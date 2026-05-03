<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('vue_pages', function (Blueprint $table) {
            $table->id();
            $table->string('adresse_ip')->nullable();
            $table->text('agent_utilisateur')->nullable();
            $table->text('referer')->nullable();
            $table->timestamp('visite_le')->useCurrent();
            $table->string('page')->nullable();
            $table->unsignedBigInteger('page_id')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('vue_pages');
    }
};
