<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreAssetLocationRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true; // Set ke true agar request diproses
    }

    public function rules(): array
    {
        return [
            'name' => 'required|string|max:255|unique:asset_locations,name',
            'code' => 'required|string|max:50|unique:asset_locations,code',
            'description' => 'nullable|string',
        ];
    }
}
