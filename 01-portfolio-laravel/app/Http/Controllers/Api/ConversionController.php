<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Conversion;
use Illuminate\Http\Request;

class ConversionController extends Controller
{
    public function index(Request $request)
    {
        $query = Conversion::with('evenement');

        if ($request->has('evenement_id')) {
            $query->where('evenement_id', $request->evenement_id);
        }

        return $query->paginate(20);
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'evenement_id' => 'required|exists:evenements,id',
            'titre' => 'required|string|max:255',
            'url_externe' => 'nullable|url|max:500',
            'type' => 'nullable|string|max:255',
        ]);

        return Conversion::create($data);
    }

    public function update(Request $request, Conversion $conversion)
    {
        $this->authorizeOwnershipOrFail($request, $conversion->evenement->emploiDuTemps);

        $data = $request->validate([
            'titre' => 'sometimes|string|max:255',
            'url_externe' => 'nullable|url|max:500',
            'type' => 'nullable|string|max:255',
        ]);

        $conversion->update($data);
        return $conversion;
    }

    public function importedt(Request $request)
    {
        $data = $request->validate([
            'url_externe' => 'required_without:fichier|url|max:500',
            'fichier' => 'required_without:url_externe|file|mimes:json,ics,csv|max:2048',
            'emploi_du_temps_id' => 'nullable|exists:emploi_du_temps,id',
        ]);

        $conversion = Conversion::create([
            'titre' => 'Import ' . now()->format('Y-m-d H:i'),
            'url_externe' => $data['url_externe'] ?? null,
            'type' => $data['url_externe'] ? 'url' : 'fichier',
        ]);

        // Attempt to parse if URL points to a known format
        if ($data['url_externe'] ?? false) {
            try {
                $response = \Illuminate\Support\Facades\Http::timeout(15)->get($data['url_externe']);
                if ($response->successful()) {
                    $conversion->update(['resultat_json' => $response->body()]);
                }
            } catch (\Exception $e) {
                // Silently fail - conversion saved even if parse fails
            }
        }

        $conversion->load('evenement');
        return response()->json($conversion, 201);
    }

    public function destroy(Request $request, Conversion $conversion)
    {
        $this->authorizeOwnershipOrFail($request, $conversion->evenement->emploiDuTemps);
        $conversion->delete();
        return response()->noContent();
    }
}
