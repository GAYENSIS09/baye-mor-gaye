<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;

class Utilisateur extends Authenticatable
{
    use HasApiTokens, HasFactory, Notifiable;

    protected $table = 'utilisateurs';

    protected $fillable = [
        'nom',
        'email',
        'password',
        'photo',
        'email_verifie_le',
        'derniere_connexion_le',
    ];

    protected $hidden = [
        'password',
    ];

    protected function casts(): array
    {
        return [
            'password' => 'hashed',
            'email_verifie_le' => 'datetime',
            'derniere_connexion_le' => 'datetime',
        ];
    }

    public function commentaires()
    {
        return $this->hasMany(Commentaire::class, 'auteur_id');
    }

    public function likes()
    {
        return $this->hasMany(Like::class, 'auteur_id');
    }

    public function proprietaire()
    {
        return $this->hasOne(Proprietaire::class);
    }
}
