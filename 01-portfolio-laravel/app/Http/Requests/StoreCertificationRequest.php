<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreCertificationRequest extends FormRequest
{
    public function authorize(): bool
    {
        return (bool) $this->user()?->proprietaire;
    }

    public function rules(): array
    {
        return [
            'titre' => 'required|string|max:255',
            'organisme' => 'required|string|max:255',
            'description' => 'nullable|string',
            'url_credential' => 'nullable|string|max:255',
            'credential_file' => 'nullable|file|mimes:jpg,jpeg,png,gif,webp,pdf|max:10240',
            'media' => 'nullable|file|mimes:jpg,jpeg,png,gif,webp|max:10240',
            'date_obtention' => 'required|date',
            'date_expiration' => 'nullable|date|after_or_equal:date_obtention',
            'ordre' => 'integer|min:0',
        ];
    }
}
