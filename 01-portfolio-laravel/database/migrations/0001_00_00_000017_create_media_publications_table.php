<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('media_publications', function (Blueprint $table) {
            $table->id();
            $table->foreignId('publication_id')->constrained()->cascadeOnDelete();
            $table->string('type')->default('image');
            $table->string('chemin_fichier');
            $table->unsignedBigInteger('taille')->nullable();
            $table->unsignedInteger('largeur')->nullable();
            $table->unsignedInteger('hauteur')->nullable();
            $table->string('titre')->nullable();
            $table->unsignedInteger('ordre')->default(0);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('media_publications');
    }
};
