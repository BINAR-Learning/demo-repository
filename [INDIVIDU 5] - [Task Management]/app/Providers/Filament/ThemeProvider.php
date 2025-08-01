<?php

namespace App\Providers\Filament;

use App\Models\Setting;
use Filament\Support\Colors\Color;
use Filament\Support\Facades\FilamentColor;
use Filament\View\PanelsRenderHook;
use Illuminate\Support\ServiceProvider;
use Filament\Facades\Filament;
use Illuminate\Support\Facades\Schema;
use Filament\Panel;

class ThemeProvider extends ServiceProvider
{
    public function boot(): void
    {
        // Check if settings table exists before trying to access it
        if (!Schema::hasTable('settings')) {
            return;
        }

        try {
            $settings = Setting::getSettings();

            // Apply site name
            config(['app.name' => $settings->site_name]);

            // Apply button colors
            if ($settings->button_colors) {
                // Register the colors
                FilamentColor::register([
                    'success' => Color::hex($settings->button_colors['success']),
                    'warning' => Color::hex($settings->button_colors['warning']),
                    'danger' => Color::hex($settings->button_colors['danger']),
                    'info' => Color::hex($settings->button_colors['info']),
                ]);

                // Apply the colors to the panel
                Filament::serving(function () use ($settings) {
                    Filament::getCurrentPanel()
                        ->colors([
                            'success' => Color::hex($settings->button_colors['success']),
                            'warning' => Color::hex($settings->button_colors['warning']),
                            'danger' => Color::hex($settings->button_colors['danger']),
                            'info' => Color::hex($settings->button_colors['info']),
                        ]);
                });
            }

            // Apply logo to sidebar
            // if ($settings->site_logo) {
            //     $this->applyLogoToSidebar($settings);
            // }
        } catch (\Exception $e) {
            // Log the error but don't break the application
            \Log::error('ThemeProvider error: ' . $e->getMessage());
        }
    }

    protected function applyLogoToSidebar(Setting $settings): void
    {
        Filament::registerRenderHook(
            PanelsRenderHook::SIDEBAR_NAV_START,
            fn() => view('filament.theme.sidebar-logo', [
                'logo' => $settings->site_logo,
                'siteName' => $settings->site_name
            ])
        );
    }
}
