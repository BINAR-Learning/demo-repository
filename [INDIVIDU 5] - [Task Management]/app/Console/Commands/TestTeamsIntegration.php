<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Services\TeamsWorkflowService;
use App\Services\TeamsNotificationFormatter;
use App\Models\Task;

class TestTeamsIntegration extends Command
{
    protected $signature = 'teams:test';
    protected $description = 'Test Microsoft Teams integration with adaptive card only';

    public function handle(TeamsWorkflowService $teamsService, TeamsNotificationFormatter $formatter)
    {
        if (!config('teams.enabled')) {
            $this->error('Teams integration is disabled. Please enable it in your .env file.');
            return 1;
        }

        $webhookUrl = config('teams.workflow_webhook_url');
        if (!$webhookUrl) {
            $this->error('Teams webhook URL not configured. Please set TEAMS_WORKFLOW_WEBHOOK_URL in your .env file.');
            return 1;
        }

        $this->info('🧪 Testing Microsoft Teams Integration (Adaptive Card Only)...');
        $this->info("Webhook URL: {$webhookUrl}");
        $this->newLine();

        $this->testAdaptiveCard($teamsService, $webhookUrl);
        $this->testTaskNotification($teamsService, $formatter, $webhookUrl);

        $this->newLine();
        $this->info('✅ Testing completed! Check your Teams channel for the adaptive cards.');
        
        return 0;
    }

    protected function testAdaptiveCard(TeamsWorkflowService $teamsService, string $webhookUrl)
    {
        $this->info('🎴 Testing adaptive card...');
        
        $card = [
            'type' => 'AdaptiveCard',
            'version' => '1.3',
            'body' => [
                [
                    'type' => 'TextBlock',
                    'text' => '🧪 Teams Integration Test - Adaptive Card',
                    'weight' => 'Bolder',
                    'size' => 'Medium',
                    'color' => 'Good',
                ],
                [
                    'type' => 'TextBlock',
                    'text' => 'This is an adaptive card test from your project management application.',
                    'wrap' => true,
                ],
                [
                    'type' => 'FactSet',
                    'facts' => [
                        [
                            'title' => 'App Name',
                            'value' => config('app.name'),
                        ],
                        [
                            'title' => 'Test Time',
                            'value' => now()->format('Y-m-d H:i:s'),
                        ],
                        [
                            'title' => 'Test Type',
                            'value' => 'Adaptive Card',
                        ],
                        [
                            'title' => 'Middleware',
                            'value' => 'Enabled',
                        ],
                    ],
                ],
            ],
            'actions' => [
                [
                    'type' => 'Action.OpenUrl',
                    'title' => 'Visit Application',
                    'url' => config('app.url'),
                ],
            ],
        ];

        // Test payload structure first
        $this->info('🔍 Testing payload structure...');
        $testPayload = $teamsService->testPayloadStructure($card);
        $this->info('Payload structure test completed. Check logs for details.');

        // Debug payload structure
        $this->info('🔍 Debugging payload structure...');
        $debugInfo = $teamsService->debugPayloadStructure($card);
        $this->info('Debug info logged. Check logs for detailed payload structure.');

        $success = $teamsService->sendAdaptiveCard($webhookUrl, $card);
        
        if ($success) {
            $this->info('✅ Adaptive card sent successfully!');
        } else {
            $this->error('❌ Failed to send adaptive card');
            $this->error('Check the application logs for detailed error information.');
        }
        
        $this->newLine();
    }

    protected function testTaskNotification(TeamsWorkflowService $teamsService, TeamsNotificationFormatter $formatter, string $webhookUrl)
    {
        $this->info('📋 Testing task notification (adaptive card)...');
        
        // Try to get a real task for testing
        $task = Task::with(['project', 'assignee'])->first();
        
        if (!$task) {
            $this->warn('⚠️ No tasks found in database. Creating a mock task notification...');
            
            $mockCard = [
                'type' => 'AdaptiveCard',
                'version' => '1.3',
                'body' => [
                    [
                        'type' => 'TextBlock',
                        'text' => '🆕 Mock Task Created',
                        'weight' => 'Bolder',
                        'size' => 'Medium',
                        'color' => 'Good',
                    ],
                    [
                        'type' => 'TextBlock',
                        'text' => 'Task: Test Task for Teams Integration',
                        'wrap' => true,
                    ],
                    [
                        'type' => 'FactSet',
                        'facts' => [
                            [
                                'title' => 'Project',
                                'value' => 'Test Project',
                            ],
                            [
                                'title' => 'Status',
                                'value' => 'To Do',
                            ],
                            [
                                'title' => 'Assigned to',
                                'value' => 'Test User',
                            ],
                            [
                                'title' => 'Due Date',
                                'value' => now()->addDays(7)->format('M d, Y'),
                            ],
                        ],
                    ],
                ],
            ];
            
            $success = $teamsService->sendAdaptiveCard($webhookUrl, $mockCard);
            $taskInfo = 'Mock task';
        } else {
            $this->info("Using real task: {$task->title}");
            
            // Format the task notification as an adaptive card
            $card = $formatter->createTaskAdaptiveCard($task, 'task_created');
            $success = $teamsService->sendAdaptiveCard($webhookUrl, $card, $task->id);
            $taskInfo = $task->title;
        }
        
        if ($success) {
            $this->info('✅ Task notification (adaptive card) sent successfully!');
        } else {
            $this->error('❌ Failed to send task notification (adaptive card)');
        }
        
        $this->newLine();
    }
} 