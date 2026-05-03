<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('projet_portfolios', function (Blueprint $table) {
            $table->id();
            $table->foreignId('proprietaire_id')->constrained()->cascadeOnDelete();
            $table->string('titre');
            $table->string('slug')->unique();
            $table->text('description');
            $table->json('technologies')->nullable();
            $table->string('url_demo')->nullable();
            $table->string('url_code')->nullable();
            $table->string('image_couverture')->nullable();
            $table->boolean('est_publie')->default(false);
            $table->timestamp('publie_le')->nullable();
            $table->timestamps();
            $table->softDeletes();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('projet_portfolios');
    }
};
