<?php

namespace Database\Factories;

use App\Models\Experience;
use App\Models\Proprietaire;
use Illuminate\Database\Eloquent\Factories\Factory;

class ExperienceFactory extends Factory
{
    protected $model = Experience::class;

    public function definition(): array
    {
        return [
            'proprietaire_id' => Proprietaire::factory(),
            'titre' => fake()->jobTitle(),
            'entreprise' => fake()->company(),
            'description' => fake()->paragraphs(2, true),
            'date_debut' => fake()->date(),
            'date_fin' => fake()->optional()->date(),
            'est_actuel' => fake()->boolean(20),
            'lieu' => fake()->city() . ', ' . fake()->country(),
            'ordre' => fake()->numberBetween(0, 10),
        ];
    }
}
