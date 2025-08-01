<?php

namespace App\Filament\Resources\TaskLabelResource\Pages;

use App\Filament\Resources\TaskLabelResource;
use Filament\Actions;
use Filament\Resources\Pages\EditRecord;

class EditTaskLabel extends EditRecord
{
    protected static string $resource = TaskLabelResource::class;

    protected function getHeaderActions(): array
    {
        return [
            Actions\DeleteAction::make(),
        ];
    }
} 