<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Publication;
use App\Services\HtmlPurifierService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Str;

class PublicationController extends Controller
{
    public function index(Request $request)
    {
        // Cache only the public list without filters
        if ($request->boolean('publie') && !$request->has('type') && !$request->has('domaine')) {
            return Cache::remember('publications.publies', 3600, function () {
                return Publication::with(['domaines', 'commentaires.auteur', 'likes.auteur'])
                    ->where('est_publie', true)
                    ->orderBy('created_at', 'desc')
                    ->paginate(12);
            });
        }

        $query = Publication::with(['domaines', 'commentaires.auteur', 'likes.auteur']);

        if ($request->boolean('publie')) {
            $query->where('est_publie', true);
        }

        if ($request->has('type')) {
            $query->where('type', $request->type);
        }

        if ($request->has('domaine')) {
            $query->whereHas('domaines', fn($q) => $q->where('slug', $request->domaine));
        }

        return $query->orderBy('created_at', 'desc')->paginate(12);
    }

    public function show(string $slug)
    {
        $query = Publication::with(['domaines', 'commentaires.auteur', 'likes.auteur']);
        if (is_numeric($slug)) {
            return $query->findOrFail((int) $slug);
        }
        return $query->where('slug', $slug)->firstOrFail();
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'titre' => 'required|string|max:255',
            'contenu' => 'required|string',
            'contenu_json' => 'nullable|json',
            'contenu_html' => 'nullable|string',
            'type' => 'required|in:article,tutoriel,note',
            'extrait' => 'nullable|string|max:500',
            'image_couverture' => 'nullable|string',
            'est_publie' => 'boolean',
            'domaines' => 'nullable|array',
            'domaines.*' => 'exists:domaines,id',
        ]);

        if (!empty($data['contenu_html'])) {
            $data['contenu_html'] = $this->purifierContenu($data['contenu_html']);
        }

        $data['slug'] = Str::slug($data['titre']) . '-' . Str::random(6);
        $data['proprietaire_id'] = $request->user()->proprietaire->id;

        if ($data['est_publie'] ?? false) {
            $data['publie_le'] = now();
        }

        $publication = Publication::create($data);

        if (!empty($data['domaines'])) {
            $publication->domaines()->sync($data['domaines']);
        }

        return $publication->load('domaines');
    }

    public function update(Request $request, Publication $publication)
    {
        $this->authorizeOwnershipOrFail($request, $publication);

        $data = $request->validate([
            'titre' => 'sometimes|string|max:255',
            'contenu' => 'sometimes|string',
            'contenu_json' => 'nullable|json',
            'contenu_html' => 'nullable|string',
            'type' => 'sometimes|in:article,tutoriel,note',
            'extrait' => 'nullable|string|max:500',
            'image_couverture' => 'nullable|string',
            'est_publie' => 'boolean',
            'domaines' => 'nullable|array',
            'domaines.*' => 'exists:domaines,id',
        ]);

        if (!empty($data['contenu_html'])) {
            $data['contenu_html'] = $this->purifierContenu($data['contenu_html']);
        }

        if (isset($data['est_publie']) && $data['est_publie'] && !$publication->publie_le) {
            $data['publie_le'] = now();
        }

        $publication->update($data);

        if (isset($data['domaines'])) {
            $publication->domaines()->sync($data['domaines']);
        }

        return $publication->load('domaines');
    }

    public function destroy(Request $request, Publication $publication)
    {
        $this->authorizeOwnershipOrFail($request, $publication);
        $publication->delete();
        return response()->noContent();
    }

    private function purifierContenu(string $html): string
    {
        return app(HtmlPurifierService::class)->purifier($html);
    }
}
