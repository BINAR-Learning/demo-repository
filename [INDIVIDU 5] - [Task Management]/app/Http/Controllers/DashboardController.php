<?php

namespace App\Http\Controllers;

use App\Models\Task;
use App\Models\TaskLabel;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Auth;

class DashboardController extends Controller
{
    public function getTaskStats(Request $request): JsonResponse
    {
        $projectId = $request->query('project_id');
        
        $query = Task::query();
        if ($projectId) {
            $query->where('project_id', $projectId);
        }

        $totalTasks = $query->count();
        $completedTasks = (clone $query)->where('is_completed', true)->count();
        $activeTasks = $totalTasks - $completedTasks;

        return response()->json([
            'total' => $totalTasks,
            'completed' => $completedTasks,
            'active' => $activeTasks
        ]);
    }

    public function getTaskStatsByLabel(Request $request): JsonResponse
    {
        $projectId = $request->query('project_id');
        
        $labels = TaskLabel::with('tasks')
            ->when($projectId, function ($query) use ($projectId) {
                $query->whereHas('tasks', function ($query) use ($projectId) {
                    $query->where('project_id', $projectId);
                });
            })
            ->get();

        $result = $labels->map(function($label) {
            $activeTasks = $label->tasks->where('is_completed', false)
                ->where('due_date', '>=', now())
                ->count();
            $overdueTasks = $label->tasks->where('is_completed', false)
                ->where('due_date', '<', now())
                ->count();

            return [
                'name' => $label->name,
                'color' => $label->color,
                'active_tasks' => $activeTasks,
                'overdue_tasks' => $overdueTasks
            ];
        });

        return response()->json($result);
    }

    public function getTaskStatsByPriority(Request $request): JsonResponse
    {
        $projectId = $request->query('project_id');
        
        $query = Task::query();
        if ($projectId) {
            $query->where('project_id', $projectId);
        }

        $highPriority = (clone $query)->where('priority', 'high')->count();
        $mediumPriority = (clone $query)->where('priority', 'medium')->count();
        $lowPriority = (clone $query)->where('priority', 'low')->count();
        $noPriority = (clone $query)->whereNull('priority')->orWhere('priority', '')->count();

        return response()->json([
            'high' => $highPriority,
            'medium' => $mediumPriority,
            'low' => $lowPriority,
            'none' => $noPriority
        ]);
    }

    public function getMemberTaskDistribution(Request $request): JsonResponse
    {
        $projectId = $request->query('project_id');
        
        $labels = TaskLabel::with('tasks')
            ->when($projectId, function ($query) use ($projectId) {
                $query->where('project_id', $projectId);
            })
            ->get();

        $members = User::whereHas('tasks', function($query) use ($projectId) {
            if ($projectId) {
                $query->where('project_id', $projectId);
            }
        })->get();

        $result = [
            'labels' => $labels->map(function($label) {
                return [
                    'name' => $label->name,
                    'color' => $label->color
                ];
            }),
            'members' => $members->map(function($member) use ($labels) {
                $taskCounts = [];
                foreach ($labels as $label) {
                    $taskCounts[$label->name] = $member->tasks()
                        ->where('task_label_id', $label->id)
                        ->count();
                }
                
                return [
                    'name' => $member->name,
                    'task_counts' => $taskCounts
                ];
            })
        ];

        return response()->json($result);
    }

    public function getMemberTaskCompletion(Request $request): JsonResponse
    {
        $projectId = $request->query('project_id');
        
        $members = User::whereHas('tasks', function($query) use ($projectId) {
            if ($projectId) {
                $query->where('project_id', $projectId);
            }
        })->get();

        $result = $members->map(function($member) use ($projectId) {
            $query = $member->tasks();
            if ($projectId) {
                $query->where('project_id', $projectId);
            }

            $totalTasks = (clone $query)->count();
            $completedTasks = (clone $query)->where('is_completed', true)->count();

            return [
                'name' => $member->name,
                'total' => $totalTasks,
                'completed' => $completedTasks
            ];
        });

        return response()->json($result);
    }

