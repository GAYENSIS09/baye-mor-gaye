<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class ImportEdtRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user() !== null;
    }

    public function rules(): array
    {
        return [
            'fichier' => 'required|file|mimes:jpg,jpeg,png,pdf|max:10240',
            'edt_id' => 'required|exists:emploi_du_temps,id',
        ];
    }
}
