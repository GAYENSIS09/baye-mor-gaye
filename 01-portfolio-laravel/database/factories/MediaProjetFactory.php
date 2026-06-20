<?php

namespace Database\Factories;

use App\Models\MediaProjet;
use App\Models\ProjetPortfolio;
use Illuminate\Database\Eloquent\Factories\Factory;

class MediaProjetFactory extends Factory
{
    protected $model = MediaProjet::class;

    public function definition(): array
    {
        return [
            'projet_portfolio_id' => ProjetPortfolio::factory(),
            'type' => fake()->randomElement(['image', 'video']),
            'chemin_fichier' => 'https://images.unsplash.com/photo-' . fake()->numberBetween(1500000000, 1600000000) . '?w=800',
            'url_externe' => fake()->optional()->url(),
            'vignette' => fake()->optional()->url(),
            'titre' => fake()->sentence(3),
            'est_principal' => fake()->boolean(20),
            'ordre' => fake()->numberBetween(0, 10),
        ];
    }
}
