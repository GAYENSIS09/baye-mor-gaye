<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
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
                return ProjetPortfolio::with(['commentaires.auteur', 'likes.auteur', 'medias'])
                    ->where('est_publie', true)
                    ->orderBy('created_at', 'desc')
                    ->paginate(12);
            });
        }

        $query = ProjetPortfolio::with(['commentaires.auteur', 'likes.auteur', 'medias']);

        if ($request->boolean('publie')) {
            $query->where('est_publie', true);
        }

        if ($request->has('technologie')) {
            $query->whereJsonContains('technologies', $request->technologie);
        }

        return $query->orderBy('created_at', 'desc')->paginate(12);
    }

    public function show(string $slug)
    {
        $query = ProjetPortfolio::with(['commentaires.auteur', 'likes.auteur', 'medias']);
        if (is_numeric($slug)) {
            return $query->findOrFail((int) $slug);
        }
        return $query->where('slug', $slug)->firstOrFail();
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'titre' => 'required|string|max:255',
            'description' => 'required|string',
            'technologies' => 'nullable|array',
            'technologies.*' => 'string',
            'url_demo' => 'nullable|url|max:500',
            'url_code' => 'nullable|url|max:500',
            'image_couverture' => 'nullable|string',
            'est_publie' => 'boolean',
        ]);

        $data['slug'] = Str::slug($data['titre']) . '-' . Str::random(6);
        $data['proprietaire_id'] = $request->user()->proprietaire->id;

        if ($data['est_publie'] ?? false) {
            $data['publie_le'] = now();
        }

        return ProjetPortfolio::create($data);
    }

    public function update(Request $request, ProjetPortfolio $projetPortfolio)
    {
        $this->authorizeOwnershipOrFail($request, $projetPortfolio);

        $data = $request->validate([
            'titre' => 'sometimes|string|max:255',
            'description' => 'sometimes|string',
            'technologies' => 'nullable|array',
            'technologies.*' => 'string',
            'url_demo' => 'nullable|url|max:500',
            'url_code' => 'nullable|url|max:500',
            'image_couverture' => 'nullable|string',
            'est_publie' => 'boolean',
        ]);

        if (isset($data['est_publie']) && $data['est_publie'] && !$projetPortfolio->publie_le) {
            $data['publie_le'] = now();
        }

        $projetPortfolio->update($data);
        return $projetPortfolio;
    }

    public function destroy(Request $request, ProjetPortfolio $projetPortfolio)
    {
        $this->authorizeOwnershipOrFail($request, $projetPortfolio);
        $projetPortfolio->delete();
        return response()->noContent();
    }
}
