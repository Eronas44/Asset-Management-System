<?php

namespace App\Http\Controllers;

use App\Models\Asset;
use App\Models\AssetBorrowing;
use Illuminate\Http\JsonResponse;
use App\Http\Resources\AssetBorrowingResource;
use Illuminate\Support\Facades\Cache;

class DashboardController extends Controller
{
        /**
     * @OA\Get(
     *      path="/api/dashboard/stats",
     *      operationId="getDashboardStats",
     *      tags={"Dashboard"},
     *      summary="Statistik Ringkasan Utama",
     *      description="Mengambil data total kuantitas barang, filter status operasional, dan nilai buku depresiasi finansial.",
     *      security={{"bearerAuth":{}}},
     *      @OA\Response(response=200, description="Sukses memuat matriks stats")
     * )
     */

    public function getStats(): JsonResponse
{
    // Simpan atau ambil dari cache selama 300 detik (5 menit)
    $stats = Cache::remember('dashboard_stats', 300, function () {
        $assetStats = Asset::selectRaw("
            COUNT(*) as total,
            COUNT(CASE WHEN status IN ('" . Asset::STATUS_AVAILABLE . "', '" . Asset::SINGLE_STATUS_AVAILABLE . "') AND (type != '" . Asset::TYPE_BULK . "' OR quantity > 0) THEN 1 END) as available,
            COUNT(CASE WHEN status = '" . Asset::STATUS_BORROWED . "' THEN 1 END) as borrowed,
            COUNT(CASE WHEN status IN ('" . Asset::STATUS_MAINTENANCE . "', '" . Asset::SINGLE_STATUS_IN_REPAIR . "') THEN 1 END) as maintenance,
            COUNT(CASE WHEN status IN ('" . Asset::STATUS_RETIRED . "', '" . Asset::SINGLE_STATUS_DISCARDED . "', '" . Asset::SINGLE_STATUS_DAMAGED . "', '" . Asset::BULK_STATUS_EMPTY . "', '" . Asset::BULK_STATUS_EXPIRED . "') THEN 1 END) as retired
        ")->first();

        $activeBorrowingsCount = AssetBorrowing::whereNull('returned_at')->count();
        // Optimasi alokasi memori: Hanya muat kolom finansial yang dibutuhkan untuk accessor current_book_value
        $totalBookValue = Asset::select(['id', 'purchase_date', 'purchase_price', 'useful_life_years', 'residual_value'])
            ->get()
            ->sum('current_book_value');

        return [
            'total_assets' => (int) $assetStats->total,
            'available_assets' => (int) $assetStats->available,
            'borrowed_assets' => (int) $assetStats->borrowed,
            'maintenance_assets' => (int) $assetStats->maintenance,
            'retired_assets' => (int) $assetStats->retired,
            'active_borrowings' => (int) $activeBorrowingsCount,
            'total_book_value' => round($totalBookValue, 2)
        ];
    });

    return response()->json($stats, 200);
}

        /**
     * @OA\Get(
     *      path="/api/dashboard/alerts",
     *      operationId="getDashboardAlerts",
     *      tags={"Dashboard"},
     *      summary="Notifikasi Peringatan Keterlambatan",
     *      description="Mengambil kuantitas dan list maksimal 10 transaksi peminjaman aset yang menunggak (overdue).",
     *      security={{"bearerAuth":{}}},
     *      @OA\Response(response=200, description="Sukses memuat list alert keterlambatan")
     * )
     */
    public function getAlerts(): JsonResponse
    {
        // Kueri mencari peminjaman yang returned_at masih NULL dan expected_return_at < sekarang
        $overdueQuery = AssetBorrowing::with(['asset.category', 'asset.location'])
            ->whereNull('returned_at')
            ->where('expected_return_at', '<', now());

        // 1. Hitung total kuantitas peminjaman menunggak saat ini (clone query agar tidak mengubah state builder)
        $overdueCount = (clone $overdueQuery)->count();

        // 2. Ambil maksimal 10 rekaman data menunggak paling baru
        $overdueItems = $overdueQuery->latest('expected_return_at')
            ->limit(10)
            ->get();

        // 3. Kembalikan data dalam satu respons gabungan terstruktur
        return response()->json([
            'overdue_borrowings' => $overdueCount,
            'overdue_assets' => AssetBorrowingResource::collection($overdueItems)
        ], 200);
    }
}
