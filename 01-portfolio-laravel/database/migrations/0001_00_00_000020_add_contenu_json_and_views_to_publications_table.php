<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('publications', function (Blueprint $table) {
            $table->json('contenu_json')->nullable()->after('contenu');
            $table->longText('contenu_html')->nullable()->after('contenu_json');
            $table->unsignedBigInteger('nombre_vues')->default(0)->after('est_publie');
        });
    }

    public function down(): void
    {
        Schema::table('publications', function (Blueprint $table) {
            $table->dropColumn(['contenu_json', 'contenu_html', 'nombre_vues']);
        });
    }
};
