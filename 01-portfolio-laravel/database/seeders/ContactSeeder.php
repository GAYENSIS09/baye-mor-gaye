<?php

namespace Database\Seeders;

use App\Models\Contact;
use Illuminate\Database\Seeder;

class ContactSeeder extends Seeder
{
    public function run(): void
    {
        $messages = [
            ['Jean Dupont', 'jean@example.com', 'Proposition de collaboration', 'Bonjour, je suis interesse par votre profil et souhaiterais discuter d\'une collaboration sur un projet web.'],
            ['Marie Diop', 'marie@example.com', 'Question Laravel', 'Super article sur Laravel 11 ! Auriez-vous des ressources pour approfondir ?'],
            ['Paul Sarr', 'paul@example.com', 'Offre de stage', 'Nous cherchons un developpeur full-stack pour un stage. Votre profil nous interesse.'],
        ];

        foreach ($messages as [$nom, $email, $sujet, $message]) {
            Contact::firstOrCreate(
                compact('nom', 'email', 'sujet', 'message'),
                [
                    'est_lu' => fake()->boolean(30),
                ]
            );
        }

        Contact::factory()->count(3)->create();
    }
}
