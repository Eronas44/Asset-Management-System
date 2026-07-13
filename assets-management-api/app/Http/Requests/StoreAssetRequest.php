<?php

namespace App\Http\Requests;

use App\Models\Asset;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreAssetRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    protected function prepareForValidation(): void
    {
        $type = $this->input('type', Asset::TYPE_SINGLE);

        $this->merge([
            'type' => $type,
            'quantity' => $type === Asset::TYPE_SINGLE ? 1 : $this->input('quantity'),
        ]);
    }

    public function rules(): array
    {
        $type = $this->input('type', Asset::TYPE_SINGLE);

        return [
            'asset_code' => ['required', 'string', 'max:100', 'unique:assets,asset_code'],
            'name' => ['required', 'string', 'max:255'],
            'type' => ['required', Rule::in(Asset::typeOptions())],
            'quantity' => ['required_if:type,' . Asset::TYPE_BULK, 'integer', 'min:0'],
            'asset_category_id' => ['required', 'integer', 'exists:asset_categories,id'],
            'asset_location_id' => ['required', 'integer', 'exists:asset_locations,id'],
            'purchase_date' => ['required', 'date'],
            'purchase_price' => ['required', 'numeric', 'min:0'],

            // Aturan validasi depresiasi
            'useful_life_years' => ['required', 'integer', 'min:1'],
            'residual_value' => [
                'required',
                'numeric',
                'min:0',
                'max:' . $this->input('purchase_price', 0),
            ],

            // Status dibatasi ketat per tipe aset, dengan alias kompatibilitas untuk data lama
            'status' => ['required', 'string', Rule::in(Asset::statusesForType($type))],
            'notes' => ['nullable', 'string'],
        ];
    }
}
