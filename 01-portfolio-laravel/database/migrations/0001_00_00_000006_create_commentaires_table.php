<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('commentaires', function (Blueprint $table) {
            $table->id();
            $table->foreignId('auteur_id')->constrained('utilisateurs')->cascadeOnDelete();
            $table->morphs('commentable');
            $table->text('contenu');
            $table->boolean('est_approuve')->default(false);
            $table->timestamps();
            $table->softDeletes();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('commentaires');
    }
};
