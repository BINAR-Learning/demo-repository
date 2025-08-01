<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Cache;
use App\Models\Task;
use App\Models\Project;
use App\Models\TaskLabel;
use App\Models\User;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Support\Facades\Auth;

class TestKanbanPerformance extends Command
{
    protected $signature = 'test:kanban-performance {--iterations=5 : Number of test iterations} {--user-id=1 : User ID to test with}';
    protected $description = 'Test the performance of the Kanban page and measure query efficiency';

    private $results = [];

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

        $this->info("Testing Kanban performance with {$iterations} iterations for user: {$user->name}");
        $this->newLine();

        // Test 1: Current implementation
        $this->testCurrentImplementation($iterations);

        // Test 2: Optimized implementation
        $this->testOptimizedImplementation($iterations);

        // Test 3: Cached implementation
        $this->testCachedImplementation($iterations);

        // Display results
        $this->displayResults();

        return 0;
    }

    private function testCurrentImplementation($iterations)
    {
        $this->info("Testing current implementation...");
        
        $times = [];
        $queryCounts = [];
        $memoryUsage = [];

        for ($i = 0; $i < $iterations; $i++) {
            DB::flushQueryLog();
            DB::enableQueryLog();
            
            $startTime = microtime(true);
            $startMemory = memory_get_usage();

            // Simulate current implementation
            $this->simulateCurrentImplementation();

            $endTime = microtime(true);
            $endMemory = memory_get_usage();

            $times[] = ($endTime - $startTime) * 1000; // Convert to milliseconds
            $queryCounts[] = count(DB::getQueryLog());
            $memoryUsage[] = $endMemory - $startMemory;

            DB::disableQueryLog();
        }

        $this->results['current'] = [
            'avg_time' => array_sum($times) / count($times),
            'min_time' => min($times),
            'max_time' => max($times),
            'avg_queries' => array_sum($queryCounts) / count($queryCounts),
            'avg_memory' => array_sum($memoryUsage) / count($memoryUsage),
            'times' => $times,
            'query_counts' => $queryCounts,
        ];
    }

    private function testOptimizedImplementation($iterations)
    {
        $this->info("Testing optimized implementation...");
        
        $times = [];
        $queryCounts = [];
        $memoryUsage = [];

        for ($i = 0; $i < $iterations; $i++) {
            DB::flushQueryLog();
            DB::enableQueryLog();
            
            $startTime = microtime(true);
            $startMemory = memory_get_usage();

            // Simulate optimized implementation
            $this->simulateOptimizedImplementation();

            $endTime = microtime(true);
            $endMemory = memory_get_usage();

            $times[] = ($endTime - $startTime) * 1000;
            $queryCounts[] = count(DB::getQueryLog());
            $memoryUsage[] = $endMemory - $startMemory;

            DB::disableQueryLog();
        }

        $this->results['optimized'] = [
            'avg_time' => array_sum($times) / count($times),
            'min_time' => min($times),
            'max_time' => max($times),
            'avg_queries' => array_sum($queryCounts) / count($queryCounts),
            'avg_memory' => array_sum($memoryUsage) / count($memoryUsage),
            'times' => $times,
            'query_counts' => $queryCounts,
        ];
    }

    private function testCachedImplementation($iterations)
    {
        $this->info("Testing cached implementation...");
        
        $times = [];
        $queryCounts = [];
        $memoryUsage = [];

        for ($i = 0; $i < $iterations; $i++) {
            DB::flushQueryLog();
            DB::enableQueryLog();
            
            $startTime = microtime(true);
            $startMemory = memory_get_usage();

            // Simulate cached implementation
            $this->simulateCachedImplementation();

            $endTime = microtime(true);
            $endMemory = memory_get_usage();

            $times[] = ($endTime - $startTime) * 1000;
            $queryCounts[] = count(DB::getQueryLog());
            $memoryUsage[] = $endMemory - $startMemory;

            DB::disableQueryLog();
        }

        $this->results['cached'] = [
            'avg_time' => array_sum($times) / count($times),
            'min_time' => min($times),
            'max_time' => max($times),
            'avg_queries' => array_sum($queryCounts) / count($queryCounts),
            'avg_memory' => array_sum($memoryUsage) / count($memoryUsage),
            'times' => $times,
            'query_counts' => $queryCounts,
        ];
    }

    private function simulateCurrentImplementation()
    {
        $user = Auth::user();
        $projectId = Project::first()?->id;

        // Simulate the current getViewData method
        $query = Task::query()
            ->when($projectId, function (Builder $query) use ($projectId) {
                $query->where('project_id', $projectId);
            });

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

        // Get labels and clone query for each
        $labels = TaskLabel::where('project_id', $projectId)
            ->orderBy('order')
            ->get();

        foreach ($labels as $label) {
            $labelQuery = $query->clone()
                ->where('task_label_id', $label->id)
                ->with(['customFieldValues.customField', 'project', 'assignee', 'files', 'comments'])
                ->get();
        }

        // Get unlabeled tasks
        $unlabeledQuery = $query->clone()
            ->whereNull('task_label_id')
            ->with(['customFieldValues.customField', 'project', 'assignee', 'files', 'comments'])
            ->get();
    }

    private function simulateOptimizedImplementation()
    {
        $user = Auth::user();
        $projectId = Project::first()?->id;

        // Single optimized query with all relationships
        $tasks = Task::query()
            ->when($projectId, function (Builder $query) use ($projectId) {
                $query->where('project_id', $projectId);
            })
            ->with([
                'customFieldValues.customField', 
                'project', 
                'assignee', 
                'files', 
                'comments',
                'label'
            ])
            ->get();

        // Get labels separately (only once)
        $labels = TaskLabel::where('project_id', $projectId)
            ->orderBy('order')
            ->get();

        // Group tasks by label in PHP
        $tasksByLabel = $tasks->groupBy('task_label_id');
    }

    private function simulateCachedImplementation()
    {
        $user = Auth::user();
        $projectId = Project::first()?->id;
        $cacheKey = "kanban_data_{$user->id}_{$projectId}";

        // Try to get from cache first
        $cachedData = Cache::get($cacheKey);
        
        if (!$cachedData) {
            // If not cached, run optimized query and cache for 5 minutes
            $tasks = Task::query()
                ->when($projectId, function (Builder $query) use ($projectId) {
                    $query->where('project_id', $projectId);
                })
                ->with([
                    'customFieldValues.customField', 
                    'project', 
                    'assignee', 
                    'files', 
                    'comments',
                    'label'
                ])
                ->get();

            $labels = TaskLabel::where('project_id', $projectId)
                ->orderBy('order')
                ->get();

            $cachedData = [
                'tasks' => $tasks,
                'labels' => $labels,
                'timestamp' => now()
            ];

            Cache::put($cacheKey, $cachedData, 300); // 5 minutes
        }

        // Use cached data
        $tasks = $cachedData['tasks'];
        $labels = $cachedData['labels'];
    }

    private function displayResults()
    {
        $this->newLine();
        $this->info("=== PERFORMANCE TEST RESULTS ===");
        $this->newLine();

        $headers = ['Implementation', 'Avg Time (ms)', 'Min Time (ms)', 'Max Time (ms)', 'Avg Queries', 'Avg Memory (bytes)'];
        $rows = [];

        foreach (['current', 'optimized', 'cached'] as $implementation) {
            $data = $this->results[$implementation];
            $rows[] = [
                ucfirst($implementation),
                number_format($data['avg_time'], 2),
                number_format($data['min_time'], 2),
                number_format($data['max_time'], 2),
                number_format($data['avg_queries'], 1),
                number_format($data['avg_memory']),
            ];
        }

        $this->table($headers, $rows);

        // Calculate improvements
        $this->newLine();
        $this->info("=== IMPROVEMENTS ===");
        
        $currentTime = $this->results['current']['avg_time'];
        $currentQueries = $this->results['current']['avg_queries'];
        
        $optimizedTime = $this->results['optimized']['avg_time'];
        $optimizedQueries = $this->results['optimized']['avg_queries'];
        
        $cachedTime = $this->results['cached']['avg_time'];
        $cachedQueries = $this->results['cached']['avg_queries'];

        $this->line("Optimized vs Current:");
        $this->line("  Time improvement: " . number_format((($currentTime - $optimizedTime) / $currentTime) * 100, 1) . "%");
        $this->line("  Query reduction: " . number_format((($currentQueries - $optimizedQueries) / $currentQueries) * 100, 1) . "%");
        
        $this->newLine();
        $this->line("Cached vs Current:");
        $this->line("  Time improvement: " . number_format((($currentTime - $cachedTime) / $currentTime) * 100, 1) . "%");
        $this->line("  Query reduction: " . number_format((($currentQueries - $cachedQueries) / $currentQueries) * 100, 1) . "%");

        $this->newLine();
        $this->info("=== RECOMMENDATIONS ===");
        $this->line("1. Implement optimized query structure (single query with eager loading)");
        $this->line("2. Add caching for frequently accessed data");
        $this->line("3. Consider pagination for large datasets");
        $this->line("4. Optimize custom field queries");
        $this->line("5. Use database indexes on frequently filtered columns");
    }
} 