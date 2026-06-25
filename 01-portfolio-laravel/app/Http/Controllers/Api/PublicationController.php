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
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class PublicationController extends Controller
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

        $cacheKey = 'publications.publies';
        $canCache = $request->boolean('publie')
            && !$request->has('type')
            && !$request->has('domaine')
            && !$request->has('search')
            && !$request->has('statut');

        if ($canCache && !$hasAuth) {
            return Cache::remember($cacheKey, 3600, function () {
                return PublicationResource::collection(Publication::with(['domaines', 'commentaires.auteur', 'likes.auteur', 'medias'])
                    ->where('est_publie', true)
                    ->orderBy('created_at', 'desc')
                    ->paginate(12));
            });
        }

        $query = Publication::with(['domaines', 'commentaires.auteur', 'likes.auteur', 'medias']);

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

        if ($request->has('type')) {
            $query->where('type', $request->type);
        }

        if ($request->has('domaine')) {
            $query->whereHas('domaines', fn($q) => $q->where('slug', $request->domaine));
        }

        if ($request->has('search')) {
            $safe = str_replace(['%', '_'], ['\\%', '\\_'], $request->search);
            $query->where('titre', 'like', '%' . $safe . '%');
        }

        return PublicationResource::collection($query->orderBy('created_at', 'desc')->paginate(12));
    }

    public function show(Request $request, string $slug)
    {
        $this->tryAuthUser($request);
        $query = Publication::with(['domaines', 'commentaires.auteur', 'likes.auteur', 'medias']);

        $all = $request->boolean('all');

        if ($all && !$request->user()) {
            $all = false;
        }

        if (!$all) {
            $query->where('est_publie', true);
        }

        if (is_numeric($slug)) {
            $publication = $query->findOrFail((int) $slug);
        } else {
            $publication = $query->where('slug', $slug)->firstOrFail();
        }

        if ($all) {
            $this->authorizeOwnershipOrFail($request, $publication);
        }

        if (!$all) {
            $publication->load([
                'commentaires' => function ($q) {
                    $q->where('est_approuve', true);
                },
                'commentaires.auteur',
            ]);
        }

        return PublicationResource::make($publication);
    }

    public function store(StorePublicationRequest $request)
    {
        $data = $request->validated();

        return DB::transaction(function () use ($request, $data) {
            if (!empty($data['contenu_html'])) {
                $data['contenu_html'] = $this->purifierContenu($data['contenu_html']);
            }

            $data['slug'] = Str::slug($data['titre']) . '-' . Str::random(6);
            $data['proprietaire_id'] = $request->user()->proprietaire->id;

            if ($data['est_publie'] ?? false) {
                $data['publie_le'] = now();
            }

            $domaines = $data['domaines'] ?? [];
            unset($data['domaines']);

            $publication = Publication::create($data);

            if (!empty($domaines)) {
                $publication->domaines()->sync($domaines);
            }

            Cache::forget('publications.publies');
            return PublicationResource::make($publication->load(['domaines', 'commentaires.auteur', 'likes.auteur', 'medias']));
        });
    }

    public function update(UpdatePublicationRequest $request, Publication $publication)
    {
        $this->authorizeOwnershipOrFail($request, $publication);

        $data = $request->validated();

        return DB::transaction(function () use ($request, $publication, $data) {
            if (!empty($data['contenu_html'])) {
                $data['contenu_html'] = $this->purifierContenu($data['contenu_html']);
            }

            if (isset($data['est_publie']) && $data['est_publie'] && !$publication->publie_le) {
                $data['publie_le'] = now();
            }

            $domaines = $data['domaines'] ?? null;
            unset($data['domaines']);

            $publication->update($data);

            if (isset($domaines)) {
                $publication->domaines()->sync($domaines);
            }

            Cache::forget('publications.publies');
            return PublicationResource::make($publication->load(['domaines', 'commentaires.auteur', 'likes.auteur', 'medias']));
        });
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
