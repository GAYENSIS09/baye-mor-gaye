<?php

namespace App\Policies;

use App\Models\Notification;
use App\Models\Utilisateur;

class NotificationPolicy
{
    public function view(Utilisateur $user, Notification $notification): bool
    {
        return $user->proprietaire?->id === $notification->proprietaire_id;
    }

    public function update(Utilisateur $user, Notification $notification): bool
    {
        return $user->proprietaire?->id === $notification->proprietaire_id;
    }

    public function delete(Utilisateur $user, Notification $notification): bool
    {
        return $user->proprietaire?->id === $notification->proprietaire_id;
    }
}
