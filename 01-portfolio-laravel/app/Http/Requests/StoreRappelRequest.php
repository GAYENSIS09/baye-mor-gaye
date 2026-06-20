<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreRappelRequest extends FormRequest
{
    public function authorize(): bool
    {
        return (bool) $this->user()?->proprietaire;
    }

    public function rules(): array
    {
        return [
            'evenement_id' => 'nullable|exists:evenements,id',
            'titre' => 'required|string|max:255',
            'message' => 'nullable|string',
            'notifie_le' => 'nullable|date',
        ];
    }
}
