<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('ressources', function (Blueprint $table) {
            $table->string('type_fichier')->nullable()->after('type');
            $table->boolean('est_publique')->default(false)->after('type_fichier');
            $table->unsignedBigInteger('nombre_telechargements')->default(0)->after('est_publique');
        });
    }

    public function down(): void
    {
        Schema::table('ressources', function (Blueprint $table) {
            $table->dropColumn(['type_fichier', 'est_publique', 'nombre_telechargements']);
        });
    }
};
