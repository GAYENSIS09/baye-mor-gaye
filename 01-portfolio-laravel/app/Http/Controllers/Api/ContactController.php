<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Mail\NouveauContact;
use App\Models\Contact;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Mail;

class ContactController extends Controller
{
    public function index(Request $request)
    {
        $query = Contact::query();

        if ($request->boolean('non_lus')) {
            $query->where('est_lu', false);
        }

        return $query->orderBy('created_at', 'desc')->paginate(20);
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'nom' => 'required|string|max:255',
            'email' => 'required|email|max:255',
            'sujet' => 'nullable|string|max:500',
            'message' => 'required|string|max:5000',
        ]);

        $contact = Contact::create($data);

        Mail::to(config('proprietaire.email'))->queue(new NouveauContact($contact));

        return $contact;
    }

    public function show(Contact $contact)
    {
        return $contact;
    }

    public function markAsRead(Contact $contact)
    {
        $contact->update(['est_lu' => true]);
        return $contact;
    }

    public function destroy(Contact $contact)
    {
        $contact->delete();
        return response()->noContent();
    }
}
