@component('mail::message')
# {{ $evenement->titre }}

{{ $evenement->description }}

**Début :** {{ $evenement->date_debut->format('d/m/Y H:i') }}
**Fin :** {{ $evenement->date_fin?->format('d/m/Y H:i') ?? '—' }}
**Lieu :** {{ $evenement->lieu ?? '—' }}
**Statut :** {{ $evenement->statut }}

@if($evenement->emploiDuTemps)
@component('mail::button', ['url' => config('app.url') . '/dashboard/edt'])
Voir l'emploi du temps
@endcomponent
@endif
@endcomponent
