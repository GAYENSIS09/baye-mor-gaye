<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UpdateRappelRequest extends FormRequest
{
    public function authorize(): bool
    {
        return (bool) $this->user()?->proprietaire;
    }

    public function rules(): array
    {
        return [
            'titre' => 'sometimes|string|max:255',
            'message' => 'nullable|string',
            'evenement_id' => 'nullable|exists:evenements,id',
            'notifie_le' => 'nullable|date',
        ];
    }
}
