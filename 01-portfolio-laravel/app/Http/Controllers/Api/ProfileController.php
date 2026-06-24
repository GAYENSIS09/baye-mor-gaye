<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\UpdateProfileRequest;
use App\Http\Resources\ProprietaireResource;
use App\Http\Resources\UtilisateurResource;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class ProfileController extends Controller
{
    public function show(Request $request)
    {
        $proprietaire = $request->user()->proprietaire;

        if (!$proprietaire) {
            return response()->json(['message' => 'Profil proprietaire introuvable.'], 404);
        }

        return ProprietaireResource::make($proprietaire);
    }

    public function publicProfile()
    {
        $proprietaire = \App\Models\Proprietaire::with([
            'utilisateur',
            'competences.niveaux',
            'domaines',
            'experiences.medias',
            'formations.medias',
            'certifications.medias',
        ])->first();

        if (!$proprietaire) {
            return response()->json(['message' => 'Profil introuvable.'], 404);
        }

        return Cache::remember('profile.public', 3600, function () use ($proprietaire) {
            $photo = $proprietaire->utilisateur->photo;
            $photoUrl = $photo
                ? (str_starts_with($photo, 'http://') || str_starts_with($photo, 'https://')
                    ? $photo
                    : url("storage/$photo"))
                : null;

            return response()->json([
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
            ]);
        });
    }

    public function update(UpdateProfileRequest $request)
    {
        $data = $request->validated();

        $utilisateur = $request->user();

        if (isset($data['nom'])) {
            $utilisateur->update(['nom' => $data['nom']]);
        }

        if (isset($data['email'])) {
            $utilisateur->update(['email' => $data['email']]);
        }

        if (isset($data['photo']) && str_starts_with($data['photo'], 'data:image/')) {
            $path = $this->saveBase64Image($data['photo'], 'profils');
            $utilisateur->update(['photo' => $path]);
        }

        $proprietaire = $utilisateur->proprietaire;

        if ($proprietaire) {
            $proprietaireData = array_intersect_key($data, array_flip([
                'bio',
                'titre_professionnel',
                'localisation',
                'site_web',
                'url_linkedin',
                'url_github',
            ]));
            $proprietaire->update($proprietaireData);
        }

        Cache::forget('profile.public');
        return UtilisateurResource::make($utilisateur->load('proprietaire'));
    }

    private function saveBase64Image(string $base64, string $folder = 'profils'): string
    {
        if (!str_contains($base64, ',')) {
            throw new \InvalidArgumentException('Format base64 invalide : virgule manquante.');
        }

        $suffix = str_starts_with($base64, 'data:image/png') ? 'png' : 'jpg';
        $filename = 'photo-' . now()->format('YmdHis') . '-' . Str::random(10) . '.' . $suffix;
        $relativePath = "uploads/{$folder}/{$filename}";

        $imageData = substr($base64, strpos($base64, ',') + 1);
        $decoded = base64_decode(trim($imageData));

        if ($decoded === false) {
            throw new \RuntimeException('Le décodage base64 de l\'image a échoué.');
        }

        if (!Storage::disk('public')->put($relativePath, $decoded)) {
            throw new \RuntimeException("Impossible d'écrire le fichier sur le disque : {$relativePath}");
        }

        return $relativePath;
    }
}
