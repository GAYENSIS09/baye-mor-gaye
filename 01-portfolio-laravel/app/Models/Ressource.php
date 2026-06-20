<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Ressource extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'proprietaire_id',
        'domaine_id',
        'titre',
        'description',
        'est_publique',
    ];

    protected function casts(): array
    {
        return [
            'est_publique' => 'boolean',
        ];
    }

    public function proprietaire()
    {
        return $this->belongsTo(Proprietaire::class);
    }

    public function domaine()
    {
        return $this->belongsTo(Domaine::class);
    }

    public function mediaQualifications()
    {
        return $this->morphMany(MediaQualification::class, 'qualifiable');
    }
}
