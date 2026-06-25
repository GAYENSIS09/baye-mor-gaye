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
            'nom' => $this->utilisateur?->nom,
            'email' => $this->utilisateur?->email,
            'bio' => $this->bio,
            'titre_professionnel' => $this->titre_professionnel,
            'localisation' => $this->localisation,
            'site_web' => $this->site_web,
            'url_linkedin' => $this->url_linkedin,
            'url_github' => $this->url_github,
            'photo' => $this->utilisateur?->photo ?? config('proprietaire.photo'),
            'competences' => $this->whenLoaded('niveauxCompetence', function () {
                return $this->niveauxCompetence
                    ->groupBy('competence_id')
                    ->map(function ($niveaux) {
                        $competence = $niveaux->first()->competence;
                        if (!$competence) return null;
                        return [
                            'id' => $competence->id,
                            'nom' => $competence->nom,
                            'categorie' => $competence->categorie,
                            'icone' => $competence->icone,
                            'niveaux' => $niveaux->map(fn ($n) => [
                                'id' => $n->id,
                                'niveau' => $n->niveau,
                                'est_surligne' => $n->est_surligne,
                            ])->values()->all(),
                        ];
                    })
                    ->filter()
                    ->values()
                    ->all();
            }),
            'domaines' => DomaineResource::collection($this->whenLoaded('domaines')),
            'experiences' => ExperienceResource::collection($this->whenLoaded('experiences')),
            'formations' => FormationResource::collection($this->whenLoaded('formations')),
            'certifications' => CertificationResource::collection($this->whenLoaded('certifications')),
            'created_at' => $this->created_at?->toIso8601String(),
            'updated_at' => $this->updated_at?->toIso8601String(),
        ];
    }
}
