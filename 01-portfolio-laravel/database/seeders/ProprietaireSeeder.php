<?php

namespace Database\Seeders;

use App\Models\Proprietaire;
use App\Models\Utilisateur;
use Illuminate\Database\Seeder;

class ProprietaireSeeder extends Seeder
{
    public function run(): void
    {
        $user = Utilisateur::where('email', config('proprietaire.email', 'contact@baye-mor-gaye.dev'))->first() ?? Utilisateur::first();

        Proprietaire::updateOrCreate(
            ['utilisateur_id' => $user->id],
            [
                'bio' => config('proprietaire.bio', "Developpeur Fullstack & Ingenieur ML base a Dakar, au Senegal."),
                'titre_professionnel' => config('proprietaire.titre_professionnel', 'Developpeur Fullstack & Ingenieur ML'),
                'localisation' => config('proprietaire.localisation', 'Dakar, Senegal'),
                'site_web' => config('proprietaire.site_web', 'https://baye-mor-gaye.dev'),
                'url_linkedin' => config('proprietaire.url_linkedin', 'https://linkedin.com/in/gayensis09'),
                'url_github' => config('proprietaire.url_github', 'https://github.com/baye-mor-gaye'),
            ]
        );
    }
}