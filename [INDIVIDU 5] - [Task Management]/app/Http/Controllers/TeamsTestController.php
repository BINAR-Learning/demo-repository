<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Services\TeamsWorkflowService;
use App\Services\TeamsNotificationFormatter;
use App\Models\Task;

class TeamsTestController extends Controller
{
    public function index()
    {
        $isEnabled = config('teams.enabled');
        $webhookUrl = config('teams.workflow_webhook_url');
        $stats = (new TeamsWorkflowService())->getNotificationStats();
        
        return view('teams.test', compact('isEnabled', 'webhookUrl', 'stats'));
    }

    public function testAdaptiveCard(Request $request)
    {
        if (!config('teams.enabled')) {
            return response()->json(['error' => 'Teams integration is disabled'], 400);
        }

        $webhookUrl = config('teams.workflow_webhook_url');
        if (!$webhookUrl) {
            return response()->json(['error' => 'Teams webhook URL not configured'], 400);
        }

        $teamsService = new TeamsWorkflowService();
        
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

        $success = $teamsService->sendAdaptiveCard($webhookUrl, $card);

        return response()->json([
            'success' => $success,
            'message' => $success ? 'Adaptive card sent successfully!' : 'Failed to send adaptive card',
        ]);
    }

    public function testTaskNotification(Request $request)
    {
        if (!config('teams.enabled')) {
            return response()->json(['error' => 'Teams integration is disabled'], 400);
        }

        $webhookUrl = config('teams.workflow_webhook_url');
        if (!$webhookUrl) {
            return response()->json(['error' => 'Teams webhook URL not configured'], 400);
        }

        $teamsService = new TeamsWorkflowService();
        $formatter = new TeamsNotificationFormatter();
        
        // Try to get a real task for testing
        $task = Task::with(['project', 'assignee'])->first();
        
        if (!$task) {
            // Create a mock adaptive card
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
            // Format the task notification as an adaptive card
            $card = $formatter->createTaskAdaptiveCard($task, 'task_created');
            $success = $teamsService->sendAdaptiveCard($webhookUrl, $card, $task->id);
            $taskInfo = $task->title;
        }

        return response()->json([
            'success' => $success,
            'message' => $success ? "Task notification (adaptive card) sent successfully! (Task: {$taskInfo})" : 'Failed to send task notification (adaptive card)',
        ]);
    }

    public function testCustomCard(Request $request)
    {
        $request->validate([
            'card' => 'required|array',
        ]);

        if (!config('teams.enabled')) {
            return response()->json(['error' => 'Teams integration is disabled'], 400);
        }

        $webhookUrl = config('teams.workflow_webhook_url');
        if (!$webhookUrl) {
            return response()->json(['error' => 'Teams webhook URL not configured'], 400);
        }

        $teamsService = new TeamsWorkflowService();
        $card = $request->input('card');
        $success = $teamsService->sendAdaptiveCard($webhookUrl, $card);

        return response()->json([
            'success' => $success,
            'message' => $success ? 'Custom adaptive card sent successfully!' : 'Failed to send custom adaptive card',
        ]);
    }
} 