<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Domaine extends Model
{
    use HasFactory;
    protected $fillable = [
        'nom',
        'slug',
        'description',
        'couleur',
        'proprietaire_id',
    ];

    public function proprietaire()
    {
        return $this->belongsTo(Proprietaire::class);
    }

    public function publications()
    {
        return $this->belongsToMany(Publication::class, 'publication_domaine');
    }

    public function ressources()
    {
        return $this->hasMany(Ressource::class);
    }
}
