<?php

namespace Database\Seeders;

use App\Models\Certification;
use App\Models\MediaQualification;
use App\Models\Proprietaire;
use Illuminate\Database\Seeder;

class CertificationSeeder extends Seeder
{
    public function run(): void
    {
        $proprietaire = Proprietaire::first();

        $certifications = [
            ['Introduction a l\'Intelligence Artificielle', 'Coursera', 'Certification en IA couvrant les fondamentaux du Machine Learning.', '2025-03-15', null, 'https://coursera.org/verify/abc123', 0, 'https://images.unsplash.com/photo-1677442136019-21780ecad995?w=400'],
            ['Laravel Developer', 'Laracasts', 'Maitrise du framework Laravel (11) : Eloquent, API, tests.', '2024-11-01', null, 'https://laracasts.com/certificates/xyz456', 1, 'https://images.unsplash.com/photo-1516116216624-53e697fedbea?w=400'],
            ['Python pour la Data Science', 'DataCamp', 'Analyse de donnees avec Pandas, NumPy et Matplotlib.', '2025-01-15', '2027-01-15', 'https://datacamp.com/verify/def789', 2, 'https://images.unsplash.com/photo-1526379095098-d400fd0bf935?w=400'],
        ];

        foreach ($certifications as [$titre, $organisme, $description, $dateObtention, $dateExpiration, $url, $ordre, $media]) {
            $cert = Certification::updateOrCreate(
                ['proprietaire_id' => $proprietaire->id, 'titre' => $titre, 'organisme' => $organisme],
                compact('titre', 'organisme', 'description', 'ordre') + [
                    'proprietaire_id' => $proprietaire->id,
                    'date_obtention' => $dateObtention,
                    'date_expiration' => $dateExpiration,
                    'url_credential' => $url,
                ]
            );

            if ($cert->wasRecentlyCreated || !$cert->medias()->count()) {
                MediaQualification::firstOrCreate(
                    ['qualifiable_id' => $cert->id, 'qualifiable_type' => Certification::class, 'type' => 'image'],
                    [
                        'chemin_fichier' => $media,
                        'titre' => $titre,
                        'ordre' => 0,
                    ]
                );
            }
        }
    }
}
