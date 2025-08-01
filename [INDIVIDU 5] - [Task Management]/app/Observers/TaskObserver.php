<?php

namespace App\Observers;

use App\Models\Task;
use App\Models\TaskLog;
use App\Services\TeamsIntegrationService;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;

class TaskObserver
{
    protected TeamsIntegrationService $teamsService;

    public function __construct(TeamsIntegrationService $teamsService)
    {
        $this->teamsService = $teamsService;
    }

    /**
     * Handle the Task "created" event.
     */
    public function created(Task $task): void
    {
        // Send Teams notification for task creation
        if ($this->teamsService->isEnabled()) {
            try {
                $this->teamsService->sendTaskCreatedNotification($task, Auth::id());
                Log::info('Teams notification sent for task creation', [
                    'task_id' => $task->id,
                    'project_id' => $task->project_id,
                ]);
            } catch (\Exception $e) {
                Log::error('Failed to send Teams notification for task creation', [
                    'task_id' => $task->id,
                    'error' => $e->getMessage(),
                ]);
            }
        }
    }

    /**
     * Handle the Task "updated" event.
     */
    public function updated(Task $task): void
    {
        // Send Teams notification for task updates
        if ($this->teamsService->isEnabled()) {
            try {
                // Check if task was completed
                if ($task->isDirty('is_completed') && $task->is_completed) {
                    $this->teamsService->sendTaskCompletedNotification($task, Auth::id());
                    Log::info('Teams notification sent for task completion', [
                        'task_id' => $task->id,
                        'project_id' => $task->project_id,
                    ]);
                } else {
                    // Send generic task update notification for other changes
                    $changes = $this->getTaskChanges($task);
                    if (!empty($changes)) {
                        $this->teamsService->sendTaskUpdatedNotification($task, $changes, Auth::id());
                        Log::info('Teams notification sent for task update', [
                            'task_id' => $task->id,
                            'project_id' => $task->project_id,
                            'changes' => $changes,
                        ]);
                    }
                }
            } catch (\Exception $e) {
                Log::error('Failed to send Teams notification for task update', [
                    'task_id' => $task->id,
                    'error' => $e->getMessage(),
                ]);
            }
        }
    }

    /**
     * Handle the Task "deleted" event.
     */
    public function deleted(Task $task): void
    {
        //
    }

    /**
     * Handle the Task "restored" event.
     */
    public function restored(Task $task): void
    {
        //
    }

    /**
     * Handle the Task "force deleted" event.
     */
    public function forceDeleted(Task $task): void
    {
        //
    }

