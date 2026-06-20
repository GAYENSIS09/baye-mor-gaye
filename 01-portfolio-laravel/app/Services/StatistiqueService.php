<?php

namespace App\Services;

use App\Models\Commentaire;
use App\Models\Contact;
use App\Models\Notification;
use App\Models\ProjetPortfolio;
use App\Models\Publication;
use App\Models\VuePage;
use Illuminate\Support\Facades\Cache;

class StatistiqueService
{
    public function getStats(): array
    {
        return Cache::remember('statistiques', 300, function () {
            $publicationsPubliees = Publication::where('est_publie', true)->count();
            $projetsPublies = ProjetPortfolio::where('est_publie', true)->count();

            $vues7DerniersJours = VuePage::where('visite_le', '>=', now()->subDays(7))
                ->selectRaw('DATE(visite_le) as date, COUNT(*) as total')
                ->groupBy('date')
                ->orderBy('date')
                ->get();

            $topPublications = Publication::where('est_publie', true)
                ->orderBy('nombre_vues', 'desc')
                ->take(5)
                ->get(['id', 'titre', 'slug', 'nombre_vues']);

            $topProjets = ProjetPortfolio::where('est_publie', true)
                ->orderBy('nombre_vues', 'desc')
                ->take(5)
                ->get(['id', 'titre', 'slug', 'nombre_vues']);

            $commentairesEnAttente = Commentaire::where('est_approuve', false)->count();
            $messagesNonLus = Contact::where('est_lu', false)->count();
            $notificationsNonLues = Notification::where('est_lue', false)->count();

            return [
                'total_publications' => Publication::count(),
                'publications_publiees' => $publicationsPubliees,
                'total_projets' => ProjetPortfolio::count(),
                'projets_publies' => $projetsPublies,
                'total_competences' => \App\Models\Competence::count(),
                'total_domaines' => \App\Models\Domaine::count(),
                'total_experiences' => \App\Models\Experience::count(),
                'total_commentaires' => Commentaire::count(),
                'commentaires_en_attente' => $commentairesEnAttente,
                'messages_non_lus' => $messagesNonLus,
                'notifications_non_lues' => $notificationsNonLues,
                'vues_7_jours' => $vues7DerniersJours,
                'top_publications' => $topPublications,
                'top_projets' => $topProjets,
            ];
        });
    }

    public function clearCache(): void
    {
        Cache::forget('statistiques');
    }
}
