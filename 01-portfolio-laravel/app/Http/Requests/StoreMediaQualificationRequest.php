<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreMediaQualificationRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user() !== null;
    }

    public function rules(): array
    {
        return [
            'qualifiable_type' => 'required|in:experience,formation,certification,ressource',
            'qualifiable_id' => 'required|integer',
            'type' => 'required|in:image,video,document,lien',
            'chemin_fichier' => 'required|string|max:255',
            'titre' => 'nullable|string|max:255',
        ];
    }
}
