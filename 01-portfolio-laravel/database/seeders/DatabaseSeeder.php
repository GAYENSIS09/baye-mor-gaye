<?php

namespace Database\Seeders;

use App\Models\Commentaire;
use App\Models\Competence;
use App\Models\Contact;
use App\Models\Conversion;
use App\Models\Domaine;
use App\Models\EmploiDuTemps;
use App\Models\Evenement;
use App\Models\Like;
use App\Models\NiveauCompetence;
use App\Models\Notification;
use App\Models\ProjetPortfolio;
use App\Models\Proprietaire;
use App\Models\Publication;
use App\Models\Rappel;
use App\Models\Ressource;
use App\Models\Utilisateur;
use App\Models\Experience;
use App\Models\Formation;
use App\Models\Certification;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Storage;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        $config = config('proprietaire');

        $proprietaireUser = Utilisateur::firstOrCreate(
            ['email' => $config['email']],
            [
                'nom' => $config['nom'],
                'password' => Hash::make($config['password']),
                'photo' => $config['photo'],
            ]
        );

        $proprietaire = Proprietaire::firstOrCreate(
            ['utilisateur_id' => $proprietaireUser->id],
            [
                'bio' => $config['bio'],
                'titre_professionnel' => $config['titre_professionnel'],
                'localisation' => $config['localisation'],
                'site_web' => $config['site_web'],
                'url_linkedin' => $config['url_linkedin'],
                'url_github' => $config['url_github'],
            ]
        );

        $visiteurs = Utilisateur::factory()->count(5)->create();

        $domaines = collect();
        foreach (['Developpement Web', 'Intelligence Artificielle', 'DevOps', 'Mobile', 'Data Science'] as $nom) {
            $domaines->push(Domaine::factory()->create([
                'proprietaire_id' => $proprietaire->id,
                'nom' => $nom,
                'slug' => str($nom)->slug(),
            ]));
        }

        $competences = collect();
        $skillList = [
            ['Laravel', 'Backend'], ['React', 'Frontend'], ['TypeScript', 'Langage'],
            ['Python', 'Langage'], ['Docker', 'DevOps'], ['PostgreSQL', 'Base de donnees'],
            ['Git', 'Outils'], ['TailwindCSS', 'Frontend'], ['Machine Learning', 'IA'],
        ];
        foreach ($skillList as [$nom, $categorie]) {
            $c = Competence::factory()->create(compact('nom', 'categorie'));
            $competences->push($c);
            NiveauCompetence::create([
                'proprietaire_id' => $proprietaire->id,
                'competence_id' => $c->id,
                'niveau' => fake()->randomElement(['debutant', 'intermediaire', 'avance', 'expert']),
                'est_surligne' => fake()->boolean(20),
            ]);
        }

        $publications = collect();
        foreach (range(1, 8) as $i) {
            $pub = Publication::factory()->create(['proprietaire_id' => $proprietaire->id]);
            $pub->domaines()->attach($domaines->random(fake()->numberBetween(1, 3))->pluck('id'));
            $publications->push($pub);
        }

        $projets = collect();
        foreach (range(1, 4) as $i) {
            $projets->push(ProjetPortfolio::factory()->create(['proprietaire_id' => $proprietaire->id]));
        }

        foreach ($publications as $pub) {
            foreach ($visiteurs->random(2) as $visiteur) {
                Commentaire::create([
                    'auteur_id' => $visiteur->id,
                    'commentable_type' => Publication::class,
                    'commentable_id' => $pub->id,
                    'contenu' => fake()->paragraph(),
                    'est_approuve' => fake()->boolean(70),
                ]);
                Like::create([
                    'auteur_id' => $visiteur->id,
                    'likeable_type' => Publication::class,
                    'likeable_id' => $pub->id,
                ]);
            }
        }

        $edt = EmploiDuTemps::create([
            'proprietaire_id' => $proprietaire->id,
            'titre' => 'Semaine type',
            'description' => 'Mon emploi du temps professionnel',
            'type' => 'professionnel',
        ]);

        foreach (['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi'] as $jour) {
            $evenement = Evenement::create([
                'emploi_du_temps_id' => $edt->id,
                'titre' => "Travail - $jour",
                'description' => 'Developpement et recherche',
                'date_debut' => now()->startOfWeek()->addDays(array_search($jour, ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi']))->setHour(9),
                'date_fin' => now()->startOfWeek()->addDays(array_search($jour, ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi']))->setHour(18),
                'couleur' => '#09111e',
                'statut' => 'confirme',
            ]);

            Conversion::create([
                'evenement_id' => $evenement->id,
                'titre' => 'Note de reunions',
                'url_externe' => 'https://docs.google.com',
                'type' => 'document',
            ]);

            Rappel::create([
                'proprietaire_id' => $proprietaire->id,
                'evenement_id' => $evenement->id,
                'titre' => "Rappel: $jour",
                'message' => 'Pensez a preparer le standup matinal',
                'notifie_le' => $evenement->date_debut->subHour(),
            ]);
        }

        foreach (range(1, 5) as $i) {
            Notification::create([
                'proprietaire_id' => $proprietaire->id,
                'titre' => fake()->randomElement([
                    'Nouveau commentaire', 'Publication approuvee',
                    'Projet mis a jour', 'Rappel evenement',
                ]),
                'message' => fake()->sentence(),
                'type' => fake()->randomElement(['info', 'succes', 'avertissement', 'erreur']),
                'est_lue' => fake()->boolean(50),
            ]);
        }

        foreach ($domaines as $d) {
            Ressource::create([
                'proprietaire_id' => $proprietaire->id,
                'domaine_id' => $d->id,
                'titre' => "Ressource $d->nom",
                'url_externe' => 'https://example.com/' . $d->slug,
                'type' => 'lien',
            ]);
        }

        // Expériences professionnelles
        $experiences = [
            ['Stage en Développement Full-Stack', 'Sonatel', 'Développement d\'applications web et mobile pour la gestion interne.', '2025-06-01', null, true, 'Dakar, Sénégal', 0],
            ['Développeur Freelance', 'Auto-entrepreneur', 'Création de sites web et applications sur mesure pour divers clients.', '2024-01-01', '2025-05-31', false, 'Dakar, Sénégal', 1],
            ['Assistant Technique en Informatique', 'UCAD', 'Support technique et maintenance des équipements informatiques.', '2023-10-01', '2024-12-31', false, 'Dakar, Sénégal', 2],
        ];
        foreach ($experiences as [$titre, $entreprise, $description, $debut, $fin, $actuel, $lieu, $ordre]) {
            Experience::create(compact('titre', 'entreprise', 'description', 'lieu', 'ordre') + [
                'proprietaire_id' => $proprietaire->id,
                'date_debut' => $debut,
                'date_fin' => $fin,
                'est_actuel' => $actuel,
            ]);
        }

        // Formations
        $formations = [
            ['Licence en Informatique', 'Université Cheikh Anta Diop (UCAD)', 'Formation générale en informatique avec spécialisation en génie logiciel.', 'Informatique', '2023-12-01', '2026-07-31', 0],
            ['Baccalauréat S1', 'Lycée Lamine Gueye', 'Série scientifique – Mathématiques et Physique.', 'Sciences', '2020-10-01', '2023-07-31', 1],
        ];
        foreach ($formations as [$diplome, $etablissement, $description, $domaineEtude, $debut, $fin, $ordre]) {
            Formation::create([
                'diplome' => $diplome,
                'etablissement' => $etablissement,
                'description' => $description,
                'domaine_etude' => $domaineEtude,
                'ordre' => $ordre,
                'proprietaire_id' => $proprietaire->id,
                'date_debut' => $debut,
                'date_fin' => $fin,
            ]);
        }

        // Certifications
        $certifications = [
            ['Introduction à l\'Intelligence Artificielle', 'Coursera', 'Certification en IA couvrant les fondamentaux du Machine Learning.', '2025-03-15', null, 'https://coursera.org/verify/abc123', 0],
            ['Laravel Developer', 'Laracasts', 'Maîtrise du framework Laravel (11) : Eloquent, API, tests.', '2024-11-01', null, 'https://laracasts.com/certificates/xyz456', 1],
        ];
        foreach ($certifications as [$titre, $organisme, $description, $dateObtention, $dateExpiration, $url, $ordre]) {
            Certification::create(compact('titre', 'organisme', 'description', 'ordre') + [
                'proprietaire_id' => $proprietaire->id,
                'date_obtention' => $dateObtention,
                'date_expiration' => $dateExpiration,
                'url_credential' => $url,
            ]);
        }

        foreach (range(1, 3) as $i) {
            Contact::create([
                'nom' => fake()->name(),
                'email' => fake()->email(),
                'sujet' => fake()->sentence(3),
                'message' => fake()->paragraph(),
                'est_lu' => fake()->boolean(30),
            ]);
        }
    }
}
