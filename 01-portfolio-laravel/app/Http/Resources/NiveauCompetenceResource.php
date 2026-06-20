<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class NiveauCompetenceResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'niveau' => $this->niveau,
            'est_surligne' => $this->est_surligne,
            'competence_id' => $this->competence_id,
            'competence' => CompetenceResource::make($this->whenLoaded('competence')),
        ];
    }
}
