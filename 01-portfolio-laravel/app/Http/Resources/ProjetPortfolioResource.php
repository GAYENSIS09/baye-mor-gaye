<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ProjetPortfolioResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'titre' => $this->titre,
            'slug' => $this->slug,
            'description' => $this->description,
            'courte_description' => $this->courte_description,
            'technologies' => $this->technologies,
            'date_realisation' => $this->date_realisation?->toIso8601String(),
            'url_demo' => $this->url_demo,
            'url_code' => $this->url_code,
            'image_couverture' => $this->image_couverture,
            'est_publie' => $this->est_publie,
            'est_en_vedette' => $this->est_en_vedette,
            'publie_le' => $this->publie_le?->toIso8601String(),
            'nombre_vues' => $this->nombre_vues,
            'commentaires' => CommentaireResource::collection($this->whenLoaded('commentaires')),
            'likes' => LikeResource::collection($this->whenLoaded('likes')),
            'medias' => MediaResource::collection($this->whenLoaded('medias')),
            'created_at' => $this->created_at?->toIso8601String(),
            'updated_at' => $this->updated_at?->toIso8601String(),
        ];
    }
}
