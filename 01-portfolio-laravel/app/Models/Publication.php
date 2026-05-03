<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Publication extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'proprietaire_id',
        'titre',
        'slug',
        'contenu',
        'contenu_json',
        'contenu_html',
        'extrait',
        'type',
        'image_couverture',
        'publie_le',
        'est_publie',
        'nombre_vues',
    ];

    protected function casts(): array
    {
        return [
            'publie_le' => 'datetime',
            'est_publie' => 'boolean',
            'contenu_json' => 'array',
            'nombre_vues' => 'integer',
        ];
    }

    const TYPES = ['article', 'tutoriel', 'note'];

    public function proprietaire()
    {
        return $this->belongsTo(Proprietaire::class);
    }

    public function commentaires()
    {
        return $this->morphMany(Commentaire::class, 'commentable');
    }

    public function likes()
    {
        return $this->morphMany(Like::class, 'likeable');
    }

    public function domaines()
    {
        return $this->belongsToMany(Domaine::class, 'publication_domaine');
    }

    public function medias()
    {
        return $this->hasMany(MediaPublication::class)->orderBy('ordre');
    }
}
