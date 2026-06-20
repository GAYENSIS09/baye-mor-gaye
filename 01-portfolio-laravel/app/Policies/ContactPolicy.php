<?php

namespace App\Policies;

use App\Models\Contact;
use App\Models\Utilisateur;

class ContactPolicy
{
    public function create(Utilisateur $user): bool
    {
        return true;
    }

    public function view(Utilisateur $user, Contact $contact): bool
    {
        return (bool) $user->proprietaire;
    }

    public function update(Utilisateur $user, Contact $contact): bool
    {
        return (bool) $user->proprietaire;
    }

    public function delete(Utilisateur $user, Contact $contact): bool
    {
        return (bool) $user->proprietaire;
    }
}
