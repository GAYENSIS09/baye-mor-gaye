<?php

namespace Database\Seeders;

use App\Models\Like;
use App\Models\ProjetPortfolio;
use App\Models\Publication;
use App\Models\Utilisateur;
use Illuminate\Database\Seeder;

class LikeSeeder extends Seeder
{
    public function run(): void
    {
        $visiteurs = Utilisateur::where('email', '!=', config('proprietaire.email', 'contact@baye-mor-gaye.dev'))->get();
        $publications = Publication::all();
        $projets = ProjetPortfolio::all();

        $likeableItems = collect();

        foreach ($publications as $pub) {
            $likeableItems->push(['type' => Publication::class, 'id' => $pub->id]);
        }
        foreach ($projets as $projet) {
            $likeableItems->push(['type' => ProjetPortfolio::class, 'id' => $projet->id]);
        }

        foreach ($visiteurs as $visiteur) {
            $dejaLike = [];
            foreach ($likeableItems->random(min(5, $likeableItems->count())) as $item) {
                $key = $item['type'] . '-' . $item['id'];
                if (in_array($key, $dejaLike)) continue;
                $dejaLike[] = $key;

                Like::firstOrCreate([
                    'auteur_id' => $visiteur->id,
                    'likeable_type' => $item['type'],
                    'likeable_id' => $item['id'],
                ]);
            }
        }
    }
}
