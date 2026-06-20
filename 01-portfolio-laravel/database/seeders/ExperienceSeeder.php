<?php

namespace Database\Seeders;

use App\Models\Experience;
use App\Models\MediaQualification;
use App\Models\Proprietaire;
use Illuminate\Database\Seeder;

class ExperienceSeeder extends Seeder
{
    public function run(): void
    {
        $proprietaire = Proprietaire::first();

        $experiences = [
            ['Stage en Developpement Full-Stack', 'Sonatel', 'Developpement d\'applications web et mobile pour la gestion interne.', '2025-06-01', null, true, 'Dakar, Senegal', 0, 'https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=400'],
            ['Developpeur Freelance', 'Auto-entrepreneur', 'Creation de sites web et applications sur mesure pour divers clients.', '2024-01-01', '2025-05-31', false, 'Dakar, Senegal', 1, 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=400'],
            ['Assistant Technique en Informatique', 'UCAD', 'Support technique et maintenance des equipements informatiques.', '2023-10-01', '2024-12-31', false, 'Dakar, Senegal', 2, 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=400'],
        ];

        foreach ($experiences as [$titre, $entreprise, $description, $debut, $fin, $actuel, $lieu, $ordre, $media]) {
            $exp = Experience::updateOrCreate(
                ['proprietaire_id' => $proprietaire->id, 'titre' => $titre, 'date_debut' => $debut],
                compact('titre', 'entreprise', 'description', 'lieu', 'ordre') + [
                    'proprietaire_id' => $proprietaire->id,
                    'date_debut' => $debut,
                    'date_fin' => $fin,
                    'est_actuel' => $actuel,
                ]
            );

            if ($exp->wasRecentlyCreated || !$exp->medias()->count()) {
                MediaQualification::firstOrCreate(
                    ['qualifiable_id' => $exp->id, 'qualifiable_type' => Experience::class, 'type' => 'image'],
                    [
                        'chemin_fichier' => $media,
                        'titre' => $entreprise,
                        'ordre' => 0,
                    ]
                );
            }
        }
    }
}
