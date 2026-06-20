<?php

namespace App\Policies;

use App\Models\Rappel;
use App\Models\Utilisateur;

class RappelPolicy
{
    public function create(Utilisateur $user): bool
    {
        return (bool) $user->proprietaire;
    }

    public function update(Utilisateur $user, Rappel $rappel): bool
    {
        return $user->proprietaire?->id === $rappel->proprietaire_id;
    }

    public function delete(Utilisateur $user, Rappel $rappel): bool
    {
        return $user->proprietaire?->id === $rappel->proprietaire_id;
    }
}
