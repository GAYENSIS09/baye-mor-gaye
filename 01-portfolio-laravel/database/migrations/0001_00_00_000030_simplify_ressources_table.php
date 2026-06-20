<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('ressources', function (Blueprint $table) {
            $table->dropColumn([
                'type',
                'fichier',
                'url_externe',
                'type_fichier',
                'taille',
                'nombre_telechargements',
            ]);

            $table->text('description')->nullable()->after('titre');
        });
    }

    public function down(): void
    {
        Schema::table('ressources', function (Blueprint $table) {
            $table->enum('type', ['fichier', 'lien'])->after('titre');
            $table->string('fichier')->nullable()->after('type');
            $table->string('url_externe')->nullable()->after('fichier');
            $table->string('type_fichier')->nullable()->after('url_externe');
            $table->unsignedBigInteger('taille')->nullable()->after('type_fichier');
            $table->unsignedBigInteger('nombre_telechargements')->default(0)->after('taille');

            $table->dropColumn('description');
        });
    }
};
