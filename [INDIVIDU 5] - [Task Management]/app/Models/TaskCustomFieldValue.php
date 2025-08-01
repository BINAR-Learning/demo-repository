<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class TaskCustomFieldValue extends Model
{
    use HasFactory;

    protected $fillable = [
        'task_id',
        'project_custom_field_id',
        'value',
    ];

    public function task(): BelongsTo
    {
        return $this->belongsTo(Task::class);
    }

    public function customField(): BelongsTo
    {
        return $this->belongsTo(ProjectCustomField::class, 'project_custom_field_id');
    }
} 