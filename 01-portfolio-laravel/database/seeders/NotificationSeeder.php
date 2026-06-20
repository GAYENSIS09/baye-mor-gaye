<?php

namespace Database\Seeders;

use App\Models\Notification;
use App\Models\Proprietaire;
use Illuminate\Database\Seeder;

class NotificationSeeder extends Seeder
{
    public function run(): void
    {
        $proprietaire = Proprietaire::first();

        $notifications = [
            ['Bienvenue sur votre portfolio', 'Votre compte a ete cree avec succes.', 'succes'],
            ['Nouveau commentaire', 'Quelqu\'un a commente votre publication.', 'info'],
            ['Publication approuvee', 'Votre article a ete approuve et publie.', 'succes'],
            ['Projet mis a jour', 'Le projet E-learning a ete mis a jour.', 'info'],
            ['Rappel evenement', 'Vous avez un evenement dans 1 heure.', 'avertissement'],
            ['Sauvegarde effectuee', 'La sauvegarde automatique des donnees est terminee.', 'info'],
            ['Nouveau visiteur', 'Votre portfolio a recu 50 nouvelles visites aujourd\'hui.', 'info'],
        ];

        foreach ($notifications as [$titre, $message, $type]) {
            Notification::firstOrCreate(
                ['proprietaire_id' => $proprietaire->id, 'titre' => $titre],
                [
                    'message' => $message,
                    'type' => $type,
                    'est_lue' => fake()->boolean(50),
                    'lue_le' => fake()->optional()->dateTimeThisMonth(),
                ]
            );
        }

        Notification::factory()->count(5)->create([
            'proprietaire_id' => $proprietaire->id,
        ]);
    }
}
