<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class ToggleLikeRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user() !== null;
    }

    public function rules(): array
    {
        return [
            'likeable_type' => 'required_without_all:publication_id,projet_id|in:publication,projet_portfolio,commentaire',
            'likeable_id' => 'required_without_all:publication_id,projet_id|integer',
            'publication_id' => 'required_without_all:likeable_type,likeable_id|exists:publications,id',
            'projet_id' => 'required_without_all:likeable_type,likeable_id|exists:projet_portfolios,id',
        ];
    }
}
