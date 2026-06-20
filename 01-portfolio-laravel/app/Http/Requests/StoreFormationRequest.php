<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreFormationRequest extends FormRequest
{
    public function authorize(): bool
    {
        return (bool) $this->user()?->proprietaire;
    }

    public function rules(): array
    {
        return [
            'diplome' => 'required|string|max:255',
            'etablissement' => 'required|string|max:255',
            'description' => 'nullable|string',
            'domaine_etude' => 'nullable|string|max:255',
            'date_debut' => 'required|date',
            'date_fin' => 'nullable|date|after_or_equal:date_debut',
            'ordre' => 'integer|min:0',
        ];
    }
}
