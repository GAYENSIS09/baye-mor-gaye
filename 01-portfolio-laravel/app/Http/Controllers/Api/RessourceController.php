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
        $query = Ressource::with('domaine', 'medias');

        if ($request->has('domaine')) {
            $query->where('domaine_id', $request->domaine);
        }

        if ($request->has('publique')) {
            if ($request->publique !== 'all') {
                $query->where('est_publique', filter_var($request->publique, FILTER_VALIDATE_BOOLEAN));
            }
        } else {
            $query->where('est_publique', true);
        }

        if ($request->has('type')) {
            $query->whereHas('medias', fn($q) => $q->where('type', $request->type));
        }

        if ($request->has('search')) {
            $safe = str_replace(['%', '_'], ['\\%', '\\_'], $request->search);
            $query->where('titre', 'like', '%' . $safe . '%');
        }

        return RessourceResource::collection($query->orderBy('created_at', 'desc')->paginate(20));
    }

    public function show(Ressource $ressource)
    {
        return RessourceResource::make($ressource->load('domaine', 'medias'));
    }

    public function store(StoreRessourceRequest $request)
    {
        $data = $request->validated();
        $data['proprietaire_id'] = $request->user()->proprietaire->id;

        return RessourceResource::make(Ressource::create($data)->load('domaine', 'medias'));
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
