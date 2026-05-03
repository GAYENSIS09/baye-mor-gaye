<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Commentaire;
use App\Models\Contact;
use App\Models\Like;
use App\Models\ProjetPortfolio;
use App\Models\Publication;
use App\Models\VuePage;
use Illuminate\Http\Request;

class StatistiqueController extends Controller
{
    public function index(Request $request)
    {
        $proprietaire = $request->user()->proprietaire;

        $jours = match ($request->get('periode', '7d')) {
            '30d'  => 30,
            '3m'   => 90,
            '1a'   => 365,
            default => 7,
        };
        $depuis = now()->subDays($jours);

        $publicationVues = VuePage::where('page', 'publication')
            ->where('visite_le', '>=', $depuis)
            ->selectRaw('page_id, COUNT(*) as total')
            ->groupBy('page_id')
            ->pluck('total', 'page_id');

        $projetVues = VuePage::where('page', 'projet')
            ->where('visite_le', '>=', $depuis)
            ->selectRaw('page_id, COUNT(*) as total')
            ->groupBy('page_id')
            ->pluck('total', 'page_id');

        $topPublications = Publication::withCount(['likes', 'commentaires'])
            ->where('proprietaire_id', $proprietaire->id)
            ->get(['id', 'titre', 'slug'])
            ->each(fn($p) => $p->vuepages_count = $publicationVues[$p->id] ?? 0)
            ->sortByDesc('vuepages_count')
            ->take(5)
            ->values();

        $topProjets = ProjetPortfolio::withCount(['likes', 'commentaires'])
            ->where('proprietaire_id', $proprietaire->id)
            ->get(['id', 'titre', 'slug'])
            ->each(fn($p) => $p->vuepages_count = $projetVues[$p->id] ?? 0)
            ->sortByDesc('vuepages_count')
            ->take(5)
            ->values();

        return response()->json([
            'vues_par_jour' => VuePage::where('visite_le', '>=', $depuis)
                ->selectRaw('DATE(visite_le) as date, COUNT(*) as total')
                ->groupBy('date')
                ->orderBy('date')
                ->get(),

            'top_publications' => $topPublications,
            'top_projets'      => $topProjets,

            'totaux' => [
                'vues'              => VuePage::count(),
                'publications'      => Publication::where('proprietaire_id', $proprietaire->id)->where('est_publie', true)->count(),
                'projets'           => ProjetPortfolio::where('proprietaire_id', $proprietaire->id)->where('est_publie', true)->count(),
                'likes'             => Like::count(),
                'messages_non_lus'  => Contact::where('est_lu', false)->count(),
                'commentaires_en_attente' => Commentaire::where('est_approuve', false)->count(),
            ],
        ]);
    }
}
