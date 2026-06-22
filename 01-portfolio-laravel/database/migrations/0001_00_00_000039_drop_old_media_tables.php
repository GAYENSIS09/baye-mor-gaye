<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::dropIfExists('media_qualifications');
        Schema::dropIfExists('media_publications');
        Schema::dropIfExists('media_projets');
    }

    public function down(): void
    {
        // Not reversible — data is in `media` table
    }
};
