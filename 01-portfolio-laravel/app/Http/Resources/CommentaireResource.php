<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class CommentaireResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'contenu' => $this->contenu,
            'est_approuve' => $this->est_approuve,
            'auteur' => [
                'id' => $this->auteur?->id,
                'nom' => $this->auteur?->nom,
                'photo' => $this->auteur?->photo,
            ],
            'parent_id' => $this->parent_id,
            'commentable_id' => $this->commentable_id,
            'commentable_type' => $this->commentable_type,
            'commentable' => $this->whenLoaded('commentable', fn() => [
                'id' => $this->commentable->id,
                'titre' => $this->commentable->titre ?? null,
                'slug' => $this->commentable->slug ?? null,
            ]),
            'created_at' => $this->created_at?->toIso8601String(),
            'updated_at' => $this->updated_at?->toIso8601String(),
        ];
    }
}
