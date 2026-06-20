<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreEvenementRequest extends FormRequest
{
    public function authorize(): bool
    {
        return (bool) $this->user()?->proprietaire;
    }

    public function rules(): array
    {
        return [
            'emploi_du_temps_id' => 'required|exists:emploi_du_temps,id',
            'titre' => 'required|string|max:255',
            'description' => 'nullable|string',
            'date_debut' => 'required|date',
            'date_fin' => 'nullable|date|after_or_equal:date_debut',
            'lieu' => 'nullable|string|max:255',
            'couleur' => 'nullable|string|max:7',
            'est_journee_complete' => 'boolean',
            'statut' => 'in:planifie,confirme,annule,termine',
        ];
    }
}
