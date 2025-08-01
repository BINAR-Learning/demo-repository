<?php

namespace App\Models;

use App\Enums\TaskStatus;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Task extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'title',
        'description',
        'project_id',
        'task_label_id',
        'assigned_to',
        'due_date',
        'status',
        'priority',
        'is_completed',
        'completed_at',
        'share_with'
    ];

    protected $casts = [
        'due_date' => 'date',
        'completed_at' => 'datetime',
        'status' => TaskStatus::class,
        'share_with' => 'array',
    ];

    protected static function booted()
    {
        static::updating(function ($task) {
            if ($task->isDirty('is_completed') && $task->is_completed) {
                $task->completed_at = now();
            }
        });
    }

    public function project(): BelongsTo
    {
        return $this->belongsTo(Project::class);
    }

    public function label(): BelongsTo
    {
        return $this->belongsTo(TaskLabel::class, 'task_label_id');
    }

    public function assignee(): BelongsTo
    {
        return $this->belongsTo(User::class, 'assigned_to');
    }

    public function files(): HasMany
    {
        return $this->hasMany(TaskFile::class);
    }

    public function comments(): HasMany
    {
        return $this->hasMany(TaskComment::class);
    }

    public function logs(): HasMany
    {
        return $this->hasMany(TaskLog::class);
    }

    public function customFieldValues(): HasMany
    {
        return $this->hasMany(TaskCustomFieldValue::class);
    }

    public function getCustomFieldValue($fieldId)
    {
        return $this->customFieldValues()
            ->where('project_custom_field_id', $fieldId)
            ->first()?->value;
    }
} 