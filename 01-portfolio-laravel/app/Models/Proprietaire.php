<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Proprietaire extends Model
{
    use HasFactory;
    protected $table = 'proprietaires';

    protected $fillable = [
        'utilisateur_id',
        'bio',
        'titre_professionnel',
        'localisation',
        'site_web',
        'url_linkedin',
        'url_github',
    ];

    public function utilisateur()
    {
        return $this->belongsTo(Utilisateur::class);
    }

    public function niveauxCompetence()
    {
        return $this->hasMany(NiveauCompetence::class);
    }

    public function competences()
    {
        return $this->belongsToMany(Competence::class, 'niveau_competence')
            ->withPivot(['niveau', 'est_surligne'])
            ->withTimestamps();
    }

    public function domaines()
    {
        return $this->hasMany(Domaine::class);
    }

    public function publications()
    {
        return $this->hasMany(Publication::class);
    }

    public function projets()
    {
        return $this->hasMany(ProjetPortfolio::class);
    }

    public function emploisDuTemps()
    {
        return $this->hasMany(EmploiDuTemps::class);
    }

    public function rappels()
    {
        return $this->hasMany(Rappel::class);
    }

    public function notifications()
    {
        return $this->hasMany(Notification::class);
    }

    public function ressources()
    {
        return $this->hasMany(Ressource::class);
    }

    public function vuePages()
    {
        return $this->hasMany(VuePage::class);
    }

    public function experiences()
    {
        return $this->hasMany(Experience::class);
    }

    public function formations()
    {
        return $this->hasMany(Formation::class);
    }

    public function certifications()
    {
        return $this->hasMany(Certification::class);
    }
}
