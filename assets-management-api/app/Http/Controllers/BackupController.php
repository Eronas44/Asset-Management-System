<?php

namespace App\Http\Controllers;

use App\Services\DatabaseBackupService;
use App\Services\ActivityLogger;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Storage;

class BackupController extends Controller
{
    protected $backupService;

    public function __construct(DatabaseBackupService $backupService)
    {
        $this->backupService = $backupService;
    }

    /**
     * Menampilkan daftar semua file backup database yang tersedia.
     */
    public function index(): JsonResponse
    {
        $backups = $this->backupService->getBackupFiles();
        return response()->json([
            'message' => 'Success',
            'data' => $backups
        ], 200);
    }

    /**
     * Membuat file backup baru.
     */
    public function store(): JsonResponse
    {
        try {
            $filename = $this->backupService->createBackup();
            
            // Catat ke Audit Trail Aktivitas
            ActivityLogger::log('create_backup', "Membuat cadangan (backup) database baru dengan nama file: {$filename}");

            return response()->json([
                'message' => 'Success',
                'data' => ['filename' => $filename]
            ], 201);
        } catch (\Exception $e) {
            return response()->json(['message' => $e->getMessage()], 500);
        }
    }
    /**
     * Mengunduh file backup database pilihan (Terproteksi Path Traversal).
     */
        /**
     * Mengunduh file backup database pilihan (Terproteksi Path Traversal).
     */
    public function download(string $filename)
    {
        if (!preg_match('/^[a-zA-Z0-9_-]+\.sql$/', $filename)) {
            return response()->json(['message' => 'Forbidden: Format nama file tidak sah.'], 403);
        }

        // Ambil path absolut file dari storage lokal laravel
        $absolutePath = storage_path('app/backups/' . $filename);

        if (!file_exists($absolutePath)) {
            return response()->json(['message' => 'File tidak ditemukan.'], 404);
        }

        return response()->download($absolutePath);
    }



    /**
     * Memulihkan (Restore) database dari file cadangan (Terproteksi Path Traversal).
     */
    public function restore(string $filename): JsonResponse
    {
        // Validasi Keamanan: Cegah manipulasi struktur path folder
        if (!preg_match('/^[a-zA-Z0-9_-]+\.sql$/', $filename)) {
            return response()->json(['message' => 'Forbidden: Format nama file tidak sah.'], 403);
        }

        try {
            $this->backupService->restoreBackup($filename);
            
            // Catat ke Audit Trail Aktivitas
            ActivityLogger::log('restore_backup', "Melakukan pemulihan (restore) database menggunakan file cadangan: {$filename}");

            return response()->json([
                'message' => 'Success'
            ], 200);
        } catch (\Exception $e) {
            return response()->json(['message' => $e->getMessage()], 500);
        }
    }
}
