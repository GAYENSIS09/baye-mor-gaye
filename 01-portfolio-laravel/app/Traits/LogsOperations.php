<?php

namespace App\Traits;

use Illuminate\Support\Facades\Log;

trait LogsOperations
{
    protected function logOperation(string $operation, string $entity, mixed $id = null, array $context = []): void
    {
        Log::info("[{$operation}] {$entity}" . ($id ? " #{$id}" : ''), $context);
    }
}
