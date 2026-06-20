<?php

namespace App\Policies;

use App\Models\ProjetPortfolio;
use App\Models\Utilisateur;

class ProjetPortfolioPolicy
{
    public function view(Utilisateur $user, ProjetPortfolio $projet): bool
    {
        return $projet->est_publie || $this->isOwner($user, $projet);
    }

    public function create(Utilisateur $user): bool
    {
        return (bool) $user->proprietaire;
    }

    public function update(Utilisateur $user, ProjetPortfolio $projet): bool
    {
        return $this->isOwner($user, $projet);
    }

    public function delete(Utilisateur $user, ProjetPortfolio $projet): bool
    {
        return $this->isOwner($user, $projet);
    }

    private function isOwner(Utilisateur $user, ProjetPortfolio $projet): bool
    {
        return $user->proprietaire?->id === $projet->proprietaire_id;
    }
}
