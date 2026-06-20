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
                'bio' => "Developpeur Fullstack & Ingenieur ML base a Dakar, au Senegal. Passionne par la creation de solutions technologiques a impact social, j'allie expertise en developpement web (Laravel, Next.js, React) et intelligence artificielle (PyTorch, TensorFlow, LLMs). Apres plusieurs annees en freelance et en stage chez Sonatel, je me concentre desormais sur des projets innovants : plateformes pedagogiques IA, systemes de prevision energetique pour SENELEC, et solutions IoT pour le monitoring energetique. Membre actif de la communaute tech senegalaise, je partage mes connaissances via des articles techniques, du mentorat et des contributions open-source. Mon objectif : batir des outils qui transforment concretement le quotidien des africains.",
                'titre_professionnel' => 'Developpeur Fullstack & Ingenieur ML',
                'localisation' => 'Dakar, Senegal',
                'site_web' => 'https://baye-mor-gaye.dev',
                'url_linkedin' => 'https://linkedin.com/in/gayensis09',
                'url_github' => 'https://github.com/baye-mor-gaye',
            ]
        );
    }
}