<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\MediaQualification;
use App\Models\Experience;
use App\Models\Formation;
use App\Models\Certification;
use Illuminate\Http\Request;

class MediaQualificationController extends Controller
{
    public function store(Request $request)
    {
        $data = $request->validate([
            'qualifiable_type' => 'required|in:experience,formation,certification',
            'qualifiable_id' => 'required|integer',
            'type' => 'required|in:image,video,document,lien',
            'chemin_fichier' => 'required|string|max:255',
            'titre' => 'nullable|string|max:255',
        ]);

        $modelClass = match ($data['qualifiable_type']) {
            'experience' => Experience::class,
            'formation' => Formation::class,
            'certification' => Certification::class,
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

        return $media->fresh();
    }

    public function destroy(Request $request, MediaQualification $mediaQualification)
    {
        $this->authorizeOwnershipOrFail($request, $mediaQualification->qualifiable);
        $mediaQualification->delete();
        return response()->noContent();
    }
}
