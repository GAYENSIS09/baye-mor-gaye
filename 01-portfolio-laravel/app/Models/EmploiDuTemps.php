<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class EmploiDuTemps extends Model
{
    use HasFactory;
    protected $table = 'emploi_du_temps';

    protected $fillable = [
        'proprietaire_id',
        'titre',
        'description',
        'type',
        'est_actif',
    ];

    protected function casts(): array
    {
        return [
            'est_actif' => 'boolean',
        ];
    }

    public function proprietaire()
    {
        return $this->belongsTo(Proprietaire::class);
    }

    public function evenements()
    {
        return $this->hasMany(Evenement::class);
    }
}