    public function getMonthlyCompletedTasks(Request $request): JsonResponse
    {
        $projectId = $request->query('project_id');
        
        // Get last 6 months
        $months = collect();
        for ($i = 5; $i >= 0; $i--) {
            $months->push(now()->subMonths($i)->format('M Y'));
        }

        $result = $months->map(function($month) use ($projectId) {
            $startDate = Carbon::createFromFormat('M Y', $month)->startOfMonth();
            $endDate = $startDate->copy()->endOfMonth();

            $query = Task::where('is_completed', true)
                ->whereBetween('updated_at', [$startDate, $endDate]);

            if ($projectId) {
                $query->where('project_id', $projectId);
            }

            $completedTasks = $query->get();
            $totalCompleted = $completedTasks->count();

            // Get member completion stats
            $members = User::whereHas('tasks', function($query) use ($startDate, $endDate, $projectId) {
                $query->where('is_completed', true)
                    ->whereBetween('updated_at', [$startDate, $endDate]);
                if ($projectId) {
                    $query->where('project_id', $projectId);
                }
            })->get();

            $memberStats = $members->map(function($member) use ($startDate, $endDate, $projectId) {
                $count = $member->tasks()
                    ->where('is_completed', true)
                    ->whereBetween('updated_at', [$startDate, $endDate]);
                
                if ($projectId) {
                    $count->where('project_id', $projectId);
                }

                return [
                    'user' => [
                        'name' => $member->name
                    ],
                    'count' => $count->count()
                ];
            });

            return [
                'month' => $month,
                'total' => $totalCompleted,
                'members' => $memberStats
            ];
        });

        return response()->json($result);
    }

    public function getRecentlyCompletedTasks(Request $request): JsonResponse
    {
        $projectId = $request->query('project_id');
        
        $query = Task::with(['assignee'])
            ->where('is_completed', true)
            ->orderBy('updated_at', 'desc')
            ->limit(10);

        if ($projectId) {
            $query->where('project_id', $projectId);
        }

        $tasks = $query->get()->map(function($task) {
            return [
                'id' => $task->id,
                'title' => $task->title,
                'assignee' => $task->assignee ? [
                    'name' => $task->assignee->name
                ] : null,
                'completed_at' => $task->updated_at->format('d M Y')
            ];
        });

        return response()->json($tasks);
    }

    public function getOverdueTasks(Request $request)
    {
        $query = Task::with(['label', 'assignee'])
            ->where('due_date', '<', now())
            ->where('is_completed', false);

        if ($request->has('project_id') && $request->project_id) {
            $query->where('project_id', $request->project_id);
        }

        $tasks = $query->get()->map(function ($task) {
            return [
                'id' => $task->id,
                'title' => $task->title,
                'label' => $task->label,
                'assignee' => $task->assignee,
                'due_date' => $task->due_date->format('Y-m-d'),
                'priority' => $task->priority,
            ];
        });

        return response()->json($tasks);
    }

    public function getSharedTasks(Request $request)
    {
        $user = Auth::user();
        $userWorkingUnit = $user->working_unit_id;

        $query = Task::with(['label', 'assignee', 'project'])
            ->join('projects', 'tasks.project_id', '=', 'projects.id')
            ->whereNotNull('share_with')
            ->whereNull('projects.deleted_at')
            ->where('share_with', '!=', '[]');

        if ($request->has('project_id') && $request->project_id) {
            $query->where('project_id', $request->project_id);
        }

        $tasks = $query->get()
            ->filter(function ($task) use ($userWorkingUnit, $user) {
                $shareWith = is_array($task->share_with) ? $task->share_with : json_decode($task->share_with, true);
                // Super admin can see all projects
                if ($user->hasRole('super_admin')) {
                    return true;
                }

                return in_array($userWorkingUnit, $shareWith);
            })
            ->map(function ($task) {
                $shareWith = is_array($task->share_with) ? $task->share_with : json_decode($task->share_with, true);
                $workingUnits = \App\Models\WorkingUnit::whereIn('id', $shareWith)->get();

                return [
                    'id' => $task->id,
                    'title' => $task->title,
                    'description' => $task->description,
                    'label' => $task->label,
                    'assignee' => $task->assignee,
                    'project' => $task->project,
                    'due_date' => $task->due_date->format('Y-m-d'),
                    'priority' => $task->priority,
                    'is_completed' => $task->is_completed,
                    'share_with' => $workingUnits->pluck('name'),
                ];
            });

        return response()->json($tasks);
    }
} 