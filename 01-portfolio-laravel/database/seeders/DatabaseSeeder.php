<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        $this->call([
            // Niveau 1 : tables sans dependances
            UtilisateurSeeder::class,

            // Niveau 2 : depend de utilisateurs
            ProprietaireSeeder::class,

            // Niveau 3 : depend de proprietaires
            CompetenceSeeder::class,
            DomaineSeeder::class,
            ExperienceSeeder::class,
            FormationSeeder::class,
            CertificationSeeder::class,

            // Niveau 4 : depend de proprietaires + autres
            PublicationSeeder::class,
            ProjetPortfolioSeeder::class,
            EmploiDuTempsSeeder::class,
            NotificationSeeder::class,
            RessourceSeeder::class,

            // Niveau 5 : depend des publications, projets, utilisateurs
            CommentaireSeeder::class,
            LikeSeeder::class,
            VuePageSeeder::class,

            // Niveau 6 : sans dependances (donnees de contact)
            ContactSeeder::class,
        ]);
    }
}
