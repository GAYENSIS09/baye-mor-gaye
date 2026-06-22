<?php

namespace Database\Seeders;

use App\Models\Formation;
use App\Models\Media;
use App\Models\Proprietaire;
use Illuminate\Database\Seeder;

class FormationSeeder extends Seeder
{
    public function run(): void
    {
        $proprietaire = Proprietaire::first();

        $formations = [
            ['Licence en Informatique', 'Universite Cheikh Anta Diop (UCAD)', 'Formation generale en informatique avec specialisation en genie logiciel.', 'Informatique', '2023-12-01', '2026-07-31', 0, 'https://images.unsplash.com/photo-1562774053-701939374585?w=400'],
            ['Baccalaureat S1', 'Lycee Lamine Gueye', 'Serie scientifique – Mathematiques et Physique.', 'Sciences', '2020-10-01', '2023-07-31', 1, 'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=400'],
        ];

        foreach ($formations as [$diplome, $etablissement, $description, $domaineEtude, $debut, $fin, $ordre, $media]) {
            $formation = Formation::updateOrCreate(
                ['proprietaire_id' => $proprietaire->id, 'diplome' => $diplome, 'etablissement' => $etablissement],
                compact('diplome', 'etablissement', 'description', 'ordre') + [
                    'domaine_etude' => $domaineEtude,
                    'proprietaire_id' => $proprietaire->id,
                    'date_debut' => $debut,
                    'date_fin' => $fin,
                ]
            );

            if ($formation->wasRecentlyCreated || !$formation->medias()->count()) {
                Media::firstOrCreate(
                    ['mediable_id' => $formation->id, 'mediable_type' => Formation::class, 'type' => 'image'],
                    [
                        'chemin_fichier' => $media,
                        'titre' => $etablissement,
                        'ordre' => 0,
                    ]
                );
            }
        }
    }
}
