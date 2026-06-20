<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreDomaineRequest;
use App\Http\Requests\UpdateDomaineRequest;
use App\Http\Resources\DomaineResource;
use App\Models\Domaine;
use App\Models\Ressource;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class DomaineController extends Controller
{
    public function index()
    {
        $user = request()->user();

        if ($user && $user->proprietaire) {
            $proprietaireId = $user->proprietaire->id;
            return Cache::remember("domaines.user.{$proprietaireId}", 3600, function () use ($proprietaireId) {
                $proprietaire = \App\Models\Proprietaire::find($proprietaireId);
                return $proprietaire
                    ? DomaineResource::collection($proprietaire->domaines()->withCount(['publications', 'ressources'])->get())
                    : collect();
            });
        }

        return Cache::remember('domaines.public', 3600, function () {
            return DomaineResource::collection(Domaine::all());
        });
    }

    public function show(Domaine $domaine)
    {
        return DomaineResource::make($domaine->load('publications', 'ressources'));
    }

    public function store(StoreDomaineRequest $request)
    {
        $data = $request->validated();
        $data['slug'] = $data['slug'] ?? Str::slug($data['nom']);
        $data['proprietaire_id'] = $request->user()->proprietaire->id;

        $proprietaireId = $request->user()->proprietaire->id;
        Cache::forget("domaines.user.{$proprietaireId}");
        Cache::forget('domaines.public');
        return DomaineResource::make(Domaine::create($data));
    }

    public function update(UpdateDomaineRequest $request, Domaine $domaine)
    {
        $this->authorizeOwnershipOrFail($request, $domaine);

        $domaine->update($request->validated());

        $proprietaireId = $request->user()->proprietaire->id;
        Cache::forget("domaines.user.{$proprietaireId}");
        Cache::forget('domaines.public');
        return DomaineResource::make($domaine);
    }

    public function destroy(Request $request, Domaine $domaine)
    {
        $this->authorizeOwnershipOrFail($request, $domaine);

        $proprietaireId = $request->user()->proprietaire->id;
        DB::transaction(function () use ($domaine) {
            $domaine->publications()->detach();
            Ressource::where('domaine_id', $domaine->id)
                     ->update(['domaine_id' => null]);
            $domaine->delete();
        });

        Cache::forget("domaines.user.{$proprietaireId}");
        Cache::forget('domaines.public');
        return response()->json(['message' => 'Domaine supprimé, publications dissociées']);
    }
}
