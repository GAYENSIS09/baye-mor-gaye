<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreCertificationRequest;
use App\Http\Requests\UpdateCertificationRequest;
use App\Http\Resources\CertificationResource;
use App\Models\Certification;
use App\Models\Proprietaire;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;

class CertificationController extends Controller
{
    public function index()
    {
        return Cache::remember('certifications.public', 3600, function () {
            $proprietaire = Proprietaire::first();

            if (!$proprietaire) {
                return response()->json(['message' => 'Aucun profil trouve.'], 404);
            }

            return CertificationResource::collection($proprietaire->certifications()->with('medias')->orderBy('ordre')->orderByDesc('date_obtention')->get());
        });
    }

    public function show(Certification $certification)
    {
        return CertificationResource::make($certification->load('medias'));
    }

    public function store(StoreCertificationRequest $request)
    {
        $data = $request->validated();
        $data['proprietaire_id'] = $request->user()->proprietaire->id;

        $certification = Certification::create($data);

        if ($request->hasFile('media')) {
            $path = $request->file('media')->store('uploads/certifications', 'public');
            $certification->medias()->create([
                'type' => 'image',
                'chemin_fichier' => $path,
                'titre' => $data['titre'] ?? null,
                'ordre' => 0,
            ]);
        }

        Cache::forget('profile.public');
        Cache::forget('certifications.public');
        return CertificationResource::make($certification->load('medias'));
    }

    public function update(UpdateCertificationRequest $request, Certification $certification)
    {
        $this->authorizeOwnershipOrFail($request, $certification);

        $certification->update($request->validated());

        if ($request->hasFile('media')) {
            $certification->medias()->delete();
            $path = $request->file('media')->store('uploads/certifications', 'public');
            $certification->medias()->create([
                'type' => 'image',
                'chemin_fichier' => $path,
                'titre' => $certification->titre,
                'ordre' => 0,
            ]);
        }

        Cache::forget('profile.public');
        Cache::forget('certifications.public');
        return CertificationResource::make($certification->load('medias'));
    }

    public function destroy(Request $request, Certification $certification)
    {
        $this->authorizeOwnershipOrFail($request, $certification);
        $certification->delete();
        Cache::forget('profile.public');
        Cache::forget('certifications.public');
        return response()->noContent();
    }
}
