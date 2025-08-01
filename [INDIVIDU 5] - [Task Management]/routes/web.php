<?php

use Illuminate\Support\Facades\Route;
use Illuminate\Http\Request;
use App\Http\Controllers\DashboardController;
use Illuminate\Support\Facades\Http; // Added for Teams integration test

Route::get('/', function () {
    return redirect('/admin');
});

Route::get('/login', [App\Http\Controllers\Auth\LoginController::class, 'showLoginForm'])->name('login');
Route::post('/login', [App\Http\Controllers\Auth\LoginController::class, 'login']);
Route::post('/logout', [App\Http\Controllers\Auth\LoginController::class, 'logout'])->name('logout');

Route::get('/auth/jwt/callback', [App\Http\Controllers\Auth\JwtAuthController::class, 'callback'])
    ->name('auth.jwt.callback');

Route::get('/filament-impersonate/leave', function () {
    auth()->user()->leaveImpersonation();
    return redirect('/admin');
})->name('filament-impersonate.leave');

Route::get('storage/{path}', [App\Http\Controllers\ImageProxyController::class, 'show'])
    ->where('path', '.*')
    ->name('image.proxy');

Route::get('/admin/tasks/kanban', [App\Filament\Resources\TaskResource\Pages\KanbanTasks::class, 'index'])
    ->name('filament.admin.resources.tasks.kanban');

// Dashboard API Routes
Route::get('/api/task-stats', [DashboardController::class, 'getTaskStats']);
Route::get('/api/task-stats-by-label', [DashboardController::class, 'getTaskStatsByLabel']);
Route::get('/api/task-stats-by-priority', [DashboardController::class, 'getTaskStatsByPriority']);
Route::get('/api/member-task-distribution', [DashboardController::class, 'getMemberTaskDistribution']);
Route::get('/api/member-task-completion', [DashboardController::class, 'getMemberTaskCompletion']);
Route::get('/api/monthly-completed-tasks', [DashboardController::class, 'getMonthlyCompletedTasks']);
Route::get('/api/recently-completed-tasks', [DashboardController::class, 'getRecentlyCompletedTasks']);
Route::get('/api/overdue-tasks', [DashboardController::class, 'getOverdueTasks']);
Route::get('/api/shared-tasks', [DashboardController::class, 'getSharedTasks']);

// Teams Integration Test Routes (Adaptive Card Only)
Route::prefix('teams-test')->middleware('auth')->group(function () {
    Route::get('/', [App\Http\Controllers\TeamsTestController::class, 'index'])->name('teams.test');
    Route::post('/adaptive-card', [App\Http\Controllers\TeamsTestController::class, 'testAdaptiveCard'])->name('teams.test.card');
    Route::post('/task-notification', [App\Http\Controllers\TeamsTestController::class, 'testTaskNotification'])->name('teams.test.task');
    Route::post('/custom-card', [App\Http\Controllers\TeamsTestController::class, 'testCustomCard'])->name('teams.test.custom');
});

// Simple test route for quick verification
Route::get('/test-teams-integration', function () {
    if (!config('teams.enabled')) {
        return response()->json(['error' => 'Teams integration is disabled'], 400);
    }

    $webhookUrl = config('teams.workflow_webhook_url');
    
    if (!$webhookUrl) {
        return response()->json(['error' => 'Teams webhook URL not configured'], 400);
    }

    $testPayload = [
        'type' => 'test_message',
        'message' => '🧪 **Teams Integration Test**\n\nThis is a test message from your project management application.\n\n✅ Integration is working correctly!',
        'timestamp' => now()->toISOString(),
        'app_name' => config('app.name'),
    ];

    try {
        $response = Http::timeout(30)
            ->post($webhookUrl, $testPayload);

        if ($response->successful()) {
            return response()->json([
                'success' => true,
                'message' => 'Test message sent successfully to Teams!',
                'response_status' => $response->status(),
                'webhook_url' => $webhookUrl,
            ]);
        } else {
            return response()->json([
                'success' => false,
                'error' => 'Failed to send test message',
                'response_status' => $response->status(),
                'response_body' => $response->body(),
            ], 400);
        }
    } catch (\Exception $e) {
        return response()->json([
            'success' => false,
            'error' => 'Exception occurred: ' . $e->getMessage(),
        ], 500);
    }
})->middleware('auth');
