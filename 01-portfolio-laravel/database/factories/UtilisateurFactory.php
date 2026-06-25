<?php

namespace Database\Factories;

use App\Models\Utilisateur;
use Illuminate\Database\Eloquent\Factories\Factory;

class UtilisateurFactory extends Factory
{
    protected $model = Utilisateur::class;

    public function definition(): array
    {
        return [
            'nom' => fake()->name(),
            'email' => fake()->unique()->safeEmail(),
            'password' => 'password',
        ];
    }

    public function proprietaire(): static
    {
        return $this->state(fn(array $attributes) => [
            'nom' => 'Baye Mor Gaye',
            'email' => 'contact@baye-mor-gaye.dev',
        ]);
    }
}
