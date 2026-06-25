<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\MediaResource;
use App\Models\Media;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Illuminate\Validation\Rule;

class MediaController extends Controller
{
    public function store(Request $request)
    {
        $data = $request->validate([
            'mediable_type' => ['required', 'string', Rule::in([
                'App\Models\Publication',
                'App\Models\ProjetPortfolio',
                'App\Models\Ressource',
                'App\Models\Experience',
                'App\Models\Formation',
                'App\Models\Certification',
            ])],
            'mediable_id' => 'required|integer',
            'type' => 'required|string|in:image,video,document,lien,youtube',
            'chemin_fichier' => 'nullable|string|max:255',
            'url_externe' => 'nullable|string|max:255',
            'vignette' => 'nullable|string|max:255',
            'titre' => 'nullable|string|max:255',
            'taille' => 'nullable|integer',
            'largeur' => 'nullable|integer',
            'hauteur' => 'nullable|integer',
            'est_principal' => 'boolean',
            'ordre' => 'integer',
        ]);

        $modelClass = $data['mediable_type'];
        $qualifiable = $modelClass::findOrFail($data['mediable_id']);
        $this->authorizeOwnershipOrFail($request, $qualifiable);

        $data['est_principal'] ??= false;
        $data['ordre'] ??= 0;

        if ($data['est_principal']) {
            Media::where('mediable_type', $modelClass)
                ->where('mediable_id', $qualifiable->id)
                ->update(['est_principal' => false]);
        }

        $media = Media::create($data);

        Cache::forget('profile.public');

        return MediaResource::make($media->fresh());
    }

    public function update(Request $request, Media $media)
    {
        $this->authorizeOwnershipOrFail($request, $media->mediable);

        $data = $request->validate([
            'mediable_type' => 'prohibited',
            'mediable_id' => 'prohibited',
            'type' => 'nullable|string|in:image,video,document,lien,youtube',
            'chemin_fichier' => 'nullable|string|max:255',
            'url_externe' => 'nullable|string|max:255',
            'vignette' => 'nullable|string|max:255',
            'titre' => 'nullable|string|max:255',
            'ordre' => 'nullable|integer',
            'est_principal' => 'nullable|boolean',
        ]);

        if (!empty($data['est_principal'])) {
            Media::where('mediable_type', $media->mediable_type)
                ->where('mediable_id', $media->mediable_id)
                ->where('id', '!=', $media->id)
                ->update(['est_principal' => false]);
        }

        $media->update($data);
        Cache::forget('profile.public');

        return MediaResource::make($media->fresh());
    }

    public function destroy(Request $request, Media $media)
    {
        $this->authorizeOwnershipOrFail($request, $media->mediable);
        $media->delete();
        Cache::forget('profile.public');
        return response()->noContent();
    }
}
