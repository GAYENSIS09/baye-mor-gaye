<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class MediaPublication extends Model
{
    use HasFactory;
    protected $table = 'media_publications';

    protected $fillable = [
        'publication_id',
        'type',
        'chemin_fichier',
        'taille',
        'largeur',
        'hauteur',
        'titre',
        'ordre',
    ];

    protected function casts(): array
    {
        return [
            'type' => 'string',
        ];
    }

    public function publication()
    {
        return $this->belongsTo(Publication::class);
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
