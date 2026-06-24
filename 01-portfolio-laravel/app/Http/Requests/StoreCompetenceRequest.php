<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreCompetenceRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user() !== null;
    }

    public function rules(): array
    {
        return [
            'nom' => 'required|string|max:255',
            'categorie' => 'nullable|string|max:255',
            'icone' => 'nullable|string|max:255',
            'niveau' => 'nullable|in:debutant,intermediaire,avance,expert',
            'est_surligne' => 'boolean',
        ];
    }
}
