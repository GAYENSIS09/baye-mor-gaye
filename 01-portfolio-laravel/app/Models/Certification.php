<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Certification extends Model
{
    use HasFactory;
    protected $fillable = [
        'proprietaire_id',
        'titre',
        'organisme',
        'description',
        'date_obtention',
        'date_expiration',
        'url_credential',
        'ordre',
    ];

    protected function casts(): array
    {
        return [
            'date_obtention' => 'date',
            'date_expiration' => 'date',
        ];
    }

    public function proprietaire()
    {
        return $this->belongsTo(Proprietaire::class);
    }

    public function medias()
    {
        return $this->morphMany(MediaQualification::class, 'qualifiable');
    }
}
