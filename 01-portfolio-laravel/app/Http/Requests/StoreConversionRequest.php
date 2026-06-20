<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreConversionRequest extends FormRequest
{
    public function authorize(): bool
    {
        return (bool) $this->user()?->proprietaire;
    }

    public function rules(): array
    {
        return [
            'evenement_id' => 'required|exists:evenements,id',
            'titre' => 'required|string|max:255',
            'url_externe' => 'nullable|url|max:500',
            'type' => 'nullable|string|max:50',
        ];
    }
}
