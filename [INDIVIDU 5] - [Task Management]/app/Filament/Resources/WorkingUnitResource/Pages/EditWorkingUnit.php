<?php

namespace App\Filament\Resources\WorkingUnitResource\Pages;

use App\Filament\Resources\WorkingUnitResource;
use Filament\Actions;
use Filament\Resources\Pages\EditRecord;

class EditWorkingUnit extends EditRecord
{
    protected static string $resource = WorkingUnitResource::class;

    protected function getHeaderActions(): array
    {
        return [
            Actions\DeleteAction::make(),
        ];
    }
}
