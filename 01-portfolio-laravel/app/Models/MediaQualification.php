<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class MediaQualification extends Model
{
    use HasFactory;
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
