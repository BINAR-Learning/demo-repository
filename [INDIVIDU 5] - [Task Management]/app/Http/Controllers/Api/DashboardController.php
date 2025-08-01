<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Task;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class DashboardController extends Controller
{
    /**
     * Get task statistics for the dashboard
     *
     * @param Request $request
     * @return JsonResponse
     */
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
} 