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
            'borrowed_at' => 'nullable|date',
            'expected_return_at' => 'required|date',
            'notes' => 'nullable|string',
        ];
    }
}
