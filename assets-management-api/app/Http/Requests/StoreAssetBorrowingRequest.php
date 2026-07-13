<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreAssetBorrowingRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'asset_id' => 'required|integer|exists:assets,id',
            'borrower_name' => 'required|string|max:255',
            'borrowed_at' => 'required|date_format:Y-m-d H:i:s',
            'expected_return_at' => 'required|date_format:Y-m-d H:i:s|after:borrowed_at',
            'notes' => 'nullable|string',
        ];
    }
}
