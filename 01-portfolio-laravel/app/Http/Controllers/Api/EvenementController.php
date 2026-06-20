<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreEvenementRequest;
use App\Http\Requests\UpdateEvenementRequest;
use App\Http\Resources\EvenementResource;
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

        return EvenementResource::collection($query->orderBy('date_debut')->paginate(50));
    }

    public function show(Evenement $evenement)
    {
        return EvenementResource::make($evenement->load(['emploiDuTemps', 'conversions', 'rappels']));
    }

    public function update(UpdateEvenementRequest $request, Evenement $evenement)
    {
        $this->authorizeOwnershipOrFail($request, $evenement->emploiDuTemps);

        $evenement->update($request->validated());
        return EvenementResource::make($evenement);
    }

    public function destroy(Request $request, Evenement $evenement)
    {
        $this->authorizeOwnershipOrFail($request, $evenement->emploiDuTemps);
        $evenement->delete();
        return response()->noContent();
    }

    public function store(StoreEvenementRequest $request)
    {
        $emploiDuTemps = \App\Models\EmploiDuTemps::findOrFail($request->validated('emploi_du_temps_id'));
        $this->authorizeOwnershipOrFail($request, $emploiDuTemps);

        return EvenementResource::make(Evenement::create($request->validated()));
    }
}
