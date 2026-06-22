<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreExperienceRequest extends FormRequest
{
    public function authorize(): bool
    {
        return (bool) $this->user()?->proprietaire;
    }

public function rules(): array
    {
        return [
            'titre' => 'required|string|max:255',
            'entreprise' => 'required|string|max:255',
            'description' => 'nullable|string',
            'date_debut' => 'required|date',
            'date_fin' => 'nullable|date|after_or_equal:date_debut',
            'est_actuel' => 'boolean',
            'lieu' => 'nullable|string|max:255',
            'ordre' => 'integer|min:0',
            'media' => 'nullable|file|mimes:jpg,jpeg,png,gif,webp|max:10240',
        ];
    }
}
