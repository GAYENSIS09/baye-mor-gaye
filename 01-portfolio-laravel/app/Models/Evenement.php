<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Evenement extends Model
{
    use HasFactory, SoftDeletes;
    protected $fillable = [
        'emploi_du_temps_id',
        'titre',
        'description',
        'date_debut',
        'date_fin',
        'lieu',
        'couleur',
        'est_journee_complete',
        'statut',
    ];

    protected function casts(): array
    {
        return [
            'date_debut' => 'datetime',
            'date_fin' => 'datetime',
            'est_journee_complete' => 'boolean',
        ];
    }

    const STATUTS = ['planifie', 'confirme', 'annule', 'termine'];

    public function emploiDuTemps()
    {
        return $this->belongsTo(EmploiDuTemps::class);
    }

    public function conversions()
    {
        return $this->hasMany(Conversion::class);
    }

    public function rappels()
    {
        return $this->hasMany(Rappel::class);
    }
}
