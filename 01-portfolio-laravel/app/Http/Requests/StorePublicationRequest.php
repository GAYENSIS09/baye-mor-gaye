<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StorePublicationRequest extends FormRequest
{
    public function authorize(): bool
    {
        return (bool) $this->user()?->proprietaire;
    }

    public function rules(): array
    {
        return [
            'titre' => 'required|string|max:255',
            'contenu' => 'required|string',
            'contenu_json' => 'nullable|json',
            'contenu_html' => 'nullable|string',
            'type' => 'required|in:article,tutoriel,note',
            'extrait' => 'nullable|string|max:500',
            'image_couverture' => 'nullable|string',
            'est_publie' => 'boolean',
            'domaines' => 'nullable|array',
            'domaines.*' => 'exists:domaines,id',
        ];
    }
}
