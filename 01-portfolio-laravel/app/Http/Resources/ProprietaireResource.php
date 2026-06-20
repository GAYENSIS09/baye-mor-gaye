<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ProprietaireResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'bio' => $this->bio,
            'titre_professionnel' => $this->titre_professionnel,
            'localisation' => $this->localisation,
            'site_web' => $this->site_web,
            'url_linkedin' => $this->url_linkedin,
            'url_github' => $this->url_github,
            'photo' => config('proprietaire.photo'),
            'competences' => NiveauCompetenceResource::collection($this->whenLoaded('niveauxCompetence')),
            'domaines' => DomaineResource::collection($this->whenLoaded('domaines')),
            'experiences' => ExperienceResource::collection($this->whenLoaded('experiences')),
            'formations' => FormationResource::collection($this->whenLoaded('formations')),
            'certifications' => CertificationResource::collection($this->whenLoaded('certifications')),
            'created_at' => $this->created_at?->toIso8601String(),
            'updated_at' => $this->updated_at?->toIso8601String(),
        ];
    }
}
