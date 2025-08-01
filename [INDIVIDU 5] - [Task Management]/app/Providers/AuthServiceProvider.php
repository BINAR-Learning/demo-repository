<?php

namespace App\Providers;

use App\Auth\ApiGuard;
use App\Models\Task;
use App\Models\TaskLabel;
use App\Policies\TaskPolicy;
use App\Policies\TaskLabelPolicy;
use Illuminate\Foundation\Support\Providers\AuthServiceProvider as ServiceProvider;
use Illuminate\Support\Facades\Auth;

class AuthServiceProvider extends ServiceProvider
{
    /**
     * The model to policy mappings for the application.
     *
     * @var array<class-string, class-string>
     */
    protected $policies = [
        Task::class => TaskPolicy::class,
        TaskLabel::class => TaskLabelPolicy::class,
    ];

    /**
     * Register any authentication / authorization services.
     */
    public function boot(): void
    {
        Auth::extend('api_guard', function ($app, $name, array $config) {
            return new ApiGuard(
                Auth::createUserProvider($config['provider']),
                $app['request'],
                $app->make(\App\Services\ApiAuthService::class)
            );
        });

        Auth::provider('username', function ($app, array $config) {
            return new UsernameUserProvider($app->make('hash'), $config['model']);
        });

        $this->registerPolicies();
    }
} 