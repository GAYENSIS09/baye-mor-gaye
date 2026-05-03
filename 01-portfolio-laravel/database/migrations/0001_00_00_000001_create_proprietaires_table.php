<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('proprietaires', function (Blueprint $table) {
            $table->id();
            $table->foreignId('utilisateur_id')->constrained()->cascadeOnDelete();
            $table->text('bio')->nullable();
            $table->string('titre_professionnel')->nullable();
            $table->string('localisation')->nullable();
            $table->string('site_web')->nullable();
            $table->string('url_linkedin')->nullable();
            $table->string('url_github')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('proprietaires');
    }
};
