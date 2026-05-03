<?php

namespace App\Policies;

use App\Models\Utilisateur;
use App\Models\Competence;

class CompetencePolicy
{
    public function view(Utilisateur $user, Competence $competence): bool
    {
        return true;
    }

    public function create(Utilisateur $user): bool
    {
        return $user->proprietaire !== null;
    }

    public function update(Utilisateur $user, Competence $competence): bool
    {
        return $user->proprietaire && $competence->niveaux()->where('proprietaire_id', $user->proprietaire->id)->exists();
    }

    public function delete(Utilisateur $user, Competence $competence): bool
    {
        return $user->proprietaire && $competence->niveaux()->where('proprietaire_id', $user->proprietaire->id)->exists();
    }
}
