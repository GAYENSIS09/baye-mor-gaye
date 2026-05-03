<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('likes', function (Blueprint $table) {
            $table->id();
            $table->foreignId('auteur_id')->constrained('utilisateurs')->cascadeOnDelete();
            $table->morphs('likeable');
            $table->timestamps();

            $table->unique(['auteur_id', 'likeable_id', 'likeable_type']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('likes');
    }
};
