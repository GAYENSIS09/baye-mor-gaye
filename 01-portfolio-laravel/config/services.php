<?php

return [
    'paligemma' => [
        'enabled' => env('PALIGEMMA_ENABLED', false),
    ],

    'vertex' => [
        'api_key'  => env('VERTEX_API_KEY'),
        'endpoint' => env('VERTEX_ENDPOINT', 'https://us-central1-aiplatform.googleapis.com/v1'),
    ],
];
