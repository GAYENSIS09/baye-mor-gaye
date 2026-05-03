<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class MediaProjet extends Model
{
    protected $table = 'media_projets';

    protected $fillable = [
        'projet_portfolio_id',
        'type',
        'chemin_fichier',
        'url_externe',
        'vignette',
        'titre',
        'est_principal',
        'ordre',
    ];

    protected function casts(): array
    {
        return [
            'est_principal' => 'boolean',
        ];
    }

    public function projetPortfolio()
    {
        return $this->belongsTo(ProjetPortfolio::class, 'projet_portfolio_id');
    }

    public function commentaires()
    {
        return $this->morphMany(Commentaire::class, 'commentable');
    }

    public function likes()
    {
        return $this->morphMany(Like::class, 'likeable');
    }
}
