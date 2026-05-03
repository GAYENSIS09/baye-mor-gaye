<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;

class UploadController extends Controller
{
    public function store(Request $request)
    {
        $data = $request->validate([
            'file' => 'required|file|mimes:pdf,doc,docx,xls,xlsx,zip,png,jpg,jpeg,gif,webp|max:10240',
            'folder' => 'nullable|string|in:publications,projets,ressources,profils',
        ]);

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

    public function uploadImage(Request $request)
    {
        $data = $request->validate([
            'image' => 'required|image|mimes:jpeg,png,jpg,gif,webp|max:5120',
            'folder' => 'nullable|string|in:publications,projets,ressources,profils',
        ]);

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
