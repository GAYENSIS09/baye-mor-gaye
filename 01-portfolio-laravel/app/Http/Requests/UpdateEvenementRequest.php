<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UpdateEvenementRequest extends FormRequest
{
    public function authorize(): bool
    {
        return (bool) $this->user()?->proprietaire;
    }

    public function rules(): array
    {
        return [
            'titre' => 'sometimes|string|max:255',
            'description' => 'nullable|string',
            'date_debut' => 'sometimes|date',
            'date_fin' => 'nullable|date|after_or_equal:date_debut',
            'lieu' => 'nullable|string|max:255',
            'couleur' => 'nullable|string|max:7',
            'est_journee_complete' => 'boolean',
            'statut' => 'sometimes|in:planifie,confirme,annule,termine',
            'emploi_du_temps_id' => 'nullable|exists:emploi_du_temps,id',
        ];
    }
}
