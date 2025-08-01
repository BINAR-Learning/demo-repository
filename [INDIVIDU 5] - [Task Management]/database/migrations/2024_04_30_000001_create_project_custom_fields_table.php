<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('project_custom_fields', function (Blueprint $table) {
            $table->id();
            $table->foreignId('project_id')->constrained()->onDelete('no action');
            $table->string('name');
            $table->enum('type', ['text', 'number', 'enum']);
            $table->boolean('is_required')->default(false);
            $table->json('options')->nullable(); // For enum type, store the options
            $table->integer('order')->default(0);
            $table->timestamps();
            $table->softDeletes();
        });

        Schema::create('task_custom_field_values', function (Blueprint $table) {
            $table->id();
            $table->foreignId('task_id')->constrained()->onDelete('no action');
            $table->foreignId('project_custom_field_id')->constrained()->onDelete('no action');
            $table->text('value');
            $table->timestamps();

            $table->unique(['task_id', 'project_custom_field_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('task_custom_field_values');
        Schema::dropIfExists('project_custom_fields');
    }
}; 