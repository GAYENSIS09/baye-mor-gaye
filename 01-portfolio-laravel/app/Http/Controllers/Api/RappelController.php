<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Rappel;
use Illuminate\Http\Request;

class RappelController extends Controller
{
    public function index(Request $request)
    {
        $query = $request->user()->proprietaire->rappels()->with('evenement');

        if ($request->boolean('en_attente')) {
            $query->where('est_notifie', false);
        }

        return $query->orderBy('created_at', 'desc')->paginate(20);
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'evenement_id' => 'nullable|exists:evenements,id',
            'titre' => 'required|string|max:255',
            'message' => 'nullable|string',
            'notifie_le' => 'nullable|date',
        ]);

        $data['proprietaire_id'] = $request->user()->proprietaire->id;

        return Rappel::create($data);
    }

    public function update(Request $request, Rappel $rappel)
    {
        $this->authorizeOwnershipOrFail($request, $rappel);

        $data = $request->validate([
            'titre' => 'sometimes|string|max:255',
            'message' => 'nullable|string',
            'notifie_le' => 'nullable|date',
        ]);

        $rappel->update($data);
        return $rappel;
    }

    public function destroy(Request $request, Rappel $rappel)
    {
        $this->authorizeOwnershipOrFail($request, $rappel);
        $rappel->delete();
        return response()->noContent();
    }
}
