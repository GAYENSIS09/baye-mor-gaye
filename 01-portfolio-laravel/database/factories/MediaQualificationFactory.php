<?php

namespace Database\Factories;

use App\Models\MediaQualification;
use Illuminate\Database\Eloquent\Factories\Factory;

class MediaQualificationFactory extends Factory
{
    protected $model = MediaQualification::class;

    public function definition(): array
    {
        return [
            'qualifiable_id' => 1,
            'qualifiable_type' => 'App\Models\Experience',
            'type' => fake()->randomElement(['image', 'video', 'document', 'lien']),
            'chemin_fichier' => 'https://images.unsplash.com/photo-' . fake()->numberBetween(1500000000, 1600000000) . '?w=400',
            'titre' => fake()->optional()->sentence(3),
            'taille' => fake()->optional()->numberBetween(5000, 2000000),
            'ordre' => fake()->numberBetween(0, 10),
        ];
    }
}
