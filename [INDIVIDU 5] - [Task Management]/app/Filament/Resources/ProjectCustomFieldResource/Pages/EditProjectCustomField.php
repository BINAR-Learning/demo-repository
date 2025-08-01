<?php

namespace App\Filament\Resources\ProjectCustomFieldResource\Pages;

use App\Filament\Resources\ProjectCustomFieldResource;
use Filament\Actions;
use Filament\Resources\Pages\EditRecord;

class EditProjectCustomField extends EditRecord
{
    protected static string $resource = ProjectCustomFieldResource::class;

    protected function getHeaderActions(): array
    {
        return [
            Actions\DeleteAction::make(),
            Actions\ForceDeleteAction::make(),
            Actions\RestoreAction::make(),
        ];
    }
} 