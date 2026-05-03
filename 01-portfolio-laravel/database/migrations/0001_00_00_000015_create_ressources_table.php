<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('ressources', function (Blueprint $table) {
            $table->id();
            $table->foreignId('proprietaire_id')->constrained()->cascadeOnDelete();
            $table->foreignId('domaine_id')->nullable()->constrained()->nullOnDelete();
            $table->string('titre');
            $table->string('fichier')->nullable();
            $table->string('url_externe')->nullable();
            $table->enum('type', ['fichier', 'lien']);
            $table->unsignedBigInteger('taille')->nullable();
            $table->timestamps();
            $table->softDeletes();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('ressources');
    }
};
