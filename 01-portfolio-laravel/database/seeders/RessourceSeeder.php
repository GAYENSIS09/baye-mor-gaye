<?php

namespace Database\Seeders;

use App\Models\Domaine;
use App\Models\Proprietaire;
use App\Models\Ressource;
use Illuminate\Database\Seeder;

class RessourceSeeder extends Seeder
{
    public function run(): void
    {
        $proprietaire = Proprietaire::first();
        $domaines = Domaine::all();

        foreach ($domaines as $domaine) {
            $ressources = [
                ["Guide $domaine->nom", 'https://example.com/guide-' . $domaine->slug],
                ["Documentation $domaine->nom", 'https://docs.example.com/' . $domaine->slug],
                ["Tutoriel $domaine->nom", 'https://tuto.example.com/' . $domaine->slug],
            ];

            foreach ($ressources as [$titre, $url]) {
                Ressource::firstOrCreate(
                    ['proprietaire_id' => $proprietaire->id, 'titre' => $titre],
                    [
                        'domaine_id' => $domaine->id,
                        'url_externe' => $url,
                        'type' => 'lien',
                        'est_publique' => true,
                        'nombre_telechargements' => fake()->numberBetween(0, 200),
                    ]
                );
            }
        }
    }
}
