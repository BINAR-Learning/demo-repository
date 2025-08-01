<?php

namespace App\Filament\Resources;

use App\Filament\Resources\ProjectResource\Pages;
use App\Models\Project;
use Filament\Forms;
use Filament\Forms\Form;
use Filament\Resources\Resource;
use Filament\Tables;
use Filament\Tables\Table;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\SoftDeletingScope;
use Filament\Forms\Components\RichEditor;
use Filament\Forms\Components\Select;
use Filament\Forms\Components\Repeater;
use Filament\Forms\Components\TextInput;
use Filament\Forms\Components\Hidden;
use Filament\Tables\Columns\TextColumn;
use Filament\Tables\Actions\Action;
use Filament\Tables\Actions\BulkActionGroup;
use Filament\Tables\Actions\DeleteBulkAction;
use Filament\Tables\Actions\EditAction;
use Filament\Tables\Actions\ViewAction;
use Filament\Tables\Filters\TrashedFilter;
use Filament\Forms\Components\Grid;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use App\Models\User;
use Filament\Forms\Components\Toggle;
use Filament\Forms\Components\Section;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Auth;
use Filament\Forms\Components\ColorPicker;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Session;

class ProjectResource extends Resource
{
    protected static ?string $model = Project::class;

    protected static ?string $navigationIcon = 'heroicon-o-folder';

    protected static ?string $navigationGroup = 'Project Management';

    protected static ?string $modelLabel = 'Project';

    protected static ?string $pluralModelLabel = 'Projects';

