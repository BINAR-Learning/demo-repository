<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use App\Models\ProjectCustomField;

class Project extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'name',
        'code',
        'description',
        'status',
        'member_type',
        'created_by',
        'start_date',
        'end_date',
        'project_manager_id',
    ];

    protected $casts = [
        'start_date' => 'date',
        'end_date' => 'date',
        'status' => 'string',
        'member_type' => 'string',
    ];

    public function projectManager(): BelongsTo
    {
        return $this->belongsTo(User::class, 'project_manager_id');
    }

    public function managers(): BelongsToMany
    {
        return $this->belongsToMany(User::class, 'project_members')
            ->wherePivot('is_manager', true);
    }

    public function members()
    {
        return $this->belongsToMany(User::class, 'project_members');
    }

    public function tasks(): HasMany
    {
        return $this->hasMany(Task::class);
    }

    public function labels(): HasMany
    {
        return $this->hasMany(TaskLabel::class);
    }

    public function customFields(): HasMany
    {
        return $this->hasMany(ProjectCustomField::class);
    }
} 