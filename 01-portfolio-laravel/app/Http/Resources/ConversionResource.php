<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ConversionResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'titre' => $this->titre,
            'url_externe' => $this->url_externe,
            'fichier_original' => $this->fichier_original,
            'modele_utilise' => $this->modele_utilise,
            'type' => $this->type,
            'resultat_json' => $this->resultat_json,
            'confiance' => $this->confiance,
            'emploi_du_temps_id' => $this->emploi_du_temps_id,
            'evenement_id' => $this->evenement_id,
            'created_at' => $this->created_at?->toIso8601String(),
            'updated_at' => $this->updated_at?->toIso8601String(),
        ];
    }
}
