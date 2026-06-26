<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreContactRequest;
use App\Http\Resources\ContactResource;
use App\Mail\NouveauContact;
use App\Models\Contact;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Mail;

class ContactController extends Controller
{
    public function index(Request $request)
    {
        if (!$this->getProprietaireId($request)) {
            abort(403, 'Action non autorisée.');
        }

        $query = Contact::query();

        if ($request->boolean('non_lus')) {
            $query->where('est_lu', false);
        }

        return ContactResource::collection($query->orderBy('created_at', 'desc')->paginate(20));
    }

    public function store(StoreContactRequest $request)
    {
        $data = $request->validated();

        $contact = Contact::create($data);

        Mail::to(config('proprietaire.email'))->send(new NouveauContact($contact));

        return ContactResource::make($contact);
    }

    public function show(Request $request, Contact $contact)
    {
        if (!$this->getProprietaireId($request)) {
            abort(403, 'Action non autorisée.');
        }

        return ContactResource::make($contact);
    }

    public function markAsRead(Request $request, Contact $contact)
    {
        if (!$this->getProprietaireId($request)) {
            abort(403, 'Action non autorisée.');
        }

        $contact->update(['est_lu' => true]);
        return ContactResource::make($contact);
    }

    public function destroy(Request $request, Contact $contact)
    {
        if (!$this->getProprietaireId($request)) {
            abort(403, 'Action non autorisée.');
        }

        $contact->delete();
        return response()->noContent();
    }
}
