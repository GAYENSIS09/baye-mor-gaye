<?php

namespace Database\Factories;

use App\Models\Publication;
use App\Models\Proprietaire;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

class PublicationFactory extends Factory
{
    protected $model = Publication::class;

    public function definition(): array
    {
        $titre = fake()->unique()->sentence(4);

        return [
            'proprietaire_id' => Proprietaire::factory(),
            'titre' => $titre,
            'slug' => Str::slug($titre) . '-' . Str::random(6),
            'contenu' => fake()->paragraphs(5, true),
            'extrait' => fake()->sentence(),
            'type' => fake()->randomElement(['article', 'tutoriel', 'note']),
            'est_publie' => true,
            'publie_le' => now()->subDays(fake()->numberBetween(1, 365)),
        ];
    }
}
