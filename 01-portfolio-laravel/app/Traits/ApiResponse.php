<?php

namespace App\Traits;

use Illuminate\Http\JsonResponse;
use Illuminate\Http\Resources\Json\ResourceCollection;

trait ApiResponse
{
    protected function success(mixed $data, ?array $meta = null, int $code = 200): JsonResponse
    {
        $response = [
            'success' => true,
            'data' => $data,
        ];

        if ($meta !== null) {
            $response['meta'] = array_merge($meta, [
                'timestamp' => now()->toIso8601String(),
            ]);
        } else {
            $response['meta'] = [
                'timestamp' => now()->toIso8601String(),
            ];
        }

        return response()->json($response, $code);
    }

    protected function created(mixed $data, ?array $meta = null): JsonResponse
    {
        return $this->success($data, $meta, 201);
    }

    protected function noContent(): JsonResponse
    {
        return response()->json(null, 204);
    }

    protected function paginated(ResourceCollection $collection): JsonResponse
    {
        $response = $collection->response()->getData(true);
        $paginator = $collection->resource;

        return response()->json([
            'success' => true,
            'data' => $response['data'],
            'meta' => [
                'current_page' => $response['meta']['current_page'] ?? $paginator->currentPage(),
                'last_page' => $response['meta']['last_page'] ?? $paginator->lastPage(),
                'per_page' => $response['meta']['per_page'] ?? $paginator->perPage(),
                'total' => $response['meta']['total'] ?? $paginator->total(),
                'links' => [
                    'first' => $paginator->url(1),
                    'last' => $paginator->url($paginator->lastPage()),
                    'prev' => $paginator->previousPageUrl(),
                    'next' => $paginator->nextPageUrl(),
                ],
                'timestamp' => now()->toIso8601String(),
            ],
        ]);
    }

    protected function error(string $code, string $message, mixed $details = null, int $httpCode = 400): JsonResponse
    {
        $error = [
            'success' => false,
            'error' => [
                'code' => $code,
                'message' => $message,
            ],
        ];

        if ($details !== null) {
            $error['error']['details'] = $details;
        }

        return response()->json($error, $httpCode);
    }
}
