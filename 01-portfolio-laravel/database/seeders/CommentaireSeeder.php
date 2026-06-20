<?php

namespace Database\Seeders;

use App\Models\Commentaire;
use App\Models\ProjetPortfolio;
use App\Models\Publication;
use App\Models\Utilisateur;
use Illuminate\Database\Seeder;

class CommentaireSeeder extends Seeder
{
    public function run(): void
    {
        $visiteurs = Utilisateur::where('email', '!=', config('proprietaire.email', 'contact@baye-mor-gaye.dev'))->get();
        $publications = Publication::all();
        $projets = ProjetPortfolio::all();

        foreach ($publications as $pub) {
            foreach ($visiteurs->random(min(3, $visiteurs->count())) as $visiteur) {
                Commentaire::firstOrCreate(
                    [
                        'auteur_id' => $visiteur->id,
                        'commentable_type' => Publication::class,
                        'commentable_id' => $pub->id,
                        'contenu' => fake()->paragraph(),
                    ],
                    [
                        'est_approuve' => fake()->boolean(70),
                    ]
                );
            }
        }

        foreach ($projets as $projet) {
            foreach ($visiteurs->random(min(2, $visiteurs->count())) as $visiteur) {
                Commentaire::firstOrCreate(
                    [
                        'auteur_id' => $visiteur->id,
                        'commentable_type' => ProjetPortfolio::class,
                        'commentable_id' => $projet->id,
                        'contenu' => fake()->paragraph(),
                    ],
                    [
                        'est_approuve' => fake()->boolean(70),
                    ]
                );
            }
        }
    }
}
