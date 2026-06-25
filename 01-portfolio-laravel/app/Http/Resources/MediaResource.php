<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class MediaResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'type' => $this->type,
            'chemin_fichier' => $this->chemin_fichier,
            'url' => $this->chemin_fichier ? \Illuminate\Support\Facades\Storage::url($this->chemin_fichier) : null,
            'url_externe' => $this->url_externe,
            'vignette' => $this->vignette,
            'titre' => $this->titre,
            'taille' => $this->taille,
            'largeur' => $this->largeur,
            'hauteur' => $this->hauteur,
            'est_principal' => $this->est_principal,
            'ordre' => $this->ordre,
            'created_at' => $this->created_at?->toIso8601String(),
        ];
    }
}
