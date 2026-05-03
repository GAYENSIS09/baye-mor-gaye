<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Experience;
use App\Models\Proprietaire;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;

class ExperienceController extends Controller
{
    public function index()
    {
        return Cache::remember('experiences.public', 3600, function () {
            $proprietaire = Proprietaire::first();

            if (!$proprietaire) {
                return response()->json(['message' => 'Aucun profil trouve.'], 404);
            }

            return $proprietaire->experiences()->orderBy('ordre')->orderByDesc('date_debut')->get();
        });
    }

    public function show(Experience $experience)
    {
        return $experience->load('medias');
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'titre' => 'required|string|max:255',
            'entreprise' => 'required|string|max:255',
            'description' => 'nullable|string',
            'date_debut' => 'required|date',
            'date_fin' => 'nullable|date|after_or_equal:date_debut',
            'est_actuel' => 'boolean',
            'lieu' => 'nullable|string|max:255',
            'ordre' => 'integer|min:0',
        ]);

        $data['proprietaire_id'] = $request->user()->proprietaire->id;

        return Experience::create($data);
    }

    public function update(Request $request, Experience $experience)
    {
        $this->authorizeOwnershipOrFail($request, $experience);

        $data = $request->validate([
            'titre' => 'sometimes|string|max:255',
            'entreprise' => 'sometimes|string|max:255',
            'description' => 'nullable|string',
            'date_debut' => 'sometimes|date',
            'date_fin' => 'nullable|date|after_or_equal:date_debut',
            'est_actuel' => 'boolean',
            'lieu' => 'nullable|string|max:255',
            'ordre' => 'integer|min:0',
        ]);

        $experience->update($data);
        return $experience;
    }

    public function destroy(Request $request, Experience $experience)
    {
        $this->authorizeOwnershipOrFail($request, $experience);
        $experience->delete();
        return response()->noContent();
    }
}
