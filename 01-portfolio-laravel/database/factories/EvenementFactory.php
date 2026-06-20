<?php

namespace Database\Factories;

use App\Models\Evenement;
use App\Models\EmploiDuTemps;
use Illuminate\Database\Eloquent\Factories\Factory;

class EvenementFactory extends Factory
{
    protected $model = Evenement::class;

    public function definition(): array
    {
        $start = fake()->dateTimeBetween('-1 month', '+1 month');

        return [
            'emploi_du_temps_id' => EmploiDuTemps::factory(),
            'titre' => fake()->sentence(3),
            'description' => fake()->optional()->paragraph(),
            'date_debut' => $start,
            'date_fin' => fake()->optional()->dateTimeBetween($start, (clone $start)->modify('+4 hours')),
            'lieu' => fake()->optional()->city(),
            'couleur' => fake()->hexColor(),
            'est_journee_complete' => fake()->boolean(10),
            'statut' => fake()->randomElement(['planifie', 'confirme', 'annule', 'termine']),
        ];
    }
}
