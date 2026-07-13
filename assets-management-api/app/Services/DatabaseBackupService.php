<?php

namespace App\Services;

use Carbon\Carbon;
use Symfony\Component\Process\ExecutableFinder;
use Symfony\Component\Process\Process;
use Illuminate\Support\Facades\Storage;

class DatabaseBackupService
{
    protected $disk = 'local';
    protected $folder = 'backups';

    /**
     * Memperoleh daftar semua file backup yang tersedia.
     */
    public function getBackupFiles(): array
    {
        $files = Storage::disk($this->disk)->files($this->folder);
        $backupList = [];

        foreach ($files as $file) {
            if (pathinfo($file, PATHINFO_EXTENSION) === 'sql') {
                $backupList[] = [
                    'filename' => basename($file),
                    'size_bytes' => Storage::disk($this->disk)->size($file),
                    'size_human' => $this->formatBytes(Storage::disk($this->disk)->size($file)),
                    'created_at' => Carbon::createFromTimestamp(Storage::disk($this->disk)->lastModified($file))->format('Y-m-d H:i:s')
                ];
            }
        }

        // Urutkan berdasarkan tanggal terbaru
        usort($backupList, function ($a, $b) {
            return strcmp($b['created_at'], $a['created_at']);
        });

        return $backupList;
    }

    /**
     * Membuat file backup baru (.sql) dari database pgsql aktif.
     */
    public function createBackup(): string
    {
        $filename = 'backup-' . Carbon::now()->format('Y-m-d-H-i-s') . '.sql';
        $filePath = storage_path('app/' . $this->folder . '/' . $filename);

        // Pastikan folder backups tersedia
        if (!file_exists(storage_path('app/' . $this->folder))) {
            mkdir(storage_path('app/' . $this->folder), 0755, true);
        }

        $pgDumpPath = $this->findExecutable('pg_dump');

        if (!$pgDumpPath) {
            throw new \Exception('pg_dump tidak ditemukan. Install PostgreSQL client di environment aplikasi atau rebuild container app agar backup database bisa dijalankan.');
        }

        $process = new Process([
            $pgDumpPath,
            '-U', (string) config('database.connections.pgsql.username'),
            '-h', (string) config('database.connections.pgsql.host'),
            '-p', (string) config('database.connections.pgsql.port'),
            (string) config('database.connections.pgsql.database'),
        ]);
        $process->setEnv(array_merge($_ENV, $_SERVER, [
            'PGPASSWORD' => (string) config('database.connections.pgsql.password'),
        ]));
        $process->setTimeout(null);
        $process->run();

        if (!$process->isSuccessful()) {
            $details = trim($process->getErrorOutput() . PHP_EOL . $process->getOutput());
            throw new \Exception('Gagal membuat backup database. ' . ($details !== '' ? $details : 'Kode error: ' . $process->getExitCode()));
        }

        file_put_contents($filePath, $process->getOutput());

        return $filename;
    }

    /**
     * Memulihkan (Restore) database dari file sql pilihan.
     */
    public function restoreBackup(string $filename): void
    {
        $filePath = storage_path('app/' . $this->folder . '/' . $filename);

        if (!file_exists($filePath)) {
            throw new \Exception("File backup tidak ditemukan.");
        }

        $psqlPath = $this->findExecutable('psql');

        if (!$psqlPath) {
            throw new \Exception('psql tidak ditemukan. Install PostgreSQL client di environment aplikasi atau rebuild container app agar restore database bisa dijalankan.');
        }

        $process = new Process([
            $psqlPath,
            '-U', (string) config('database.connections.pgsql.username'),
            '-h', (string) config('database.connections.pgsql.host'),
            '-p', (string) config('database.connections.pgsql.port'),
            (string) config('database.connections.pgsql.database'),
        ]);
        $process->setInput(file_get_contents($filePath));
        $process->setEnv(array_merge($_ENV, $_SERVER, [
            'PGPASSWORD' => (string) config('database.connections.pgsql.password'),
        ]));
        $process->setTimeout(null);
        $process->run();

        if (!$process->isSuccessful()) {
            $details = trim($process->getErrorOutput() . PHP_EOL . $process->getOutput());
            throw new \Exception('Gagal memulihkan database. ' . ($details !== '' ? $details : 'Kode error: ' . $process->getExitCode()));
        }
    }

    /**
     * Helper untuk format representasi ukuran file.
     */
    private function formatBytes($bytes, $precision = 2): string
    {
        $units = ['B', 'KB', 'MB', 'GB', 'TB'];
        $bytes = max($bytes, 0);
        $pow = floor(($bytes ? log($bytes) : 0) / log(1024));
        $pow = min($pow, count($units) - 1);
        $bytes /= pow(1024, $pow);

        return round($bytes, $precision) . ' ' . $units[$pow];
    }

    private function findExecutable(string $name): ?string
    {
        return (new ExecutableFinder())->find($name);
    }
}