    public static function form(Form $form): Form
    {
        return $form
            ->schema([
                Section::make('Project Information')
                    ->schema([
                        Forms\Components\TextInput::make('name')
                            ->required()
                            ->maxLength(255),
                        Forms\Components\TextInput::make('code')
                            ->required()
                            ->maxLength(255)
                            ->unique(ignoreRecord: true),
                        Forms\Components\RichEditor::make('description')
                            ->columnSpanFull(),
                        Forms\Components\Select::make('status')
                            ->options([
                                'planning' => 'Planning',
                                'in_progress' => 'In Progress',
                                'on_hold' => 'On Hold',
                                'completed' => 'Completed',
                            ])
                            ->required(),
                        Forms\Components\Select::make('member_type')
                            ->label('Member Type')
                            ->options([
                                'internal' => 'Internal (Same Working Unit)',
                                'collaborative_project' => 'Collaborative Project (All Users)',
                            ])
                            ->required()
                            ->default('internal')
                            ->live()
                            ->afterStateUpdated(function ($state, Forms\Set $set) {
                                // Reset members when member_type changes
                                $set('members', []);
                            }),
                        Forms\Components\DatePicker::make('start_date')
                            ->required(),
                        Forms\Components\DatePicker::make('end_date'),
                        Forms\Components\Select::make('project_manager_id')
                            ->label('Project Manager')
                            ->searchable()
                            ->preload()
                            ->required()
                            ->options(function (callable $get, $record) {
                                $memberType = $get('member_type');
                                $selectedIds = [];
                                if ($record && isset($record->project_manager_id)) {
                                    $selectedIds[] = $record->project_manager_id;
                                }
                                if ($memberType === 'internal') {
                                    $users = \App\Models\User::whereHas('workingUnit', function ($query) {
                                        $query->where('id', Auth::user()->working_unit_id);
                                    });
                                } else {
                                    $users = \App\Models\User::select('*');
                                }
                                // Always include selected users
                                if (!empty($selectedIds)) {
                                    $users->orWhereIn('id', $selectedIds);
                                }
                                $users = $users->with(['workingUnit', 'jobPosition' => function($query) {
                                    $query->orderBy('code');
                                }])->get();
                                return $users->groupBy('workingUnit.name')
                                    ->map(function ($users) {
                                        return $users->sortBy(function($user) {
                                            return $user->jobPosition?->code ?? 'ZZZ';
                                        })->mapWithKeys(function ($user) {
                                            return [$user->id => $user->name . ' - ' . ($user->jobPosition?->name ?? 'No Position')];
                                        });
                                    });
                            })
                            ->afterStateHydrated(function (Forms\Components\Select $component, $record) {
                                if ($record && $record->project_manager_id) {
                                    $component->state($record->project_manager_id);
                                }
                            })
                            ->afterStateUpdated(function ($state, Forms\Set $set) {
                                // Reset members when project manager changes
                                $set('members', []);
                            }),
                        Forms\Components\Select::make('members')
                            ->multiple()
                            ->searchable()
                            ->preload()
                            ->options(function (callable $get, $record) {
                                $memberType = $get('member_type');
                                $selectedIds = [];
                                if ($record && method_exists($record, 'members')) {
                                    $selectedIds = $record->members()->pluck('users.id')->toArray();
                                }
                                if ($memberType === 'internal') {
                                    $users = \App\Models\User::whereHas('workingUnit', function ($query) {
                                        $query->where('id', Auth::user()->working_unit_id);
                                    });
                                } else {
                                    $users = \App\Models\User::query();
                                }
                                // Always include selected users
                                if (!empty($selectedIds)) {
                                    $users->orWhereIn('id', $selectedIds);
                                }
                                $users = $users->with(['workingUnit', 'jobPosition' => function($query) {
                                    $query->orderBy('code');
                                }])->get();
                                return $users->groupBy('workingUnit.name')
                                    ->map(function ($users) {
                                        return $users->sortBy(function($user) {
                                            return $user->jobPosition?->code ?? 'ZZZ';
                                        })->mapWithKeys(function ($user) {
                                            return [$user->id => $user->name . ' - ' . ($user->jobPosition?->name ?? 'No Position')];
                                        });
                                    });
                            })
                            ->afterStateHydrated(function (Forms\Components\Select $component, $record) {
                                if ($record) {
                                    $memberIds = $record->members()->pluck('users.id')->toArray();
                                    $component->state($memberIds);
                                }
                            }),
                    ])
                    ->columns(2),
                
                Section::make('Task Labels')
                    ->schema([
                        Forms\Components\Repeater::make('labels')
                            ->schema([
                                Forms\Components\Hidden::make('id'),
                                Forms\Components\TextInput::make('name')
                                    ->required()
                                    ->maxLength(255),
                                Forms\Components\ColorPicker::make('color')
                                    ->required(),
                                Forms\Components\Select::make('icon')
                                    ->options([
                                        'heroicon-o-tag' => 'Tag',
                                        'heroicon-o-flag' => 'Flag',
                                        'heroicon-o-star' => 'Star',
                                        'heroicon-o-bookmark' => 'Bookmark',
                                        'heroicon-o-check-circle' => 'Check Circle',
                                        'heroicon-o-exclamation-circle' => 'Exclamation Circle',
                                        'heroicon-o-x-circle' => 'X Circle',
                                        'heroicon-o-clock' => 'Clock',
                                        'heroicon-o-calendar' => 'Calendar',
                                        'heroicon-o-user' => 'User',
                                        'heroicon-o-users' => 'Users',
                                        'heroicon-o-folder' => 'Folder',
                                        'heroicon-o-document' => 'Document',
                                        'heroicon-o-chart-bar' => 'Chart Bar',
                                        'heroicon-o-chart-pie' => 'Chart Pie',
                                    ])
                                    ->required(),
                                Forms\Components\TextInput::make('order')
                                    ->numeric()
                                    ->default(0),
                            ])
                            ->columns(4)
                            ->defaultItems(0)
                            ->reorderable(false)
                            ->columnSpanFull()
                            ->collapsible()
                            ->itemLabel(fn (array $state): ?string => $state['name'] ?? null)
                            ->afterStateHydrated(function (Forms\Components\Repeater $component, $record) {
                                if ($record) {
                                    $labels = $record->labels()
                                        ->orderBy('order')
                                        ->get()
                                        ->map(function ($label) {
                                            return [
                                                'id' => $label->id,
                                                'name' => $label->name,
                                                'color' => $label->color,
                                                'icon' => $label->icon,
                                                'order' => $label->order,
                                            ];
                                        })
                                        ->toArray();

                                    $component->state($labels);
                                }
                            }),
                    ])
                    ->collapsible()
                    ->compact(),

                Section::make('Custom Fields')
                    ->schema([
                        Forms\Components\Repeater::make('custom_fields')
                            ->schema([
                                Forms\Components\Hidden::make('id'),
                                Forms\Components\TextInput::make('name')
                                    ->required()
                                    ->maxLength(255),
                                Forms\Components\Select::make('type')
                                    ->options([
                                        'text' => 'Text',
                                        'number' => 'Number',
                                        'enum' => 'Enum',
                                        'date' => 'Date',
                                    ])
                                    ->required()
                                    ->live(),
                                Forms\Components\Section::make('Field Settings')
                                    ->schema([
                                        Forms\Components\Toggle::make('is_use_for_filter')
                                            ->default(false),
                                        Forms\Components\Toggle::make('is_required')
                                            ->default(false),
                                        Forms\Components\Toggle::make('is_allow_multiple')
                                            ->default(false)
                                            ->visible(fn (callable $get) => $get('type') === 'enum'),
                                    ]),
                                Forms\Components\Repeater::make('options')
                                    ->schema([
                                        Forms\Components\TextInput::make('value')
                                            ->required()
                                            ->maxLength(255),
                                        Forms\Components\TextInput::make('label')
                                            ->maxLength(255),
                                    ])
                                    ->columns(2)
                                    ->visible(fn (callable $get) => $get('type') === 'enum')
                                    ->required(fn (callable $get) => $get('type') === 'enum'),
                            ])
                            ->columns(2)
                            ->defaultItems(0)
                            ->columnSpanFull()
                            ->reorderable(false)
                            ->collapsible()
                            ->itemLabel(fn (array $state): ?string => $state['name'] ?? null)
                            ->afterStateHydrated(function (Forms\Components\Repeater $component, $record) {
                                if ($record) {
                                    $customFields = $record->customFields()
                                        ->get()
                                        ->map(function ($field) {
                                            $data = [
                                                'id' => $field->id,
                                                'name' => $field->name,
                                                'type' => $field->type,
                                                'is_required' => $field->is_required,
                                                'is_use_for_filter' => $field->is_use_for_filter,
                                                'is_allow_multiple' => $field->is_allow_multiple,
                                                'options' => $field->options,
                                            ];
                                            
                                            Log::info('Loading custom field:', $data);
                                            return $data;
                                        })
                                        ->toArray();

                                    $component->state($customFields);
                                }
                            }),
                    ])
                    ->collapsible()
                    ->compact(),
            ]);
    }

