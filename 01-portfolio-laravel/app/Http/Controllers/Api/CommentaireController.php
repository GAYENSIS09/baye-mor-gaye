<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
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

        return $model->commentaires()->with('auteur')->where('est_approuve', true)->paginate(20);
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'commentable_type' => 'required|in:publication,projet_portfolio',
            'commentable_id' => 'required|integer',
            'contenu' => 'required|string|min:2|max:2000',
        ]);

        $model = $this->resolveModel($data['commentable_type'], $data['commentable_id']);

        $commentaire = $model->commentaires()->create([
            'auteur_id' => $request->user()->id,
            'contenu' => $data['contenu'],
            'est_approuve' => false,
        ]);

        return $commentaire->load('auteur');
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

        return response()->json($commentaire->load('auteur'));
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
            abort(403);
        }
        return Commentaire::with(['auteur', 'commentable'])
            ->where('est_approuve', false)
            ->where(function ($q) use ($proprietaireId) {
                $q->whereHasMorph('commentable', [Publication::class], fn($sq) => $sq->where('proprietaire_id', $proprietaireId))
                  ->orWhereHasMorph('commentable', [ProjetPortfolio::class], fn($sq) => $sq->where('proprietaire_id', $proprietaireId));
            })
            ->orderBy('created_at', 'desc')
            ->paginate(20);
    }

    public function destroy(Request $request, Commentaire $commentaire)
    {
        $this->authorizeOwnershipOrFail($request, $commentaire->commentable);
        $commentaire->delete();
        return response()->noContent();
    }

    private function resolveModel(string $type, int $id)
    {
        return match ($type) {
            'publication' => \App\Models\Publication::findOrFail($id),
            'projet_portfolio' => \App\Models\ProjetPortfolio::findOrFail($id),
        };
    }
}
