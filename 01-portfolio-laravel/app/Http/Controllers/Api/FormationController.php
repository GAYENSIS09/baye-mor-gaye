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
use Illuminate\Support\Facades\DB;

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
        return DB::transaction(function () use ($request) {
            $data = $request->validated();
            $data['proprietaire_id'] = $request->user()->proprietaire->id;
            unset($data['media']);

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
        });
    }

    public function update(UpdateFormationRequest $request, Formation $formation)
    {
        $this->authorizeOwnershipOrFail($request, $formation);

        return DB::transaction(function () use ($request, $formation) {
            $data = $request->validated();
            unset($data['media']);
            $formation->update($data);

            if ($request->boolean('supprimer_media')) {
                $formation->medias()->delete();
            }

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
        });
    }

    public function destroy(Request $request, Formation $formation)
    {
        $this->authorizeOwnershipOrFail($request, $formation);
        $formation->medias()->delete();
        $formation->delete();
        Cache::forget('profile.public');
        Cache::forget('formations.public');
        return response()->noContent();
    }
}
