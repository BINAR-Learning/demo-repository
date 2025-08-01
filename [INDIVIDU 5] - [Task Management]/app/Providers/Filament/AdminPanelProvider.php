<?php

namespace App\Providers\Filament;

use App\Models\Company;
use App\Models\JobPosition;
use App\Models\User;
use App\Models\WorkingUnit;
use Filament\Http\Middleware\Authenticate;
use Filament\Http\Middleware\AuthenticateSession;
use Filament\Http\Middleware\DisableBladeIconComponents;
use Filament\Http\Middleware\DispatchServingFilamentEvent;
use Filament\Navigation\NavigationItem;
use Filament\Pages;
use Filament\Panel;
use Filament\PanelProvider;
use Filament\Support\Colors\Color;
use Filament\Widgets;
use Illuminate\Cookie\Middleware\AddQueuedCookiesToResponse;
use Illuminate\Cookie\Middleware\EncryptCookies;
use Illuminate\Foundation\Http\Middleware\VerifyCsrfToken;
use Illuminate\Routing\Middleware\SubstituteBindings;
use Illuminate\Session\Middleware\StartSession;
use Illuminate\View\Middleware\ShareErrorsFromSession;
use BezhanSalleh\FilamentShield\FilamentShieldPlugin;
use App\Filament\Pages\Auth\Login;
use App\Providers\Filament\ThemeProvider;
use App\Models\Setting;
use App\Filament\Resources\TaskResource;
use App\Filament\Resources\TaskLabelResource;

class AdminPanelProvider extends PanelProvider
{
    public function panel(Panel $panel): Panel
    {
        return $panel
            ->default()
            ->id('admin')
            ->path('/admin')
            ->login(Login::class)
            ->colors([
                'primary' => '#1868db',
            ])
            ->maxContentWidth('full')
            ->discoverResources(in: app_path('Filament/Resources'), for: 'App\\Filament\\Resources')
            ->resources([
                TaskResource::class,
                TaskLabelResource::class,
            ])
            ->discoverPages(in: app_path('Filament/Pages'), for: 'App\\Filament\\Pages')
            ->pages([
                \App\Filament\Pages\Dashboard::class,
                \App\Filament\Pages\LeaveImpersonation::class,
                \App\Filament\Pages\TaskKanban::class,
                \App\Filament\Pages\TaskIntegration::class,
            ])
            ->discoverWidgets(in: app_path('Filament/Widgets'), for: 'App\\Filament\\Widgets')
            ->widgets([])
            ->middleware([
                EncryptCookies::class,
                AddQueuedCookiesToResponse::class,
                StartSession::class,
                AuthenticateSession::class,
                ShareErrorsFromSession::class,
                VerifyCsrfToken::class,
                SubstituteBindings::class,
                DisableBladeIconComponents::class,
                DispatchServingFilamentEvent::class,
            ])
            ->plugins([
                FilamentShieldPlugin::make()
                    ->gridColumns([
                        'default' => 1,
                        'sm' => 2,
                        'lg' => 3
                    ])
                    ->sectionColumnSpan(1)
                    ->checkboxListColumns([
                        'default' => 1,
                        'sm' => 2,
                        'lg' => 4,
                    ])
                    ->resourceCheckboxListColumns([
                        'default' => 1,
                        'sm' => 2,
                    ]),
            ])
            ->authMiddleware([
                Authenticate::class,
            ])
            ->renderHook(
                'panels::head.end',
                fn (): string => '<style>
                    * {
                        font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif !important;
                    }
                    .fi-sidebar {
                        width: 250px !important;
                        min-width: 250px !important;
                        max-width: 250px !important;
                        border-right: 1px solid rgb(229 231 235) !important;
                    }
                    .dark .fi-sidebar {
                        border-right: 1px solid rgb(55 65 81) !important;
                    }
                    .fi-dropdown-panel {
                        background-color: white !important;
                    }
                    .dark .fi-dropdown-panel {
                        background-color: rgb(17 24 39) !important;
                    }
                    .fi-sidebar-header {
                        display: flex !important;
                        align-items: center !important;
                        gap: 0.75rem !important;
                    }
                    .fi-logo {
                        display: flex !important;
                        align-items: center !important;
                        gap: 0.75rem !important;
                    }
                    .fi-sidebar-brand {
                        display: flex !important;
                        align-items: center !important;
                        gap: 0.75rem !important;
                    }
                    .fi-sidebar-header {
                        display: none !important;
                    }
                    .fi-simple-main {
                        width: 400px !important;
                        max-width: 400px !important;
                    }
                    .fi-simple-page .fi-header {
                        display: none !important;
                    }
                    .fi-simple-page .fi-header-heading {
                        display: none !important;
                    }
                    .fi-logo.flex.text-xl.font-bold {
                        display: none !important;
                    }
                    .fi-modal-window {
                        background-color: white !important;
                    }
                    .dark .fi-modal-window {
                        background-color: rgb(17 24 39) !important;
                    }
                </style>
                <link rel="icon" type="image/svg+xml" href="/app-icon.svg">
                <link rel="icon" type="image/x-icon" href="/app-icon.svg">'
            )
            ->renderHook(
                'panels::sidebar.nav.start',
                fn (): string => '<div class="flex items-center gap-3 px-4 py-4">
                    <img src="/app-icon.svg" alt="Taspen" class="h-8 w-8" />
                    <span class="text-lg font-semibold text-gray-900 dark:text-white">T-Project</span>
                </div>'
            )
            ->renderHook(
                'panels::auth.login.form.before',
                fn (): string => '<div class="flex flex-col items-center mb-8">
                    <img src="/app-icon.svg" alt="T-Project" class="h-16 w-16 mb-4" />
                    <h1 class="text-2xl font-bold text-gray-900 dark:text-white">T-Project</h1>
                    <p class="text-sm text-gray-600 dark:text-gray-400 mt-1">Welcome back! Please sign in to your account.</p>
                </div>'
            )
            ->navigationItems([
                NavigationItem::make('Kanban Board')
                    ->icon('heroicon-o-view-columns')
                    ->group('Project Management')
                    ->sort(1)
                    ->url(fn (): string => route('filament.admin.pages.task-kanban')),
            ]);
    }
}
