<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreVuePageRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'page'    => 'required|string|in:publication,projet',
            'page_id' => ['required', 'integer', 'min:1'],
        ];
    }
}
