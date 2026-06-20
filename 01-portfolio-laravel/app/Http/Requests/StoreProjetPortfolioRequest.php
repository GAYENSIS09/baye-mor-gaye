<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreProjetPortfolioRequest extends FormRequest
{
    public function authorize(): bool
    {
        return (bool) $this->user()?->proprietaire;
    }

    public function rules(): array
    {
        return [
            'titre' => 'required|string|max:255',
            'description' => 'required|string',
            'courte_description' => 'nullable|string|max:300',
            'technologies' => 'nullable|array',
            'technologies.*' => 'string',
            'date_realisation' => 'nullable|date',
            'url_demo' => 'nullable|url|max:500',
            'url_code' => 'nullable|url|max:500',
            'image_couverture' => 'nullable|string',
            'est_publie' => 'boolean',
            'est_en_vedette' => 'boolean',
        ];
    }
}
