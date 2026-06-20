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
            $photoUrl = $photo
                ? (str_starts_with($photo, 'http://') || str_starts_with($photo, 'https://')
                    ? $photo
                    : url("storage/$photo"))
                : null;

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

    public function update(UpdateProfileRequest $request)
    {
        $data = $request->validated();

        $utilisateur = $request->user();

        if (isset($data['nom'])) {
            $utilisateur->update(['nom' => $data['nom']]);
        }

        if (isset($data['photo'])) {
            if (str_starts_with($data['photo'], 'data:image/')) {
                $path = $this->saveBase64Image($data['photo'], 'profils');
                $utilisateur->update(['photo' => $path]);
            } else {
                $utilisateur->update(['photo' => $data['photo']]);
            }
        }

        $proprietaire = $utilisateur->proprietaire;

        if ($proprietaire) {
            $proprietaire->update($data);
        }

        Cache::forget('profile.public');
        return UtilisateurResource::make($utilisateur->load('proprietaire'));
    }

    private function saveBase64Image(string $base64, string $folder = 'profils'): string
    {
        $suffix = str_starts_with($base64, 'data:image/png') ? 'png' : 'jpg';
        $filename = 'photo-' . now()->format('YmdHis') . '-' . Str::random(10) . '.' . $suffix;
        $relativePath = "uploads/{$folder}/{$filename}";

        $imageData = substr($base64, strpos($base64, ',') + 1);
        $decoded = base64_decode($imageData);

        Storage::disk('public')->put($relativePath, $decoded);

        return $relativePath;
    }
}
