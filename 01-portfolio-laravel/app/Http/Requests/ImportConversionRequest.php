<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class ImportConversionRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user() !== null;
    }

    public function rules(): array
    {
        return [
            'url_externe' => 'required_without:fichier|url|max:500',
            'fichier' => 'required_without:url_externe|file|mimes:json,ics,csv|max:2048',
            'emploi_du_temps_id' => 'nullable|exists:emploi_du_temps,id',
        ];
    }
}
