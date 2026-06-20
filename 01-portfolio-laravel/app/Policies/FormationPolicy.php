<?php

namespace App\Policies;

use App\Models\Formation;
use App\Models\Utilisateur;

class FormationPolicy
{
    public function create(Utilisateur $user): bool
    {
        return (bool) $user->proprietaire;
    }

    public function update(Utilisateur $user, Formation $formation): bool
    {
        return $user->proprietaire?->id === $formation->proprietaire_id;
    }

    public function delete(Utilisateur $user, Formation $formation): bool
    {
        return $user->proprietaire?->id === $formation->proprietaire_id;
    }
}
