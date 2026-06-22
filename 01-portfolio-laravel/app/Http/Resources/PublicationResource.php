<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class PublicationResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'titre' => $this->titre,
            'slug' => $this->slug,
            'contenu' => $this->contenu,
            'contenu_json' => $this->contenu_json,
            'contenu_html' => $this->contenu_html,
            'extrait' => $this->extrait,
            'type' => $this->type,
            'image_couverture' => $this->image_couverture,
            'est_publie' => $this->est_publie,
            'publie_le' => $this->publie_le?->toIso8601String(),
            'nombre_vues' => $this->nombre_vues,
            'domaines' => DomaineResource::collection($this->whenLoaded('domaines')),
            'commentaires' => CommentaireResource::collection($this->whenLoaded('commentaires')),
            'likes' => LikeResource::collection($this->whenLoaded('likes')),
            'medias' => MediaResource::collection($this->whenLoaded('medias')),
            'created_at' => $this->created_at?->toIso8601String(),
            'updated_at' => $this->updated_at?->toIso8601String(),
        ];
    }
}
