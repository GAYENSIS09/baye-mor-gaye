<?php

namespace App\Services;

use App\Models\ProjetPortfolio;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Str;

class ProjetPortfolioService extends BaseCrudService
{
    protected array $sortableColumns = ['created_at', 'updated_at', 'titre', 'date_realisation', 'nombre_vues'];
    protected array $searchableColumns = ['titre', 'description', 'courte_description'];

    protected function getModelClass(): string
    {
        return ProjetPortfolio::class;
    }

    public function list(array $params = [], int $perPage = 12): mixed
    {
        $query = ProjetPortfolio::with(['commentaires.auteur', 'likes.auteur', 'medias']);

        $filter = $params['filter'] ?? [];
        $publie = $params['publie'] ?? $filter['publie'] ?? null;
        $technologie = $params['technologie'] ?? $filter['technologie'] ?? null;

        if ($publie) {
            $query->where('est_publie', true);
        }

        if ($technologie) {
            $query->where('technologies', 'like', '%"' . $technologie . '"%');
        }

        $this->applySearch($query, $params);
        $this->applySort($query, $params);

        return $query->paginate($perPage);
    }

    public function findBySlug(string $slug): ProjetPortfolio
    {
        $query = ProjetPortfolio::with(['commentaires.auteur', 'likes.auteur', 'medias']);
        if (is_numeric($slug)) {
            return $query->findOrFail((int) $slug);
        }
        return $query->where('slug', $slug)->firstOrFail();
    }

    public function store(array $data): Model
    {
        $data['slug'] = Str::slug($data['titre']) . '-' . Str::random(6);
        return parent::store($data);
    }
}
