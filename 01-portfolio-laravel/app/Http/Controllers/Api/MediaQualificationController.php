<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreMediaQualificationRequest;
use App\Http\Resources\MediaQualificationResource;
use App\Models\MediaQualification;
use App\Models\Experience;
use App\Models\Formation;
use App\Models\Certification;
use App\Models\Ressource;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;

class MediaQualificationController extends Controller
{
    public function store(StoreMediaQualificationRequest $request)
    {
        $data = $request->validated();

        $modelClass = match ($data['qualifiable_type']) {
            'experience' => Experience::class,
            'formation' => Formation::class,
            'certification' => Certification::class,
            'ressource' => Ressource::class,
        };

        $qualifiable = $modelClass::findOrFail($data['qualifiable_id']);
        $this->authorizeOwnershipOrFail($request, $qualifiable);

        $media = MediaQualification::create([
            'qualifiable_type' => $modelClass,
            'qualifiable_id' => $qualifiable->id,
            'type' => $data['type'],
            'chemin_fichier' => $data['chemin_fichier'],
            'titre' => $data['titre'] ?? null,
            'taille' => null,
            'ordre' => 0,
        ]);

        Cache::forget('profile.public');

        return MediaQualificationResource::make($media->fresh());
    }

    public function destroy(Request $request, MediaQualification $mediaQualification)
    {
        $this->authorizeOwnershipOrFail($request, $mediaQualification->qualifiable);
        $mediaQualification->delete();
        Cache::forget('profile.public');
        return response()->noContent();
    }
}
