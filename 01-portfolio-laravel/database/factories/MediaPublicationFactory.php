<?php

namespace Database\Factories;

use App\Models\MediaPublication;
use App\Models\Publication;
use Illuminate\Database\Eloquent\Factories\Factory;

class MediaPublicationFactory extends Factory
{
    protected $model = MediaPublication::class;

    public function definition(): array
    {
        return [
            'publication_id' => Publication::factory(),
            'type' => fake()->randomElement(['image', 'video', 'code']),
            'chemin_fichier' => 'https://images.unsplash.com/photo-' . fake()->numberBetween(1500000000, 1600000000) . '?w=800',
            'taille' => fake()->numberBetween(10000, 5000000),
            'largeur' => fake()->optional()->numberBetween(400, 1920),
            'hauteur' => fake()->optional()->numberBetween(300, 1080),
            'titre' => fake()->optional()->sentence(3),
            'ordre' => fake()->numberBetween(0, 10),
        ];
    }
}
