<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('conversions', function (Blueprint $table) {
            $table->foreignId('emploi_du_temps_id')->nullable()->constrained()->cascadeOnDelete();
            $table->string('fichier_original')->nullable();
            $table->string('modele_utilise')->nullable();
        });
    }

    public function down(): void
    {
        Schema::table('conversions', function (Blueprint $table) {
            $table->dropForeign(['emploi_du_temps_id']);
            $table->dropColumn(['emploi_du_temps_id', 'fichier_original', 'modele_utilise']);
        });
    }
};
