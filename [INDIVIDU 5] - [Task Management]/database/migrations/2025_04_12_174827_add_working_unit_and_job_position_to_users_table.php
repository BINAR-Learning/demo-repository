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
        Schema::table('users', function (Blueprint $table) {
            $table->foreignId('working_unit_id')->nullable()->constrained()->onDelete('no action');
            $table->foreignId('job_position_id')->nullable()->constrained()->onDelete('no action');
            $table->string('employee_id')->nullable(); // For NIK
            $table->string('position_name')->nullable(); // For JABATAN
            $table->string('business_area')->nullable(); // For BA
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropForeign(['working_unit_id']);
            $table->dropForeign(['job_position_id']);
            $table->dropColumn(['working_unit_id', 'job_position_id', 'employee_id', 'position_name', 'business_area']);
        });
    }
};
