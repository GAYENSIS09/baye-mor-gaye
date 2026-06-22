<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreCompetenceRequest;
use App\Http\Requests\UpdateCompetenceRequest;
use App\Http\Resources\CompetenceResource;
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
                return CompetenceResource::collection(Competence::with(['niveaux' => function ($q) use ($proprietaireId) {
                    $q->where('proprietaire_id', $proprietaireId);
                }])->get());
            });
        }

        return Cache::remember('competences.public', 3600, function () {
            return CompetenceResource::collection(Competence::with('niveaux')->get());
        });
    }

    public function show(Competence $competence)
    {
        return CompetenceResource::make($competence->load('niveaux'));
    }

    public function store(StoreCompetenceRequest $request)
    {
        $data = $request->validated();

        $competence = Competence::create([
            'nom' => $data['nom'],
            'categorie' => $data['categorie'] ?? null,
            'icone' => $data['icone'] ?? null,
        ]);

        $proprietaire = $request->user()->proprietaire;
        $proprietaireId = $proprietaire->id;

        NiveauCompetence::create([
            'proprietaire_id' => $proprietaireId,
            'competence_id' => $competence->id,
            'niveau' => $data['niveau'] ?? 'debutant',
        ]);

        Cache::forget("competences.user.{$proprietaireId}");
        Cache::forget('competences.public');
        return $competence->load('niveaux');
    }

    public function update(UpdateCompetenceRequest $request, Competence $competence)
    {
        $proprietaireId = $this->getProprietaireId($request);
        if (!$proprietaireId || !NiveauCompetence::where('proprietaire_id', $proprietaireId)->where('competence_id', $competence->id)->exists()) {
            abort(403, 'Action non autorisée.');
        }
        $data = $request->validated();

        $niveau = $data['niveau'] ?? null;
        unset($data['niveau']);

        $competence->update($data);

        if ($niveau) {
            $proprietaire = $request->user()->proprietaire;
            NiveauCompetence::updateOrCreate(
                ['proprietaire_id' => $proprietaire->id, 'competence_id' => $competence->id],
                ['niveau' => $niveau]
            );
        }

        Cache::forget("competences.user.{$proprietaireId}");
        Cache::forget('competences.public');
        return CompetenceResource::make($competence->load('niveaux'));
    }

    public function destroy(Request $request, Competence $competence)
    {
        $proprietaireId = $this->getProprietaireId($request);
        if (!$proprietaireId || !NiveauCompetence::where('proprietaire_id', $proprietaireId)->where('competence_id', $competence->id)->exists()) {
            abort(403, 'Action non autorisée.');
        }
        $competence->delete();
        Cache::forget("competences.user.{$proprietaireId}");
        Cache::forget('competences.public');
        return response()->noContent();
    }
}
