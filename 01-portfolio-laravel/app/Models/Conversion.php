<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Conversion extends Model
{
    use HasFactory;
    protected $fillable = [
        'emploi_du_temps_id',
        'evenement_id',
        'titre',
        'url_externe',
        'fichier_original',
        'modele_utilise',
        'type',
        'resultat_json',
        'confiance',
    ];

    protected function casts(): array
    {
        return [
            'resultat_json' => 'array',
            'confiance' => 'float',
        ];
    }

    public function emploiDuTemps()
    {
        return $this->belongsTo(EmploiDuTemps::class);
    }

    public function evenement()
    {
        return $this->belongsTo(Evenement::class);
    }
}
