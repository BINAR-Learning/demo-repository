<?php

namespace App\Filament\Resources;

use Z3d0X\FilamentLogger\Resources\ActivityResource as BaseActivityResource;
use Illuminate\Support\Facades\Auth;

class ActivityResource extends BaseActivityResource
{
    protected static ?string $navigationGroup = 'Settings';

    protected static ?int $navigationSort = 100;

    public static function shouldRegisterNavigation(): bool
    {
        return Auth::check() && Auth::user()->hasRole('super_admin');
    }

    public static function canAccess(): bool
    {
        return Auth::check() && Auth::user()->hasRole('super_admin');
    }

    public static function getNavigationLabel(): string
    {
        return 'Activity Log';
    }

    public static function getNavigationIcon(): string
    {
        return 'heroicon-o-clipboard-document-list';
    }

    public static function getNavigationGroup(): ?string
    {
        return Auth::check() && Auth::user()->hasRole('super_admin') ? 'Settings' : null;
    }

    public static function getNavigationSort(): ?int
    {
        return Auth::check() && Auth::user()->hasRole('super_admin') ? 100 : null;
    }
} 