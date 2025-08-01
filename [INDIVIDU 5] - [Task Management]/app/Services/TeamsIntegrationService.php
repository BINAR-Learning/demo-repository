<?php

namespace App\Services;

use App\Models\TeamsIntegrationSetting;
use App\Models\Task;
use Illuminate\Support\Facades\Log;

class TeamsIntegrationService
{
    protected TeamsWorkflowService $teamsService;
    protected TeamsNotificationFormatter $formatter;

    public function __construct(TeamsWorkflowService $teamsService, TeamsNotificationFormatter $formatter)
    {
        $this->teamsService = $teamsService;
        $this->formatter = $formatter;
    }

    /**
     * Send task notification to the appropriate Teams channel
     */
    public function sendTaskNotification(Task $task, string $notificationType, ?int $userId = null): bool
    {
        // Get project-specific webhook
        $projectMapping = $this->getProjectWebhook($task->project_id);
        
        if (!$projectMapping) {
            Log::info('No Teams webhook configured for project', [
                'project_id' => $task->project_id,
                'task_id' => $task->id,
            ]);
            return false;
        }

        // Create adaptive card for the task
        $card = $this->formatter->createTaskAdaptiveCard($task, $notificationType);
        
        // Send to project-specific webhook
        return $this->teamsService->sendAdaptiveCard(
            $projectMapping->workflow_webhook_url,
            $card,
            $task->id,
            $userId
        );
    }

    /**
     * Send task created notification
     */
    public function sendTaskCreatedNotification(Task $task, ?int $userId = null): bool
    {
        return $this->sendTaskNotification($task, 'task_created', $userId);
    }

    /**
     * Send task updated notification
     */
    public function sendTaskUpdatedNotification(Task $task, array $changes, ?int $userId = null): bool
    {
        return $this->sendTaskNotification($task, 'task_updated', $userId);
    }

    /**
     * Send task assigned notification
     */
    public function sendTaskAssignedNotification(Task $task, ?int $userId = null): bool
    {
        return $this->sendTaskNotification($task, 'task_assigned', $userId);
    }

    /**
     * Send task completed notification
     */
    public function sendTaskCompletedNotification(Task $task, ?int $userId = null): bool
    {
        return $this->sendTaskNotification($task, 'task_completed', $userId);
    }





    /**
     * Get project-specific webhook URL
     */
    protected function getProjectWebhook(int $projectId): ?TeamsIntegrationSetting
    {
        return TeamsIntegrationSetting::where('project_id', $projectId)
            ->where('is_active', true)
            ->first();
    }

    /**
     * Get default webhook URL (fallback)
     */
    protected function getDefaultWebhook(): ?string
    {
        return config('teams.workflow_webhook_url');
    }

    /**
     * Check if Teams integration is enabled
     */
    public function isEnabled(): bool
    {
        return config('teams.enabled', false);
    }

    /**
     * Get notification statistics for a specific project
     */
    public function getProjectNotificationStats(int $projectId): array
    {
        $projectMapping = $this->getProjectWebhook($projectId);
        
        if (!$projectMapping) {
            return [
                'total' => 0,
                'sent' => 0,
                'failed' => 0,
                'pending' => 0,
                'webhook_configured' => false,
            ];
        }

        $stats = $this->teamsService->getNotificationStats();
        $stats['webhook_configured'] = true;
        $stats['channel_name'] = $projectMapping->channel_name;
        
        return $stats;
    }

    /**
     * Get all project mappings
     */
    public function getAllProjectMappings(): array
    {
        return TeamsIntegrationSetting::with('project')
            ->whereNotNull('project_id')
            ->where('is_active', true)
            ->get()
            ->map(function ($mapping) {
                return [
                    'project_id' => $mapping->project_id,
                    'project_name' => $mapping->project->name,
                    'channel_name' => $mapping->channel_name,
                    'webhook_url' => $mapping->workflow_webhook_url,
                    'stats' => $this->getProjectNotificationStats($mapping->project_id),
                ];
            })
            ->toArray();
    }

    /**
     * Test webhook for a specific project
     */
    public function testProjectWebhook(int $projectId): bool
    {
        $projectMapping = $this->getProjectWebhook($projectId);
        
        if (!$projectMapping) {
            return false;
        }

        $testCard = [
            'type' => 'AdaptiveCard',
            'version' => '1.3',
            'body' => [
                [
                    'type' => 'TextBlock',
                    'text' => '🧪 Project Teams Integration Test',
                    'weight' => 'Bolder',
                    'size' => 'Medium',
                    'color' => 'Good',
                ],
                [
                    'type' => 'TextBlock',
                    'text' => "Testing Teams integration for project: {$projectMapping->project->name}",
                    'wrap' => true,
                ],
                [
                    'type' => 'FactSet',
                    'facts' => [
                        [
                            'title' => 'Project',
                            'value' => $projectMapping->project->name,
                        ],
                        [
                            'title' => 'Channel',
                            'value' => $projectMapping->channel_name ?: 'Default',
                        ],
                        [
                            'title' => 'Test Time',
                            'value' => now()->format('Y-m-d H:i:s'),
                        ],
                    ],
                ],
            ],
        ];

        return $this->teamsService->sendAdaptiveCard($projectMapping->workflow_webhook_url, $testCard);
    }
} 