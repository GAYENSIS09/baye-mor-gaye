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
                ["Guide $domaine->nom"],
                ["Documentation $domaine->nom"],
                ["Tutoriel $domaine->nom"],
            ];

            foreach ($ressources as [$titre]) {
                Ressource::firstOrCreate(
                    ['proprietaire_id' => $proprietaire->id, 'titre' => $titre],
                    [
                        'domaine_id' => $domaine->id,
                        'est_publique' => true,
                    ]
                );
            }
        }
    }
}
