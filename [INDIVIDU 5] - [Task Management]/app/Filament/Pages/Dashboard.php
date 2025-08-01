<?php

namespace App\Filament\Pages;

use App\Models\Task;
use App\Models\TaskLabel;
use App\Models\User;
use App\Models\Project;
use Filament\Pages\Page;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\Auth;

class Dashboard extends Page
{
    protected static ?string $navigationIcon = 'heroicon-o-home';

    protected static string $view = 'filament.pages.dashboard';

    protected static ?string $navigationLabel = 'Dashboard';

    protected static ?string $title = 'Dashboard';

    protected static ?string $slug = 'custom-dashboard';

    public $selectedProject = '';

    public function mount()
    {
        $this->selectedProject = '';
    }

    public function getProjects()
    {
        $user = Auth::user();
        
        // Super admin can see all projects
        if ($user->hasRole('super_admin')) {
            return Project::all();
        }
        
        // For other users, only show projects where they are manager or member
        return Project::where(function ($query) use ($user) {
            $query->whereHas('members', function ($q) use ($user) {
                $q->where('users.id', $user->id);
            })
            ->orWhere('project_manager_id', $user->id);
        })->get();
    }

    protected function getProjectFilter()
    {
        return $this->selectedProject ? ['project_id' => $this->selectedProject] : [];
    }

    public function getHeaderWidgets(): array
    {
        return [];
    }

    public function getFooterWidgets(): array
    {
        return [];
    }

    public function getHeaderWidgetsColumns(): int | array
    {
        return 1;
    }

    public function getFooterWidgetsColumns(): int | array
    {
        return 1;
    }

    public function getTasksByLabel()
    {
        $query = TaskLabel::query();

        if ($this->selectedProject) {
            $query->whereHas('tasks', function ($q) {
                $q->where('project_id', $this->selectedProject);
            });
        }

        return $query->withCount(['tasks' => function ($query) {
            $query->where('is_completed', false)
                ->when($this->selectedProject, function ($query) {
                    $query->where('project_id', $this->selectedProject);
                });
        }])
        ->withCount(['tasks as completed_tasks_count' => function ($query) {
            $query->where('is_completed', true)
                ->when($this->selectedProject, function ($query) {
                    $query->where('project_id', $this->selectedProject);
                });
        }])
        ->withCount(['tasks as overdue_tasks_count' => function ($query) {
            $query->where('is_completed', false)
                ->whereNotNull('due_date')
                ->where('due_date', '<', now())
                ->when($this->selectedProject, function ($query) {
                    $query->where('project_id', $this->selectedProject);
                });
        }])
        ->get();
    }

    public function getMemberTasks()
    {
        $query = User::query();

        if ($this->selectedProject) {
            $query->whereHas('tasks', function ($q) {
                $q->where('project_id', $this->selectedProject);
            });
        }

        return $query->with(['tasks' => function ($query) {
            $query->where('is_completed', false)
                ->when($this->selectedProject, function ($query) {
                    $query->where('project_id', $this->selectedProject);
                });
        }])->get()->map(function ($user) {
            $tasks = $user->tasks->groupBy('task_label_id');
            $taskCounts = [];
            
            foreach ($tasks as $labelId => $labelTasks) {
                $label = TaskLabel::find($labelId);
                if ($label) {
                    $taskCounts[$label->name] = $labelTasks->count();
                }
            }
            
            return [
                'user' => $user,
                'task_counts' => $taskCounts,
                'total_tasks' => $user->tasks->count()
            ];
        })->filter(function ($memberData) {
            return $memberData['total_tasks'] > 0;
        });
    }

    public function getOverdueTasks()
    {
        $query = Task::query()
            ->where('is_completed', false)
            ->whereNotNull('due_date')
            ->where('due_date', '<', Carbon::now())
            ->when($this->selectedProject, function ($query) {
                $query->where('project_id', $this->selectedProject);
            })
            ->with(['project', 'assignee', 'label']);

        return $query->get();
    }

    public function getCompletedTasks()
    {
        $query = Task::query()
            ->where('is_completed', true)
            ->when($this->selectedProject, function ($query) {
                $query->where('project_id', $this->selectedProject);
            })
            ->with(['project', 'assignee', 'label'])
            ->latest('updated_at')
            ->take(5);

        return $query->get();
    }

    public function getMonthlyCompletedTasks()
    {
        $currentYear = now()->year;
        $months = collect(range(1, 12))->map(function ($month) use ($currentYear) {
            $startDate = now()->setYear($currentYear)->setMonth($month)->startOfMonth();
            $endDate = $startDate->copy()->endOfMonth();

            $query = Task::query()
                ->where('is_completed', true)
                ->whereBetween('completed_at', [$startDate, $endDate])
                ->when($this->selectedProject, function ($query) {
                    $query->where('project_id', $this->selectedProject);
                })
                ->with('assignee');

            $tasks = $query->get();

            $memberStats = $tasks->groupBy('assigned_to')
                ->map(function ($userTasks, $userId) {
                    $user = $userTasks->first()->assignee;
                    return [
                        'user' => $user,
                        'count' => $userTasks->count()
                    ];
                })
                ->values();

            return [
                'month' => $startDate->format('F'),
                'total' => $tasks->count(),
                'members' => $memberStats
            ];
        });

        return $months;
    }

    public function redirectToTask($taskId)
    {
        return redirect()->route('filament.admin.resources.tasks.view', ['record' => $taskId]);
    }

    public function redirectToTaskKanban()
    {
        return redirect()->route('filament.admin.pages.task-kanban');
    }

    public function getTotalTasks(): int
    {
        $query = Task::query();
        if ($this->selectedProject) {
            $query->where('project_id', $this->selectedProject);
        }
        return $query->count();
    }

    public function getCompletedTasksCount(): int
    {
        $query = Task::query()->where('is_completed', true);
        if ($this->selectedProject) {
            $query->where('project_id', $this->selectedProject);
        }
        return $query->count();
    }

    public function getOverdueTasksCount(): int
    {
        $query = Task::query()
            ->where('is_completed', false)
            ->where('due_date', '<', now());
        
        if ($this->selectedProject) {
            $query->where('project_id', $this->selectedProject);
        }
        
        return $query->count();
    }

    public function updatedSelectedProject()
    {
        \Log::info('Project filter changed to: ' . $this->selectedProject);
        \Log::info('Dispatching projectFilterChanged event');
        $this->dispatch('projectFilterChanged');
        \Log::info('Event dispatched');
    }

    public function getMemberTaskChartData()
    {
        $members = $this->getMemberTasks();
        $labels = [];
        $completed = [];
        $total = [];

        foreach ($members as $memberData) {
            $labels[] = $memberData['user']->name;
            $completed[] = $memberData['user']->tasks()
                ->where('is_completed', true)
                ->when($this->selectedProject, function ($query) {
                    $query->where('project_id', $this->selectedProject);
                })->count();
            $total[] = $memberData['total_tasks'];
        }

        return [
            'labels' => $labels,
            'completed' => $completed,
            'total' => $total,
        ];
    }

    /**
     * Get task count by priority for the selected project
     */
    public function getTaskPriorityStats()
    {
        $query = \App\Models\Task::query();
        if ($this->selectedProject) {
            $query->where('project_id', $this->selectedProject);
        }
        $priorities = ['high', 'medium', 'low'];
        $counts = [];
        foreach ($priorities as $priority) {
            $counts[$priority] = (clone $query)->where('priority', $priority)->count();
        }
        // Count tasks with no priority
        $counts['none'] = (clone $query)->whereNull('priority')->orWhere('priority', '')->count();
        return $counts;
    }
} 