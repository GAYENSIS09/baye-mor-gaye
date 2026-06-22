<?php

namespace Database\Factories;

use App\Models\Ressource;
use App\Models\Proprietaire;
use App\Models\Domaine;
use Illuminate\Database\Eloquent\Factories\Factory;

class RessourceFactory extends Factory
{
    protected $model = Ressource::class;

    public function definition(): array
    {
        return [
            'proprietaire_id' => Proprietaire::factory(),
            'domaine_id' => Domaine::factory(),
            'titre' => fake()->sentence(3),
            'description' => fake()->paragraph(),
            'est_publique' => fake()->boolean(50),
        ];
    }
}
