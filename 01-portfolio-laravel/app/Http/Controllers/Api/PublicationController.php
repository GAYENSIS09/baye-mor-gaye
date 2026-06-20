<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\StorePublicationRequest;
use App\Http\Requests\UpdatePublicationRequest;
use App\Http\Resources\PublicationResource;
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
                return PublicationResource::collection(Publication::with(['domaines', 'commentaires.auteur', 'likes.auteur'])
                    ->where('est_publie', true)
                    ->orderBy('created_at', 'desc')
                    ->paginate(12));
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

        return PublicationResource::collection($query->orderBy('created_at', 'desc')->paginate(12));
    }

    public function show(string $slug)
    {
        $query = Publication::with(['domaines', 'commentaires.auteur', 'likes.auteur']);
        if (is_numeric($slug)) {
            return PublicationResource::make($query->findOrFail((int) $slug));
        }
        return PublicationResource::make($query->where('slug', $slug)->firstOrFail());
    }

    public function store(StorePublicationRequest $request)
    {
        $data = $request->validated();

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

        Cache::forget('publications.publies');
        return PublicationResource::make($publication->load('domaines'));
    }

    public function update(UpdatePublicationRequest $request, Publication $publication)
    {
        $this->authorizeOwnershipOrFail($request, $publication);

        $data = $request->validated();

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

        Cache::forget('publications.publies');
        return PublicationResource::make($publication->load('domaines'));
    }

    public function destroy(Request $request, Publication $publication)
    {
        $this->authorizeOwnershipOrFail($request, $publication);
        $publication->delete();
        Cache::forget('publications.publies');
        return response()->noContent();
    }

    private function purifierContenu(string $html): string
    {
        return app(HtmlPurifierService::class)->purifier($html);
    }
}
