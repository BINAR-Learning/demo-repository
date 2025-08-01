<?php

namespace App\Providers;

use App\Providers\Filament\ThemeProvider;
use Illuminate\Support\ServiceProvider;
use App\Models\Task;
use App\Observers\TaskObserver;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        //
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        $this->app->register(ThemeProvider::class);
        Task::observe(TaskObserver::class);
    }
}
