<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('projet_portfolios', function (Blueprint $table) {
            $table->string('courte_description')->nullable()->after('description');
            $table->date('date_realisation')->nullable()->after('technologies');
            $table->boolean('est_en_vedette')->default(false)->after('est_publie');
        });
    }

    public function down(): void
    {
        Schema::table('projet_portfolios', function (Blueprint $table) {
            $table->dropColumn(['courte_description', 'date_realisation', 'est_en_vedette']);
        });
    }
};
