<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class AssetResource extends JsonResource
{
    public function toArray(Request $request): array
{
    // Mengambil base URL aplikasi backend (misal: http://127.0.0.1:8000)
    $baseUrl = url('/api/public/assets/' . $this->uuid);

    return [
        'id' => $this->id,
        'uuid' => $this->uuid,
        'asset_code' => $this->asset_code,
        'name' => $this->name,
        'type' => $this->type,
        'quantity' => $this->quantity,
        
        // Menambahkan properti URL identitas digital sesuai instruksi kerja
        'public_url' => $baseUrl,
        'qr_code_url' => $baseUrl, // Sesuai petunjuk arsitektur, sementara cukup diisi string URL yang sama
        
        'purchase_date' => $this->purchase_date,
        'purchase_price' => (float) $this->purchase_price,
        'useful_life_years' => $this->useful_life_years,
        'residual_value' => (float) $this->residual_value,
        'annual_depreciation' => round($this->annual_depreciation, 2),
        'current_book_value' => round($this->current_book_value, 2),
        'status' => $this->status,
        'notes' => $this->notes,
        'category' => new AssetCategoryResource($this->whenLoaded('category')),
        'location' => new AssetLocationResource($this->whenLoaded('location')),
        'created_at' => $this->created_at->format('Y-m-d H:i:s'),
        'updated_at' => $this->updated_at->format('Y-m-d H:i:s'),
    ];
}

/**
 * Menambahkan data meta tambahan ke dalam respons sukses JSON.
 */
public function with(Request $request): array
{
    return [
        'message' => 'Success'
    ];
}

}
