<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class TeamsIntegrationSetting extends Model
{
    use HasFactory;

    protected $fillable = [
        'company_id',
        'project_id',
        'workflow_webhook_url',
        'channel_name',
        'team_name',
        'is_active',
        'notification_types',
    ];

    protected $casts = [
        'is_active' => 'boolean',
        'notification_types' => 'array',
    ];

    public function company(): BelongsTo
    {
        return $this->belongsTo(Company::class);
    }

    public function project(): BelongsTo
    {
        return $this->belongsTo(Project::class);
    }

    public function isNotificationTypeEnabled(string $type): bool
    {
        if (!$this->notification_types) {
            return config("teams.notification_types.{$type}", true);
        }

        return $this->notification_types[$type] ?? true;
    }

    public function getWebhookUrl(): string
    {
        return $this->workflow_webhook_url;
    }
} 