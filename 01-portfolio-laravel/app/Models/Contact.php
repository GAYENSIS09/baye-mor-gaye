<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Contact extends Model
{
    use HasFactory;
    protected $fillable = [
        'nom',
        'email',
        'sujet',
        'message',
        'est_lu',
    ];

    protected function casts(): array
    {
        return [
            'est_lu' => 'boolean',
        ];
    }
}
