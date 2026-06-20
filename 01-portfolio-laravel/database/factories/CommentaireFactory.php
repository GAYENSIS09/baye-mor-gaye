<?php

namespace Database\Factories;

use App\Models\Commentaire;
use App\Models\Utilisateur;
use Illuminate\Database\Eloquent\Factories\Factory;

class CommentaireFactory extends Factory
{
    protected $model = Commentaire::class;

    public function definition(): array
    {
        return [
            'auteur_id' => Utilisateur::factory(),
            'commentable_id' => 1,
            'commentable_type' => 'App\Models\Publication',
            'contenu' => fake()->paragraph(),
            'est_approuve' => fake()->boolean(70),
        ];
    }

    public function approuve(): static
    {
        return $this->state(fn(array $a) => ['est_approuve' => true]);
    }

    public function enAttente(): static
    {
        return $this->state(fn(array $a) => ['est_approuve' => false]);
    }
}
