<?php

namespace App\Filament\Resources\TaskLabelResource\Pages;

use App\Filament\Resources\TaskLabelResource;
use Filament\Actions;
use Filament\Resources\Pages\ListRecords;

class ListTaskLabels extends ListRecords
{
    protected static string $resource = TaskLabelResource::class;

    protected function getHeaderActions(): array
    {
        return [
            Actions\CreateAction::make(),
        ];
    }
} 