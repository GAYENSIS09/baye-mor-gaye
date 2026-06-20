<?php

namespace App\Policies;

use App\Models\Evenement;
use App\Models\Utilisateur;

class EvenementPolicy
{
    public function create(Utilisateur $user): bool
    {
        return (bool) $user->proprietaire;
    }

    public function update(Utilisateur $user, Evenement $evenement): bool
    {
        return $user->proprietaire?->id === $evenement->emploiDuTemps?->proprietaire_id;
    }

    public function delete(Utilisateur $user, Evenement $evenement): bool
    {
        return $user->proprietaire?->id === $evenement->emploiDuTemps?->proprietaire_id;
    }
}
