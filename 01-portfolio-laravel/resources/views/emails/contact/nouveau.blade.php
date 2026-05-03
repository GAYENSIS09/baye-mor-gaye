@component('mail::message')
# Nouveau message de {{ $contact->nom }}

**De :** {{ $contact->nom }} ({{ $contact->email }})

**Message :**
{{ $contact->message }}

@component('mail::button', ['url' => config('app.url') . '/dashboard/messages'])
Voir dans le dashboard
@endcomponent

<small>Reçu le {{ $contact->created_at->format('d/m/Y à H:i') }}</small>
@endcomponent
