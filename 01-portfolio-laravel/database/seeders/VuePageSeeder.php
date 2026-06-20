<?php

namespace Database\Seeders;

use App\Models\ProjetPortfolio;
use App\Models\Publication;
use App\Models\VuePage;
use Illuminate\Database\Seeder;

class VuePageSeeder extends Seeder
{
    public function run(): void
    {
        $publications = Publication::all();
        $projets = ProjetPortfolio::all();

        foreach ($publications as $pub) {
            VuePage::factory()->count(fake()->numberBetween(3, 8))->create([
                'proprietaire_id' => $pub->proprietaire_id,
                'page' => 'publication',
                'page_id' => $pub->id,
            ]);
        }

        foreach ($projets as $projet) {
            VuePage::factory()->count(fake()->numberBetween(2, 5))->create([
                'proprietaire_id' => $projet->proprietaire_id,
                'page' => 'projet',
                'page_id' => $projet->id,
            ]);
        }

        VuePage::factory()->count(20)->create([
            'proprietaire_id' => $projets->first()->proprietaire_id,
            'page' => 'accueil',
            'page_id' => null,
        ]);
    }
}
