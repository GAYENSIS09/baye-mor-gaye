<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('vue_pages', function (Blueprint $table) {
            $table->foreignId('proprietaire_id')->nullable()->constrained()->cascadeOnDelete();
        });
    }

    public function down(): void
    {
        Schema::table('vue_pages', function (Blueprint $table) {
            $table->dropForeign(['proprietaire_id']);
            $table->dropColumn('proprietaire_id');
        });
    }
};
