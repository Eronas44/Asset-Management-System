<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;
use Carbon\Carbon;

class AssetBorrowingResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        $expectedReturn = Carbon::parse($this->expected_return_at);
        $isOverdue = $this->returned_at === null && $expectedReturn->isPast();
        
        // Hitung selisih hari keterlambatan dari hari ini (jika terlambat)
        $overdueDays = $isOverdue ? (int) $expectedReturn->diffInDays(Carbon::now()) : 0;
    
        return [
            'id' => $this->id,
            'borrower_name' => $this->borrower_name,
            'borrowed_by_user_name' => $this->borrowed_by_user_name,
            'borrowed_at' => $this->borrowed_at,
            'expected_return_at' => $this->expected_return_at,
            'returned_at' => $this->returned_at,
            'is_returned' => $this->returned_at !== null,
            
            // Tambahkan dua field indikator keterlambatan baru sesuai instruksi kerja
            'is_overdue' => $isOverdue,
            'overdue_days' => $overdueDays,
            
            'notes' => $this->notes,
            'asset' => new AssetResource($this->whenLoaded('asset')),
            'created_at' => $this->created_at->format('Y-m-d H:i:s'),
            'updated_at' => $this->updated_at->format('Y-m-d H:i:s'),
    ];
}
}
