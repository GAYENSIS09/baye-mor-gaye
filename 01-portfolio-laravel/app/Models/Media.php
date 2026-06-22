<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Media extends Model
{
    use HasFactory;

    protected $fillable = [
        'mediable_type',
        'mediable_id',
        'type',
        'chemin_fichier',
        'url_externe',
        'vignette',
        'titre',
        'taille',
        'largeur',
        'hauteur',
        'est_principal',
        'ordre',
    ];

    protected function casts(): array
    {
        return [
            'est_principal' => 'boolean',
            'taille' => 'integer',
            'largeur' => 'integer',
            'hauteur' => 'integer',
            'ordre' => 'integer',
        ];
    }

    public function mediable()
    {
        return $this->morphTo();
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
