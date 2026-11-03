<?php

namespace App\Http\Controllers;

use App\Models\Asset;
use App\Models\AssetBorrowing;
use App\Http\Requests\StoreAssetBorrowingRequest;
use App\Http\Resources\AssetBorrowingResource;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;
use App\Services\ActivityLogger;
use Illuminate\Support\Facades\Cache;

class AssetBorrowingController extends Controller
{
        /**
     * @OA\Get(
     *      path="/api/asset-borrowings",
     *      operationId="getBorrowingsList",
     *      tags={"Borrowings"},
     *      summary="Riwayat Transaksi Peminjaman",
     *      description="Mengambil semua log riwayat sirkulasi transaksi peminjaman aset kantor.",
     *      security={{"bearerAuth":{}}},
     *      @OA\Response(response=200, description="Sukses memuat log transaksi")
     * )
     */

    public function index(Request $request)
    {
        $filters = $request->only(['search', 'is_returned']);
        $perPage = $request->input('per_page', 10);

        $borrowings = AssetBorrowing::with(['asset' => fn($q) => $q->withTrashed(), 'asset.category', 'asset.location'])
            ->filter($filters)
            ->latest()
            ->paginate($perPage);

        return AssetBorrowingResource::collection($borrowings);
    }
        /**
     * @OA\Post(
     *      path="/api/asset-borrowings",
     *      operationId="storeBorrowing",
     *      tags={"Borrowings"},
     *      summary="Proses Peminjaman Aset Baru",
     *      description="Membuat transaksi pinjam baru dan otomatis merubah status aset terkait menjadi 'borrowed'.",
     *      security={{"bearerAuth":{}}},
     *      @OA\RequestBody(
     *          required=true,
     *          @OA\JsonContent(
     *              required={"asset_id", "borrower_name", "borrowed_at", "expected_return_at"},
     *              @OA\Property(property="asset_id", type="integer", example=1),
     *              @OA\Property(property="borrower_name", type="string", example="Rian Wijaya"),
     *              @OA\Property(property="borrowed_at", type="string", example="2026-06-17 09:00:00"),
     *              @OA\Property(property="expected_return_at", type="string", example="2026-06-20 17:00:00"),
     *              @OA\Property(property="notes", type="string", example="Presentasi luar kota")
     *          )
     *      ),
     *      @OA\Response(response=201, description="Peminjaman Sukses Diproses"),
     *      @OA\Response(response=422, description="Aset Tidak Tersedia / Sedang Dipinjam")
     * )
     */

    public function store(StoreAssetBorrowingRequest $request): JsonResponse
    {
        // Jalankan Database Transaction dengan Pessimistic Locking untuk mencegah Race Condition (Double Borrowing)
        $borrowing = DB::transaction(function () use ($request) {
            $asset = Asset::where('id', $request->asset_id)->lockForUpdate()->first();

            // Mendukung status kanonikal 'tersedia' maupun legacy 'available'
            if (!$asset || !$asset->isAvailable()) {
                abort(response()->json([
                    'message' => 'Aset tidak tersedia untuk dipinjam saat ini.'
                ], 422));
            }

            $borrowedByUserName = optional($request->user())->name ?? 'Unknown';
            $borrowedAt = $request->filled('borrowed_at') ? Carbon::parse($request->input('borrowed_at')) : Carbon::now();

            // 1. Buat records transaksi peminjaman dengan server-controlled timestamp
            $borrow = AssetBorrowing::create(array_merge($request->validated(), [
                'borrowed_at' => $borrowedAt,
                'borrowed_by_user_name' => $borrowedByUserName,
            ]));

            // 2. Ubah status operasional aset
            if ($asset->isBulk()) {
                $newQty = max(0, $asset->quantity - 1);
                $asset->update([
                    'quantity' => $newQty,
                    'status' => $newQty === 0 ? Asset::BULK_STATUS_EMPTY : $asset->status,
                ]);
            } else {
                $asset->update([
                    'status' => Asset::STATUS_BORROWED
                ]);
            }

            ActivityLogger::log('borrow_asset', "Memproses peminjaman aset {$asset->name} oleh {$borrow->borrower_name}", $borrow);
            return $borrow;
        });

        // Hapus cache statistik agar dashboard langsung tersinkron
        Cache::forget('dashboard_stats');

        $borrowing->load(['asset']);

        return response()->json([
            'message' => 'Success',
            'data' => new AssetBorrowingResource($borrowing)
        ], 201);
    }

        /**
     * @OA\Patch(
     *      path="/api/asset-borrowings/{id}/return",
     *      operationId="returnAsset",
     *      tags={"Borrowings"},
     *      summary="Proses Pengembalian Aset",
     *      description="Menutup log sirkulasi pinjam dan otomatis mengembalikan status aset menjadi 'available'.",
     *      security={{"bearerAuth":{}}},
     *      @OA\Parameter(name="id", in="path", description="ID Transaksi Peminjaman", required=true, @OA\Schema(type="integer")),
     *      @OA\Response(response=200, description="Aset Berhasil Dikembalikan"),
     *      @OA\Response(response=422, description="Aset Sudah Dikembalikan Sebelumnya")
     * )
     */

    public function markAsReturned(int $id): JsonResponse
    {
        // Jalankan Database Transaction dengan lockForUpdate untuk mencegah race condition
        $borrowing = DB::transaction(function () use ($id) {
            // 1. Lock transaksi peminjaman
            $borrowing = AssetBorrowing::with(['asset' => fn($q) => $q->withTrashed()])
                ->where('id', $id)
                ->lockForUpdate()
                ->firstOrFail();

            // 2. Validasi Idempotensi: Pastikan aset belum dikembalikan sebelumnya
            if ($borrowing->returned_at !== null) {
                abort(response()->json([
                    'message' => 'Aset ini sudah berstatus selesai dikembalikan sebelumnya.'
                ], 422));
            }

            // 3. Update waktu pengembalian transaksi peminjaman ke waktu server sekarang
            $borrowing->update([
                'returned_at' => Carbon::now()
            ]);

            // 4. Kembalikan status operasional entitas aset dengan lockForUpdate
            if ($borrowing->asset_id) {
                $asset = Asset::withTrashed()->where('id', $borrowing->asset_id)->lockForUpdate()->first();
                if ($asset) {
                    if ($asset->isBulk()) {
                        $asset->update([
                            'quantity' => $asset->quantity + 1,
                            'status' => Asset::BULK_STATUS_AVAILABLE,
                        ]);
                    } else {
                        $asset->update([
                            'status' => Asset::SINGLE_STATUS_AVAILABLE
                        ]);
                    }
                }
            }

            ActivityLogger::log('return_asset', "Memproses pengembalian aset {$borrowing->asset?->name} oleh {$borrowing->borrower_name}", $borrowing);

            return $borrowing;
        });

        // Hapus cache statistik agar dashboard langsung terupdate
        Cache::forget('dashboard_stats');

        // Muat ulang data terbaru relasi aset
        $borrowing->load(['asset' => fn($q) => $q->withTrashed(), 'asset.category', 'asset.location']);

        return response()->json([
            'message' => 'Success',
            'data' => new AssetBorrowingResource($borrowing)
        ], 200);
    }
}
