<?php

namespace Database\Factories;

use App\Models\Competence;
use Illuminate\Database\Eloquent\Factories\Factory;

class CompetenceFactory extends Factory
{
    protected $model = Competence::class;

    public function definition(): array
    {
        $skills = [
            ['Laravel', 'Backend'], ['React', 'Frontend'], ['TypeScript', 'Langage'],
            ['Python', 'Langage'], ['Docker', 'DevOps'], ['PostgreSQL', 'Base de donnees'],
            ['Git', 'Outils'], ['REST API', 'Backend'], ['TailwindCSS', 'Frontend'],
            ['Machine Learning', 'IA'],
        ];
        [$nom, $categorie] = fake()->randomElement($skills);

        return compact('nom', 'categorie');
    }
}
