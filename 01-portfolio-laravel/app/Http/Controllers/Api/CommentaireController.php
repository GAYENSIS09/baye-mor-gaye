<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreCommentaireRequest;
use App\Http\Requests\UpdateCommentaireRequest;
use App\Http\Resources\CommentaireResource;
use App\Mail\CommentaireApprouve;
use App\Mail\CommentaireRejete;
use App\Models\Commentaire;
use App\Models\Notification;
use App\Models\ProjetPortfolio;
use App\Models\Publication;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Mail;

class CommentaireController extends Controller
{
    public function store(StoreCommentaireRequest $request)
    {
        $data = $request->validated();

        $model = $this->resolveModel($data['commentable_type'], $data['commentable_id']);

        $commentaire = $model->commentaires()->create([
            'auteur_id' => $request->user()->id,
            'contenu' => $data['contenu'],
            'est_approuve' => false,
            'parent_id' => $data['parent_id'] ?? null,
        ]);

        return CommentaireResource::make($commentaire->load(['auteur', 'commentable']));
    }

    public function approuver(Request $request, Commentaire $commentaire)
    {
        $this->authorizeOwnershipOrFail($request, $commentaire->commentable);

        $commentaire->update(['est_approuve' => true]);

        if ($commentaire->auteur) {
            Notification::create([
                'proprietaire_id' => $commentaire->commentable?->proprietaire_id,
                'titre'           => 'Commentaire approuvé',
                'message'         => "Le commentaire de {$commentaire->auteur->nom} a été approuvé.",
                'type'            => 'succes',
                'donnees'         => ['commentaire_id' => $commentaire->id],
            ]);

            Mail::to($commentaire->auteur->email)->queue(new CommentaireApprouve($commentaire));
        }

        return response()->json(CommentaireResource::make($commentaire->load(['auteur', 'commentable'])));
    }

    public function rejeter(Request $request, Commentaire $commentaire)
    {
        $this->authorizeOwnershipOrFail($request, $commentaire->commentable);
        $auteur = $commentaire->auteur;
        $commentaire->delete();

        if ($auteur) {
            Notification::create([
                'proprietaire_id' => $commentaire->commentable?->proprietaire_id,
                'titre'           => 'Commentaire rejeté',
                'message'         => "Le commentaire de {$auteur->nom} a été rejeté.",
                'type'            => 'avertissement',
                'donnees'         => ['commentaire_id' => $commentaire->id],
            ]);

            Mail::to($auteur->email)->queue(new CommentaireRejete($commentaire));
        }

        return response()->json(['message' => 'Commentaire rejeté']);
    }

    public function enAttente(Request $request)
    {
        $proprietaireId = $this->getProprietaireId($request);
        if (!$proprietaireId) {
            return CommentaireResource::collection(Commentaire::where('id', 0)->paginate(20));
        }
        return CommentaireResource::collection(Commentaire::with(['auteur', 'commentable'])
            ->where('est_approuve', false)
            ->where(function ($q) use ($proprietaireId) {
                $q->whereHasMorph('commentable', [Publication::class], fn($sq) => $sq->where('proprietaire_id', $proprietaireId))
                  ->orWhereHasMorph('commentable', [ProjetPortfolio::class], fn($sq) => $sq->where('proprietaire_id', $proprietaireId));
            })
            ->orderBy('created_at', 'desc')
            ->paginate(20));
    }

    public function mesCommentaires(Request $request)
    {
        return CommentaireResource::collection(
            Commentaire::with(['auteur', 'commentable'])
                ->where('auteur_id', $request->user()->id)
                ->orderBy('created_at', 'desc')
                ->paginate(20)
        );
    }

    public function destroy(Request $request, Commentaire $commentaire)
    {
        $user = $request->user();
        if ($user->id !== $commentaire->auteur_id) {
            $this->authorizeOwnershipOrFail($request, $commentaire->commentable);
        }
        $commentaire->delete();
        return response()->noContent();
    }

    public function update(UpdateCommentaireRequest $request, Commentaire $commentaire)
    {
        $user = $request->user();
        if ($user->id !== $commentaire->auteur_id) {
            $this->authorizeOwnershipOrFail($request, $commentaire->commentable);
        }

        $commentaire->update($request->validated());

        return CommentaireResource::make($commentaire->load(['auteur', 'commentable']));
    }

    private function resolveModel(string $type, int $id)
    {
        return match ($type) {
            'publication', 'publications', Publication::class => Publication::findOrFail($id),
            'projet', 'projet_portfolio', 'projets', ProjetPortfolio::class => ProjetPortfolio::findOrFail($id),
            default => abort(400, 'Type de commentaire invalide.'),
        };
    }
}
