<?php

namespace App\Policies;

use App\Models\Conversion;
use App\Models\Utilisateur;

class ConversionPolicy
{
    public function create(Utilisateur $user): bool
    {
        return (bool) $user->proprietaire;
    }

    public function update(Utilisateur $user, Conversion $conversion): bool
    {
        return (bool) $user->proprietaire;
    }

    public function delete(Utilisateur $user, Conversion $conversion): bool
    {
        return (bool) $user->proprietaire;
    }
}
