<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class CompetenceResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'nom' => $this->nom,
            'categorie' => $this->categorie,
            'icone' => $this->icone,
            'niveaux' => $this->whenLoaded('niveaux', function () {
                return $this->niveaux->map(fn ($n) => [
                    'id' => $n->id,
                    'niveau' => $n->niveau,
                    'est_surligne' => $n->est_surligne,
                ]);
            }),
            'created_at' => $this->created_at?->toIso8601String(),
            'updated_at' => $this->updated_at?->toIso8601String(),
        ];
    }
}
