<?php

namespace App\Policies;

use App\Models\Utilisateur;
use App\Models\Domaine;

class DomainePolicy
{
    public function view(Utilisateur $user, Domaine $domaine): bool
    {
        return true;
    }

    public function create(Utilisateur $user): bool
    {
        return $user->proprietaire !== null;
    }

    public function update(Utilisateur $user, Domaine $domaine): bool
    {
        return $user->proprietaire && $domaine->proprietaire_id === $user->proprietaire->id;
    }

    public function delete(Utilisateur $user, Domaine $domaine): bool
    {
        return $user->proprietaire && $domaine->proprietaire_id === $user->proprietaire->id;
    }
}
