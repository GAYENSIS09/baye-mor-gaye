<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreRappelRequest;
use App\Http\Requests\UpdateRappelRequest;
use App\Http\Resources\RappelResource;
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

        return RappelResource::collection($query->orderBy('created_at', 'desc')->paginate(20));
    }

    public function show(Request $request, Rappel $rappel)
    {
        $this->authorizeOwnershipOrFail($request, $rappel);
        return RappelResource::make($rappel->load('evenement'));
    }

    public function store(StoreRappelRequest $request)
    {
        $data = $request->validated();
        $data['proprietaire_id'] = $request->user()->proprietaire->id;

        return RappelResource::make(Rappel::create($data)->load('evenement'));
    }

    public function update(UpdateRappelRequest $request, Rappel $rappel)
    {
        $this->authorizeOwnershipOrFail($request, $rappel);

        $rappel->update($request->validated());
        return RappelResource::make($rappel);
    }

    public function destroy(Request $request, Rappel $rappel)
    {
        $this->authorizeOwnershipOrFail($request, $rappel);
        $rappel->delete();
        return response()->noContent();
    }
}
