<?php

namespace App\Services;

use App\Services\Contracts\CrudServiceInterface;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Cache;

abstract class BaseCrudService implements CrudServiceInterface
{
    protected string $modelClass;
    protected string $cachePrefix = '';
    protected int $cacheTtl = 3600;
    protected array $sortableColumns = ['created_at', 'updated_at'];
    protected array $searchableColumns = [];
    protected string $defaultSortColumn = 'created_at';
    protected string $defaultSortDirection = 'desc';

    public function __construct()
    {
        $this->modelClass = $this->getModelClass();
        $this->cachePrefix = class_basename($this->modelClass);
    }

    abstract protected function getModelClass(): string;

    public function list(array $params = [], int $perPage = 12): mixed
    {
        $query = $this->modelClass::query();

        $this->applyFilters($query, $params);
        $this->applySearch($query, $params);
        $this->applySort($query, $params);

        return $query->paginate($perPage);
    }

    public function show(int $id): ?Model
    {
        return Cache::remember(
            "{$this->cachePrefix}.{$id}",
            $this->cacheTtl,
            fn () => $this->modelClass::findOrFail($id)
        );
    }

    public function store(array $data): Model
    {
        $model = $this->modelClass::create($data);
        $this->clearCache($model->id);
        return $model;
    }

    public function update(Model $model, array $data): Model
    {
        $model->update($data);
        $this->clearCache($model->id);
        return $model->fresh();
    }

    public function delete(Model $model): void
    {
        $this->clearCache($model->id);
        $model->delete();
    }

    protected function applyFilters($query, array $params): void
    {
        $filterParams = $params['filter'] ?? [];

        if (is_array($filterParams)) {
            foreach ($filterParams as $key => $value) {
                $this->applyFilter($query, $key, $value);
            }
        }

        // Also support flat params for backward compat
        foreach ($params as $key => $value) {
            if (in_array($key, ['sort', 'page', 'per_page', 'search', 'filter', 'publie'])) continue;
            if ($key === 'publie') {
                $this->applyFilter($query, $key, $value);
                continue;
            }
            if (is_array($value) || $value === null || $value === '') continue;
            $this->applyFilter($query, $key, $value);
        }
    }

    protected function applySearch($query, array $params): void
    {
        $search = $params['search'] ?? null;
        if (!$search || empty($this->searchableColumns)) return;

        $query->where(function ($q) use ($search) {
            foreach ($this->searchableColumns as $column) {
                $q->orWhere($column, 'like', "%{$search}%");
            }
        });
    }

    protected function applySort($query, array $params): void
    {
        $sort = $params['sort'] ?? null;

        if ($sort) {
            $direction = 'asc';
            if (str_starts_with($sort, '-')) {
                $direction = 'desc';
                $sort = substr($sort, 1);
            }

            if (in_array($sort, $this->sortableColumns)) {
                $query->orderBy($sort, $direction);
                return;
            }
        }

        $query->orderBy($this->defaultSortColumn, $this->defaultSortDirection);
    }

    protected function applyFilter($query, string $key, mixed $value): void
    {
        if ($value === null || $value === '') return;

        if (is_array($value)) {
            $query->whereIn($key, $value);
        } else {
            $query->where($key, $value);
        }
    }

    protected function clearCache(?int $id = null): void
    {
        if ($id !== null) {
            Cache::forget("{$this->cachePrefix}.{$id}");
        }
    }
}
