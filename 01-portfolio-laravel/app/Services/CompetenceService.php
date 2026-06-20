<?php

namespace App\Services;

use App\Models\Competence;
use App\Models\NiveauCompetence;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Cache;

class CompetenceService extends BaseCrudService
{
    protected array $sortableColumns = ['created_at', 'updated_at', 'nom', 'categorie'];
    protected array $searchableColumns = ['nom', 'categorie'];

    protected function getModelClass(): string
    {
        return Competence::class;
    }

    public function all(?int $proprietaireId = null): mixed
    {
        if ($proprietaireId) {
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

    public function store(array $data): Model
    {
        $competence = Competence::create([
            'nom' => $data['nom'],
            'categorie' => $data['categorie'] ?? null,
            'icone' => $data['icone'] ?? null,
        ]);

        NiveauCompetence::create([
            'proprietaire_id' => $data['proprietaire_id'],
            'competence_id' => $competence->id,
            'niveau' => $data['niveau'] ?? 'debutant',
        ]);

        $this->clearCache();

        return $competence->load('niveaux');
    }

    public function update(Model $competence, array $data): Model
    {
        $competence->update($data);

        if (isset($data['niveau'])) {
            NiveauCompetence::updateOrCreate(
                ['proprietaire_id' => $data['proprietaire_id'], 'competence_id' => $competence->id],
                ['niveau' => $data['niveau']]
            );
        }

        $this->clearCache();

        return $competence->load('niveaux');
    }

    public function delete(Model $competence): void
    {
        $competence->niveaux()->delete();
        $competence->delete();
        $this->clearCache();
    }

    public function show(int $id): ?Model
    {
        return Competence::with('niveaux')->findOrFail($id);
    }

    protected function clearCache(): void
    {
        Cache::forget('competences.public');
    }
}
