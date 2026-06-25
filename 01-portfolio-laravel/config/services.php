<?php

return [
    'ollama' => [
        'url'   => env('OLLAMA_URL', 'http://host.docker.internal:11434'),
        'model' => env('OLLAMA_MODEL', 'llava'),
    ],
];
