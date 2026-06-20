<?php

namespace App\Services\Contracts;

use Illuminate\Database\Eloquent\Model;

interface CrudServiceInterface
{
    public function list(array $filters = [], int $perPage = 12): mixed;
    public function show(int $id): ?Model;
    public function store(array $data): Model;
    public function update(Model $model, array $data): Model;
    public function delete(Model $model): void;
}