    public static function table(Table $table): Table
    {
        return $table
            ->columns([
                Tables\Columns\TextColumn::make('name')
                    ->searchable()
                    ->sortable(),
                Tables\Columns\TextColumn::make('code')
                    ->searchable()
                    ->sortable(),
                Tables\Columns\TextColumn::make('status')
                    ->badge()
                    ->color(fn (string $state): string => match ($state) {
                        'planning' => 'gray',
                        'in_progress' => 'info',
                        'completed' => 'success',
                        'on_hold' => 'warning',
                        'cancelled' => 'danger',
                    }),
                Tables\Columns\TextColumn::make('projectManager.name')
                    ->label('Project Manager')
                    ->searchable()
                    ->sortable(),
                Tables\Columns\TextColumn::make('start_date')
                    ->date()
                    ->sortable(),
                Tables\Columns\TextColumn::make('end_date')
                    ->date()
                    ->sortable(),
            ])
            ->filters([
                Tables\Filters\TrashedFilter::make(),
            ])
            ->actions([
                Tables\Actions\ViewAction::make(),
                Tables\Actions\EditAction::make(),
                Tables\Actions\Action::make('copy')
                    ->label('Copy Project')
                    ->icon('heroicon-o-document-duplicate')
                    ->visible(fn (Project $record): bool => static::canCopy($record))
                    ->action(function (Project $record) {
                        // Create new project with copied data
                        $newProject = $record->replicate();
                        $newProject->name = $record->name . '-COPY';
                        $newProject->code = $record->code . '-COPY';
                        $newProject->save();

                        // Copy members
                        $record->members->each(function ($member) use ($newProject) {
                            $newProject->members()->attach($member->id);
                        });

                        // Copy labels
                        $record->labels->each(function ($label) use ($newProject) {
                            $newLabel = $label->replicate();
                            $newLabel->project_id = $newProject->id;
                            $newLabel->save();
                        });

                        // Copy custom fields
                        $record->customFields->each(function ($field) use ($newProject) {
                            $newField = $field->replicate();
                            $newField->project_id = $newProject->id;
                            $newField->save();
                        });

                        // Show success notification
                        \Filament\Notifications\Notification::make()
                            ->title('Project copied successfully')
                            ->success()
                            ->send();
                    })
                    ->requiresConfirmation()
                    ->modalHeading('Copy Project')
                    ->modalDescription('Are you sure you want to copy this project? This will create a new project with all members, labels, and custom fields.')
                    ->modalSubmitActionLabel('Yes, copy project'),
                Tables\Actions\DeleteAction::make(),
                Tables\Actions\ForceDeleteAction::make(),
                Tables\Actions\RestoreAction::make(),
            ])
            ->bulkActions([
                Tables\Actions\BulkActionGroup::make([
                    Tables\Actions\DeleteBulkAction::make(),
                    Tables\Actions\ForceDeleteBulkAction::make(),
                    Tables\Actions\RestoreBulkAction::make(),
                ]),
            ]);
    }

