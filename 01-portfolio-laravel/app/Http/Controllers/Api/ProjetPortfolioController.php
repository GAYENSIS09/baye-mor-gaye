<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreProjetPortfolioRequest;
use App\Http\Requests\UpdateProjetPortfolioRequest;
use App\Http\Resources\ProjetPortfolioResource;
use App\Models\ProjetPortfolio;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Str;

class ProjetPortfolioController extends Controller
{
    public function index(Request $request)
    {
        // Cache only the public list without filters
        if ($request->boolean('publie') && !$request->has('technologie')) {
            return Cache::remember('projets.publies', 3600, function () {
                return ProjetPortfolioResource::collection(ProjetPortfolio::with(['commentaires.auteur', 'likes.auteur', 'medias'])
                    ->where('est_publie', true)
                    ->orderBy('created_at', 'desc')
                    ->paginate(12));
            });
        }

        $query = ProjetPortfolio::with(['commentaires.auteur', 'likes.auteur', 'medias']);

        if ($request->has('statut')) {
            match ($request->statut) {
                'publie' => $query->where('est_publie', true),
                'brouillon' => $query->where('est_publie', false),
                default => null,
            };
        } elseif ($request->boolean('publie')) {
            $query->where('est_publie', true);
        } elseif (!$request->boolean('all')) {
            $query->where('est_publie', true);
        }

        if ($request->has('technologie')) {
            $query->whereJsonContains('technologies', $request->technologie);
        }

        if ($request->has('search')) {
            $query->where('titre', 'like', '%' . $request->search . '%');
        }

        return ProjetPortfolioResource::collection($query->orderBy('created_at', 'desc')->paginate(12));
    }

    public function show(Request $request, string $slug)
    {
        $query = ProjetPortfolio::with(['commentaires.auteur', 'likes.auteur', 'medias']);

        if (!$request->boolean('all')) {
            $query->where('est_publie', true);
        }

        if (is_numeric($slug)) {
            return ProjetPortfolioResource::make($query->findOrFail((int) $slug));
        }
        return ProjetPortfolioResource::make($query->where('slug', $slug)->firstOrFail());
    }

    public function store(StoreProjetPortfolioRequest $request)
    {
        $data = $request->validated();
        $data['slug'] = Str::slug($data['titre']) . '-' . Str::random(6);
        $data['proprietaire_id'] = $request->user()->proprietaire->id;

        if ($data['est_publie'] ?? false) {
            $data['publie_le'] = now();
        }

        Cache::forget('projets.publies');
        return ProjetPortfolioResource::make(ProjetPortfolio::create($data)->load(['commentaires.auteur', 'likes.auteur', 'medias']));
    }

    public function update(UpdateProjetPortfolioRequest $request, ProjetPortfolio $projetPortfolio)
    {
        $this->authorizeOwnershipOrFail($request, $projetPortfolio);

        $data = $request->validated();

        if (isset($data['est_publie']) && $data['est_publie'] && !$projetPortfolio->publie_le) {
            $data['publie_le'] = now();
        }

        $projetPortfolio->update($data);
        Cache::forget('projets.publies');
        return ProjetPortfolioResource::make($projetPortfolio->load(['commentaires.auteur', 'likes.auteur', 'medias']));
    }

    public function destroy(Request $request, ProjetPortfolio $projetPortfolio)
    {
        $this->authorizeOwnershipOrFail($request, $projetPortfolio);
        $projetPortfolio->delete();
        Cache::forget('projets.publies');
        return response()->noContent();
    }
}
