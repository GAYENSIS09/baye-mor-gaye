<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class NiveauCompetence extends Model
{
    protected $table = 'niveau_competence';

    protected $fillable = [
        'proprietaire_id',
        'competence_id',
        'niveau',
        'est_surligne',
    ];

    protected function casts(): array
    {
        return [
            'est_surligne' => 'boolean',
        ];
    }

    const NIVEAUX = ['debutant', 'intermediaire', 'avance', 'expert'];

    public function proprietaire()
    {
        return $this->belongsTo(Proprietaire::class);
    }

    public function competence()
    {
        return $this->belongsTo(Competence::class);
    }
}
