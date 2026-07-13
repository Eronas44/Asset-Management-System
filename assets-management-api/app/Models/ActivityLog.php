<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\MorphTo;

class ActivityLog extends Model
{
    use HasFactory;

    // Matikan timestamps default karena kita hanya butuh created_at
    public $timestamps = false;

    protected $fillable = [
        'user_id',
        'action',
        'subject_type',
        'subject_id',
        'description',
        'properties',
        'created_at'
    ];

    protected $casts = [
        'properties' => 'array',
        'created_at' => 'datetime'
    ];

    /**
     * Relasi: Setiap log tercatat atas aksi satu pengguna.
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class, 'user_id');
    }

    /**
     * Relasi Polimorfis: Menghubungkan log ke model subjek target (Asset, Category, dll).
     */
    public function subject(): MorphTo
    {
        return $this->morphTo();
    }

    /**
     * Scope Filter Kriteria Pencarian Audit Trail.
     */
    public function scopeFilter($query, array $filters)
    {
        $query->when($filters['action'] ?? null, function ($query, $action) {
            $query->where('action', $action);
        });

        $query->when($filters['user_id'] ?? null, function ($query, $userId) {
            $query->where('user_id', $userId);
        });

        $query->when($filters['date_from'] ?? null, function ($query, $dateFrom) {
            $query->whereDate('created_at', '>=', $dateFrom);
        });

        $query->when($filters['date_to'] ?? null, function ($query, $dateTo) {
            $query->whereDate('created_at', '<=', $dateTo);
        });
    }
}
