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
    public function index(string $commentableType, int $commentableId)
    {
        $model = $this->resolveModel($commentableType, $commentableId);

        return CommentaireResource::collection($model->commentaires()->with('auteur')->where('est_approuve', true)->paginate(20));
    }

    public function store(StoreCommentaireRequest $request)
    {
        $data = $request->validated();

        if (!in_array($data['commentable_type'], ['publication', 'publications', 'projet_portfolio', 'projets'])) {
            abort(422, 'Type de commentaire invalide');
        }

        $model = $this->resolveModel($data['commentable_type'], $data['commentable_id']);

        $commentaire = $model->commentaires()->create([
            'auteur_id' => $request->user()->id,
            'contenu' => $data['contenu'],
            'est_approuve' => false,
        ]);

        return CommentaireResource::make($commentaire->load('auteur'));
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

        return response()->json(CommentaireResource::make($commentaire->load('auteur')));
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

    public function publicationCommentaires(string $slug)
    {
        $publication = Publication::where('slug', $slug)->firstOrFail();

        return CommentaireResource::collection($publication->commentaires()->with('auteur')->where('est_approuve', true)->paginate(20));
    }

    public function projetCommentaires(string $slug)
    {
        $projet = ProjetPortfolio::where('slug', $slug)->firstOrFail();

        return CommentaireResource::collection($projet->commentaires()->with('auteur')->where('est_approuve', true)->paginate(20));
    }

    public function enAttente(Request $request)
    {
        $proprietaireId = $this->getProprietaireId($request);
        if (!$proprietaireId) {
            abort(403);
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

    public function destroy(Request $request, Commentaire $commentaire)
    {
        $this->authorizeOwnershipOrFail($request, $commentaire->commentable);
        $commentaire->delete();
        return response()->noContent();
    }

    public function update(UpdateCommentaireRequest $request, Commentaire $commentaire)
    {
        $this->authorizeOwnershipOrFail($request, $commentaire->commentable);

        $commentaire->update($request->validated());

        return CommentaireResource::make($commentaire->load('auteur'));
    }

    private function resolveModel(string $type, int $id)
    {
        return match ($type) {
            'publication', 'publications' => \App\Models\Publication::findOrFail($id),
            'projet_portfolio', 'projets' => \App\Models\ProjetPortfolio::findOrFail($id),
        };
    }
}
