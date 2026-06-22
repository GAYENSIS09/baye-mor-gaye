<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('media', function (Blueprint $table) {
            $table->id();
            $table->morphs('mediable');
            $table->string('type')->default('image');
            $table->string('chemin_fichier')->nullable();
            $table->string('url_externe')->nullable();
            $table->string('vignette')->nullable();
            $table->string('titre')->nullable();
            $table->unsignedBigInteger('taille')->nullable();
            $table->unsignedInteger('largeur')->nullable();
            $table->unsignedInteger('hauteur')->nullable();
            $table->boolean('est_principal')->default(false);
            $table->unsignedSmallInteger('ordre')->default(0);
            $table->timestamps();

            $table->index(['mediable_type', 'mediable_id', 'ordre']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('media');
    }
};
