<?php

return [
    'enabled' => env('TEAMS_INTEGRATION_ENABLED', true),
    'workflow_webhook_url' => env('TEAMS_WORKFLOW_WEBHOOK_URL', 'https://api-tcds.taspen.co.id/api/teams/send_message'),
    'default_channel' => env('TEAMS_DEFAULT_CHANNEL', 'general'),
    'middleware_url' => env('TEAMS_MIDDLEWARE_URL', 'https://api-tcds.taspen.co.id/api/teams/send_message'),
    'notification_types' => [
        'task_created' => true,
        'task_updated' => true,
        'task_assigned' => true,
        'task_completed' => true,
    ],
    'retry_attempts' => 3,
    'timeout' => 30,
    'rate_limit' => [
        'max_requests' => 100,
        'per_minutes' => 1,
    ],
]; 