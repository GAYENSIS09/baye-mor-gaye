<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
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
                    ? $proprietaire->domaines()->withCount(['publications', 'ressources'])->get()
                    : collect();
            });
        }

        return Cache::remember('domaines.public', 3600, function () {
            return Domaine::all();
        });
    }

    public function show(Domaine $domaine)
    {
        return $domaine->load('publications', 'ressources');
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'nom' => 'required|string|max:255',
            'slug' => 'nullable|string|max:255|unique:domaines,slug',
            'description' => 'nullable|string',
            'couleur' => 'nullable|string|max:7',
        ]);

        $data['slug'] = $data['slug'] ?? Str::slug($data['nom']);
        $data['proprietaire_id'] = $request->user()->proprietaire->id;

        return Domaine::create($data);
    }

    public function update(Request $request, Domaine $domaine)
    {
        $this->authorizeOwnershipOrFail($request, $domaine);

        $data = $request->validate([
            'nom' => 'sometimes|string|max:255',
            'slug' => 'nullable|string|max:255|unique:domaines,slug,' . $domaine->id,
            'description' => 'nullable|string',
            'couleur' => 'nullable|string|max:7',
        ]);

        $domaine->update($data);

        return $domaine;
    }

    public function destroy(Request $request, Domaine $domaine)
    {
        $this->authorizeOwnershipOrFail($request, $domaine);

        DB::transaction(function () use ($domaine) {
            $domaine->publications()->detach();
            Ressource::where('domaine_id', $domaine->id)
                     ->update(['domaine_id' => null]);
            $domaine->delete();
        });

        return response()->json(['message' => 'Domaine supprimé, publications dissociées']);
    }
}
