<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreCommentaireRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'contenu' => 'required|string|min:2|max:2000',
            'commentable_id' => 'required|integer',
            'commentable_type' => 'required|string|in:publications,projets',
            'parent_id' => 'nullable|integer|exists:commentaires,id',
        ];
    }
}
