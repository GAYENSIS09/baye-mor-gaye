@component('mail::message')
# Votre commentaire a été approuvé

Bonjour {{ $commentaire->auteur?->nom ?? 'Visiteur' }},

Votre commentaire sur la publication a été approuvé et est désormais visible publiquement.

**Votre commentaire :**
> {{ $commentaire->contenu }}

@component('mail::button', ['url' => config('app.url') . '/publications/' . ($commentaire->commentable?->slug ?? '#')])
Voir la publication
@endcomponent

Merci pour votre contribution !
@endcomponent
