<?php

namespace Database\Seeders;

use App\Models\MediaProjet;
use App\Models\ProjetPortfolio;
use App\Models\Proprietaire;
use Illuminate\Database\Seeder;
use Illuminate\Support\Str;

class ProjetPortfolioSeeder extends Seeder
{
    public function run(): void
    {
        $proprietaire = Proprietaire::first();

        $projects = [
            ['Plateforme E-learning', 'Plateforme de cours en ligne avec gestion utilisateurs, quiz et certifications.', 'https://images.unsplash.com/photo-1501504905252-473c47e087f8?w=800', 'https://demo-elearning.baye-mor-gaye.dev', 'https://github.com/baye-mor-gaye/e-learning', ['Laravel', 'React', 'PostgreSQL', 'Docker'], true],
            ['App Meteo IoT', 'Application météo connectée avec capteurs IoT et tableau de bord temps réel.', 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800', 'https://demo-iot.baye-mor-gaye.dev', 'https://github.com/baye-mor-gaye/iot-weather', ['Python', 'React', 'TypeScript', 'Docker'], true],
            ['Portfolio CMS', 'Système de gestion de contenu pour portfolio avec dashboard administrateur.', 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800', null, 'https://github.com/baye-mor-gaye/portfolio-cms', ['Laravel', 'TailwindCSS', 'PostgreSQL', 'Git'], false],
            ['Chatbot IA', 'Assistant conversationnel base sur l\'IA pour le support client automatisé.', 'https://images.unsplash.com/photo-1677442136019-21780ecad995?w=800', 'https://demo-chatbot.baye-mor-gaye.dev', 'https://github.com/baye-mor-gaye/ai-chatbot', ['Python', 'Machine Learning', 'React', 'TypeScript'], false],
            ['Application de Gestion de Taches', 'Application de gestion de projets avec tableaux Kanban et suivi du temps.', 'https://images.unsplash.com/photo-1611224923853-80b023f02d71?w=800', 'https://demo-tasks.baye-mor-gaye.dev', 'https://github.com/baye-mor-gaye/task-manager', ['Laravel', 'Vue.js', 'MySQL', 'Redis'], false],
        ];

        foreach ($projects as [$titre, $description, $image, $urlDemo, $urlCode, $technologies, $enVedette]) {
            $projet = ProjetPortfolio::firstOrCreate(
                ['slug' => Str::slug($titre) . '-' . Str::random(6)],
                [
                    'proprietaire_id' => $proprietaire->id,
                    'titre' => $titre,
                    'description' => $description,
                    'courte_description' => $description,
                    'technologies' => $technologies,
                    'date_realisation' => fake()->date(),
                    'url_demo' => $urlDemo,
                    'url_code' => $urlCode,
                    'image_couverture' => $image,
                    'est_publie' => true,
                    'est_en_vedette' => $enVedette,
                    'publie_le' => now()->subDays(fake()->numberBetween(10, 365)),
                    'nombre_vues' => fake()->numberBetween(50, 3000),
                ]
            );

            MediaProjet::firstOrCreate(
                ['projet_portfolio_id' => $projet->id, 'est_principal' => true],
                [
                    'type' => 'image',
                    'chemin_fichier' => $image,
                    'url_externe' => $image,
                    'titre' => "Capture d'ecran - $titre",
                    'est_principal' => true,
                    'ordre' => 0,
                ]
            );

            MediaProjet::factory()->count(2)->create([
                'projet_portfolio_id' => $projet->id,
                'est_principal' => false,
            ]);
        }
    }
}
