<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Competence;
use App\Models\NiveauCompetence;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;

class CompetenceController extends Controller
{
    public function index()
    {
        $user = request()->user();

        if ($user && $user->proprietaire) {
            $proprietaireId = $user->proprietaire->id;
            return Cache::remember("competences.user.{$proprietaireId}", 3600, function () use ($proprietaireId) {
                return Competence::with(['niveaux' => function ($q) use ($proprietaireId) {
                    $q->where('proprietaire_id', $proprietaireId);
                }])->get();
            });
        }

        return Cache::remember('competences.public', 3600, function () {
            return Competence::with('niveaux')->get();
        });
    }

    public function show(Competence $competence)
    {
        return $competence->load('niveaux');
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'nom' => 'required|string|max:255',
            'categorie' => 'nullable|string|max:255',
            'icone' => 'nullable|string|max:255',
            'niveau' => 'nullable|in:debutant,intermediaire,avance,expert',
        ]);

        $competence = Competence::create([
            'nom' => $data['nom'],
            'categorie' => $data['categorie'] ?? null,
            'icone' => $data['icone'] ?? null,
        ]);

        $proprietaire = $request->user()->proprietaire;

        NiveauCompetence::create([
            'proprietaire_id' => $proprietaire->id,
            'competence_id' => $competence->id,
            'niveau' => $data['niveau'] ?? 'debutant',
        ]);

        return $competence->load('niveaux');
    }

    public function update(Request $request, Competence $competence)
    {
        $proprietaireId = $this->getProprietaireId($request);
        if (!$proprietaireId || !NiveauCompetence::where('proprietaire_id', $proprietaireId)->where('competence_id', $competence->id)->exists()) {
            abort(403, 'Action non autorisée.');
        }
        $data = $request->validate([
            'nom' => 'sometimes|string|max:255',
            'categorie' => 'nullable|string|max:255',
            'icone' => 'nullable|string|max:255',
        ]);

        $competence->update($data);

        $niveau = $request->input('niveau');
        if ($niveau) {
            $proprietaire = $request->user()->proprietaire;
            NiveauCompetence::updateOrCreate(
                ['proprietaire_id' => $proprietaire->id, 'competence_id' => $competence->id],
                ['niveau' => $niveau]
            );
        }

        return $competence->load('niveaux');
    }

    public function destroy(Request $request, Competence $competence)
    {
        $proprietaireId = $this->getProprietaireId($request);
        if (!$proprietaireId || !NiveauCompetence::where('proprietaire_id', $proprietaireId)->where('competence_id', $competence->id)->exists()) {
            abort(403, 'Action non autorisée.');
        }
        $competence->delete();
        return response()->noContent();
    }
}
