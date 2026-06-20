<?php

namespace App\Policies;

use App\Models\Commentaire;
use App\Models\Utilisateur;

class CommentairePolicy
{
    public function create(Utilisateur $user): bool
    {
        return true; // Any authenticated user can comment
    }

    public function update(Utilisateur $user, Commentaire $commentaire): bool
    {
        return $user->id === $commentaire->auteur_id;
    }

    public function delete(Utilisateur $user, Commentaire $commentaire): bool
    {
        return $user->id === $commentaire->auteur_id || (bool) $user->proprietaire;
    }
}