    public static function getRelations(): array
    {
        if (request()->routeIs('filament.admin.resources.projects.view')) {
            return [
                \App\Filament\Resources\ProjectResource\RelationManagers\MembersRelationManager::class,
            ];
        }

        return [];
    }

    public static function getPages(): array
    {
        return [
            'index' => Pages\ListProjects::route('/'),
            'create' => Pages\CreateProject::route('/create'),
            'view' => Pages\ViewProject::route('/{record}'),
            'edit' => Pages\EditProject::route('/{record}/edit'),
        ];
    }

    public static function getEloquentQuery(): Builder
    {
        $query = parent::getEloquentQuery();
        $user = Auth::user();

        // Super admin can see all projects
        if ($user->hasRole('super_admin')) {
            return $query;
        }

        // For other users, only show projects where they are manager or member
        return $query->where(function ($query) use ($user) {
            $query->whereHas('members', function ($q) use ($user) {
                $q->where('users.id', $user->id);
            })
            ->orWhere('project_manager_id', $user->id);
        });
    }

    public static function canViewAny(): bool
    {
        return true; // All authenticated users can view projects list
    }

    public static function canView(Model $record): bool
    {
        return true;
    }

    public static function canCreate(): bool
    {
        return true; // All authenticated users can create projects
    }

    public static function canEdit(Model $record): bool
    {
        $user = Auth::user();
        
        // Super admin can edit any project
        return $user->hasRole('super_admin') || $record->project_manager_id == $user->id;
    }

    public static function canDelete(Model $record): bool
    {
        $user = Auth::user();
        
        // Super admin can edit any project
        return $user->hasRole('super_admin') || $record->project_manager_id == $user->id;
    }

    public static function canDeleteAny(): bool
    {
        $user = Auth::user();
        return $user->hasRole('super_admin');
    }

    public static function canCopy(Model $record): bool
    {
        $user = Auth::user();
        return $user->hasRole('super_admin') || $record->project_manager_id == $user->id;
    }

    public static function mutateFormDataBeforeCreate(array $data): array
    {
        Log::info('mutateFormDataBeforeCreate - Input data:', $data);
        Log::info('mutateFormDataBeforeCreate - Members data:', ['members' => $data['members'] ?? []]);

        // Extract members data
        $members = $data['members'] ?? [];
        unset($data['members']);

        // Extract custom fields data
        $customFields = $data['custom_fields'] ?? [];
        unset($data['custom_fields']);

        // Extract labels data
        $labels = $data['labels'] ?? [];
        unset($data['labels']);

        Log::info('Labels data for create:', ['labels' => $labels]);

        // Store data in session for after create
        Session::put('project_members', $members);
        Session::put('project_custom_fields', $customFields);
        Session::put('project_labels', $labels);

        return $data;
    }

