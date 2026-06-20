<?php

namespace Database\Factories;

use App\Models\Formation;
use App\Models\Proprietaire;
use Illuminate\Database\Eloquent\Factories\Factory;

class FormationFactory extends Factory
{
    protected $model = Formation::class;

    public function definition(): array
    {
        return [
            'proprietaire_id' => Proprietaire::factory(),
            'diplome' => fake()->randomElement([
                'Licence en Informatique', 'Master en Genie Logiciel',
                'BTS Informatique', 'Doctorat en IA',
            ]),
            'etablissement' => fake()->randomElement([
                'Universite Cheikh Anta Diop', 'Ecole Superieure Polytechnique',
                'Universite de Dakar', 'ESIBA',
            ]),
            'description' => fake()->paragraph(),
            'domaine_etude' => fake()->randomElement(['Informatique', 'Mathematiques', 'Genie Logiciel', 'IA']),
            'date_debut' => fake()->date(),
            'date_fin' => fake()->optional()->date(),
            'ordre' => fake()->numberBetween(0, 10),
        ];
    }
}
