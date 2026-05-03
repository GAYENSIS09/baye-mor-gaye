<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('conversions', function (Blueprint $table) {
            $table->longText('resultat_json')->nullable()->after('type');
            $table->float('confiance')->nullable()->after('resultat_json');
        });
    }

    public function down(): void
    {
        Schema::table('conversions', function (Blueprint $table) {
            $table->dropColumn(['resultat_json', 'confiance']);
        });
    }
};
