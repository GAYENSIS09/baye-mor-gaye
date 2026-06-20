<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UpdateCertificationRequest extends FormRequest
{
    public function authorize(): bool
    {
        return (bool) $this->user()?->proprietaire;
    }

    public function rules(): array
    {
        return [
            'titre' => 'sometimes|string|max:255',
            'organisme' => 'sometimes|string|max:255',
            'description' => 'nullable|string',
            'url_credential' => 'nullable|url|max:255',
            'date_obtention' => 'sometimes|date',
            'date_expiration' => 'nullable|date|after_or_equal:date_obtention',
            'ordre' => 'integer|min:0',
        ];
    }
}
