<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('rappels', function (Blueprint $table) {
            $table->id();
            $table->foreignId('proprietaire_id')->constrained()->cascadeOnDelete();
            $table->foreignId('evenement_id')->nullable()->constrained()->nullOnDelete();
            $table->string('titre');
            $table->text('message')->nullable();
            $table->timestamp('notifie_le')->nullable();
            $table->boolean('est_notifie')->default(false);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('rappels');
    }
};
