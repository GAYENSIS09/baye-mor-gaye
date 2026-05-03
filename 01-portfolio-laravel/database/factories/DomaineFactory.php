<?php

namespace Database\Factories;

use App\Models\Domaine;
use App\Models\Proprietaire;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

class DomaineFactory extends Factory
{
    protected $model = Domaine::class;

    public function definition(): array
    {
        $nom = fake()->unique()->randomElement([
            'Developpement Web', 'Intelligence Artificielle', 'DevOps',
            'Mobile', 'Data Science', 'Cybersecurite',
        ]);

        return [
            'proprietaire_id' => Proprietaire::factory(),
            'nom' => $nom,
            'slug' => Str::slug($nom),
            'description' => fake()->sentence(),
            'couleur' => fake()->hexColor(),
        ];
    }
}
