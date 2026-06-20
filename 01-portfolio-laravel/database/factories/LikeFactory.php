<?php

namespace Database\Factories;

use App\Models\Like;
use App\Models\Utilisateur;
use Illuminate\Database\Eloquent\Factories\Factory;

class LikeFactory extends Factory
{
    protected $model = Like::class;

    public function definition(): array
    {
        return [
            'auteur_id' => Utilisateur::factory(),
            'likeable_id' => 1,
            'likeable_type' => 'App\Models\Publication',
        ];
    }
}
