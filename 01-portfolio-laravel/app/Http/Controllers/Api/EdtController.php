<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Conversion;
use App\Models\EmploiDuTemps;
use App\Services\Contracts\VisionServiceInterface;
use Illuminate\Http\Request;

class EdtController extends Controller
{
    public function index(Request $request)
    {
        $query = $request->user()->proprietaire->emploisDuTemps()->with('evenements');

        if ($request->boolean('actif')) {
            $query->where('est_actif', true);
        }

        return $query->get();
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'titre' => 'required|string|max:255',
            'description' => 'nullable|string',
            'type' => 'required|in:professionnel,academique,personnel',
        ]);

        $data['proprietaire_id'] = $request->user()->proprietaire->id;

        return EmploiDuTemps::create($data);
    }

    public function update(Request $request, EmploiDuTemps $emploiDuTemp)
    {
        $this->authorizeOwnershipOrFail($request, $emploiDuTemp);

        $data = $request->validate([
            'titre' => 'sometimes|string|max:255',
            'description' => 'nullable|string',
            'type' => 'sometimes|in:professionnel,academique,personnel',
            'est_actif' => 'boolean',
        ]);

        $emploiDuTemp->update($data);
        return $emploiDuTemp;
    }

    public function destroy(Request $request, EmploiDuTemps $emploiDuTemp)
    {
        $this->authorizeOwnershipOrFail($request, $emploiDuTemp);
        $emploiDuTemp->delete();
        return response()->noContent();
    }

    public function import(Request $request)
    {
        $data = $request->validate([
            'fichier' => 'required|file|mimes:jpg,jpeg,png,pdf|max:10240',
            'edt_id'  => 'required|exists:emploi_du_temps,id',
        ]);

        $chemin = $request->file('fichier')->store('edt-imports', 'local');

        $resultat = app(VisionServiceInterface::class)->analyserEdt(storage_path('app/' . $chemin));

        $conversion = Conversion::create([
            'emploi_du_temps_id' => $data['edt_id'],
            'fichier_original'   => $chemin,
            'modele_utilise'     => $resultat['model'],
            'resultat_json'      => $resultat['evenements'],
            'confiance'          => $resultat['confiance'],
            'titre'              => 'Import ' . now()->format('Y-m-d H:i'),
            'type'               => 'image',
        ]);

        return response()->json($conversion, 201);
    }
}
