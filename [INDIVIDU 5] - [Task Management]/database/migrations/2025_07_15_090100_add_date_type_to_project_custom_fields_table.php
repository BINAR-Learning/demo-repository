<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // Drop the constraint first
        DB::statement("
            DECLARE @sql NVARCHAR(MAX) = '';
            SELECT @sql = @sql + 'ALTER TABLE project_custom_fields DROP CONSTRAINT ' + name + ';'
            FROM sys.check_constraints 
            WHERE parent_object_id = OBJECT_ID('project_custom_fields') 
            AND definition LIKE '%type%';
            EXEC(@sql);
        ");

        Schema::table('project_custom_fields', function (Blueprint $table) {
            // Drop the existing type column
            $table->dropColumn('type');
        });

        Schema::table('project_custom_fields', function (Blueprint $table) {
            // Add the new type column with 'date' option and default value
            $table->enum('type', ['text', 'number', 'enum', 'date'])->default('text')->after('name');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // Drop the constraint first
        DB::statement("
            DECLARE @sql NVARCHAR(MAX) = '';
            SELECT @sql = @sql + 'ALTER TABLE project_custom_fields DROP CONSTRAINT ' + name + ';'
            FROM sys.check_constraints 
            WHERE parent_object_id = OBJECT_ID('project_custom_fields') 
            AND definition LIKE '%type%';
            EXEC(@sql);
        ");

        Schema::table('project_custom_fields', function (Blueprint $table) {
            // Drop the type column
            $table->dropColumn('type');
        });

        Schema::table('project_custom_fields', function (Blueprint $table) {
            // Recreate the original type column without 'date' option
            $table->enum('type', ['text', 'number', 'enum'])->default('text')->after('name');
        });
    }
};
