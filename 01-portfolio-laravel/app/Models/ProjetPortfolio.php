<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class ProjetPortfolio extends Model
{
    use HasFactory, SoftDeletes;

    protected $table = 'projet_portfolios';

    protected $fillable = [
        'proprietaire_id',
        'titre',
        'slug',
        'description',
        'courte_description',
        'technologies',
        'date_realisation',
        'url_demo',
        'url_code',
        'image_couverture',
        'est_publie',
        'est_en_vedette',
        'publie_le',
        'nombre_vues',
    ];

    protected function casts(): array
    {
        return [
            'technologies' => 'array',
            'est_publie' => 'boolean',
            'est_en_vedette' => 'boolean',
            'publie_le' => 'datetime',
            'date_realisation' => 'date',
            'nombre_vues' => 'integer',
        ];
    }

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

    public function medias()
    {
        return $this->morphMany(Media::class, 'mediable')->orderBy('ordre');
    }
}
