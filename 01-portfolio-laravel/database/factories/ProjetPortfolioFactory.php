<?php

namespace Database\Factories;

use App\Models\ProjetPortfolio;
use App\Models\Proprietaire;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

class ProjetPortfolioFactory extends Factory
{
    protected $model = ProjetPortfolio::class;

    public function definition(): array
    {
        $titre = fake()->unique()->words(3, true);

        return [
            'proprietaire_id' => Proprietaire::factory(),
            'titre' => ucfirst($titre),
            'slug' => Str::slug($titre) . '-' . Str::random(6),
            'description' => fake()->paragraphs(3, true),
            'technologies' => fake()->randomElements(['Laravel', 'React', 'TypeScript', 'Python', 'Docker', 'PostgreSQL'], fake()->numberBetween(2, 5)),
            'url_demo' => 'https://demo.' . Str::slug($titre) . '.dev',
            'url_code' => 'https://github.com/baye-mor-gaye/' . Str::slug($titre),
            'est_publie' => true,
            'publie_le' => now()->subDays(fake()->numberBetween(1, 365)),
        ];
    }
}
