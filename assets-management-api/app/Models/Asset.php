<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Str;
use Carbon\Carbon;

class Asset extends Model
{
    use HasFactory;

    // Tipe aset
    const TYPE_SINGLE = 'single';
    const TYPE_BULK = 'bulk';

    // Konstanta Status Aset
    const STATUS_AVAILABLE = 'available';
    const STATUS_BORROWED = 'borrowed';
    const STATUS_MAINTENANCE = 'maintenance';
    const STATUS_RETIRED = 'retired';

    // Status canonical untuk aset tunggal
    const SINGLE_STATUS_AVAILABLE = 'tersedia';
    const SINGLE_STATUS_DAMAGED = 'rusak';
    const SINGLE_STATUS_IN_REPAIR = 'sedang diperbaiki';
    const SINGLE_STATUS_LOST = 'hilang';
    const SINGLE_STATUS_DISCARDED = 'dibuang';

    // Status canonical untuk aset berkelompok
    const BULK_STATUS_AVAILABLE = 'tersedia';
    const BULK_STATUS_EMPTY = 'habis';
    const BULK_STATUS_LOST = 'hilang';
    const BULK_STATUS_EXPIRED = 'kadaluarsa';

    protected $fillable = [
        'uuid',
        'asset_code',
        'name',
        'type',
        'quantity',
        'asset_category_id',
        'asset_location_id',
        'purchase_date',
        'purchase_price',
        'useful_life_years',
        'residual_value',
        'status',
        'notes',
    ];

    protected $casts = [
        'quantity' => 'integer',
    ];

    public static function typeOptions(): array
    {
        return [self::TYPE_SINGLE, self::TYPE_BULK];
    }

    public static function statusesForType(string $type): array
    {
        return $type === self::TYPE_BULK
            ? [
                self::BULK_STATUS_AVAILABLE,
                self::BULK_STATUS_EMPTY,
                self::BULK_STATUS_LOST,
                self::BULK_STATUS_EXPIRED,
                self::STATUS_AVAILABLE, // kompatibilitas data lama
            ]
            : [
                self::SINGLE_STATUS_AVAILABLE,
                self::SINGLE_STATUS_DAMAGED,
                self::SINGLE_STATUS_IN_REPAIR,
                self::SINGLE_STATUS_LOST,
                self::SINGLE_STATUS_DISCARDED,
                self::STATUS_AVAILABLE, // kompatibilitas data lama
                self::STATUS_MAINTENANCE,
                self::STATUS_RETIRED,
                self::STATUS_BORROWED,
            ];
    }

    public function isSingle(): bool
    {
        return $this->type === self::TYPE_SINGLE;
    }

    public function isBulk(): bool
    {
        return $this->type === self::TYPE_BULK;
    }

    public function isAvailable(): bool
    {
        if ($this->isBulk()) {
            return $this->quantity > 0 && in_array($this->status, [self::BULK_STATUS_AVAILABLE, self::STATUS_AVAILABLE], true);
        }

        return in_array($this->status, [self::SINGLE_STATUS_AVAILABLE, self::STATUS_AVAILABLE], true);
    }

    public function scopeSingle($query)
    {
        return $query->where('type', self::TYPE_SINGLE);
    }

    public function scopeBulk($query)
    {
        return $query->where('type', self::TYPE_BULK);
    }

    public function scopeAvailable($query)
    {
        return $query->where(function ($builder) {
            $builder->where(function ($singleQuery) {
                $singleQuery->where('type', self::TYPE_SINGLE)
                    ->whereIn('status', [self::SINGLE_STATUS_AVAILABLE, self::STATUS_AVAILABLE]);
            })->orWhere(function ($bulkQuery) {
                $bulkQuery->where('type', self::TYPE_BULK)
                    ->where('quantity', '>', 0)
                    ->whereIn('status', [self::BULK_STATUS_AVAILABLE, self::STATUS_AVAILABLE]);
            });
        });
    }

