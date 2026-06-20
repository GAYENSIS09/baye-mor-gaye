<?php

namespace App\Policies;

use App\Models\Publication;
use App\Models\Utilisateur;

class PublicationPolicy
{
    public function view(Utilisateur $user, Publication $publication): bool
    {
        return $publication->est_publie || $this->isOwner($user, $publication);
    }

    public function create(Utilisateur $user): bool
    {
        return (bool) $user->proprietaire;
    }

    public function update(Utilisateur $user, Publication $publication): bool
    {
        return $this->isOwner($user, $publication);
    }

    public function delete(Utilisateur $user, Publication $publication): bool
    {
        return $this->isOwner($user, $publication);
    }

    private function isOwner(Utilisateur $user, Publication $publication): bool
    {
        return $user->proprietaire?->id === $publication->proprietaire_id;
    }
}
