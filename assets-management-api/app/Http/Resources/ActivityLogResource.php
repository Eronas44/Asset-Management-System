<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ActivityLogResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'action' => $this->action,
            'description' => $this->description,
            'properties' => $this->properties,
            'operator' => $this->user ? $this->user->name : 'Sistem Otomatis',
            'created_at' => $this->created_at->format('Y-m-d H:i:s'),
        ];
    }
}
