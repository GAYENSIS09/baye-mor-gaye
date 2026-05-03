<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Notification extends Model
{
    protected $fillable = [
        'proprietaire_id',
        'titre',
        'message',
        'type',
        'donnees',
        'est_lue',
        'lue_le',
    ];

    protected function casts(): array
    {
        return [
            'donnees' => 'array',
            'est_lue' => 'boolean',
            'lue_le' => 'datetime',
        ];
    }

    const TYPES = ['info', 'succes', 'avertissement', 'erreur'];

    public function proprietaire()
    {
        return $this->belongsTo(Proprietaire::class);
    }
}
