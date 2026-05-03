<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('certifications', function (Blueprint $table) {
            $table->id();
            $table->foreignId('proprietaire_id')->constrained()->cascadeOnDelete();
            $table->string('titre');
            $table->string('organisme');
            $table->text('description')->nullable();
            $table->date('date_obtention');
            $table->date('date_expiration')->nullable();
            $table->string('url_credential')->nullable();
            $table->unsignedSmallInteger('ordre')->default(0);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('certifications');
    }
};
