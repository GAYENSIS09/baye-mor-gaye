<?php

namespace Database\Seeders;

use App\Models\Competence;
use App\Models\NiveauCompetence;
use App\Models\Proprietaire;
use Illuminate\Database\Seeder;

class CompetenceSeeder extends Seeder
{
    public function run(): void
    {
        $proprietaire = Proprietaire::first();

        $skillList = [
            ['Laravel', 'Backend'], ['React', 'Frontend'], ['TypeScript', 'Langage'],
            ['Python', 'Langage'], ['Docker', 'DevOps'], ['PostgreSQL', 'Base de donnees'],
            ['Git', 'Outils'], ['REST API', 'Backend'], ['TailwindCSS', 'Frontend'],
            ['Machine Learning', 'IA'], ['PHP', 'Langage'], ['Node.js', 'Backend'],
            ['MySQL', 'Base de donnees'], ['Redis', 'Base de donnees'], ['Linux', 'DevOps'],
            ['Figma', 'Design'], ['GraphQL', 'Backend'], ['Vue.js', 'Frontend'],
        ];

        $niveaux = ['debutant', 'intermediaire', 'avance', 'expert'];

        foreach ($skillList as [$nom, $categorie]) {
            $competence = Competence::firstOrCreate(
                compact('nom', 'categorie'),
                compact('nom', 'categorie')
            );

            NiveauCompetence::firstOrCreate(
                [
                    'proprietaire_id' => $proprietaire->id,
                    'competence_id' => $competence->id,
                ],
                [
                    'niveau' => fake()->randomElement($niveaux),
                    'est_surligne' => fake()->boolean(20),
                ]
            );
        }
    }
}
