<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Evenement;
use Illuminate\Http\Request;

class EvenementController extends Controller
{
    public function index(Request $request)
    {
        $query = Evenement::with('emploiDuTemps');

        if ($request->has('emploi_du_temps_id')) {
            $query->where('emploi_du_temps_id', $request->emploi_du_temps_id);
        }

        if ($request->has('from')) {
            $query->where('date_debut', '>=', $request->from);
        }

        if ($request->has('to')) {
            $query->where('date_debut', '<=', $request->to);
        }

        return $query->orderBy('date_debut')->paginate(50);
    }

    public function show(Evenement $evenement)
    {
        return $evenement->load(['emploiDuTemps', 'conversions', 'rappels']);
    }

    public function update(Request $request, Evenement $evenement)
    {
        $this->authorizeOwnershipOrFail($request, $evenement->emploiDuTemps);

        $data = $request->validate([
            'titre' => 'sometimes|string|max:255',
            'description' => 'nullable|string',
            'date_debut' => 'sometimes|date',
            'date_fin' => 'nullable|date|after_or_equal:date_debut',
            'lieu' => 'nullable|string|max:255',
            'couleur' => 'nullable|string|max:7',
            'est_journee_complete' => 'boolean',
            'statut' => 'in:planifie,confirme,annule,termine',
        ]);

        $evenement->update($data);
        return $evenement;
    }

    public function destroy(Request $request, Evenement $evenement)
    {
        $this->authorizeOwnershipOrFail($request, $evenement->emploiDuTemps);
        $evenement->delete();
        return response()->noContent();
    }

    public function store(Request $request)
    {
        $emploiDuTemps = \App\Models\EmploiDuTemps::findOrFail($request->emploi_du_temps_id);
        $this->authorizeOwnershipOrFail($request, $emploiDuTemps);

        $data = $request->validate([
            'emploi_du_temps_id' => 'required|exists:emploi_du_temps,id',
            'titre' => 'required|string|max:255',
            'description' => 'nullable|string',
            'date_debut' => 'required|date',
            'date_fin' => 'nullable|date|after_or_equal:date_debut',
            'lieu' => 'nullable|string|max:255',
            'couleur' => 'nullable|string|max:7',
            'est_journee_complete' => 'boolean',
            'statut' => 'in:planifie,confirme,annule,termine',
        ]);

        return Evenement::create($data);
    }
}
