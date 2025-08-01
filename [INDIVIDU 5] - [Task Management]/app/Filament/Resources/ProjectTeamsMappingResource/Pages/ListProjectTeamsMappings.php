<?php

namespace App\Filament\Resources\ProjectTeamsMappingResource\Pages;

use App\Filament\Resources\ProjectTeamsMappingResource;
use Filament\Actions;
use Filament\Resources\Pages\ListRecords;

class ListProjectTeamsMappings extends ListRecords
{
    protected static string $resource = ProjectTeamsMappingResource::class;

    protected function getHeaderActions(): array
    {
        return [
            Actions\CreateAction::make(),
        ];
    }
} 