<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;

class ProfileController extends Controller
{
    public function show(Request $request)
    {
        $proprietaire = $request->user()->proprietaire;

        if (!$proprietaire) {
            return response()->json(['message' => 'Profil proprietaire introuvable.'], 404);
        }

        return $proprietaire;
    }

    public function publicProfile()
    {
        $data = Cache::remember('profile.public', 3600, function () {
            $proprietaire = \App\Models\Proprietaire::with([
                'utilisateur',
                'competences.niveaux',
                'domaines',
                'experiences.medias',
                'formations.medias',
                'certifications.medias',
            ])->first();

            if (!$proprietaire) {
                return ['error' => 'Profil introuvable.', 'status' => 404];
            }

            $photo = $proprietaire->utilisateur->photo;
            $photoUrl = $photo ? url("storage/$photo") : null;

            return [
                'nom' => $proprietaire->utilisateur->nom,
                'email' => $proprietaire->utilisateur->email,
                'photo' => $photoUrl,
                'titre_professionnel' => $proprietaire->titre_professionnel,
                'bio' => $proprietaire->bio,
                'localisation' => $proprietaire->localisation,
                'site_web' => $proprietaire->site_web,
                'url_linkedin' => $proprietaire->url_linkedin,
                'url_github' => $proprietaire->url_github,
                'updated_at' => $proprietaire->updated_at?->toIso8601String(),
                'competences' => $proprietaire->competences,
                'domaines' => $proprietaire->domaines,
                'experiences' => $proprietaire->experiences,
                'formations' => $proprietaire->formations,
                'certifications' => $proprietaire->certifications,
            ];
        });

        if (isset($data['error'])) {
            return response()->json(['message' => $data['error']], $data['status'] ?? 404);
        }

        return response()->json($data);
    }

    public function update(Request $request)
    {
        $data = $request->validate([
            'bio' => 'nullable|string',
            'titre_professionnel' => 'nullable|string|max:255',
            'localisation' => 'nullable|string|max:255',
            'site_web' => 'nullable|url|max:255',
            'url_linkedin' => 'nullable|url|max:255',
            'url_github' => 'nullable|url|max:255',
            'nom' => 'nullable|string|max:255',
            'photo' => 'nullable|string',
        ]);

        $utilisateur = $request->user();

        if (isset($data['nom'])) {
            $utilisateur->update(['nom' => $data['nom']]);
        }

        if (isset($data['photo'])) {
            $utilisateur->update(['photo' => $data['photo']]);
        }

        $proprietaire = $utilisateur->proprietaire;

        if ($proprietaire) {
            $proprietaire->update($data);
        }

        return $utilisateur->load('proprietaire');
    }
}
