<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasManyThrough;
use Spatie\Activitylog\LogOptions;
use Spatie\Activitylog\Traits\LogsActivity;

class Company extends Model
{
    use HasFactory, LogsActivity;

    protected $fillable = [
        'name',
        'code',
        'description',
        'login_type',
        'api_url',
        'business_area',
        'address',
    ];

    protected $casts = [
        'login_type' => 'string',
    ];

    public function workingUnits(): HasMany
    {
        return $this->hasMany(WorkingUnit::class);
    }

    public function jobPositions(): HasManyThrough
    {
        return $this->hasManyThrough(JobPosition::class, WorkingUnit::class);
    }

    public function users(): HasMany
    {
        return $this->hasMany(User::class);
    }

    public function usesApiAuth(): bool
    {
        return $this->login_type === 'api';
    }

    public function getActivitylogOptions(): LogOptions
    {
        return LogOptions::defaults()
            ->logOnly(['name', 'code', 'description', 'login_type', 'api_url'])
            ->logOnlyDirty()
            ->dontSubmitEmptyLogs()
            ->setDescriptionForEvent(fn(string $eventName) => "Company has been {$eventName}");
    }
}
