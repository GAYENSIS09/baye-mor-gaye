<?php

namespace Database\Seeders;

use App\Models\Conversion;
use App\Models\EmploiDuTemps;
use App\Models\Evenement;
use App\Models\Proprietaire;
use App\Models\Rappel;
use Illuminate\Database\Seeder;

class EmploiDuTempsSeeder extends Seeder
{
    public function run(): void
    {
        $proprietaire = Proprietaire::first();

        $edt = EmploiDuTemps::firstOrCreate(
            ['proprietaire_id' => $proprietaire->id, 'titre' => 'Semaine type'],
            [
                'description' => 'Mon emploi du temps professionnel',
                'type' => 'professionnel',
                'est_actif' => true,
            ]
        );

        $jours = ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi'];
        $couleurs = ['#09111e', '#1a1a2e', '#16213e', '#0f3460', '#533483'];

        foreach ($jours as $index => $jour) {
            $dateDebut = now()->startOfWeek()->addDays($index)->setHour(9);
            $dateFin = now()->startOfWeek()->addDays($index)->setHour(18);

            $evenement = Evenement::firstOrCreate(
                [
                    'emploi_du_temps_id' => $edt->id,
                    'titre' => "Travail - $jour",
                    'date_debut' => $dateDebut,
                ],
                [
                    'description' => 'Developpement et recherche',
                    'date_fin' => $dateFin,
                    'couleur' => $couleurs[$index],
                    'statut' => 'confirme',
                ]
            );

            Conversion::firstOrCreate(
                ['evenement_id' => $evenement->id, 'titre' => 'Note de reunions'],
                [
                    'url_externe' => 'https://docs.google.com',
                    'type' => 'document',
                ]
            );

            Rappel::firstOrCreate(
                ['proprietaire_id' => $proprietaire->id, 'titre' => "Rappel: $jour"],
                [
                    'evenement_id' => $evenement->id,
                    'message' => 'Pensez a preparer le standup matinal',
                    'notifie_le' => $dateDebut->subHour(),
                    'est_notifie' => true,
                ]
            );
        }

        EmploiDuTemps::factory()->count(2)->create([
            'proprietaire_id' => $proprietaire->id,
        ]);
    }
}
