<?php

namespace App\Filament\Widgets;

use App\Models\WorkingUnit;
use App\Models\User;
use App\Models\JobPosition;
use Filament\Widgets\StatsOverviewWidget as BaseWidget;
use Filament\Widgets\StatsOverviewWidget\Stat;

class WorkingUnitStatsWidget extends BaseWidget
{
    protected static ?string $pollingInterval = null;

    protected int | string | array $columnSpan = 'full';

    protected function getStats(): array
    {
        return [
            Stat::make('Total Working Units', WorkingUnit::count())
                ->description('Total number of working units')
                ->descriptionIcon('heroicon-m-building-office-2')
                ->color('success')
                ->chart([7, 3, 4, 5, 6, 3, 5, 3])
                ->extraAttributes([
                    'class' => 'bg-gray-800',
                ]),
            Stat::make('Total Users', User::count())
                ->description('Total number of users')
                ->descriptionIcon('heroicon-m-users')
                ->color('info')
                ->chart([8, 4, 6, 5, 3, 2, 5, 4])
                ->extraAttributes([
                    'class' => 'bg-gray-800',
                ]),
            Stat::make('Total Job Positions', JobPosition::count())
                ->description('Total number of job positions')
                ->descriptionIcon('heroicon-m-briefcase')
                ->color('warning')
                ->chart([3, 5, 7, 6, 3, 5, 2, 4])
                ->extraAttributes([
                    'class' => 'bg-gray-800',
                ]),
            Stat::make('Active Companies', WorkingUnit::distinct('company_id')->count())
                ->description('Number of companies with working units')
                ->descriptionIcon('heroicon-m-building-office')
                ->color('success')
                ->chart([4, 5, 3, 6, 3, 5, 7, 4])
                ->extraAttributes([
                    'class' => 'bg-gray-800',
                ]),
        ];
    }

    protected function getColumns(): int
    {
        return 4;
    }
} 