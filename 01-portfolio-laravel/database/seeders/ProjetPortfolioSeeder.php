<?php

namespace Database\Seeders;

use App\Models\Media;
use App\Models\ProjetPortfolio;
use App\Models\Proprietaire;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class ProjetPortfolioSeeder extends Seeder
{
    public function run(): void
    {
        $proprietaire = Proprietaire::first();

        $projects = [
            ['Plateforme E-learning', 'Plateforme de cours en ligne avec gestion utilisateurs, quiz et certifications.', 'seeders/projets/elearning-cover.jpg', 'seeders/projets/elearning-demo.mp4', 'https://demo-elearning.baye-mor-gaye.dev', 'https://github.com/baye-mor-gaye/e-learning', ['Laravel', 'React', 'PostgreSQL', 'Docker'], true],
            ['App Meteo IoT', 'Application météo connectée avec capteurs IoT et tableau de bord temps réel.', 'seeders/projets/iot-cover.jpg', 'seeders/projets/iot-demo.mp4', 'https://demo-iot.baye-mor-gaye.dev', 'https://github.com/baye-mor-gaye/iot-weather', ['Python', 'React', 'TypeScript', 'Docker'], true],
            ['Portfolio CMS', 'Système de gestion de contenu pour portfolio avec dashboard administrateur.', 'seeders/projets/cms-cover.jpg', null, null, 'https://github.com/baye-mor-gaye/portfolio-cms', ['Laravel', 'TailwindCSS', 'PostgreSQL', 'Git'], false],
            ['Chatbot IA', 'Assistant conversationnel base sur l\'IA pour le support client automatisé.', 'seeders/projets/chatbot-cover.jpg', 'seeders/projets/chatbot-demo.mp4', 'https://demo-chatbot.baye-mor-gaye.dev', 'https://github.com/baye-mor-gaye/ai-chatbot', ['Python', 'Machine Learning', 'React', 'TypeScript'], false],
            ['Application de Gestion de Taches', 'Application de gestion de projets avec tableaux Kanban et suivi du temps.', 'seeders/projets/tasks-cover.jpg', null, 'https://demo-tasks.baye-mor-gaye.dev', 'https://github.com/baye-mor-gaye/task-manager', ['Laravel', 'Vue.js', 'MySQL', 'Redis'], false],
        ];

        foreach ($projects as [$titre, $description, $coverImage, $demoVideo, $urlDemo, $urlCode, $technologies, $enVedette]) {
            foreach (array_filter([$coverImage, $demoVideo]) as $path) {
                if (!Storage::disk('public')->exists($path)) {
                    $ext = pathinfo($path, PATHINFO_EXTENSION);
                    if ($ext === 'mp4') {
                        Storage::disk('public')->put($path, '');
                    } else {
                        Storage::disk('public')->put($path, '<svg xmlns="http://www.w3.org/2000/svg" width="800" height="600" viewBox="0 0 800 600">
                            <rect fill="#1a1a2e" width="800" height="600"/>
                            <rect fill="#16213e" x="30" y="30" width="740" height="540" rx="12"/>
                            <text x="400" y="240" text-anchor="middle" fill="#e0e0e0" font-family="Arial" font-size="36" font-weight="bold">' . htmlspecialchars($titre, ENT_QUOTES) . '</text>
                            <text x="400" y="310" text-anchor="middle" fill="#888" font-family="Arial" font-size="20">Projet Portfolio</text>
                            <rect fill="#00e5ff" x="300" y="380" width="200" height="4" rx="2"/>
                        </svg>');
                    }
                }
            }

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
                    'image_couverture' => $coverImage,
                    'est_publie' => true,
                    'est_en_vedette' => $enVedette,
                    'publie_le' => now()->subDays(fake()->numberBetween(10, 365)),
                    'nombre_vues' => fake()->numberBetween(50, 3000),
                ]
            );

            Media::firstOrCreate(
                ['mediable_id' => $projet->id, 'mediable_type' => ProjetPortfolio::class, 'est_principal' => true],
                [
                    'type' => 'image',
                    'chemin_fichier' => $coverImage,
                    'url_externe' => null,
                    'titre' => "Capture d'ecran - $titre",
                    'est_principal' => true,
                    'ordre' => 0,
                ]
            );

            if ($demoVideo) {
                Media::firstOrCreate(
                    ['mediable_id' => $projet->id, 'mediable_type' => ProjetPortfolio::class, 'type' => 'video', 'est_principal' => false],
                    [
                        'chemin_fichier' => $demoVideo,
                        'url_externe' => null,
                        'titre' => "Video demo - $titre",
                        'est_principal' => false,
                        'ordre' => 1,
                    ]
                );
            }

            Media::factory()->count(max(0, 2 - ($demoVideo ? 1 : 0)))->create([
                'mediable_id' => $projet->id,
                'mediable_type' => ProjetPortfolio::class,
                'est_principal' => false,
            ]);
        }
    }
}
