<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class Commentaire extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'auteur_id',
        'commentable_id',
        'commentable_type',
        'contenu',
        'est_approuve',
        'parent_id',
    ];

    protected function casts(): array
    {
        return [
            'est_approuve' => 'boolean',
        ];
    }

    public function auteur()
    {
        return $this->belongsTo(Utilisateur::class, 'auteur_id');
    }

    public function commentable()
    {
        return $this->morphTo();
    }

    public function parent(): BelongsTo
    {
        return $this->belongsTo(Commentaire::class, 'parent_id');
    }

    public function reponses(): HasMany
    {
        return $this->hasMany(Commentaire::class, 'parent_id');
    }
}
