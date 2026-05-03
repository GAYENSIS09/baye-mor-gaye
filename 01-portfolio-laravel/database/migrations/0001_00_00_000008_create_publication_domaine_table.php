<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('publication_domaine', function (Blueprint $table) {
            $table->id();
            $table->foreignId('publication_id')->constrained()->cascadeOnDelete();
            $table->foreignId('domaine_id')->constrained()->cascadeOnDelete();
            $table->timestamps();

            $table->unique(['publication_id', 'domaine_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('publication_domaine');
    }
};
