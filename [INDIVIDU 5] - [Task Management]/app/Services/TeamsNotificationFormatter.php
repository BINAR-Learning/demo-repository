<?php

namespace App\Services;

use App\Models\Task;
use App\Models\User;
use App\Models\Project;
use Carbon\Carbon;

class TeamsNotificationFormatter
{
    /**
     * Format task created notification
     */
    public function formatTaskCreated(Task $task): array
    {
        $assignee = $task->assignee;
        $project = $task->project;
        $label = $task->label ? $task->label->name : 'No Label';
        
        $message = "🆕 **New Task Created**\n\n";
        $message .= "**Task:** {$task->title}\n";
        $message .= "**Project:** " . ($project ? $project->name : 'No Project') . "\n";
        $message .= "**Status:** {$label}\n";
        
        if ($assignee) {
            $message .= "**Assigned to:** {$assignee->name}\n";
        }
        
        if ($task->due_date) {
            $message .= "**Due Date:** {$task->due_date->format('M d, Y')}\n";
        }
        
        if ($task->priority) {
            $message .= "**Priority:** {$task->priority}\n";
        }

        return [
            'type' => 'task_created',
            'message' => $message,
            'task_id' => $task->id,
            'project_id' => $project ? $project->id : null,
        ];
    }

    /**
     * Format task updated notification
     */
    public function formatTaskUpdated(Task $task, array $changes): array
    {
        $project = $task->project;
        
        $message = "✏️ **Task Updated**\n\n";
        $message .= "**Task:** {$task->title}\n";
        $message .= "**Project:** {$project->name}\n";
        
        foreach ($changes as $field => $change) {
            $message .= "**{$field}:** {$change['old']} → {$change['new']}\n";
        }

        return [
            'type' => 'task_updated',
            'message' => $message,
            'task_id' => $task->id,
            'project_id' => $project->id,
            'changes' => $changes,
        ];
    }

    /**
     * Format task assigned notification
     */
    public function formatTaskAssigned(Task $task, ?User $oldAssignee, ?User $newAssignee): array
    {
        $project = $task->project;
        
        $message = "👤 **Task Assignment**\n\n";
        $message .= "**Task:** {$task->title}\n";
        $message .= "**Project:** {$project->name}\n";
        
        if ($oldAssignee && $newAssignee) {
            $message .= "**Reassigned from:** {$oldAssignee->name}\n";
            $message .= "**Reassigned to:** {$newAssignee->name}\n";
        } elseif ($newAssignee) {
            $message .= "**Assigned to:** {$newAssignee->name}\n";
        } elseif ($oldAssignee) {
            $message .= "**Unassigned from:** {$oldAssignee->name}\n";
        }

        return [
            'type' => 'task_assigned',
            'message' => $message,
            'task_id' => $task->id,
            'project_id' => $project->id,
            'old_assignee' => $oldAssignee?->name,
            'new_assignee' => $newAssignee?->name,
        ];
    }

    /**
     * Format task completed notification
     */
    public function formatTaskCompleted(Task $task): array
    {
        $assignee = $task->assignee;
        $project = $task->project;
        
        $message = "✅ **Task Completed**\n\n";
        $message .= "**Task:** {$task->title}\n";
        $message .= "**Project:** {$project->name}\n";
        
        if ($assignee) {
            $message .= "**Completed by:** {$assignee->name}\n";
        }
        
        if ($task->completed_at) {
            $message .= "**Completed at:** {$task->completed_at->format('M d, Y H:i')}\n";
        }

        return [
            'type' => 'task_completed',
            'message' => $message,
            'task_id' => $task->id,
            'project_id' => $project->id,
        ];
    }





    /**
     * Create adaptive card for task
     */
    public function createTaskAdaptiveCard(Task $task, string $notificationType): array
    {
        $assignee = $task->assignee;
        $project = $task->project;
        $label = $task->label ? $task->label->name : 'No Label';
        $user = auth()->user();
        
        $card = [
            'type' => 'AdaptiveCard',
            'version' => '1.3',
            'body' => [
                [
                    'type' => 'Container',
                    'style' => $this->getNotificationStyle($notificationType),
                    'items' => [
                        [
                            'type' => 'TextBlock',
                            'text' => $this->getNotificationTitle($notificationType),
                            'weight' => 'Bolder',
                            'size' => 'Medium',
                            'color' => 'Light',
                        ],
                    ],
                ],
                [
                    'type' => 'TextBlock',
                    'text' => $task->title,
                    'weight' => 'Bolder',
                    'size' => 'Large',
                    'wrap' => true,
                    'spacing' => 'Medium',
                ],
                [
                    'type' => 'FactSet',
                    'facts' => [
                        [
                            'title' => 'Project',
                            'value' => $project ? $project->name : 'No Project',
                        ],
                        [
                            'title' => 'Status',
                            'value' => $label,
                        ],
                    ],
                    'spacing' => 'Medium',
                ],
            ],
            'actions' => [
                [
                    'type' => 'Action.OpenUrl',
                    'title' => 'View Task',
                    'url' => $this->getTaskUrl($task),
                    'style' => 'positive',
                ],
            ],
        ];

        // Add assignee if available
        if ($assignee) {
            $card['body'][2]['facts'][] = [
                'title' => 'Assigned to',
                'value' => $assignee->name,
            ];
        }

        // Add due date if available
        if ($task->due_date) {
            $card['body'][2]['facts'][] = [
                'title' => 'Due Date',
                'value' => $task->due_date->format('M d, Y'),
            ];
        }

        // Add priority if available
        if ($task->priority) {
            $card['body'][2]['facts'][] = [
                'title' => 'Priority',
                'value' => ucfirst($task->priority),
            ];
        }

        // Add who performed the action
        if ($user) {
            $card['body'][] = [
                'type' => 'TextBlock',
                'text' => "Updated by: {$user->name}",
                'size' => 'Small',
                'color' => 'Accent',
                'spacing' => 'Small',
            ];
        }

        // Add description if available (truncated)
        if ($task->description) {
            $description = strip_tags($task->description);
            if (strlen($description) > 150) {
                $description = substr($description, 0, 150) . '...';
            }
            $card['body'][] = [
                'type' => 'TextBlock',
                'text' => $description,
                'wrap' => true,
                'size' => 'Small',
                'color' => 'Default',
                'spacing' => 'Small',
            ];
        }

        return $card;
    }

    /**
     * Get notification title
     */
    protected function getNotificationTitle(string $type): string
    {
        $user = auth()->user();
        $userName = $user ? $user->name : 'System';
        
        return match($type) {
            'task_created' => "🆕 New Task Created by {$userName}",
            'task_updated' => "✏️ Task Updated by {$userName}",
            'task_assigned' => "👤 Task Assignment by {$userName}",
            'task_completed' => "✅ Task Completed by {$userName}",
            default => "📋 Task Notification by {$userName}",
        };
    }

    /**
     * Get notification color
     */
    protected function getNotificationColor(string $type): string
    {
        return match($type) {
            'task_created' => 'Good',
            'task_updated' => 'Warning',
            'task_assigned' => 'Accent',
            'task_completed' => 'Good',
            default => 'Default',
        };
    }

    /**
     * Get notification style (background color)
     */
    protected function getNotificationStyle(string $type): string
    {
        return match($type) {
            'task_created' => 'emphasis',
            'task_updated' => 'warning',
            'task_assigned' => 'accent',
            'task_completed' => 'good',
            default => 'default',
        };
    }

    /**
     * Get task URL
     */
    protected function getTaskUrl(Task $task): string
    {
        return config('app.url') . "/admin/tasks/{$task->id}";
    }
} 