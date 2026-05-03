<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\ProjetPortfolio;
use App\Models\Publication;
use App\Models\VuePage;
use Illuminate\Http\Request;

class VuePageController extends Controller
{
    public function enregistrer(Request $request)
    {
        $data = $request->validate([
            'page'    => 'required|string|in:publication,projet',
            'page_id' => 'required|integer|min:1',
        ]);

        VuePage::create([
            'page'              => $data['page'],
            'page_id'           => $data['page_id'],
            'adresse_ip'        => $request->ip(),
            'agent_utilisateur' => $request->userAgent(),
            'referer'           => $request->header('referer'),
            'visite_le'         => now(),
        ]);

        $model = match ($data['page']) {
            'publication' => Publication::class,
            'projet'      => ProjetPortfolio::class,
        };
        $model::where('id', $data['page_id'])->increment('nombre_vues');

        return response()->json(['message' => 'Vue enregistrée'], 201);
    }
}
