<?php

namespace Database\Seeders;

use App\Models\Utilisateur;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Storage;

class UtilisateurSeeder extends Seeder
{
    public function run(): void
    {
        // ===== PROPRIETAIRE PRINCIPAL =====
        $proprietairePhoto = config('proprietaire.photo');
        if ($proprietairePhoto && !str_starts_with($proprietairePhoto, 'http://') && !str_starts_with($proprietairePhoto, 'https://')) {
            if (!Storage::disk('public')->exists($proprietairePhoto)) {
                $initial = mb_substr(config('proprietaire.nom', 'B'), 0, 1);
                Storage::disk('public')->put($proprietairePhoto, '<svg xmlns="http://www.w3.org/2000/svg" width="400" height="400" viewBox="0 0 400 400">
                    <rect fill="#1a1a2e" width="400" height="400"/>
                    <circle cx="200" cy="180" r="80" fill="#16213e" stroke="#00e5ff" stroke-width="2"/>
                    <text x="200" y="200" text-anchor="middle" fill="#e0e0e0" font-family="Arial" font-size="72" font-weight="bold" dominant-baseline="central">' . $initial . '</text>
                    <rect fill="#00e5ff" x="100" y="290" width="200" height="4" rx="2"/>
                </svg>');
            }
        } else {
            $proprietairePhoto = $proprietairePhoto ?: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&q=80';
        }
        Utilisateur::updateOrCreate(
            ['email' => config('proprietaire.email', 'contact@baye-mor-gaye.dev')],
            [
                'nom' => config('proprietaire.nom', 'Baye Mor Gaye'),
                'password' => Hash::make(config('proprietaire.password', 'password')),
                'photo' => $proprietairePhoto,
                'email_verifie_le' => now(),
                'derniere_connexion_le' => now(),
            ]
        );

        // ===== 5 VISITEURS REALISTES POUR COMMENTAIRES/LIKES =====
        $visiteurs = [
            [
                'nom' => 'Aminata Diop',
                'email' => 'aminata.diop@example.sn',
                'password' => Hash::make('password123'),
                'photo' => 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&q=80',
                'email_verifie_le' => now(),
                'derniere_connexion_le' => now()->subDays(2),
            ],
            [
                'nom' => 'Mamadou Sarr',
                'email' => 'mamadou.sarr@example.sn',
                'password' => Hash::make('password123'),
                'photo' => 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&q=80',
                'email_verifie_le' => now()->subDays(10),
                'derniere_connexion_le' => now()->subDays(1),
            ],
            [
                'nom' => 'Fatoumata Kane',
                'email' => 'fatoumata.kane@example.sn',
                'password' => Hash::make('password123'),
                'photo' => 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400&q=80',
                'email_verifie_le' => now()->subDays(30),
                'derniere_connexion_le' => now()->subHours(5),
            ],
            [
                'nom' => 'Ibrahima Ndiaye',
                'email' => 'ibrahima.ndiaye@example.sn',
                'password' => Hash::make('password123'),
                'photo' => 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&q=80',
                'email_verifie_le' => now()->subDays(60),
                'derniere_connexion_le' => now()->subDays(3),
            ],
            [
                'nom' => 'Aissatou Ba',
                'email' => 'aissatou.ba@example.sn',
                'password' => Hash::make('password123'),
                'photo' => 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400&q=80',
                'email_verifie_le' => now()->subDays(15),
                'derniere_connexion_le' => now(),
            ],
        ];

        foreach ($visiteurs as $visiteur) {
            Utilisateur::updateOrCreate(
                ['email' => $visiteur['email']],
                $visiteur
            );
        }
    }
}
