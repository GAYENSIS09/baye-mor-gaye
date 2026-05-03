<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
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

            return $proprietaire->certifications()->orderBy('ordre')->orderByDesc('date_obtention')->get();
        });
    }

    public function show(Certification $certification)
    {
        return $certification->load('medias');
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'titre' => 'required|string|max:255',
            'organisme' => 'required|string|max:255',
            'description' => 'nullable|string',
            'date_obtention' => 'required|date',
            'date_expiration' => 'nullable|date|after_or_equal:date_obtention',
            'url_credential' => 'nullable|url|max:255',
            'ordre' => 'integer|min:0',
        ]);

        $data['proprietaire_id'] = $request->user()->proprietaire->id;

        return Certification::create($data);
    }

    public function update(Request $request, Certification $certification)
    {
        $this->authorizeOwnershipOrFail($request, $certification);

        $data = $request->validate([
            'titre' => 'sometimes|string|max:255',
            'organisme' => 'sometimes|string|max:255',
            'description' => 'nullable|string',
            'date_obtention' => 'sometimes|date',
            'date_expiration' => 'nullable|date|after_or_equal:date_obtention',
            'url_credential' => 'nullable|url|max:255',
            'ordre' => 'integer|min:0',
        ]);

        $certification->update($data);
        return $certification;
    }

    public function destroy(Request $request, Certification $certification)
    {
        $this->authorizeOwnershipOrFail($request, $certification);
        $certification->delete();
        return response()->noContent();
    }
}
