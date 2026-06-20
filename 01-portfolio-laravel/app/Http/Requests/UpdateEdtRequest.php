<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UpdateEdtRequest extends FormRequest
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
            'type' => 'sometimes|in:professionnel,academique,personnel',
            'est_actif' => 'boolean',
        ];
    }
}
