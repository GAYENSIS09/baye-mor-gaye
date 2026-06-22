<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        // Migrate media_projets → media
        DB::table('media_projets')->orderBy('id')->each(function (object $old) {
            DB::table('media')->insert([
                'mediable_type' => \App\Models\ProjetPortfolio::class,
                'mediable_id' => $old->projet_portfolio_id,
                'type' => $old->type,
                'chemin_fichier' => $old->chemin_fichier,
                'url_externe' => $old->url_externe,
                'vignette' => $old->vignette,
                'titre' => $old->titre,
                'taille' => null,
                'largeur' => null,
                'hauteur' => null,
                'est_principal' => $old->est_principal,
                'ordre' => $old->ordre,
                'created_at' => $old->created_at,
                'updated_at' => $old->updated_at,
            ]);
        });

        // Migrate media_publications → media
        DB::table('media_publications')->orderBy('id')->each(function (object $old) {
            DB::table('media')->insert([
                'mediable_type' => \App\Models\Publication::class,
                'mediable_id' => $old->publication_id,
                'type' => $old->type,
                'chemin_fichier' => $old->chemin_fichier,
                'url_externe' => null,
                'vignette' => null,
                'titre' => $old->titre,
                'taille' => $old->taille,
                'largeur' => $old->largeur,
                'hauteur' => $old->hauteur,
                'est_principal' => false,
                'ordre' => $old->ordre,
                'created_at' => $old->created_at,
                'updated_at' => $old->updated_at,
            ]);
        });

        // Migrate media_qualifications → media
        DB::table('media_qualifications')->orderBy('id')->each(function (object $old) {
            DB::table('media')->insert([
                'mediable_type' => $old->qualifiable_type,
                'mediable_id' => $old->qualifiable_id,
                'type' => $old->type,
                'chemin_fichier' => $old->chemin_fichier,
                'url_externe' => null,
                'vignette' => null,
                'titre' => $old->titre,
                'taille' => $old->taille,
                'largeur' => null,
                'hauteur' => null,
                'est_principal' => false,
                'ordre' => $old->ordre,
                'created_at' => $old->created_at,
                'updated_at' => $old->updated_at,
            ]);
        });
    }

    public function down(): void
    {
        // Not reversible
    }
};
