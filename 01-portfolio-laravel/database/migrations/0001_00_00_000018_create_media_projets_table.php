<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('media_projets', function (Blueprint $table) {
            $table->id();
            $table->foreignId('projet_portfolio_id')->constrained()->cascadeOnDelete();
            $table->string('type')->default('image');
            $table->string('chemin_fichier')->nullable();
            $table->string('url_externe')->nullable();
            $table->string('vignette')->nullable();
            $table->string('titre')->nullable();
            $table->boolean('est_principal')->default(false);
            $table->unsignedInteger('ordre')->default(0);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('media_projets');
    }
};
