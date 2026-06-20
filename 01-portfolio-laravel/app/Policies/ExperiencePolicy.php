<?php

namespace App\Policies;

use App\Models\Experience;
use App\Models\Utilisateur;

class ExperiencePolicy
{
    public function create(Utilisateur $user): bool
    {
        return (bool) $user->proprietaire;
    }

    public function update(Utilisateur $user, Experience $experience): bool
    {
        return $user->proprietaire?->id === $experience->proprietaire_id;
    }

    public function delete(Utilisateur $user, Experience $experience): bool
    {
        return $user->proprietaire?->id === $experience->proprietaire_id;
    }
}
