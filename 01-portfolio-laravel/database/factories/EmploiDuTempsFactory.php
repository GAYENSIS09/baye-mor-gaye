<?php

namespace Database\Factories;

use App\Models\EmploiDuTemps;
use App\Models\Proprietaire;
use Illuminate\Database\Eloquent\Factories\Factory;

class EmploiDuTempsFactory extends Factory
{
    protected $model = EmploiDuTemps::class;

    public function definition(): array
    {
        return [
            'proprietaire_id' => Proprietaire::factory(),
            'titre' => fake()->randomElement(['Semaine type', 'Emploi du temps academique', 'Planning projet']),
            'description' => fake()->sentence(),
            'type' => fake()->randomElement(['professionnel', 'academique', 'personnel']),
            'est_actif' => true,
        ];
    }
}
