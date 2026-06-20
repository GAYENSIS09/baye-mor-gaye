<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UpdateProfileRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user() !== null;
    }

    public function rules(): array
    {
        return [
            'bio' => 'nullable|string',
            'titre_professionnel' => 'nullable|string|max:255',
            'localisation' => 'nullable|string|max:255',
            'site_web' => 'nullable|url|max:255',
            'url_linkedin' => 'nullable|url|max:255',
            'url_github' => 'nullable|url|max:255',
            'nom' => 'nullable|string|max:255',
            'photo' => 'nullable|string',
        ];
    }
}
