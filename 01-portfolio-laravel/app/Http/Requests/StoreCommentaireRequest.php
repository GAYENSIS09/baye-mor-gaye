<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Support\Facades\DB;

class StoreCommentaireRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'contenu'          => 'required|string|min:2|max:2000',
            'commentable_id'   => [
                'required',
                'integer',
                'min:1',
                function ($attribute, $value, $fail) {
                    $type = $this->input('commentable_type');
                    $table = match ($type) {
                        'publication', 'publications'      => 'publications',
                        'projet', 'projets', 'projet_portfolio' => 'projet_portfolios',
                        default                            => null,
                    };
                    if (!$table || !DB::table($table)->where('id', $value)->exists()) {
                        $fail('La publication ou le projet référencé n\'existe pas.');
                    }
                },
            ],
            'commentable_type' => 'required|string|in:publication,publications,projet,projets,projet_portfolio',
            'parent_id'        => 'nullable|integer|exists:commentaires,id',
        ];
    }
}
