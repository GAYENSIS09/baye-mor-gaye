@php
    $owner = \App\Models\Proprietaire::with('utilisateur')->first();
    $user = $owner?->utilisateur;
    $photo = $user?->photo;
    $photoUrl = $photo ? config('app.url') . \Illuminate\Support\Facades\Storage::url($photo) : '';
    $initials = '';
    if ($user?->nom) {
        $parts = explode(' ', $user->nom);
        foreach ($parts as $p) { $initials .= strtoupper(substr($p, 0, 1)); }
    }
@endphp
@props(['url'])
<tr>
<td class="header">
@if($user)
<table width="100%" cellpadding="0" cellspacing="0" role="presentation">
<tr>
<td width="60" style="padding-right:12px" valign="middle">
@if($photoUrl)
<img src="{{ $photoUrl }}"
     alt="{{ $user->nom }}"
     width="50" height="50"
     style="border-radius:50%; width:50px; height:50px; object-fit:cover; display:block; border:2px solid #e2e8f0"
     onerror="this.style.display='none';this.nextElementSibling.style.display='block'">
@endif
<div style="display:none; width:50px; height:50px; border-radius:50%; background:#4a5568; color:#fff; text-align:center; line-height:50px; font-size:20px; font-weight:bold; font-family:Arial,sans-serif">
{{ $initials }}
</div>
</td>
<td valign="middle">
<h2 style="margin:0; font-size:18px; color:#2d3748; font-family:Arial,sans-serif">{{ $user->nom }}</h2>
@if($owner?->titre_professionnel)
<p style="margin:2px 0 0; font-size:13px; color:#718096; font-family:Arial,sans-serif">{{ $owner->titre_professionnel }}</p>
@endif
</td>
</tr>
</table>
@else
<a href="{{ $url }}" style="display: inline-block;">
{{ config('app.name') }}
</a>
@endif
</td>
</tr>
