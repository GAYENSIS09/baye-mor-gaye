<?php

namespace Database\Seeders;

use App\Models\Domaine;
use App\Models\Proprietaire;
use Illuminate\Database\Seeder;
use Illuminate\Support\Str;

class DomaineSeeder extends Seeder
{
    public function run(): void
    {
        $proprietaire = Proprietaire::first();

        $domaines = [
            [
                'nom' => 'Intelligence Artificielle',
                'slug' => 'intelligence-artificielle',
                'description' => 'Machine Learning, Deep Learning, NLP, Computer Vision et LLMs pour resolver des problemes complexes.',
                'couleur' => '#8B5CF6',
            ],
            [
                'nom' => 'Developpement Web',
                'slug' => 'developpement-web',
                'description' => 'Applications full-stack modernes avec Laravel, Next.js, React, TypeScript et APIs REST/GraphQL.',
                'couleur' => '#3B82F6',
            ],
            [
                'nom' => 'IoT & Systemes Embarques',
                'slug' => 'iot-systemes-embarques',
                'description' => 'Objets connectes, capteurs, MQTT, ESP32/Arduino, edge computing et monitoring temps reel.',
                'couleur' => '#10B981',
            ],
            [
                'nom' => 'Data Engineering',
                'slug' => 'data-engineering',
                'description' => 'Pipelines de donnees, ETL/ELT, PostgreSQL, InfluxDB, TimescaleDB, Kafka et traitements temps reel.',
                'couleur' => '#F59E0B',
            ],
            [
                'nom' => 'DevOps & Infrastructure',
                'slug' => 'devops-infrastructure',
                'description' => 'Docker, Kubernetes, CI/CD, Terraform, monitoring Prometheus/Grafana, cloud AWS/Azure.',
                'couleur' => '#EF4444',
            ],
            [
                'nom' => 'Mobile',
                'slug' => 'mobile',
                'description' => 'Applications mobiles cross-platform avec React Native, Expo, Flutter et synchronisation offline-first.',
                'couleur' => '#EC4899',
            ],
            [
                'nom' => 'Recherche & Publications',
                'slug' => 'recherche-publications',
                'description' => 'Articles scientifiques, veille technologique, rapports techniques et vulgarisation IA/Tech.',
                'couleur' => '#6366F1',
            ],
        ];

        foreach ($domaines as $domaine) {
            Domaine::updateOrCreate(
                ['slug' => $domaine['slug']],
                array_merge($domaine, ['proprietaire_id' => $proprietaire->id])
            );
        }
    }
}