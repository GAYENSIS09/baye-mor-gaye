<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class VuePage extends Model
{
    use HasFactory;
    protected $table = 'vue_pages';

    protected $fillable = [
        'proprietaire_id',
        'adresse_ip',
        'agent_utilisateur',
        'referer',
        'visite_le',
        'page',
        'page_id',
    ];

    public function publication()
    {
        return $this->belongsTo(Publication::class, 'page_id')
            ->where('vue_pages.page', 'publication');
    }

    public function projet()
    {
        return $this->belongsTo(ProjetPortfolio::class, 'page_id')
            ->where('vue_pages.page', 'projet');
    }

    protected function casts(): array
    {
        return [
            'visite_le' => 'datetime',
        ];
    }
}
