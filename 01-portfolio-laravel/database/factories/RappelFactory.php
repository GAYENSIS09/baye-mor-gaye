<?php

namespace Database\Factories;

use App\Models\Rappel;
use App\Models\Proprietaire;
use App\Models\Evenement;
use Illuminate\Database\Eloquent\Factories\Factory;

class RappelFactory extends Factory
{
    protected $model = Rappel::class;

    public function definition(): array
    {
        return [
            'proprietaire_id' => Proprietaire::factory(),
            'evenement_id' => Evenement::factory(),
            'titre' => 'Rappel: ' . fake()->sentence(2),
            'message' => fake()->optional()->sentence(),
            'notifie_le' => fake()->optional()->dateTimeThisMonth(),
            'est_notifie' => fake()->boolean(50),
        ];
    }
}
