<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreEdtRequest;
use App\Http\Requests\UpdateEdtRequest;
use App\Http\Requests\ImportEdtRequest;
use App\Http\Resources\ConversionResource;
use App\Http\Resources\EmploiDuTempsResource;
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

        return EmploiDuTempsResource::collection($query->get());
    }

    public function store(StoreEdtRequest $request)
    {
        $data = $request->validated();
        $data['proprietaire_id'] = $request->user()->proprietaire->id;

        return EmploiDuTempsResource::make(EmploiDuTemps::create($data));
    }

    public function update(UpdateEdtRequest $request, EmploiDuTemps $emploiDuTemp)
    {
        $this->authorizeOwnershipOrFail($request, $emploiDuTemp);

        $emploiDuTemp->update($request->validated());
        return EmploiDuTempsResource::make($emploiDuTemp);
    }

    public function destroy(Request $request, EmploiDuTemps $emploiDuTemp)
    {
        $this->authorizeOwnershipOrFail($request, $emploiDuTemp);
        $emploiDuTemp->delete();
        return response()->noContent();
    }

    public function import(ImportEdtRequest $request)
    {
        $data = $request->validated();

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

        return response()->json(ConversionResource::make($conversion), 201);
    }
}
