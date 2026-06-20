<?php

namespace App\Policies;

use App\Models\Certification;
use App\Models\Utilisateur;

class CertificationPolicy
{
    public function create(Utilisateur $user): bool
    {
        return (bool) $user->proprietaire;
    }

    public function update(Utilisateur $user, Certification $certification): bool
    {
        return $user->proprietaire?->id === $certification->proprietaire_id;
    }

    public function delete(Utilisateur $user, Certification $certification): bool
    {
        return $user->proprietaire?->id === $certification->proprietaire_id;
    }
}
