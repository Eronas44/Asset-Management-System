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
     * Membuat file backup baru (.sql) dari database mysql aktif.
     */
    public function createBackup(): string
    {
        $filename = 'backup-' . Carbon::now()->format('Y-m-d-H-i-s') . '.sql';
        $folderPath = Storage::disk($this->disk)->path($this->folder);
        $filePath = $folderPath . DIRECTORY_SEPARATOR . $filename;

        // Pastikan folder backups tersedia pada disk local
        if (!file_exists($folderPath)) {
            mkdir($folderPath, 0755, true);
        }

        $mysqldumpPath = $this->findExecutable('mysqldump');

        if (!$mysqldumpPath) {
            throw new \Exception('mysqldump tidak ditemukan. Install MySQL client di environment aplikasi atau rebuild container app agar backup database bisa dijalankan.');
        }

        $process = new Process([
            $mysqldumpPath,
            '-u', (string) config('database.connections.mysql.username'),
            '-h', (string) config('database.connections.mysql.host'),
            '-P', (string) config('database.connections.mysql.port'),
            '--single-transaction',
            '--routines',
            '--events',
            '--result-file=' . $filePath,
            (string) config('database.connections.mysql.database'),
        ]);
        $process->setEnv(array_merge($_ENV, $_SERVER, [
            'MYSQL_PWD' => (string) config('database.connections.mysql.password'),
        ]));
        $process->setTimeout(null);
        $process->run();

        if (!$process->isSuccessful() || !file_exists($filePath)) {
            $details = trim($process->getErrorOutput() . PHP_EOL . $process->getOutput());
            throw new \Exception('Gagal membuat backup database. ' . ($details !== '' ? $details : 'Kode error: ' . $process->getExitCode()));
        }

        return $filename;
    }

    /**
     * Memulihkan (Restore) database dari file sql pilihan.
     */
    public function restoreBackup(string $filename): void
    {
        $filePath = Storage::disk($this->disk)->path($this->folder . DIRECTORY_SEPARATOR . $filename);

        if (!file_exists($filePath)) {
            throw new \Exception("File backup tidak ditemukan.");
        }

        $mysqlPath = $this->findExecutable('mysql');

        if (!$mysqlPath) {
            throw new \Exception('mysql client tidak ditemukan. Install MySQL client di environment aplikasi atau rebuild container app agar restore database bisa dijalankan.');
        }

        $stream = fopen($filePath, 'r');
        if (!$stream) {
            throw new \Exception("Tidak dapat membuka file arsip database untuk dipulihkan.");
        }

        $process = new Process([
            $mysqlPath,
            '-u', (string) config('database.connections.mysql.username'),
            '-h', (string) config('database.connections.mysql.host'),
            '-P', (string) config('database.connections.mysql.port'),
            (string) config('database.connections.mysql.database'),
        ]);
        $process->setInput($stream);
        $process->setEnv(array_merge($_ENV, $_SERVER, [
            'MYSQL_PWD' => (string) config('database.connections.mysql.password'),
        ]));
        $process->setTimeout(null);
        try {
            $process->run();
        } finally {
            if (is_resource($stream)) {
                fclose($stream);
            }
        }

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
        $path = (new ExecutableFinder())->find($name);
        if ($path) {
            return $path;
        }

        $fallbacks = [
            "/usr/bin/{$name}",
            "/usr/local/bin/{$name}",
            "/bin/{$name}",
        ];

        foreach ($fallbacks as $fallback) {
            if (file_exists($fallback) && is_executable($fallback)) {
                return $fallback;
            }
        }

        return null;
    }
}
