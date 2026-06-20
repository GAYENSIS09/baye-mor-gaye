<?php

namespace Database\Factories;

use App\Models\VuePage;
use App\Models\Proprietaire;
use Illuminate\Database\Eloquent\Factories\Factory;

class VuePageFactory extends Factory
{
    protected $model = VuePage::class;

    public function definition(): array
    {
        return [
            'proprietaire_id' => 1,
            'adresse_ip' => fake()->ipv4(),
            'agent_utilisateur' => fake()->userAgent(),
            'referer' => fake()->optional()->url(),
            'visite_le' => fake()->dateTimeThisMonth(),
            'page' => fake()->randomElement(['publication', 'projet', 'accueil', 'competences']),
            'page_id' => fake()->optional()->numberBetween(1, 20),
        ];
    }
}
