<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreExperienceRequest;
use App\Http\Requests\UpdateExperienceRequest;
use App\Http\Resources\ExperienceResource;
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

            return ExperienceResource::collection($proprietaire->experiences()->with('medias')->orderBy('ordre')->orderByDesc('date_debut')->get());
        });
    }

    public function show(Experience $experience)
    {
        return ExperienceResource::make($experience->load('medias'));
    }

    public function store(StoreExperienceRequest $request)
    {
        $data = $request->validated();
        $data['proprietaire_id'] = $request->user()->proprietaire->id;

        $experience = Experience::create($data);

        if ($request->hasFile('media')) {
            $path = $request->file('media')->store('uploads/experiences', 'public');
            $experience->medias()->create([
                'type' => 'image',
                'chemin_fichier' => $path,
                'titre' => $data['titre'] ?? null,
                'ordre' => 0,
            ]);
        }

        Cache::forget('profile.public');
        Cache::forget('experiences.public');
        return ExperienceResource::make($experience->load('medias'));
    }

    public function update(UpdateExperienceRequest $request, Experience $experience)
    {
        $this->authorizeOwnershipOrFail($request, $experience);

        $experience->update($request->validated());

        if ($request->hasFile('media')) {
            $experience->medias()->delete();
            $path = $request->file('media')->store('uploads/experiences', 'public');
            $experience->medias()->create([
                'type' => 'image',
                'chemin_fichier' => $path,
                'titre' => $experience->titre,
                'ordre' => 0,
            ]);
        }

        Cache::forget('profile.public');
        Cache::forget('experiences.public');
        return ExperienceResource::make($experience->load('medias'));
    }

    public function destroy(Request $request, Experience $experience)
    {
        $this->authorizeOwnershipOrFail($request, $experience);
        $experience->delete();
        Cache::forget('profile.public');
        Cache::forget('experiences.public');
        return response()->noContent();
    }
}
