<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class AssetBorrowing extends Model
{
    use HasFactory;

    protected $fillable = [
        'asset_id',
        'borrower_name',
        'borrowed_by_user_name',
        'borrowed_at',
        'expected_return_at',
        'returned_at',
        'notes',
    ];

    /**
     * Relasi: Satu transaksi peminjaman terikat pada satu aset.
     */
    public function asset(): BelongsTo
    {
        return $this->belongsTo(Asset::class, 'asset_id');
    }

    /**
     * Scope untuk menyaring data transaksi peminjaman.
     */
    public function scopeFilter($query, array $filters)
    {
        $query->when($filters['search'] ?? null, function ($query, $search) {
            $query->where(function ($q) use ($search) {
                $q->where('borrower_name', 'like', '%' . $search . '%')
                  ->orWhereHas('asset', function ($assetQuery) use ($search) {
                      $assetQuery->where('name', 'like', '%' . $search . '%')
                                 ->orWhere('asset_code', 'like', '%' . $search . '%');
                  });
            });
        });
    
        $query->when(isset($filters['is_returned']), function ($query) use ($filters) {
            // Mengonversi string parameter 'true'/'false' menjadi boolean filter
            $isReturned = filter_var($filters['is_returned'], FILTER_VALIDATE_BOOLEAN);
            if ($isReturned) {
                $query->whereNotNull('returned_at');
            } else {
                $query->whereNull('returned_at');
            }
        });
    }

}
