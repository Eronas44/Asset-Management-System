<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateAssetLocationRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        $locationId = $this->route('id') ?? $this->route('asset_location');

        return [
            'name' => [
                'required',
                'string',
                'max:255',
                Rule::unique('asset_locations', 'name')->ignore($locationId),
            ],
            'code' => [
                'nullable',
                'string',
                'max:50',
                Rule::unique('asset_locations', 'code')->ignore($locationId),
            ],
            'description' => ['nullable', 'string'],
        ];
    }
}
