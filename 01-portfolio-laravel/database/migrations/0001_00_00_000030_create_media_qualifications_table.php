<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('media_qualifications', function (Blueprint $table) {
            $table->id();
            $table->morphs('qualifiable');
            $table->string('type'); // image, video, document, lien
            $table->string('chemin_fichier');
            $table->string('titre')->nullable();
            $table->unsignedInteger('taille')->nullable();
            $table->unsignedSmallInteger('ordre')->default(0);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('media_qualifications');
    }
};
