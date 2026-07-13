<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class AssetDetailResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        $baseUrl = url('/api/public/assets/' . $this->uuid);

        return [
            'id' => $this->id,
            'uuid' => $this->uuid,
            'asset_code' => $this->asset_code,
            'name' => $this->name,
            'type' => $this->type,
            'quantity' => $this->quantity,
            'public_url' => $baseUrl,
            'qr_code_url' => $baseUrl,
            'purchase_date' => $this->purchase_date,
            'purchase_price' => (float) $this->purchase_price,
            'status' => $this->status,
            'notes' => $this->notes,
            
            // Informasi Data Master Terkait
            'category' => new AssetCategoryResource($this->whenLoaded('category')),
            'location' => new AssetLocationResource($this->whenLoaded('location')),
            
            // Informasi Parameter Depresiasi Nilai
            'useful_life_years' => $this->useful_life_years,
            'residual_value' => (float) $this->residual_value,
            'annual_depreciation' => round($this->annual_depreciation, 2),
            'current_book_value' => round($this->current_book_value, 2),
            
            // Transformasi Data Riwayat Transaksi Peminjaman
            'borrowing_history' => $this->whenLoaded('borrowings', function () {
                return $this->borrowings->map(function ($borrow) {
                    return [
                        'id' => $borrow->id,
                        'borrower_name' => $borrow->borrower_name,
                        'borrowed_by_user_name' => $borrow->borrowed_by_user_name,
                        'borrowed_at' => $borrow->borrowed_at,
                        'expected_return_at' => $borrow->expected_return_at,
                        'returned_at' => $borrow->returned_at,
                        'is_returned' => $borrow->returned_at !== null,
                        'notes' => $borrow->notes,
                    ];
                });
            }),

            // Transformasi Data Jejak Audit Aktivitas (Audit Trail)
            'activity_logs' => $this->whenLoaded('activityLogs', function () {
                return $this->activityLogs->map(function ($log) {
                    return [
                        'id' => $log->id,
                        'action' => $log->action,
                        'description' => $log->description,
                        'operator' => $log->user ? $log->user->name : 'Sistem Otomatis',
                        'created_at' => $log->created_at->format('Y-m-d H:i:s'),
                    ];
                });
            }),
            
            'created_at' => $this->created_at->format('Y-m-d H:i:s'),
            'updated_at' => $this->updated_at->format('Y-m-d H:i:s'),
        ];
    }

    public function with(Request $request): array
    {
        return [
            'message' => 'Success'
        ];
    }
}
