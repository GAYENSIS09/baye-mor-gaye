<?php

namespace App\Policies;

use App\Models\Ressource;
use App\Models\Utilisateur;

class RessourcePolicy
{
    public function create(Utilisateur $user): bool
    {
        return (bool) $user->proprietaire;
    }

    public function update(Utilisateur $user, Ressource $ressource): bool
    {
        return $user->proprietaire?->id === $ressource->proprietaire_id;
    }

    public function delete(Utilisateur $user, Ressource $ressource): bool
    {
        return $user->proprietaire?->id === $ressource->proprietaire_id;
    }
}
