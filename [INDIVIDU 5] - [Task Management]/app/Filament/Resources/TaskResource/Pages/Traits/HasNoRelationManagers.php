<?php

namespace App\Filament\Resources\TaskResource\Pages\Traits;

trait HasNoRelationManagers
{
    public function hasRelationManagers(): bool
    {
        return false;
    }
} 