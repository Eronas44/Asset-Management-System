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
}
