<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreProjetPortfolioRequest;
use App\Http\Requests\UpdateProjetPortfolioRequest;
use App\Http\Resources\ProjetPortfolioResource;
use App\Models\ProjetPortfolio;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class ProjetPortfolioController extends Controller
{
    public function index(Request $request)
    {
        $this->tryAuthUser($request);
        $hasAuth = (bool) $request->user();

        if ($request->has('statut') && !$hasAuth) {
            abort(403, 'Action non autorisée.');
        }

        if ($request->boolean('all') && !$hasAuth) {
            $request->query->set('all', 'false');
        }

        $cacheKey = 'projets.publies.page.' . $request->get('page', 1);
        $canCache = $request->boolean('publie')
            && !$request->has('technologie')
            && !$request->has('search')
            && !$request->has('statut');

        if ($canCache && !$hasAuth) {
            return Cache::remember($cacheKey, 3600, function () {
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
            $safe = str_replace(['%', '_'], ['\\%', '\\_'], $request->search);
            $query->where('titre', 'like', '%' . $safe . '%');
        }

        return ProjetPortfolioResource::collection($query->orderBy('created_at', 'desc')->paginate(12));
    }

    public function show(Request $request, string $slug)
    {
        $this->tryAuthUser($request);
        $query = ProjetPortfolio::with(['commentaires.auteur', 'likes.auteur', 'medias']);

        $all = $request->boolean('all');
        if ($all && !$request->user()) {
            $all = false;
            $query->where('est_publie', true);
        } elseif (!$all) {
            $query->where('est_publie', true);
        }

        if (is_numeric($slug)) {
            $projetPortfolio = $query->findOrFail((int) $slug);
        } else {
            $projetPortfolio = $query->where('slug', $slug)->firstOrFail();
        }

        if ($all) {
            $this->authorizeOwnershipOrFail($request, $projetPortfolio);
        }

        if (!$all) {
            $projetPortfolio->load([
                'commentaires' => function ($q) {
                    $q->where('est_approuve', true);
                },
                'commentaires.auteur',
            ]);
        }

        return ProjetPortfolioResource::make($projetPortfolio);
    }

    public function store(StoreProjetPortfolioRequest $request)
    {
        $data = $request->validated();

        return DB::transaction(function () use ($request, $data) {
            $data['slug'] = Str::slug($data['titre']) . '-' . Str::random(6);
            $data['proprietaire_id'] = $request->user()->proprietaire->id;

            if ($data['est_publie'] ?? false) {
                $data['publie_le'] = now();
            }

            $projet = ProjetPortfolio::create($data);
            Cache::forget('projets.publies.page.1');
            return ProjetPortfolioResource::make($projet->load(['commentaires.auteur', 'likes.auteur', 'medias']));
        });
    }

    public function update(UpdateProjetPortfolioRequest $request, ProjetPortfolio $projetPortfolio)
    {
        $this->authorizeOwnershipOrFail($request, $projetPortfolio);

        $data = $request->validated();

        return DB::transaction(function () use ($request, $projetPortfolio, $data) {
            if (isset($data['est_publie']) && $data['est_publie'] && !$projetPortfolio->publie_le) {
                $data['publie_le'] = now();
            }

            $projetPortfolio->update($data);
            Cache::forget('projets.publies.page.1');
            return ProjetPortfolioResource::make($projetPortfolio->load(['commentaires.auteur', 'likes.auteur', 'medias']));
        });
    }

    public function destroy(Request $request, ProjetPortfolio $projetPortfolio)
    {
        $this->authorizeOwnershipOrFail($request, $projetPortfolio);
        $projetPortfolio->delete();
        Cache::forget('projets.publies.page.1');
        return response()->noContent();
    }
}
