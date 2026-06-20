<?php

namespace Database\Factories;

use App\Models\Notification;
use App\Models\Proprietaire;
use Illuminate\Database\Eloquent\Factories\Factory;

class NotificationFactory extends Factory
{
    protected $model = Notification::class;

    public function definition(): array
    {
        return [
            'proprietaire_id' => Proprietaire::factory(),
            'titre' => fake()->randomElement([
                'Nouveau commentaire', 'Publication approuvee',
                'Projet mis a jour', 'Rappel evenement',
            ]),
            'message' => fake()->sentence(),
            'type' => fake()->randomElement(['info', 'succes', 'avertissement', 'erreur']),
            'donnees' => fake()->optional()->randomElement([
                ['action' => 'comment', 'id' => 1],
                ['action' => 'publish', 'slug' => 'article-slug'],
            ]),
            'est_lue' => fake()->boolean(50),
            'lue_le' => fake()->optional()->dateTimeThisMonth(),
        ];
    }
}
