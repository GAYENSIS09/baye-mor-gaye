<?php

namespace Database\Factories;

use App\Models\Media;
use App\Models\ProjetPortfolio;
use Illuminate\Database\Eloquent\Factories\Factory;

class MediaFactory extends Factory
{
    protected $model = Media::class;

    public function definition(): array
    {
        return [
            'mediable_type' => ProjetPortfolio::class,
            'mediable_id' => ProjetPortfolio::factory(),
            'type' => fake()->randomElement(['image', 'video', 'document', 'lien', 'youtube']),
            'chemin_fichier' => 'https://images.unsplash.com/photo-' . fake()->numberBetween(1500000000, 1600000000) . '?w=800',
            'url_externe' => null,
            'vignette' => null,
            'titre' => fake()->optional()->sentence(3),
            'taille' => fake()->optional()->numberBetween(5000, 5000000),
            'largeur' => fake()->optional()->numberBetween(400, 1920),
            'hauteur' => fake()->optional()->numberBetween(300, 1080),
            'est_principal' => fake()->boolean(20),
            'ordre' => fake()->numberBetween(0, 10),
        ];
    }
}
