<?php

namespace App\Filament\Resources\ProjectResource\Pages;

use App\Filament\Resources\ProjectResource;
use Filament\Actions;
use Filament\Resources\Pages\ViewRecord;
use Filament\Infolists;
use Filament\Infolists\Infolist;

class ViewProject extends ViewRecord
{
    protected static string $resource = ProjectResource::class;

    protected function getHeaderActions(): array
    {
        return [
            Actions\EditAction::make(),
        ];
    }

    public function infolist(Infolist $infolist): Infolist
    {
        return $infolist
            ->schema([
                Infolists\Components\Section::make('Project Details')
                    ->schema([
                        Infolists\Components\TextEntry::make('name'),
                        Infolists\Components\TextEntry::make('description')
                            ->html(),
                        Infolists\Components\TextEntry::make('status')
                            ->badge()
                            ->color(fn (string $state): string => match ($state) {
                                'planning' => 'gray',
                                'in_progress' => 'info',
                                'on_hold' => 'warning',
                                'completed' => 'success',
                                'cancelled' => 'danger',
                            }),
                        Infolists\Components\TextEntry::make('projectManager.name')
                            ->label('Project Manager'),
                        Infolists\Components\TextEntry::make('start_date')
                            ->date(),
                        Infolists\Components\TextEntry::make('end_date')
                            ->date(),
                    ])
                    ->columns(2),
                Infolists\Components\Section::make('Task Labels')
                    ->schema(function ($record) {
                        $labels = $record->labels()
                            ->orderBy('order')
                            ->get()
                            ->map(function ($label) {
                                return Infolists\Components\TextEntry::make("label_{$label->id}")
                                    ->label($label->name)
                                    ->badge()
                                    ->color($label->color)
                                    ->icon($label->icon);
                            })
                            ->toArray();

                        return $labels;
                    })
                    ->collapsible(),
                Infolists\Components\Section::make('Custom Fields')
                    ->schema(function ($record) {
                        $customFields = $record->customFields()
                            ->orderBy('order')
                            ->get()
                            ->map(function ($field) {
                                return Infolists\Components\TextEntry::make("custom_field_{$field->id}")
                                    ->label($field->name)
                                    ->state(function () use ($field) {
                                        $typeLabel = match ($field->type) {
                                            'text' => 'Text Field',
                                            'number' => 'Number Field',
                                            'enum' => 'Enum Field',
                                            'date' => 'Date Field',
                                        };

                                        if ($field->type === 'enum' && !empty($field->options)) {
                                            $options = collect($field->options)
                                                ->map(fn ($option) => $option['value'] ?? $option)
                                                ->join(', ');
                                            return "{$typeLabel} (Options: {$options})";
                                        }

                                        return $typeLabel;
                                    });
                            })
                            ->toArray();

                        return $customFields;
                    })
                    ->collapsible(),
            ]);
    }
} 