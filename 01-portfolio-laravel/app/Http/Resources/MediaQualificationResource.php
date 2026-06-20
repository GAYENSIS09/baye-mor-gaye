<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class MediaQualificationResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'type' => $this->type,
            'chemin_fichier' => $this->chemin_fichier,
            'titre' => $this->titre,
            'taille' => $this->taille,
            'ordre' => $this->ordre,
            'created_at' => $this->created_at?->toIso8601String(),
        ];
    }
}
