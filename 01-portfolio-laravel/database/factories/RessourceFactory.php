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
            'fichier' => fake()->optional()->filePath(),
            'url_externe' => fake()->url(),
            'type' => fake()->randomElement(['fichier', 'lien']),
            'type_fichier' => fake()->optional()->randomElement(['pdf', 'doc', 'zip', 'image']),
            'est_publique' => fake()->boolean(50),
            'nombre_telechargements' => fake()->numberBetween(0, 500),
            'taille' => fake()->optional()->numberBetween(1000, 10000000),
        ];
    }
}
