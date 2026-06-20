<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UpdateDomaineRequest extends FormRequest
{
    public function authorize(): bool
    {
        return (bool) $this->user()?->proprietaire;
    }

    public function rules(): array
    {
        return [
            'nom' => 'sometimes|string|max:255',
            'slug' => 'nullable|string|max:255|unique:domaines,slug',
            'description' => 'nullable|string',
            'couleur' => 'nullable|string|max:7',
        ];
    }
}
