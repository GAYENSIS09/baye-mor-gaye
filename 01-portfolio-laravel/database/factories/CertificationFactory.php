<?php

namespace Database\Factories;

use App\Models\Certification;
use App\Models\Proprietaire;
use Illuminate\Database\Eloquent\Factories\Factory;

class CertificationFactory extends Factory
{
    protected $model = Certification::class;

    public function definition(): array
    {
        return [
            'proprietaire_id' => Proprietaire::factory(),
            'titre' => fake()->sentence(3),
            'organisme' => fake()->randomElement(['Coursera', 'Udemy', 'Laracasts', 'OpenClassrooms', 'LinkedIn Learning']),
            'description' => fake()->paragraph(),
            'date_obtention' => fake()->date(),
            'date_expiration' => fake()->optional()->date(),
            'ordre' => fake()->numberBetween(0, 10),
        ];
    }
}
