<?php

namespace App\Services;

use App\Models\Publication;
use App\Services\BaseCrudService;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Str;

class PublicationService extends BaseCrudService
{
    protected array $sortableColumns = ['created_at', 'updated_at', 'titre', 'publie_le', 'nombre_vues'];
    protected array $searchableColumns = ['titre', 'extrait', 'contenu'];

    protected function getModelClass(): string
    {
        return Publication::class;
    }

    public function list(array $params = [], int $perPage = 12): mixed
    {
        $query = Publication::with(['domaines', 'commentaires.auteur', 'likes.auteur']);

        $filterParams = $params['filter'] ?? [];
        $publie = $params['publie'] ?? $filterParams['publie'] ?? null;
        $type = $params['type'] ?? $filterParams['type'] ?? null;
        $slug = $filterParams['domaine'] ?? $params['domaine'] ?? null;

        if ($publie) {
            $query->where('est_publie', true);
        }

        if ($type) {
            $query->where('type', $type);
        }

        if ($slug) {
            $query->whereHas('domaines', fn($q) => $q->where('slug', $slug));
        }

        $this->applySearch($query, $params);
        $this->applySort($query, $params);

        $result = $query->paginate($perPage);

        if ($publie && !$type && !$slug) {
            Cache::remember('publications.publies', 3600, fn () => $result);
        }

        return $result;
    }

    public function findBySlug(string $slug): Publication
    {
        $query = Publication::with(['domaines', 'commentaires.auteur', 'likes.auteur']);
        if (is_numeric($slug)) {
            return $query->findOrFail((int) $slug);
        }
        return $query->where('slug', $slug)->firstOrFail();
    }

    public function store(array $data): Model
    {
        $data['slug'] = Str::slug($data['titre']) . '-' . Str::random(6);

        if (!empty($data['contenu_html'])) {
            $data['contenu_html'] = app(HtmlPurifierService::class)->purifier($data['contenu_html']);
        }

        if ($data['est_publie'] ?? false) {
            $data['publie_le'] = now();
        }

        $domaines = $data['domaines'] ?? null;
        unset($data['domaines']);

        $publication = Publication::create($data);

        if ($domaines) {
            $publication->domaines()->sync($domaines);
        }

        $this->clearCache();

        return $publication->load('domaines');
    }

    public function update(Model $publication, array $data): Model
    {
        if (!empty($data['contenu_html'])) {
            $data['contenu_html'] = app(HtmlPurifierService::class)->purifier($data['contenu_html']);
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

        $this->clearCache();

        return $publication->load('domaines');
    }

    protected function clearCache(): void
    {
        Cache::forget('publications.publies');
    }
}
