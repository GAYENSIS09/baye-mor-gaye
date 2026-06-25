<?php

namespace App\Services;

use App\Models\Proprietaire;
use App\Models\Utilisateur;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\DB;

class ProfileService
{
    public function getPublicProfile(): ?Proprietaire
    {
        return Cache::remember('profile.public', 3600, function () {
            return Proprietaire::with([
                'niveauxCompetence.competence',
                'domaines',
                'experiences',
                'formations',
                'certifications',
            ])->first();
        });
    }

    public function getUserProfile(Utilisateur $user): Utilisateur
    {
        return $user->load('proprietaire');
    }

    public function updateProfile(Utilisateur $user, array $data): Utilisateur
    {
        return DB::transaction(function () use ($user, $data) {
            $proprietaireData = [
                'bio' => $data['bio'] ?? null,
                'titre_professionnel' => $data['titre_professionnel'] ?? null,
                'localisation' => $data['localisation'] ?? null,
                'site_web' => $data['site_web'] ?? null,
                'url_linkedin' => $data['url_linkedin'] ?? null,
                'url_github' => $data['url_github'] ?? null,
            ];

            if (isset($data['nom'])) {
                $user->update(['nom' => $data['nom']]);
            }

            if (isset($data['photo'])) {
                $user->update(['photo' => $data['photo']]);
            }

            $user->proprietaire->update($proprietaireData);
            Cache::forget('profile.public');

            return $user->load('proprietaire');
        });
    }
}