    public static function afterCreate(Model $record): void
    {
        Log::info('afterCreate - Record:', $record->toArray());

        // Get data from session
        $members = Session::get('project_members', []);
        $customFields = Session::get('project_custom_fields', []);
        $labels = Session::get('project_labels', []);

        Log::info('afterCreate - Members from session:', ['members' => $members]);
        Log::info('Labels from session:', ['labels' => $labels]);

        // Save members
        if (!empty($members)) {
            Log::info('Syncing members:', ['members' => $members]);
            $record->members()->sync($members);
        } else {
            Log::info('No members to sync');
        }

        // Create custom fields
        if (!empty($customFields)) {
            foreach ($customFields as $field) {
                $fieldData = [
                    'project_id' => $record->id,
                    'name' => $field['name'],
                    'type' => $field['type'],
                    'is_required' => $field['is_required'] ?? false,
                    'is_use_for_filter' => $field['is_use_for_filter'] ?? false,
                    'is_allow_multiple' => $field['is_allow_multiple'] ?? false,
                    'options' => $field['options'] ?? [],
                ];

                \App\Models\ProjectCustomField::create($fieldData);
            }
        }

        // Create labels
        if (!empty($labels)) {
            foreach ($labels as $label) {
                try {
                    $labelData = [
                        'project_id' => $record->id,
                        'name' => $label['name'],
                        'color' => $label['color'],
                        'icon' => $label['icon'],
                    ];

                    Log::info('Creating label:', $labelData);
                    \App\Models\TaskLabel::create($labelData);
                } catch (\Exception $e) {
                    Log::error('Error creating label:', [
                        'error' => $e->getMessage(),
                        'label_data' => $label
                    ]);
                }
            }
        }

        // Clear session data
        Session::forget(['project_members', 'project_custom_fields', 'project_labels']);
    }

    public static function mutateFormDataBeforeSave(array $data): array
    {
        Log::info('mutateFormDataBeforeSave - Input data:', $data);

        // Extract members data
        $members = $data['members'] ?? [];
        unset($data['members']);

        // Extract custom fields data
        $customFields = $data['custom_fields'] ?? [];
        unset($data['custom_fields']);

        // Extract labels data
        $labels = $data['labels'] ?? [];
        unset($data['labels']);

        Log::info('Labels data to save:', ['labels' => $labels]);

        // Store members data in session for after save
        Session::put('project_members', $members);

        // Handle custom fields - get project to access existing fields
        $project = \App\Models\Project::find($data['id']);
        if ($project) {
            // Get existing field IDs
            $existingFieldIds = $project->customFields()->pluck('id')->toArray();
            $newFieldIds = collect($customFields)->pluck('id')->filter()->toArray();

            // Delete fields that are no longer present
            $fieldsToDelete = array_diff($existingFieldIds, $newFieldIds);
            if (!empty($fieldsToDelete)) {
                \App\Models\ProjectCustomField::whereIn('id', $fieldsToDelete)->delete();
            }

            // Create or update custom fields
            if (!empty($customFields)) {
                foreach ($customFields as $field) {
                    $fieldData = [
                        'name' => $field['name'],
                        'type' => $field['type'],
                        'is_required' => $field['is_required'] ?? false,
                        'is_use_for_filter' => $field['is_use_for_filter'] ?? false,
                        'is_allow_multiple' => $field['is_allow_multiple'] ?? false,
                        'options' => $field['options'] ?? [],
                    ];

                    if (isset($field['id'])) {
                        // Update existing field
                        \App\Models\ProjectCustomField::where('id', $field['id'])->update($fieldData);
                    } else {
                        // Create new field
                        $fieldData['project_id'] = $data['id'];
                        \App\Models\ProjectCustomField::create($fieldData);
                    }
                }
            }
        }

        // Create or update labels
        if (!empty($labels)) {
            foreach ($labels as $label) {
                try {
                    $labelData = [
                        'project_id' => $data['id'],
                        'name' => $label['name'],
                        'color' => $label['color'],
                        'icon' => $label['icon'],
                    ];

                    Log::info('Creating/Updating label:', $labelData);

                    if (isset($label['id'])) {
                        // Update existing label
                        \App\Models\TaskLabel::where('id', $label['id'])->update($labelData);
                    } else {
                        // Create new label
                        \App\Models\TaskLabel::create($labelData);
                    }
                } catch (\Exception $e) {
                    Log::error('Error saving label:', [
                        'error' => $e->getMessage(),
                        'label_data' => $label
                    ]);
                }
            }
        }

        return $data;
    }

    public static function afterSave(Model $record): void
    {
        // Get members data from session
        $members = Session::get('project_members', []);

        // Save members
        if (!empty($members)) {
            $record->members()->sync($members);
        }

        // Clear session data
        Session::forget(['project_members']);
    }
} 