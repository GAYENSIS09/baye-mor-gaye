<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('publications', function (Blueprint $table) {
            $table->index(['est_publie', 'created_at']);
        });

        Schema::table('projet_portfolios', function (Blueprint $table) {
            $table->index(['est_publie', 'created_at']);
        });

        Schema::table('commentaires', function (Blueprint $table) {
            $table->index('est_approuve');
        });

        Schema::table('experiences', function (Blueprint $table) {
            $table->index(['ordre', 'date_debut']);
        });

        Schema::table('formations', function (Blueprint $table) {
            $table->index(['ordre', 'date_debut']);
        });

        Schema::table('certifications', function (Blueprint $table) {
            $table->index(['ordre', 'date_obtention']);
        });
    }

    public function down(): void
    {
        Schema::table('publications', function (Blueprint $table) {
            $table->dropIndex(['est_publie', 'created_at']);
        });

        Schema::table('projet_portfolios', function (Blueprint $table) {
            $table->dropIndex(['est_publie', 'created_at']);
        });

        Schema::table('commentaires', function (Blueprint $table) {
            $table->dropIndex(['est_approuve']);
        });

        Schema::table('experiences', function (Blueprint $table) {
            $table->dropIndex(['ordre', 'date_debut']);
        });

        Schema::table('formations', function (Blueprint $table) {
            $table->dropIndex(['ordre', 'date_debut']);
        });

        Schema::table('certifications', function (Blueprint $table) {
            $table->dropIndex(['ordre', 'date_obtention']);
        });
    }
};
