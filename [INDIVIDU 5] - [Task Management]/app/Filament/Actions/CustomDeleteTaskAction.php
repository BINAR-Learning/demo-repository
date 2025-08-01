<?php

namespace App\Filament\Actions;

use Filament\Actions\Action;
use Illuminate\Support\Facades\Route;
use Illuminate\Support\Facades\Redirect;

class CustomDeleteTaskAction extends Action
{
    public static function make(?string $name = null): static
    {
        return parent::make($name)
            ->label('Delete')
            ->icon('heroicon-o-trash')
            ->color('danger')
            ->requiresConfirmation()
            ->modalHeading('Delete Task')
            ->modalDescription('Are you sure you want to delete this task? This action cannot be undone.')
            ->modalSubmitActionLabel('Yes, delete it')
            ->action(function ($record) {
                $record->delete();
                
                // Redirect to kanban board with project context
                return Redirect::route('filament.admin.pages.task-kanban', ['project_id' => $record->project_id]);
            });
    }
} 