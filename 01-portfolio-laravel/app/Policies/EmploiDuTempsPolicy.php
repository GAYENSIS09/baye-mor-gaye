<?php

namespace App\Policies;

use App\Models\EmploiDuTemps;
use App\Models\Utilisateur;

class EmploiDuTempsPolicy
{
    public function create(Utilisateur $user): bool
    {
        return (bool) $user->proprietaire;
    }

    public function update(Utilisateur $user, EmploiDuTemps $edt): bool
    {
        return $user->proprietaire?->id === $edt->proprietaire_id;
    }

    public function delete(Utilisateur $user, EmploiDuTemps $edt): bool
    {
        return $user->proprietaire?->id === $edt->proprietaire_id;
    }
}
