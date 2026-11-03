<?php

namespace App\Http\Requests;

use App\Models\Asset;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateAssetRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    protected function prepareForValidation(): void
    {
        if ($this->has('type')) {
            $type = $this->input('type', Asset::TYPE_SINGLE);
            $this->merge([
                'type' => $type,
                'quantity' => $type === Asset::TYPE_SINGLE ? 1 : $this->input('quantity', 1),
            ]);
        }
    }

    public function rules(): array
    {
        $assetId = $this->route('id') ?? $this->route('asset');
        $type = $this->input('type', Asset::TYPE_SINGLE);

        return [
            'asset_code' => [
                'required',
                'string',
                'max:100',
                Rule::unique('assets', 'asset_code')->ignore($assetId),
            ],
            'name' => ['required', 'string', 'max:255'],
            'type' => ['required', Rule::in(Asset::typeOptions())],
            'quantity' => ['required_if:type,' . Asset::TYPE_BULK, 'integer', 'min:0'],
            'asset_category_id' => ['required', 'integer', 'exists:asset_categories,id'],
            'asset_location_id' => ['required', 'integer', 'exists:asset_locations,id'],
            'purchase_date' => ['required', 'date'],
            'purchase_price' => ['required', 'numeric', 'min:0'],
            'useful_life_years' => ['required', 'integer', 'min:1'],
            'residual_value' => [
                'required',
                'numeric',
                'min:0',
                'lte:purchase_price',
            ],
            'status' => ['required', 'string', Rule::in(Asset::statusesForType($type))],
            'notes' => ['nullable', 'string'],
        ];
    }
}
