<?php

namespace Database\Factories;

use App\Models\Conversion;
use App\Models\Evenement;
use Illuminate\Database\Eloquent\Factories\Factory;

class ConversionFactory extends Factory
{
    protected $model = Conversion::class;

    public function definition(): array
    {
        return [
            'evenement_id' => Evenement::factory(),
            'titre' => fake()->sentence(3),
            'url_externe' => fake()->url(),
            'fichier_original' => fake()->optional()->filePath(),
            'modele_utilise' => fake()->optional()->randomElement(['gpt-4', 'claude-3', 'plantuml', 'custom']),
            'type' => fake()->randomElement(['document', 'image', 'video', 'lien', 'uml']),
            'resultat_json' => fake()->optional()->randomElement([
                ['status' => 'success', 'output' => '...'],
                ['status' => 'pending', 'message' => 'En attente'],
            ]),
            'confiance' => fake()->optional()->randomFloat(2, 0, 1),
        ];
    }
}
