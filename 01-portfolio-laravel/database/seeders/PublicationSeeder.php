<?php

namespace Database\Seeders;

use App\Models\Domaine;
use App\Models\MediaPublication;
use App\Models\Proprietaire;
use App\Models\Publication;
use Illuminate\Database\Seeder;
use Illuminate\Support\Str;

class PublicationSeeder extends Seeder
{
    public function run(): void
    {
        $proprietaire = Proprietaire::first();
        $domaines = Domaine::all();

        $coverImages = [
            'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=800',
            'https://images.unsplash.com/photo-1555949963-aa79dcee981c?w=800',
            'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=800',
            'https://images.unsplash.com/photo-1504639725590-34d0984388bd?w=800',
            'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800',
            'https://images.unsplash.com/photo-1515378791036-0648a3ef77b2?w=800',
            'https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=800',
            'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=800',
        ];

        $pubTypes = ['article', 'tutoriel', 'article', 'note', 'article', 'tutoriel', 'article', 'note'];

        $articles = [
            ['Introduction a Laravel 11', 'Découvrez les nouvelles fonctionnalités de Laravel 11 et comment les utiliser dans vos projets.'],
            ['Les fondamentaux de React', 'Apprenez les bases de React avec des exemples concrets.'],
            ['Comprendre les API REST', 'Guide complet sur la création d\'API REST avec Laravel.'],
            ['Tips TypeScript', 'Astuces et bonnes pratiques pour mieux utiliser TypeScript.'],
            ['Machine Learning pour les debutants', 'Introduction au Machine Learning avec Python.'],
            ['Docker en pratique', 'Déployez vos applications avec Docker facilement.'],
            ['Optimisation des performances', 'Techniques d\'optimisation pour applications Laravel.'],
            ['Architecture logicielle', 'Principes SOLID et design patterns en PHP.'],
        ];

        foreach (range(0, 7) as $i) {
            [$titre, $extrait] = $articles[$i];

            $pub = Publication::firstOrCreate(
                ['slug' => Str::slug($titre) . '-' . Str::random(6)],
                [
                    'proprietaire_id' => $proprietaire->id,
                    'titre' => $titre,
                    'contenu' => fake()->paragraphs(8, true),
                    'contenu_json' => ['blocks' => []],
                    'contenu_html' => '<p>' . implode('</p><p>', fake()->paragraphs(5)) . '</p>',
                    'extrait' => $extrait,
                    'type' => $pubTypes[$i],
                    'image_couverture' => $coverImages[$i],
                    'est_publie' => true,
                    'publie_le' => now()->subDays(fake()->numberBetween(1, 365)),
                    'nombre_vues' => fake()->numberBetween(10, 5000),
                ]
            );

            $pub->domaines()->syncWithoutDetaching(
                $domaines->random(fake()->numberBetween(1, 3))->pluck('id')
            );

            MediaPublication::factory()->count(2)->create([
                'publication_id' => $pub->id,
                'type' => 'image',
            ]);
        }
    }
}
