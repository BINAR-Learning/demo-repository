<?php

namespace App\Filament\Resources\ProjectCustomFieldResource\Pages;

use App\Filament\Resources\ProjectCustomFieldResource;
use Filament\Actions;
use Filament\Resources\Pages\ListRecords;

class ListProjectCustomFields extends ListRecords
{
    protected static string $resource = ProjectCustomFieldResource::class;

    protected function getHeaderActions(): array
    {
        return [
            Actions\CreateAction::make(),
        ];
    }
} 