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

        $certifications = [
            ['Introduction a l\'Intelligence Artificielle', 'Coursera', 'Certification en IA couvrant les fondamentaux du Machine Learning.', '2025-03-15', null, 'seeders/certifications/credential-ia.pdf', 0, 'seeders/certifications/cover-ia.jpg'],
            ['Laravel Developer', 'Laracasts', 'Maitrise du framework Laravel (11) : Eloquent, API, tests.', '2024-11-01', null, 'seeders/certifications/credential-laravel.pdf', 1, 'seeders/certifications/cover-laravel.jpg'],
            ['Python pour la Data Science', 'DataCamp', 'Analyse de donnees avec Pandas, NumPy et Matplotlib.', '2025-01-15', '2027-01-15', 'seeders/certifications/credential-python.pdf', 2, 'seeders/certifications/cover-python.jpg'],
        ];

        foreach ($certifications as [$titre, $organisme, $description, $dateObtention, $dateExpiration, $credentialPath, $ordre, $mediaPath]) {
            foreach ([[$credentialPath, 'pdf'], [$mediaPath, 'jpg']] as [$path, $ext]) {
                if (!Storage::disk('public')->exists($path)) {
                    if ($ext === 'pdf') {
                        Storage::disk('public')->put($path, 
                            "%PDF-1.4\n1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj\n2 0 obj\n<< /Type /Pages /Kids [3 0 R] /Count 1 >>\nendobj\n3 0 obj\n<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Contents 4 0 R /Resources << /Font << /F1 5 0 R >> >> >>\nendobj\n4 0 obj\n<< /Length 44 >>\nstream\nBT /F1 24 Tf 100 700 Td ($titre) Tj ET\nendstream\nendobj\n5 0 obj\n<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>\nendobj\nxref\n0 6\n0000000000 65535 f \n0000000009 00000 n \n0000000058 00000 n \n0000000115 00000 n \n0000000266 00000 n \n0000000362 00000 n \ntrailer\n<< /Size 6 /Root 1 0 R >>\nstartxref\n437\n%%%%EOF"
                        );
                    } else {
                        Storage::disk('public')->put($path, '<svg xmlns="http://www.w3.org/2000/svg" width="400" height="300" viewBox="0 0 400 300">
                            <rect fill="#1a1a2e" width="400" height="300"/>
                            <rect fill="#16213e" x="20" y="20" width="360" height="260" rx="8"/>
                            <text x="200" y="120" text-anchor="middle" fill="#e0e0e0" font-family="Arial" font-size="28" font-weight="bold">' . htmlspecialchars($titre, ENT_QUOTES) . '</text>
                            <text x="200" y="170" text-anchor="middle" fill="#888" font-family="Arial" font-size="16">' . htmlspecialchars($organisme, ENT_QUOTES) . '</text>
                            <text x="200" y="220" text-anchor="middle" fill="#555" font-family="Arial" font-size="12">Placeholder - ' . htmlspecialchars($dateObtention, ENT_QUOTES) . '</text>
                        </svg>');
                    }
                }
            }

            $cert = Certification::updateOrCreate(
                ['proprietaire_id' => $proprietaire->id, 'titre' => $titre, 'organisme' => $organisme],
                compact('titre', 'organisme', 'description', 'ordre') + [
                    'proprietaire_id' => $proprietaire->id,
                    'date_obtention' => $dateObtention,
                    'date_expiration' => $dateExpiration,
                    'url_credential' => $credentialPath,
                ]
            );

            if ($cert->wasRecentlyCreated || !$cert->medias()->count()) {
                Media::firstOrCreate(
                    ['mediable_id' => $cert->id, 'mediable_type' => Certification::class, 'type' => 'image'],
                    [
                        'chemin_fichier' => $mediaPath,
                        'titre' => $titre . ' - Couverture',
                        'ordre' => 0,
                    ]
                );
            }
        }
    }
}
