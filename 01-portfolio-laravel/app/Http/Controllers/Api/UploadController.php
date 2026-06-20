<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreUploadRequest;
use App\Http\Requests\StoreUploadImageRequest;
use Illuminate\Http\Request;

class UploadController extends Controller
{
    public function store(StoreUploadRequest $request)
    {
        $data = $request->validated();

        $folder = $data['folder'] ?? 'publications';
        $path = $request->file('file')->store("uploads/{$folder}", 'public');

        return response()->json([
            'url' => \Illuminate\Support\Facades\Storage::url($path),
            'path' => $path,
            'name' => $request->file('file')->getClientOriginalName(),
            'size' => $request->file('file')->getSize(),
            'mime' => $request->file('file')->getMimeType(),
        ], 201);
    }

    public function uploadImage(StoreUploadImageRequest $request)
    {
        $data = $request->validated();

        $folder = $data['folder'] ?? 'publications';
        $path = $request->file('image')->store("uploads/{$folder}", 'public');

        $imageInfo = getimagesize($request->file('image')->getPathname());

        return response()->json([
            'url' => \Illuminate\Support\Facades\Storage::url($path),
            'path' => $path,
            'largeur' => $imageInfo[0] ?? null,
            'hauteur' => $imageInfo[1] ?? null,
            'taille' => $request->file('image')->getSize(),
        ], 201);
    }
}
