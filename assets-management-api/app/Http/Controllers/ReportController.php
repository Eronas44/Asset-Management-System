<?php

namespace App\Http\Controllers;

use App\Models\Asset;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Barryvdh\DomPDF\Facade\Pdf;

class ReportController extends Controller
{
    /**
     * Memperoleh query dasar aset yang sudah terfilter.
     */
    private function getFilteredAssets(Request $request)
    {
        $filters = $request->only(['search', 'status', 'asset_category_id', 'asset_location_id']);
        return Asset::with(['category', 'location'])->filter($filters)->latest()->get();
    }

        /**
     * @OA\Get(
     *      path="/api/reports/assets/export/csv",
     *      operationId="exportAssetsCsv",
     *      tags={"Reports"},
     *      summary="Unduh Laporan Format CSV",
     *      description="Mengunduh laporan biner dokumen aset CSV yang terintegrasi dengan filter pencarian aktif.",
     *      security={{"bearerAuth":{}}},
     *      @OA\Response(response=200, description="File CSV Terunduh")
     * )
     */

    public function exportCsv(Request $request)
    {
        $assets = $this->getFilteredAssets($request);
        $fileName = 'assets-report-' . Carbon::now()->format('Y-m-d') . '.csv';

        $headers = [
            "Content-type"        => "text/csv",
            "Content-Disposition" => "attachment; filename=$fileName",
            "Pragma"              => "no-cache",
            "Cache-Control"       => "must-revalidate, post-check=0, pre-check=0",
            "Expires"             => "0"
        ];

        $columns = ['Kode Aset', 'Nama Aset', 'Kategori', 'Lokasi', 'Status', 'Harga Pembelian', 'Nilai Buku Saat Ini'];

        $callback = function() use($assets, $columns) {
            $file = fopen('php://output', 'w');
            fputcsv($file, $columns);

            foreach ($assets as $asset) {
                fputcsv($file, [
                    $asset->asset_code,
                    $asset->name,
                    $asset->category->name ?? '-',
                    $asset->location->name ?? '-',
                    $asset->status,
                    $asset->purchase_price,
                    $asset->current_book_value
                ]);
            }
            fclose($file);
        };

        return response()->stream($callback, 200, $headers);
    }

        /**
     * @OA\Get(
     *      path="/api/reports/assets/export/pdf",
     *      operationId="exportAssetsPdf",
     *      tags={"Reports"},
     *      summary="Unduh Laporan Format PDF",
     *      description="Mengunduh berkas cetak dokumen PDF resmi inventaris aset kantor terikat parameter filter.",
     *      security={{"bearerAuth":{}}},
     *      @OA\Response(response=200, description="File PDF Terunduh")
     * )
     */

    public function exportPdf(Request $request)
    {
        $assets = $this->getFilteredAssets($request);
        $fileName = 'assets-report-' . Carbon::now()->format('Y-m-d') . '.pdf';

        $pdf = Pdf::loadView('reports.asset-report', compact('assets'));
        
        return $pdf->download($fileName);
    }
}
