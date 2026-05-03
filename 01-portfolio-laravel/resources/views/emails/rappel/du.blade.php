@component('mail::message')
# Rappel : {{ $rappel->titre }}

{{ $rappel->message }}

**Date du rappel :** {{ $rappel->notifie_le->format('d/m/Y à H:i') }}

@component('mail::button', ['url' => config('app.url') . '/dashboard/rappels'])
Voir mes rappels
@endcomponent
@endcomponent
