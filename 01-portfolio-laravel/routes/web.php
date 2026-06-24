<?php

use Illuminate\Support\Facades\Route;

Route::get('/up', fn() => response('OK', 200));

Route::get('/storage/{path}', function (string $path) {
    $fullPath = storage_path("app/public/{$path}");
    if (!file_exists($fullPath)) {
        abort(404);
    }
    return response()->file($fullPath);
})->where('path', '.*');