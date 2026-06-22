<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Formation extends Model
{
    use HasFactory;
    protected $fillable = [
        'proprietaire_id',
        'diplome',
        'etablissement',
        'description',
        'domaine_etude',
        'date_debut',
        'date_fin',
        'ordre',
    ];

    protected function casts(): array
    {
        return [
            'date_debut' => 'date',
            'date_fin' => 'date',
        ];
    }

    public function proprietaire()
    {
        return $this->belongsTo(Proprietaire::class);
    }

    public function medias()
    {
        return $this->morphMany(Media::class, 'mediable');
    }
}
