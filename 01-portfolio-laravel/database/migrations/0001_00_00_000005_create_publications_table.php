<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('publications', function (Blueprint $table) {
            $table->id();
            $table->foreignId('proprietaire_id')->constrained()->cascadeOnDelete();
            $table->string('titre');
            $table->string('slug')->unique();
            $table->longText('contenu');
            $table->string('extrait')->nullable();
            $table->enum('type', ['article', 'tutoriel', 'note'])->default('article');
            $table->string('image_couverture')->nullable();
            $table->timestamp('publie_le')->nullable();
            $table->boolean('est_publie')->default(false);
            $table->timestamps();
            $table->softDeletes();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('publications');
    }
};
