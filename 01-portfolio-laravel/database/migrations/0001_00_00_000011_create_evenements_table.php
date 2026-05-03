<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('evenements', function (Blueprint $table) {
            $table->id();
            $table->foreignId('emploi_du_temps_id')->constrained()->cascadeOnDelete();
            $table->string('titre');
            $table->text('description')->nullable();
            $table->dateTime('date_debut');
            $table->dateTime('date_fin')->nullable();
            $table->string('lieu')->nullable();
            $table->string('couleur')->nullable();
            $table->boolean('est_journee_complete')->default(false);
            $table->enum('statut', ['planifie', 'confirme', 'annule', 'termine'])->default('planifie');
            $table->timestamps();
            $table->softDeletes();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('evenements');
    }
};
