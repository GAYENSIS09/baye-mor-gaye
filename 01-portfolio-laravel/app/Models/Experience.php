<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Experience extends Model
{
    protected $fillable = [
        'proprietaire_id',
        'titre',
        'entreprise',
        'description',
        'date_debut',
        'date_fin',
        'est_actuel',
        'lieu',
        'ordre',
    ];

    protected function casts(): array
    {
        return [
            'date_debut' => 'date',
            'date_fin' => 'date',
            'est_actuel' => 'boolean',
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
