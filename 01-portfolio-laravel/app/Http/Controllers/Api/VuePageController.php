<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreVuePageRequest;
use App\Models\ProjetPortfolio;
use App\Models\Publication;
use App\Models\VuePage;

class VuePageController extends Controller
{
    public function enregistrer(StoreVuePageRequest $request)
    {
        $data = $request->validated();

        $modelClass = match ($data['page']) {
            'publication' => Publication::class,
            'projet'      => ProjetPortfolio::class,
        };

        $model = $modelClass::find($data['page_id']);
        if (!$model) {
            return response()->json(['message' => 'Page introuvable.'], 404);
        }

        VuePage::create([
            'page'              => $data['page'],
            'page_id'           => $data['page_id'],
            'adresse_ip'        => $request->ip(),
            'agent_utilisateur' => $request->userAgent(),
            'referer'           => $request->header('referer'),
            'visite_le'         => now(),
        ]);

        $model->increment('nombre_vues');

        return response()->json(['message' => 'Vue enregistrée'], 201);
    }
}
