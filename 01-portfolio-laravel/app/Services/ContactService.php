<?php

namespace App\Services;

use App\Mail\NouveauContact;
use App\Models\Contact;
use App\Models\Proprietaire;
use Illuminate\Support\Facades\Mail;

class ContactService
{
    public function store(array $data): Contact
    {
        $contact = Contact::create($data);

        try {
            $proprietaire = Proprietaire::with('utilisateur')->first();
            if ($proprietaire?->utilisateur?->email) {
                Mail::to($proprietaire->utilisateur->email)->send(new NouveauContact($contact));
            }
        } catch (\Exception $e) {
            // Silently fail
        }

        return $contact;
    }

    public function list(array $params = []): mixed
    {
        $query = Contact::query();

        $filter = $params['filter'] ?? [];
        $nonLus = $params['non_lus'] ?? $filter['non_lus'] ?? null;
        if ($nonLus) {
            $query->where('est_lu', false);
        }

        $search = $params['search'] ?? null;
        if ($search) {
            $query->where(function ($q) use ($search) {
                $q->where('nom', 'like', "%{$search}%")
                  ->orWhere('email', 'like', "%{$search}%")
                  ->orWhere('sujet', 'like', "%{$search}%")
                  ->orWhere('message', 'like', "%{$search}%");
            });
        }

        $sort = $params['sort'] ?? '-created_at';
        $direction = str_starts_with($sort, '-') ? 'desc' : 'asc';
        $sort = ltrim($sort, '-');
        $query->orderBy(in_array($sort, ['created_at', 'nom', 'email']) ? $sort : 'created_at', $direction);

        return $query->paginate(20);
    }

    public function markAsRead(Contact $contact): Contact
    {
        $contact->update(['est_lu' => true]);
        return $contact->fresh();
    }
}
