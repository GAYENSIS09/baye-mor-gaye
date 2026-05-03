<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Ressource;
use Illuminate\Http\Request;

class RessourceController extends Controller
{
    public function index(Request $request)
    {
        $query = Ressource::with('domaine');

        if ($request->has('domaine')) {
            $query->where('domaine_id', $request->domaine);
        }

        if ($request->has('type')) {
            $query->where('type', $request->type);
        }

        return $query->orderBy('created_at', 'desc')->paginate(20);
    }

    public function show(Ressource $ressource)
    {
        return $ressource->load('domaine');
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'titre' => 'required|string|max:255',
            'fichier' => 'nullable|string',
            'url_externe' => 'nullable|url|max:500',
            'type' => 'required|in:fichier,lien',
            'domaine_id' => 'nullable|exists:domaines,id',
            'taille' => 'nullable|integer',
        ]);

        $data['proprietaire_id'] = $request->user()->proprietaire->id;

        return Ressource::create($data);
    }

    public function update(Request $request, Ressource $ressource)
    {
        $this->authorizeOwnershipOrFail($request, $ressource);

        $data = $request->validate([
            'titre' => 'sometimes|string|max:255',
            'fichier' => 'nullable|string',
            'url_externe' => 'nullable|url|max:500',
            'type' => 'sometimes|in:fichier,lien',
            'domaine_id' => 'nullable|exists:domaines,id',
            'taille' => 'nullable|integer',
        ]);

        $ressource->update($data);
        return $ressource;
    }

    public function destroy(Request $request, Ressource $ressource)
    {
        $this->authorizeOwnershipOrFail($request, $ressource);
        $ressource->delete();
        return response()->noContent();
    }
}