    public function updating(Task $task): void
    {
        // Check if task_label_id is being changed
        if ($task->isDirty('task_label_id')) {
            $oldLabelId = $task->getOriginal('task_label_id');
            $newLabelId = $task->task_label_id;

            // Get old label name
            $oldLabelName = null;
            if ($oldLabelId) {
                $oldLabel = \App\Models\TaskLabel::withTrashed()->find($oldLabelId);
                $oldLabelName = $oldLabel ? $oldLabel->name : null;
            }

            // Get new label name
            $newLabelName = null;
            if ($newLabelId) {
                $newLabel = \App\Models\TaskLabel::find($newLabelId);
                $newLabelName = $newLabel ? $newLabel->name : null;
            }

            TaskLog::create([
                'task_id' => $task->id,
                'user_id' => Auth::id() ?? $task->assigned_to,
                'field' => 'label',
                'old_value' => $oldLabelName,
                'new_value' => $newLabelName,
            ]);
        }

        // Check if status is being changed
        if ($task->isDirty('status')) {
            TaskLog::create([
                'task_id' => $task->id,
                'user_id' => Auth::id() ?? $task->assigned_to,
                'field' => 'status',
                'old_value' => $task->getOriginal('status'),
                'new_value' => $task->status,
            ]);
        }

        // Check if title is being changed
        if ($task->isDirty('title')) {
            TaskLog::create([
                'task_id' => $task->id,
                'user_id' => Auth::id() ?? $task->assigned_to,
                'field' => 'title',
                'old_value' => $task->getOriginal('title'),
                'new_value' => $task->title,
            ]);
        }

        // Check if description is being changed
        if ($task->isDirty('description')) {
            TaskLog::create([
                'task_id' => $task->id,
                'user_id' => Auth::id() ?? $task->assigned_to,
                'field' => 'description',
                'old_value' => $task->getOriginal('description'),
                'new_value' => $task->description,
            ]);
        }

        // Check if project is being changed
        if ($task->isDirty('project_id')) {
            $oldProject = \App\Models\Project::find($task->getOriginal('project_id'));
            $newProject = \App\Models\Project::find($task->project_id);

            TaskLog::create([
                'task_id' => $task->id,
                'user_id' => Auth::id() ?? $task->assigned_to,
                'field' => 'project',
                'old_value' => $oldProject ? $oldProject->name : null,
                'new_value' => $newProject ? $newProject->name : null,
            ]);
        }

        // Check if assignee is being changed
        if ($task->isDirty('assigned_to')) {
            $oldAssignee = \App\Models\User::find($task->getOriginal('assigned_to'));
            $newAssignee = \App\Models\User::find($task->assigned_to);

            TaskLog::create([
                'task_id' => $task->id,
                'user_id' => Auth::id() ?? $task->assigned_to,
                'field' => 'assignee',
                'old_value' => $oldAssignee ? $oldAssignee->name : null,
                'new_value' => $newAssignee ? $newAssignee->name : null,
            ]);
        }

        // Check if due date is being changed
        if ($task->isDirty('due_date')) {
            TaskLog::create([
                'task_id' => $task->id,
                'user_id' => Auth::id() ?? $task->assigned_to,
                'field' => 'due_date',
                'old_value' => $task->getOriginal('due_date')?->format('Y-m-d'),
                'new_value' => $task->due_date?->format('Y-m-d'),
            ]);
        }

        // Check if priority is being changed
        if ($task->isDirty('priority')) {
            TaskLog::create([
                'task_id' => $task->id,
                'user_id' => Auth::id() ?? $task->assigned_to,
                'field' => 'priority',
                'old_value' => $task->getOriginal('priority'),
                'new_value' => $task->priority,
            ]);
        }

        // Check if completion status is being changed
        if ($task->isDirty('is_completed')) {
            TaskLog::create([
                'task_id' => $task->id,
                'user_id' => Auth::id() ?? $task->assigned_to,
                'field' => 'completion_status',
                'old_value' => $task->getOriginal('is_completed') ? 'Completed' : 'In Progress',
                'new_value' => $task->is_completed ? 'Completed' : 'In Progress',
            ]);
        }
    }

    /**
     * Get the changes made to the task
     */
    protected function getTaskChanges(Task $task): array
    {
        $changes = [];

        if ($task->isDirty('task_label_id')) {
            $oldLabelId = $task->getOriginal('task_label_id');
            $newLabelId = $task->task_label_id;

            $oldLabel = $oldLabelId ? \App\Models\TaskLabel::withTrashed()->find($oldLabelId) : null;
            $newLabel = $newLabelId ? \App\Models\TaskLabel::find($newLabelId) : null;

            $changes['label'] = [
                'old' => $oldLabel ? $oldLabel->name : null,
                'new' => $newLabel ? $newLabel->name : null,
            ];
        }

        if ($task->isDirty('status')) {
            $changes['status'] = [
                'old' => $task->getOriginal('status'),
                'new' => $task->status,
            ];
        }

        if ($task->isDirty('title')) {
            $changes['title'] = [
                'old' => $task->getOriginal('title'),
                'new' => $task->title,
            ];
        }

        if ($task->isDirty('assigned_to')) {
            $oldAssignee = \App\Models\User::find($task->getOriginal('assigned_to'));
            $newAssignee = \App\Models\User::find($task->assigned_to);

            $changes['assignee'] = [
                'old' => $oldAssignee ? $oldAssignee->name : null,
                'new' => $newAssignee ? $newAssignee->name : null,
            ];
        }

        if ($task->isDirty('priority')) {
            $changes['priority'] = [
                'old' => $task->getOriginal('priority'),
                'new' => $task->priority,
            ];
        }

        if ($task->isDirty('due_date')) {
            $changes['due_date'] = [
                'old' => $task->getOriginal('due_date')?->format('Y-m-d'),
                'new' => $task->due_date?->format('Y-m-d'),
            ];
        }

        if ($task->isDirty('is_completed')) {
            $changes['completion_status'] = [
                'old' => $task->getOriginal('is_completed') ? 'Completed' : 'In Progress',
                'new' => $task->is_completed ? 'Completed' : 'In Progress',
            ];
        }

        return $changes;
    }
}
