<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreFormationRequest;
use App\Http\Requests\UpdateFormationRequest;
use App\Http\Resources\FormationResource;
use App\Models\Formation;
use App\Models\Proprietaire;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;

class FormationController extends Controller
{
    public function index()
    {
        $proprietaire = Proprietaire::first();

        if (!$proprietaire) {
            return response()->json(['message' => 'Aucun profil trouve.'], 404);
        }

        return Cache::remember('formations.public', 3600, function () use ($proprietaire) {
            return FormationResource::collection($proprietaire->formations()->with('medias')->orderBy('ordre')->orderByDesc('date_debut')->get());
        });
    }

    public function show(Formation $formation)
    {
        return FormationResource::make($formation->load('medias'));
    }

    public function store(StoreFormationRequest $request)
    {
        $data = $request->validated();
        $data['proprietaire_id'] = $request->user()->proprietaire->id;

        $formation = Formation::create($data);

        if ($request->hasFile('media')) {
            $path = $request->file('media')->store('uploads/formations', 'public');
            $formation->medias()->create([
                'type' => 'image',
                'chemin_fichier' => $path,
                'titre' => $data['diplome'] ?? null,
                'ordre' => 0,
            ]);
        }

        Cache::forget('profile.public');
        Cache::forget('formations.public');
        return FormationResource::make($formation->load('medias'));
    }

    public function update(UpdateFormationRequest $request, Formation $formation)
    {
        $this->authorizeOwnershipOrFail($request, $formation);

        $formation->update($request->validated());

        if ($request->hasFile('media')) {
            $formation->medias()->delete();
            $path = $request->file('media')->store('uploads/formations', 'public');
            $formation->medias()->create([
                'type' => 'image',
                'chemin_fichier' => $path,
                'titre' => $formation->diplome,
                'ordre' => 0,
            ]);
        }

        Cache::forget('profile.public');
        Cache::forget('formations.public');
        return FormationResource::make($formation->load('medias'));
    }

    public function destroy(Request $request, Formation $formation)
    {
        $this->authorizeOwnershipOrFail($request, $formation);
        $formation->delete();
        Cache::forget('profile.public');
        Cache::forget('formations.public');
        return response()->noContent();
    }
}
