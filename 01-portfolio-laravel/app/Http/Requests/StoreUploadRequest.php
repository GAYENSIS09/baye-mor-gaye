<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreUploadRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user() !== null;
    }

    public function rules(): array
    {
        return [
            'file' => 'required|file|mimes:pdf,doc,docx,xls,xlsx,zip,png,jpg,jpeg,gif,webp|max:10240',
            'folder' => 'nullable|string|in:publications,projets,ressources,profils,experiences,formations,certifications',
        ];
    }
}
