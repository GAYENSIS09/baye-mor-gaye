<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreConversionRequest;
use App\Http\Requests\UpdateConversionRequest;
use App\Http\Requests\ImportConversionRequest;
use App\Http\Resources\ConversionResource;
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

        return ConversionResource::collection($query->paginate(20));
    }

    public function store(StoreConversionRequest $request)
    {
        return ConversionResource::make(Conversion::create($request->validated()));
    }

    public function update(UpdateConversionRequest $request, Conversion $conversion)
    {
        $this->authorizeOwnershipOrFail($request, $conversion->evenement->emploiDuTemps);

        $conversion->update($request->validated());
        return ConversionResource::make($conversion);
    }

    public function importedt(ImportConversionRequest $request)
    {
        $data = $request->validated();

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
        return response()->json(ConversionResource::make($conversion), 201);
    }

    public function destroy(Request $request, Conversion $conversion)
    {
        $this->authorizeOwnershipOrFail($request, $conversion->evenement->emploiDuTemps);
        $conversion->delete();
        return response()->noContent();
    }
}
