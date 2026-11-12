<?php

namespace App\Services;

use App\Models\ActivityLog;
use Illuminate\Support\Facades\Auth;
use Illuminate\Database\Eloquent\Model;

class ActivityLogger
{
    /**
     * Log aktivitas ke database secara terpusat.
     */
    public static function log(string $action, string $description, ?Model $subject = null, ?array $properties = null): void
    {
        ActivityLog::create([
            'user_id' => Auth::id(), // Otomatis menangkap ID user yang sedang login via Sanctum
            'action' => $action,
            'subject_type' => $subject ? get_class($subject) : null,
            'subject_id' => $subject ? $subject->id : null,
            'description' => $description,
            'properties' => $properties,
            'created_at' => now(),
        ]);
    }

    /**
     * Log aktivitas operasi massal (batch/bulk) secara terpusat untuk menghindari log spam.
     */
    public static function logBatch(string $action, string $description, int $count, ?array $properties = null): void
    {
        ActivityLog::create([
            'user_id' => Auth::id(),
            'action' => $action,
            'subject_type' => 'BatchOperation',
            'subject_id' => null,
            'description' => $description . " (Total {$count} entri diproses)",
            'properties' => array_merge($properties ?? [], ['affected_count' => $count]),
            'created_at' => now(),
        ]);
    }
}
