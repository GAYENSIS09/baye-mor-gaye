<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Formation;
use App\Models\Proprietaire;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;

class FormationController extends Controller
{
    public function index()
    {
        return Cache::remember('formations.public', 3600, function () {
            $proprietaire = Proprietaire::first();

            if (!$proprietaire) {
                return response()->json(['message' => 'Aucun profil trouve.'], 404);
            }

            return $proprietaire->formations()->orderBy('ordre')->orderByDesc('date_debut')->get();
        });
    }

    public function show(Formation $formation)
    {
        return $formation->load('medias');
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'diplome' => 'required|string|max:255',
            'etablissement' => 'required|string|max:255',
            'description' => 'nullable|string',
            'domaine_etude' => 'nullable|string|max:255',
            'date_debut' => 'required|date',
            'date_fin' => 'nullable|date|after_or_equal:date_debut',
            'ordre' => 'integer|min:0',
        ]);

        $data['proprietaire_id'] = $request->user()->proprietaire->id;

        return Formation::create($data);
    }

    public function update(Request $request, Formation $formation)
    {
        $this->authorizeOwnershipOrFail($request, $formation);

        $data = $request->validate([
            'diplome' => 'sometimes|string|max:255',
            'etablissement' => 'sometimes|string|max:255',
            'description' => 'nullable|string',
            'domaine_etude' => 'nullable|string|max:255',
            'date_debut' => 'sometimes|date',
            'date_fin' => 'nullable|date|after_or_equal:date_debut',
            'ordre' => 'integer|min:0',
        ]);

        $formation->update($data);
        return $formation;
    }

    public function destroy(Request $request, Formation $formation)
    {
        $this->authorizeOwnershipOrFail($request, $formation);
        $formation->delete();
        return response()->noContent();
    }
}
