<?php

namespace App\Http\Controllers;

use App\Models\Asset;
use App\Http\Requests\StoreAssetRequest;
use App\Http\Requests\UpdateAssetRequest;
use App\Http\Resources\AssetResource;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use App\Services\ActivityLogger;
use App\Http\Resources\AssetDetailResource;
use Illuminate\Support\Facades\Cache;

class AssetController extends Controller
{
    /**
     * @OA\Get(
     *      path="/api/assets",
     *      operationId="getAssetsList",
     *      tags={"Assets"},
     *      summary="Daftar Inventaris Aset",
     *      description="Mengambil daftar aset kantor yang dilengkapi filter pencarian dan paginasi.",
     *      security={{"bearerAuth":{}}},
     *      @OA\Parameter(name="search", in="query", description="Cari nama atau kode aset", required=false, @OA\Schema(type="string")),
     *      @OA\Parameter(name="status", in="query", description="Filter status (available, borrowed, maintenance, retired)", required=false, @OA\Schema(type="string")),
     *      @OA\Parameter(name="page", in="query", description="Nomor halaman aktif", required=false, @OA\Schema(type="integer", default=1)),
     *      @OA\Response(
     *          response=200,
     *          description="Sukses memuat list aset",
     *          @OA\JsonContent(
     *              @OA\Property(property="data", type="array", @OA\Items(type="object")),
     *              @OA\Property(property="links", type="object"),
     *              @OA\Property(property="meta", type="object")
     *          )
     *      ),
     *      @OA\Response(response=401, description="Unauthorized / Token Tidak Valid"),
     *      @OA\Response(response=403, description="Forbidden / Tidak Ada Hak Akses")
     * )
     */
    
   /**
     * Menampilkan daftar semua aset dengan filter dan pagination.
     */
    public function index(Request $request)
    {
        // Mengambil query parameter dan menetapkan nilai default per_page = 10
        $filters = $request->only(['search', 'status', 'asset_category_id', 'asset_location_id']);
        $perPage = $request->input('per_page', 10);
    
        $assets = Asset::with(['category', 'location'])
            ->filter($filters)
            ->latest()
            ->paginate($perPage);
            
        return AssetResource::collection($assets);
    }

    /**
     * Menyimpan data aset baru ke database.
     */
    public function store(StoreAssetRequest $request): JsonResponse
    {
        // Menyimpan data hasil validasi Form Request
        $asset = Asset::create($request->validated());
        ActivityLogger::log('create_asset', "Mendaftarkan aset inventaris baru: {$asset->name}", $asset, ['asset_code' => $asset->asset_code]);

        // Memuat instans relasi sebelum dikembalikan ke resource respons
        $asset->load(['category', 'location']);

        // Invalidate cache statistik dashboard
        Cache::forget('dashboard_stats');

        return response()->json([
            'message' => 'Success',
            'data' => new AssetResource($asset)
        ], 201);

    }
    /**
     * Menampilkan detail informasi dasar aset untuk akses publik (Scan QR Code).
     * 
     * @param string $uuid
     * @return \Illuminate\Http\JsonResponse
     */
    public function showPublic(string $uuid): JsonResponse
    {
        // Cari data berdasarkan UUID yang valid, jika tidak ditemukan langsung lempar error 404
        $asset = Asset::with(['category', 'location'])
            ->whereNotNull('uuid')
            ->where('uuid', $uuid)
            ->firstOrFail();
    
        return response()->json([
            'asset_code' => $asset->asset_code,
            'name' => $asset->name,
            'category' => $asset->category ? $asset->category->name : '-',
            'location' => $asset->location ? $asset->location->name : '-',
            'status' => $asset->status,
        ], 200);
    }
    /**
     * Menampilkan detail lengkap satu aset beserta riwayat transaksi dan log aktivitas.
     * 
     * @param int $id
     * @return \Illuminate\Http\JsonResponse
     */
    public function show(int $id): JsonResponse
    {
        // Eager loading semua relasi internal, transaksi sirkulasi, dan log polimorfis
        $asset = Asset::with([
            'category', 
            'location', 
            'borrowings', 
            'activityLogs.user'
        ])->findOrFail($id);

        return response()->json([
            'message' => 'Success',
            'data' => new AssetDetailResource($asset)
        ], 200);
    }

    /**
     * Memperbarui informasi aset inventaris yang ada.
     */
    public function update(UpdateAssetRequest $request, int $id): JsonResponse
    {
        $asset = Asset::findOrFail($id);

        $asset->update($request->validated());

        ActivityLogger::log(
            'update_asset',
            "Memperbarui data aset inventaris: {$asset->name}",
            $asset,
            ['asset_code' => $asset->asset_code]
        );

        $asset->load(['category', 'location']);
        Cache::forget('dashboard_stats');

        return response()->json([
            'message' => 'Aset berhasil diperbarui',
            'data' => new AssetResource($asset)
        ], 200);
    }

    /**
     * Menghapus aset (Soft Delete).
     */
    public function destroy(int $id): JsonResponse
    {
        $asset = Asset::findOrFail($id);

        // Validasi perlindungan: aset sedang dipinjam tidak boleh dihapus
        if ($asset->status === 'borrowed' || $asset->borrowings()->whereNull('returned_at')->exists()) {
            return response()->json([
                'message' => 'Aset tidak dapat dihapus karena sedang dalam masa peminjaman aktif.'
            ], 422);
        }

        $assetName = $asset->name;
        $assetCode = $asset->asset_code;

        $asset->delete();

        ActivityLogger::log(
            'delete_asset',
            "Menghapus aset inventaris: {$assetName} ({$assetCode})",
            $asset,
            ['asset_code' => $assetCode]
        );

        Cache::forget('dashboard_stats');

        return response()->json([
            'message' => 'Aset berhasil dihapus'
        ], 200);
    }
}
