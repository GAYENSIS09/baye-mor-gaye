<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class MediaQualification extends Model
{
    protected $table = 'media_qualifications';

    protected $fillable = [
        'qualifiable_type',
        'qualifiable_id',
        'type',
        'chemin_fichier',
        'titre',
        'taille',
        'ordre',
    ];

    public function qualifiable()
    {
        return $this->morphTo();
    }
}
