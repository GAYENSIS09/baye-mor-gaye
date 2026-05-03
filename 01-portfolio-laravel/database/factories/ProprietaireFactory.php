<?php

namespace Database\Factories;

use App\Models\Proprietaire;
use App\Models\Utilisateur;
use Illuminate\Database\Eloquent\Factories\Factory;

class ProprietaireFactory extends Factory
{
    protected $model = Proprietaire::class;

    public function definition(): array
    {
        return [
            'utilisateur_id' => Utilisateur::factory(),
            'bio' => fake()->paragraph(),
            'titre_professionnel' => 'Ingenieur logiciel & passionne d\'IA',
            'localisation' => 'Dakar, Senegal',
            'site_web' => 'https://baye-mor-gaye.dev',
            'url_linkedin' => 'https://linkedin.com/in/baye-mor-gaye',
            'url_github' => 'https://github.com/baye-mor-gaye',
        ];
    }
}
