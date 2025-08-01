<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('project_custom_fields', function (Blueprint $table) {
            $table->boolean('is_allow_multiple')->default(false)->after('is_use_for_filter');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('project_custom_fields', function (Blueprint $table) {
            $table->dropColumn('is_allow_multiple');
        });
    }
}; 