<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UpdateFormationRequest extends FormRequest
{
    public function authorize(): bool
    {
        return (bool) $this->user()?->proprietaire;
    }

    public function rules(): array
    {
        return [
            'diplome' => 'sometimes|string|max:255',
            'etablissement' => 'sometimes|string|max:255',
            'description' => 'nullable|string',
            'domaine_etude' => 'nullable|string|max:255',
            'date_debut' => 'sometimes|date',
            'date_fin' => 'nullable|date|after_or_equal:date_debut',
            'ordre' => 'integer|min:0',
            'media' => 'nullable|file|mimes:jpg,jpeg,png,gif,webp|max:10240',
        ];
    }
}
