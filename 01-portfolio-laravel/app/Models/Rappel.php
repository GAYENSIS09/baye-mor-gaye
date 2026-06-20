<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Rappel extends Model
{
    use HasFactory;
    protected $fillable = [
        'proprietaire_id',
        'evenement_id',
        'titre',
        'message',
        'notifie_le',
        'est_notifie',
    ];

    protected function casts(): array
    {
        return [
            'notifie_le' => 'datetime',
            'est_notifie' => 'boolean',
        ];
    }

    public function proprietaire()
    {
        return $this->belongsTo(Proprietaire::class);
    }

    public function evenement()
    {
        return $this->belongsTo(Evenement::class);
    }
}
