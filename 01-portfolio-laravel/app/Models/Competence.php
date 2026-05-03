<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Competence extends Model
{
    use HasFactory, SoftDeletes;
    protected $fillable = [
        'nom',
        'categorie',
        'icone',
    ];

    public function niveaux()
    {
        return $this->hasMany(NiveauCompetence::class);
    }
}
