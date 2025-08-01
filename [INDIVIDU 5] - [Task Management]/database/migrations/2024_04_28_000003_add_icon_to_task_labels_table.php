<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('task_labels', function (Blueprint $table) {
            $table->string('icon')->nullable()->after('color');
        });
    }

    public function down(): void
    {
        Schema::table('task_labels', function (Blueprint $table) {
            $table->dropColumn('icon');
        });
    }
}; 