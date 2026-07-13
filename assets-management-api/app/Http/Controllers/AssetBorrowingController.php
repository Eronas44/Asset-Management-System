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

        $borrowings = AssetBorrowing::with(['asset.category', 'asset.location'])
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
        // Ambil data aset yang dituju
        $asset = Asset::find($request->asset_id);

        // Pastikan status aset saat ini adalah available
        if ($asset->status !== Asset::STATUS_AVAILABLE) {
            return response()->json([
                'message' => 'Aset tidak tersedia untuk dipinjam saat ini.'
            ], 422);
        }

        // Jalankan Database Transaction untuk keamanan data mutasi
        $borrowing = DB::transaction(function () use ($request, $asset) {
            $borrowedByUserName = optional($request->user())->name ?? 'Unknown';

            // 1. Buat records transaksi peminjaman
            $borrow = AssetBorrowing::create(array_merge($request->validated(), [
                'borrowed_by_user_name' => $borrowedByUserName,
            ]));

            // 2. Ubah status operasional aset menjadi 'borrowed'
            $asset->update([
                'status' => Asset::STATUS_BORROWED
            ]);

            ActivityLogger::log('borrow_asset', "Memproses peminjaman aset {$asset->name} oleh {$borrow->borrower_name}", $borrow);
            return $borrow;
        });

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
        // 1. Cari data transaksi peminjaman berdasarkan ID beserta data aset terkait
        $borrowing = AssetBorrowing::with('asset')->findOrFail($id);

        // 2. Validasi Idempotensi: Pastikan aset belum dikembalikan sebelumnya
        if ($borrowing->returned_at !== null) {
            return response()->json([
                'message' => 'Aset ini sudah berstatus selesai dikembalikan sebelumnya.'
            ], 422);
        }

        // 3. Jalankan Database Transaction untuk keamanan mutasi dua arah
        DB::transaction(function () use ($borrowing) {
            // Update waktu pengembalian transaksi peminjaman ke waktu sekarang
            $borrowing->update([
                'returned_at' => Carbon::now()
            ]);

            // Kembalikan status operasional entitas aset menjadi 'available'
            $borrowing->asset->update([
                'status' => \App\Models\Asset::STATUS_AVAILABLE
            ]);
        });

        // Muat ulang data terbaru relasi aset
        $borrowing->load('asset');

        return response()->json([
            'message' => 'Success',
            'data' => new AssetBorrowingResource($borrowing)
        ], 200);

    }
}
