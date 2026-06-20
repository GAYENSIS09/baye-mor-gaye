<?php

namespace App\Services;

use App\Mail\CommentaireApprouve;
use App\Mail\CommentaireRejete;
use App\Models\Commentaire;
use App\Models\Notification;
use App\Models\Proprietaire;
use App\Services\BaseCrudService;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Mail;

class CommentaireService extends BaseCrudService
{
    protected array $sortableColumns = ['created_at', 'updated_at'];
    protected array $searchableColumns = ['contenu'];

    protected function getModelClass(): string
    {
        return Commentaire::class;
    }

    public function listForResource(string $commentableType, int $commentableId): mixed
    {
        $typeMap = [
            'publications' => 'App\Models\Publication',
            'projets' => 'App\Models\ProjetPortfolio',
        ];

        $morphClass = $typeMap[$commentableType] ?? null;
        if (!$morphClass) {
            abort(404);
        }

        return Commentaire::with('auteur')
            ->where('commentable_type', $morphClass)
            ->where('commentable_id', $commentableId)
            ->where('est_approuve', true)
            ->orderBy('created_at', 'desc')
            ->get();
    }

    public function getEnAttente(): mixed
    {
        $proprietaire = Proprietaire::first();
        if (!$proprietaire) return collect();

        return Commentaire::with('auteur')
            ->where('est_approuve', false)
            ->whereHasMorph('commentable', ['*'], function ($query) use ($proprietaire) {
                $query->where('proprietaire_id', $proprietaire->id);
            })
            ->orderBy('created_at', 'desc')
            ->get();
    }

    public function approuver(Commentaire $commentaire): Commentaire
    {
        $commentaire->update(['est_approuve' => true]);

        try {
            Mail::to($commentaire->auteur->email)->queue(new CommentaireApprouve($commentaire));
        } catch (\Exception $e) {
            // Silently fail
        }

        return $commentaire->fresh()->load('auteur');
    }

    public function rejeter(Commentaire $commentaire): void
    {
        try {
            Mail::to($commentaire->auteur->email)->queue(new CommentaireRejete($commentaire));
        } catch (\Exception $e) {
            // Silently fail
        }

        $commentaire->delete();
    }
}
