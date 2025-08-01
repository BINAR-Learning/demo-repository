<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class ProjectCustomField extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'project_id',
        'name',
        'type',
        'is_required',
        'is_use_for_filter',
        'is_allow_multiple',
        'options',
    ];

    protected $casts = [
        'is_required' => 'boolean',
        'is_use_for_filter' => 'boolean',
        'is_allow_multiple' => 'boolean',
        'options' => 'array',
    ];

    public function project(): BelongsTo
    {
        return $this->belongsTo(Project::class);
    }

    public function values(): HasMany
    {
        return $this->hasMany(TaskCustomFieldValue::class);
    }
} 