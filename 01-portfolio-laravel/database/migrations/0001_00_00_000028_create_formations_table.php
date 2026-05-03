<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('formations', function (Blueprint $table) {
            $table->id();
            $table->foreignId('proprietaire_id')->constrained()->cascadeOnDelete();
            $table->string('diplome');
            $table->string('etablissement');
            $table->text('description')->nullable();
            $table->string('domaine_etude')->nullable();
            $table->date('date_debut');
            $table->date('date_fin')->nullable();
            $table->unsignedSmallInteger('ordre')->default(0);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('formations');
    }
};
