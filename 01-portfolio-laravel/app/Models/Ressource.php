<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Ressource extends Model
{
    use SoftDeletes;

    protected $fillable = [
        'proprietaire_id',
        'domaine_id',
        'titre',
        'fichier',
        'url_externe',
        'type',
        'type_fichier',
        'est_publique',
        'nombre_telechargements',
        'taille',
    ];

    protected function casts(): array
    {
        return [
            'est_publique' => 'boolean',
            'nombre_telechargements' => 'integer',
        ];
    }

    const TYPES = ['fichier', 'lien'];

    public function proprietaire()
    {
        return $this->belongsTo(Proprietaire::class);
    }

    public function domaine()
    {
        return $this->belongsTo(Domaine::class);
    }
}
