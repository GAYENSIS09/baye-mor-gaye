<?php

namespace Database\Seeders;

use App\Models\Certification;
use App\Models\Media;
use App\Models\Proprietaire;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Storage;

class CertificationSeeder extends Seeder
{
    public function run(): void
    {
        $proprietaire = Proprietaire::first();

        $colors = ['#00c8ff', '#ff6b6b', '#51cf66'];
        $covers = ['ia', 'laravel', 'python'];
        $iconPaths = [
            'ia' => 'M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5',
            'laravel' => 'M13 2L3 7l10 5 10-5-10-5zM3 17l10 5 10-5M3 12l10 5 10-5',
            'python' => 'M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5',
        ];

        $certifications = [
            ['Introduction a l\'Intelligence Artificielle', 'Coursera', 'Certification en IA couvrant les fondamentaux du Machine Learning.', '2025-03-15', null, 0],
            ['Laravel Developer', 'Laracasts', 'Maitrise du framework Laravel (11) : Eloquent, API, tests.', '2024-11-01', null, 1],
            ['Python pour la Data Science', 'DataCamp', 'Analyse de donnees avec Pandas, NumPy et Matplotlib.', '2025-01-15', '2027-01-15', 2],
        ];

        foreach ($certifications as $i => [$titre, $organisme, $description, $dateObtention, $dateExpiration, $ordre]) {
            $cert = Certification::updateOrCreate(
                ['proprietaire_id' => $proprietaire->id, 'titre' => $titre, 'organisme' => $organisme],
                compact('titre', 'organisme', 'description', 'ordre') + [
                    'proprietaire_id' => $proprietaire->id,
                    'date_obtention' => $dateObtention,
                    'date_expiration' => $dateExpiration,
                ]
            );

            $slug = $covers[$i];
            $color = $colors[$i];
            $svgContent = <<<SVG
<svg xmlns="http://www.w3.org/2000/svg" width="400" height="280" viewBox="0 0 400 280">
  <defs>
    <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:{$color};stop-opacity:0.15" />
      <stop offset="100%" style="stop-color:{$color};stop-opacity:0.05" />
    </linearGradient>
  </defs>
  <rect width="400" height="280" rx="8" fill="#1a1a1a"/>
  <rect width="400" height="280" rx="8" fill="url(#bg)"/>
  <rect x="1" y="1" width="398" height="278" rx="7" fill="none" stroke="{$color}" stroke-opacity="0.3" stroke-width="1.5"/>
  <text x="200" y="90" text-anchor="middle" font-family="system-ui,sans-serif" font-size="16" font-weight="600" fill="{$color}">{$organisme}</text>
  <text x="200" y="170" text-anchor="middle" font-family="system-ui,sans-serif" font-size="22" font-weight="700" fill="#ffffff">{$titre}</text>
  <circle cx="200" cy="210" r="3" fill="{$color}" opacity="0.6"/>
  <rect x="80" y="230" width="240" height="28" rx="14" fill="{$color}" fill-opacity="0.1" stroke="{$color}" stroke-opacity="0.3" stroke-width="1"/>
  <text x="200" y="249" text-anchor="middle" font-family="system-ui,sans-serif" font-size="11" fill="{$color}" opacity="0.8">CREDENTIAL</text>
</svg>
SVG;

            $coverPath = "seeders/certifications/cover-{$slug}.svg";
            if (!Storage::disk('public')->exists($coverPath)) {
                Storage::disk('public')->put($coverPath, $svgContent);
            }

            $cert->medias()->delete();
            $cert->medias()->create([
                'type' => 'image',
                'chemin_fichier' => $coverPath,
                'titre' => $titre,
                'ordre' => 0,
            ]);
        }
    }
}
