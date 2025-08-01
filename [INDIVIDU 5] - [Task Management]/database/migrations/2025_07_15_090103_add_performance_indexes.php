<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        // Add indexes for better Kanban performance
        Schema::table('tasks', function (Blueprint $table) {
            // Index for project filtering
            $table->index(['project_id', 'is_completed']);
            
            // Index for assignee filtering
            $table->index(['assigned_to', 'project_id']);
            
            // Index for priority filtering
            $table->index(['priority', 'project_id']);
            
            // Index for title search
            $table->index(['title']);
            
            // Index for task label grouping
            $table->index(['task_label_id', 'project_id']);
            
            // Composite index for common filter combinations
            $table->index(['project_id', 'assigned_to', 'priority', 'is_completed']);
        });

        Schema::table('task_labels', function (Blueprint $table) {
            // Index for project-based label queries
            $table->index(['project_id', 'order']);
        });

        Schema::table('task_custom_field_values', function (Blueprint $table) {
            // Index for task-based custom field queries
            $table->index(['task_id', 'project_custom_field_id']);
            
            // Index for project custom field queries
            $table->index(['project_custom_field_id']);
        });

        Schema::table('project_custom_fields', function (Blueprint $table) {
            // Index for project-based custom field queries
            $table->index(['project_id', 'is_use_for_filter']);
        });

        Schema::table('task_files', function (Blueprint $table) {
            // Index for task-based file queries
            $table->index(['task_id']);
        });

        Schema::table('task_comments', function (Blueprint $table) {
            // Index for task-based comment queries
            $table->index(['task_id']);
        });

        Schema::table('project_members', function (Blueprint $table) {
            // Index for project member queries
            $table->index(['project_id', 'user_id']);
        });
    }

    public function down()
    {
        Schema::table('tasks', function (Blueprint $table) {
            $table->dropIndex(['project_id', 'is_completed']);
            $table->dropIndex(['assigned_to', 'project_id']);
            $table->dropIndex(['priority', 'project_id']);
            $table->dropIndex(['title']);
            $table->dropIndex(['task_label_id', 'project_id']);
            $table->dropIndex(['project_id', 'assigned_to', 'priority', 'is_completed']);
        });

        Schema::table('task_labels', function (Blueprint $table) {
            $table->dropIndex(['project_id', 'order']);
        });

        Schema::table('task_custom_field_values', function (Blueprint $table) {
            $table->dropIndex(['task_id', 'project_custom_field_id']);
            $table->dropIndex(['project_custom_field_id']);
        });

        Schema::table('project_custom_fields', function (Blueprint $table) {
            $table->dropIndex(['project_id', 'is_use_for_filter']);
        });

        Schema::table('task_files', function (Blueprint $table) {
            $table->dropIndex(['task_id']);
        });

        Schema::table('task_comments', function (Blueprint $table) {
            $table->dropIndex(['task_id']);
        });

        Schema::table('project_members', function (Blueprint $table) {
            $table->dropIndex(['project_id', 'user_id']);
        });
    }
}; 