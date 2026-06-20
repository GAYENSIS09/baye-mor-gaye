<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreRessourceRequest;
use App\Http\Requests\UpdateRessourceRequest;
use App\Http\Resources\RessourceResource;
use App\Models\Ressource;
use Illuminate\Http\Request;

class RessourceController extends Controller
{
    public function index(Request $request)
    {
        $query = Ressource::with('domaine', 'mediaQualifications');

        if ($request->has('domaine')) {
            $query->where('domaine_id', $request->domaine);
        }

        return RessourceResource::collection($query->orderBy('created_at', 'desc')->paginate(20));
    }

    public function show(Ressource $ressource)
    {
        return RessourceResource::make($ressource->load('domaine', 'mediaQualifications'));
    }

    public function store(StoreRessourceRequest $request)
    {
        $data = $request->validated();
        $data['proprietaire_id'] = $request->user()->proprietaire->id;

        return RessourceResource::make(Ressource::create($data));
    }

    public function update(UpdateRessourceRequest $request, Ressource $ressource)
    {
        $this->authorizeOwnershipOrFail($request, $ressource);

        $ressource->update($request->validated());
        return RessourceResource::make($ressource);
    }

    public function destroy(Request $request, Ressource $ressource)
    {
        $this->authorizeOwnershipOrFail($request, $ressource);
        $ressource->delete();
        return response()->noContent();
    }
}
