@php
    $owner = \App\Models\Proprietaire::with('utilisateur')->first();
    $user = $owner?->utilisateur;
@endphp
<tr>
<td>
<table class="footer" align="center" width="570" cellpadding="0" cellspacing="0" role="presentation">
<tr>
<td class="content-cell" align="center">
@if($owner)
<p style="font-size:12px; color:#a0aec0; margin:8px 0; font-family:Arial,sans-serif">
@if($owner->site_web)
<a href="{{ $owner->site_web }}" style="color:#a0aec0; text-decoration:none; margin:0 6px">Site web</a>
@endif
@if($owner->url_linkedin)
<a href="{{ $owner->url_linkedin }}" style="color:#a0aec0; text-decoration:none; margin:0 6px">LinkedIn</a>
@endif
@if($owner->url_github)
<a href="{{ $owner->url_github }}" style="color:#a0aec0; text-decoration:none; margin:0 6px">GitHub</a>
@endif
</p>
@endif
<p style="font-size:12px; color:#a0aec0; margin:5px 0; font-family:Arial,sans-serif">
&copy; {{ date('Y') }} {{ $user?->nom ?? config('app.name') }}. Tous droits r&eacute;serv&eacute;s.
</p>
</td>
</tr>
</table>
</td>
</tr>
