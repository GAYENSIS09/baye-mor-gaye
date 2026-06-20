<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class MediaProjetResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'type' => $this->type,
            'chemin_fichier' => $this->chemin_fichier,
            'url_externe' => $this->url_externe,
            'vignette' => $this->vignette,
            'titre' => $this->titre,
            'est_principal' => $this->est_principal,
            'ordre' => $this->ordre,
            'created_at' => $this->created_at?->toIso8601String(),
        ];
    }
}
