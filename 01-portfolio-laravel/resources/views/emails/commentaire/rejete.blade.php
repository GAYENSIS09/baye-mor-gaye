@component('mail::message')
# Votre commentaire n'a pas été retenu

Bonjour {{ $commentaire->auteur?->nom ?? 'Visiteur' }},

Nous vous informons que votre commentaire n'a pas été approuvé sur notre site.

Cela peut être dû à son contenu ou à la politique de modération.

**Votre commentaire :**
> {{ $commentaire->contenu }}

Nous vous remercions de votre compréhension.
@endcomponent
