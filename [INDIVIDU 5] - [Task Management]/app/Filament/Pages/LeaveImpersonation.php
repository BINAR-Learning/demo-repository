<?php

namespace App\Filament\Pages;

use Filament\Pages\Page;
use Illuminate\Support\Facades\Auth;

class LeaveImpersonation extends Page
{
    protected static ?string $slug = 'leave-impersonation';

    protected static string $view = 'filament.pages.leave-impersonation';

    public static function shouldRegisterNavigation(): bool
    {
        return false;
    }

    public function mount(): void
    {
        if (Auth::user()->isImpersonated()) {
            Auth::user()->leaveImpersonation();
        }
        
        // $this->redirect(route('filament.admin.pages.custom-dashboard'));
    }
} 