<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Commentaire;
use App\Models\Like;
use App\Models\ProjetPortfolio;
use App\Models\Publication;
use Illuminate\Http\Request;

class LikeController extends Controller
{
    public function toggle(Request $request)
    {
        $data = $request->validate([
            'likeable_type'  => 'required_without_all:publication_id,projet_id|in:publication,projet_portfolio,commentaire',
            'likeable_id'    => 'required_without_all:publication_id,projet_id|integer',
            'publication_id' => 'required_without_all:likeable_type,likeable_id|exists:publications,id',
            'projet_id'      => 'required_without_all:likeable_type,likeable_id|exists:projet_portfolios,id',
        ]);

        // Support both morph and direct publication_id/projet_id
        if (isset($data['publication_id'])) {
            $type = Publication::class;
            $id   = $data['publication_id'];
        } elseif (isset($data['projet_id'])) {
            $type = ProjetPortfolio::class;
            $id   = $data['projet_id'];
        } else {
            $type = $this->morphClass($data['likeable_type']);
            $id   = $data['likeable_id'];
        }

        $like = Like::where([
            'auteur_id'     => $request->user()->id,
            'likeable_type' => $type,
            'likeable_id'   => $id,
        ])->first();

        if ($like) {
            $like->delete();
            return response()->json(['liked' => false, 'count' => $this->count($type, $id)]);
        }

        Like::create([
            'auteur_id'     => $request->user()->id,
            'likeable_type' => $type,
            'likeable_id'   => $id,
        ]);

        return response()->json(['liked' => true, 'count' => $this->count($type, $id)]);
    }

    private function count(string $type, int $id): int
    {
        return Like::where(['likeable_type' => $type, 'likeable_id' => $id])->count();
    }

    private function morphClass(string $type): string
    {
        return match ($type) {
            'publication'       => Publication::class,
            'projet_portfolio'  => ProjetPortfolio::class,
            'commentaire'       => Commentaire::class,
        };
    }
}
