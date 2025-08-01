<?php

namespace App\Filament\Resources\ProjectTeamsMappingResource\Pages;

use App\Filament\Resources\ProjectTeamsMappingResource;
use Filament\Actions;
use Filament\Resources\Pages\EditRecord;

class EditProjectTeamsMapping extends EditRecord
{
    protected static string $resource = ProjectTeamsMappingResource::class;

    protected function getHeaderActions(): array
    {
        return [
            Actions\DeleteAction::make(),
        ];
    }
} 