<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('projet_portfolios', function (Blueprint $table) {
            $table->unsignedBigInteger('nombre_vues')->default(0)->after('est_publie');
        });
    }

    public function down(): void
    {
        Schema::table('projet_portfolios', function (Blueprint $table) {
            $table->dropColumn('nombre_vues');
        });
    }
};
