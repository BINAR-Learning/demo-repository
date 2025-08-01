<?php

namespace App\Filament\Resources\TaskResource\Pages;

use App\Filament\Resources\TaskResource;
use Filament\Resources\Pages\Page;
use Filament\Pages\Actions\Action;
use Filament\Pages\Actions\DeleteAction;
use Filament\Pages\Actions\ViewAction;
use Filament\Pages\Actions\EditAction;
use Filament\Pages\Actions\RestoreAction;
use Filament\Pages\Actions\ForceDeleteAction;

class TaskComments extends Page
{
    protected static string $resource = TaskResource::class;

    protected static string $view = 'filament.resources.task-resource.pages.task-comments';

    protected function getActions(): array
    {
        return [
            Action::make('back')
                ->label('Back to Tasks')
                ->url(route('filament.resources.tasks.index'))
                ->color('secondary'),
        ];
    }
}
 