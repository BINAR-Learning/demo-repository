<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;
use App\Models\Task;
use App\Models\Project;
use App\Models\TaskLabel;
use App\Models\User;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Support\Facades\Auth;

class TestKanbanSpeed extends Command
{
    protected $signature = 'test:kanban-speed {--iterations=3 : Number of test iterations} {--user-id=1 : User ID to test with}';
    protected $description = 'Test the loading speed of the Kanban page';

    public function handle()
    {
        $iterations = (int) $this->option('iterations');
        $userId = (int) $this->option('user-id');
        
        $user = User::find($userId);
        if (!$user) {
            $this->error("User with ID {$userId} not found");
            return 1;
        }

        Auth::login($user);

        $this->info("Testing Kanban speed with {$iterations} iterations for user: {$user->name}");
        $this->newLine();

        $times = [];
        $queryCounts = [];

        for ($i = 0; $i < $iterations; $i++) {
            DB::flushQueryLog();
            DB::enableQueryLog();
            
            $startTime = microtime(true);

            // Simulate the optimized getViewData method
            $this->simulateKanbanLoad();

            $endTime = microtime(true);

            $times[] = ($endTime - $startTime) * 1000; // Convert to milliseconds
            $queryCounts[] = count(DB::getQueryLog());

            DB::disableQueryLog();
        }

        $avgTime = array_sum($times) / count($times);
        $avgQueries = array_sum($queryCounts) / count($queryCounts);

        $this->info("=== PERFORMANCE RESULTS ===");
        $this->line("Average loading time: " . number_format($avgTime, 2) . " ms");
        $this->line("Average query count: " . number_format($avgQueries, 1));
        $this->line("Min time: " . number_format(min($times), 2) . " ms");
        $this->line("Max time: " . number_format(max($times), 2) . " ms");
        $this->line("Min queries: " . min($queryCounts));
        $this->line("Max queries: " . max($queryCounts));

        return 0;
    }

    private function simulateKanbanLoad()
    {
        $user = Auth::user();
        $projectId = Project::first()?->id;

        // Build optimized single query with all relationships
        $query = Task::query()
            ->when($projectId, function (Builder $query) use ($projectId) {
                $query->where('project_id', $projectId);
            });

        // Apply project access authorization
        if (!$user->hasRole('super_admin')) {
            $query->whereHas('project', function (Builder $query) use ($user) {
                $query->where(function ($q) use ($user) {
                    $q->whereHas('members', function ($memberQuery) use ($user) {
                        $memberQuery->where('users.id', $user->id);
                    })
                    ->orWhere('project_manager_id', $user->id);
                });
            });
        }

        // Single query with all relationships loaded
        $allTasks = $query->with([
            'customFieldValues.customField', 
            'project', 
            'assignee', 
            'files', 
            'comments',
            'label'
        ])->get();

        // Get labels in a separate single query
        $labels = TaskLabel::where('project_id', $projectId)
            ->orderBy('order')
            ->get();

        // Group tasks by label in PHP
        $tasksByLabel = $allTasks->groupBy('task_label_id');
    }
} 