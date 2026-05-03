<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('niveau_competence', function (Blueprint $table) {
            $table->id();
            $table->foreignId('proprietaire_id')->constrained()->cascadeOnDelete();
            $table->foreignId('competence_id')->constrained()->cascadeOnDelete();
            $table->enum('niveau', ['debutant', 'intermediaire', 'avance', 'expert']);
            $table->boolean('est_surligne')->default(false);
            $table->timestamps();

            $table->unique(['proprietaire_id', 'competence_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('niveau_competence');
    }
};