    /**
     * Relasi: Satu aset dimiliki oleh satu kategori.
     */
    public function category(): BelongsTo
    {
        return $this->belongsTo(AssetCategory::class, 'asset_category_id');
    }

    /**
     * Relasi: Satu aset berada di satu lokasi fisik.
     */
    public function location(): BelongsTo
    {
        return $this->belongsTo(AssetLocation::class, 'asset_location_id');
    }
    
    // Tambahkan ini di dalam class Asset pada file app/Models/Asset.php
    public function borrowings(): \Illuminate\Database\Eloquent\Relations\HasMany
    {
        return $this->hasMany(AssetBorrowing::class, 'asset_id');
    }

    /**
     * Scope untuk menyaring data aset berdasarkan kriteria pencarian dan filter.
     */
    public function scopeFilter($query, array $filters)
    {
        $query->when($filters['search'] ?? null, function ($query, $search) {
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', '%' . $search . '%')
                  ->orWhere('asset_code', 'like', '%' . $search . '%');
            });
        });

        $query->when($filters['status'] ?? null, function ($query, $status) {
            $query->where('status', $status);
        });

        $query->when($filters['asset_category_id'] ?? null, function ($query, $categoryId) {
            $query->where('asset_category_id', $categoryId);
        });

        $query->when($filters['asset_location_id'] ?? null, function ($query, $locationId) {
            $query->where('asset_location_id', $locationId);
        });
    }
    /**
     * Menghitung depresiasi tahunan menggunakan metode Straight-Line (Garis Lurus).
     * Rumus: (Harga Perolehan - Nilai Residu) / Umur Manfaat
     */
    public function getAnnualDepreciationAttribute(): float
    {
        if ($this->useful_life_years <= 0) {
            return 0;
        }

        $depreciationAbleValue = $this->purchase_price - $this->residual_value;
        return max(0, $depreciationAbleValue / $this->useful_life_years);
    }

    /**
     * Menghitung Nilai Buku Terkini secara dinamis berdasarkan berjalannya waktu (bulan).
     * Nilai tidak akan pernah turun di bawah Nilai Residu.
     */
    /**
 * Menghitung Nilai Buku Terkini secara dinamis berdasarkan berjalannya waktu (bulan).
 * Nilai tidak akan pernah turun di bawah Nilai Residu.
 */
public function getCurrentBookValueAttribute(): float
{
    $purchaseDate = Carbon::parse($this->purchase_date);
    $currentDate = Carbon::now();
    
    // Perbaikan: Gunakan diffInMonths untuk menghitung selisih bulan secara aman
    $monthsPassed = $purchaseDate->diffInMonths($currentDate);
    
    if ($monthsPassed <= 0) {
        return (float) $this->purchase_price;
    }
    
    // Hitung total bulan manfaat ekonomis
    $totalUsefulMonths = $this->useful_life_years * 12;
    
    // Hitung depresiasi nilai per bulan
    $monthlyDepreciation = $this->annual_depreciation / 12;
    
    // Total akumulasi nilai penyusutan saat ini
    $accumulatedDepreciation = $monthlyDepreciation * min($monthsPassed, $totalUsefulMonths);
    
    // Nilai buku terkini (tidak boleh lebih kecil dari nilai residu)
    $bookValue = $this->purchase_price - $accumulatedDepreciation;
    
    return (float) max($this->residual_value, $bookValue);
}


    /**
     * Fungsi internal booting model Laravel.
     */
    protected static function boot()
    {
        parent::boot();
    
        // Event handler: Sebelum data disimpan ke database, isi kolom uuid secara otomatis
        static::creating(function ($model) {
            if (empty($model->uuid)) {
                $model->uuid = (string) Str::uuid();
            }
        });
    }

    /**
     * Relasi Polimorfis: Satu aset dapat memiliki banyak jejak audit aktivitas terkait.
     */
    public function activityLogs(): \Illuminate\Database\Eloquent\Relations\MorphMany
    {
        // Mengaitkan polimorfis ke model ActivityLog berdasarkan subject_type dan subject_id
        return $this->morphMany(ActivityLog::class, 'subject');
    }


}
