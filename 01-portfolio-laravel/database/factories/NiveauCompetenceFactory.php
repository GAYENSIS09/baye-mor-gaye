<?php

namespace Database\Factories;

use App\Models\NiveauCompetence;
use App\Models\Proprietaire;
use App\Models\Competence;
use Illuminate\Database\Eloquent\Factories\Factory;

class NiveauCompetenceFactory extends Factory
{
    protected $model = NiveauCompetence::class;

    public function definition(): array
    {
        return [
            'proprietaire_id' => Proprietaire::factory(),
            'competence_id' => Competence::factory(),
            'niveau' => fake()->randomElement(['debutant', 'intermediaire', 'avance', 'expert']),
            'est_surligne' => fake()->boolean(20),
        ];
    }
}
