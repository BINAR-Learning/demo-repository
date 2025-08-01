<?php

namespace App\Filament\Resources;

use App\Filament\Resources\TaskResource\Pages;
use App\Filament\Resources\TaskResource\RelationManagers;
use App\Models\Task;
use Filament\Forms;
use Filament\Forms\Form;
use Filament\Resources\Resource;
use Filament\Tables;
use Filament\Tables\Table;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\SoftDeletingScope;

use Illuminate\Support\Str;
use Filament\Navigation\NavigationItem;
use Filament\Forms\Components\TextInput;
use Filament\Forms\Components\RichEditor;
use Filament\Forms\Components\Select;
use Filament\Forms\Components\DatePicker;
use Filament\Forms\Components\FileUpload;
use Filament\Forms\Components\Section;
use Illuminate\Support\Facades\Auth;
use Filament\Forms\Components\Toggle;
use Filament\Forms\Components\DateTimePicker;
use App\Filament\Resources\TaskResource\Pages\EditTask;
use App\Models\Project;
use App\Models\TaskLabel;
use App\Models\User;
use App\Models\TaskFile;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\File;
use Spatie\Permission\Models\Role;
use function request;

class TaskResource extends Resource
{
    protected static ?string $model = Task::class;

    protected static ?string $navigationIcon = 'heroicon-o-rectangle-stack';

    protected static ?string $navigationGroup = 'Project Management';

    protected static ?string $modelLabel = 'Task';

    protected static ?string $pluralModelLabel = 'Tasks';

    public static function form(Form $form): Form
    {
        return $form
            ->schema([
                Forms\Components\Section::make()
                    ->schema([
                        Forms\Components\TextInput::make('title')
                            ->required()
                            ->columnSpanFull()
                            ->maxLength(255),
                        Forms\Components\RichEditor::make('description')
                            ->columnSpanFull(),
                        Forms\Components\Select::make('project_id')
                            ->relationship('project', 'name')
                            ->required()
                            ->default(request()->get('project_id'))
                            ->hidden(fn () => request()->has('project_id'))
                            ->live()
                            ->options(function () {
                                $user = Auth::user();
                                
                                // Super admin can see all projects
                                if ($user->is_admin) {
                                    return Project::pluck('name', 'id');
                                }
                                
                                // For other users, only show projects where they are manager or member
                                return Project::where(function ($query) use ($user) {
                                    $query->whereHas('members', function ($q) use ($user) {
                                        $q->where('users.id', $user->id);
                                    })
                                    ->orWhere('project_manager_id', $user->id);
                                })
                                ->pluck('name', 'id');
                            })
                            ->afterStateUpdated(function ($state, Forms\Set $set) {
                                // Reset custom field values when project changes
                                $set('custom_fields', []);
                            }),
                        Forms\Components\Select::make('task_label_id')
                            ->label('Label')
                            ->relationship('label', 'name')
                            ->required()
                            ->options(function (Forms\Get $get) {
                                $projectId = $get('project_id');
                                if (!$projectId) {
                                    return [];
                                }
                                return TaskLabel::where('project_id', $projectId)
                                    ->pluck('name', 'id');
                            }),
                        Forms\Components\Select::make('assigned_to')
                            ->label('Assignee')
                            ->options(function (Forms\Get $get) {
                                $projectId = $get('project_id');
                                if (!$projectId) {
                                    return User::pluck('name', 'id');
                                }
                                return User::whereHas('projects', function ($query) use ($projectId) {
                                    $query->where('projects.id', $projectId);
                                })->pluck('name', 'id');
                            })
                            ->required()
                            ->searchable(),
                        Forms\Components\DatePicker::make('due_date')
                            ->required(),
                        Forms\Components\Select::make('priority')
                            ->options([
                                'low' => 'Low',
                                'medium' => 'Medium',
                                'high' => 'High',
                            ])
                            ->required(),
                        Forms\Components\Select::make('share_with')
                            ->label('Share With')
                            ->multiple()
                            ->options(function (Forms\Get $get) {
                                $projectId = $get('project_id');
                                if (!$projectId) {
                                    return \App\Models\WorkingUnit::pluck('name', 'id');
                                }

                                $project = \App\Models\Project::find($projectId);
                                if (!$project) {
                                    return \App\Models\WorkingUnit::pluck('name', 'id');
                                }

                                // Get project manager's working unit
                                $projectManager = $project->projectManager;
                                if (!$projectManager || !$projectManager->jobPosition) {
                                    return \App\Models\WorkingUnit::pluck('name', 'id');
                                }

                                // Get working units from the same company as project manager's working unit
                                return \App\Models\WorkingUnit::where('company_id', $projectManager->workingUnit->company_id)
                                    ->pluck('name', 'id');
                            })
                            ->searchable()
                            ->preload(),
                        Forms\Components\Toggle::make('is_completed')
                            ->label('Mark as Completed')
                            ->helperText('This will record the completion date')
                            ->visible(fn ($livewire) => $livewire instanceof EditTask)
                            ->afterStateUpdated(function ($state, Forms\Set $set) {
                                if ($state) {
                                    $set('completed_at', now());
                                }
                            }),
                        Forms\Components\DateTimePicker::make('completed_at')
                            ->label('Completed At')
                            ->visible(fn ($livewire) => $livewire instanceof EditTask)
                            ->disabled(),
                        Forms\Components\FileUpload::make('uploaded_files')
                            ->label('Upload New Files')
                            ->disk('ftp')
                            ->directory('task-files')
                            ->preserveFilenames()
                            ->downloadable()
                            ->openable()
                            ->multiple()
                            ->columnSpanFull(),
                    ])
                    ->columns(2),
            ]);
    }

    public static function table(Table $table): Table
    {
        return $table
            ->columns([
                Tables\Columns\TextColumn::make('title')
                    ->searchable(),
                Tables\Columns\TextColumn::make('project.name')
                    ->sortable(),
                Tables\Columns\TextColumn::make('label.name')
                    ->sortable(),
                Tables\Columns\TextColumn::make('assignee.name')
                    ->sortable(),
                Tables\Columns\TextColumn::make('due_date')
                    ->date()
                    ->sortable(),
                Tables\Columns\IconColumn::make('is_completed')
                    ->label('Completed')
                    ->boolean()
                    ->sortable(),
                Tables\Columns\TextColumn::make('status')
                    ->badge()
                    ->color(fn (string $state): string => match ($state) {
                        'todo' => 'gray',
                        'in_progress' => 'info',
                        'done' => 'success',
                    }),
                Tables\Columns\TextColumn::make('priority')
                    ->badge()
                    ->color(fn (string $state): string => match ($state) {
                        'low' => 'gray',
                        'medium' => 'info',
                        'high' => 'danger',
                    }),
                Tables\Columns\TextColumn::make('created_at')
                    ->dateTime()
                    ->sortable()
                    ->toggleable(isToggledHiddenByDefault: true),
                Tables\Columns\TextColumn::make('updated_at')
                    ->dateTime()
                    ->sortable()
                    ->toggleable(isToggledHiddenByDefault: true),
            ])
            ->filters([
                Tables\Filters\TrashedFilter::make(),
                Tables\Filters\SelectFilter::make('is_completed')
                    ->label('Completion Status')
                    ->options([
                        '0' => 'Not Completed',
                        '1' => 'Completed',
                    ])
                    ->default('0'),
            ])
            ->actions([
                Tables\Actions\ViewAction::make(),
                Tables\Actions\EditAction::make()
                    ->visible(function ($record) {
                        $user = Auth::user();
                        
                        // Super admin can edit any task
                        if ($user->hasRole('super_admin') || $user->is_admin) {
                            return true;
                        }
                        // Task assignee can edit their own task
                        if ($record->assigned_to == $user->id) {
                            return true;
                        }
                        // Project manager can edit any task in their project
                        if ($record->project && $record->project->project_manager_id == $user->id) {
                            return true;
                        }
                        
                        return false;
                    }),
            ])
            ->bulkActions([
                Tables\Actions\BulkActionGroup::make([
                    Tables\Actions\DeleteBulkAction::make()
                        ->visible(function () {
                            $user = Auth::user();
                            return $user->hasRole('super_admin') || $user->is_admin;
                        }),
                    Tables\Actions\ForceDeleteBulkAction::make()
                        ->visible(function () {
                            $user = Auth::user();
                            return $user->hasRole('super_admin') || $user->is_admin;
                        }),
                    Tables\Actions\RestoreBulkAction::make()
                        ->visible(function () {
                            $user = Auth::user();
                            return $user->hasRole('super_admin') || $user->is_admin;
                        }),
                ]),
            ]);
    }

    public static function getRelations(): array
    {
        return [];
    }

    public static function getPages(): array
    {
        return [
            'index' => Pages\ListTasks::route('/'),
            'create' => Pages\CreateTask::route('/create'),
            'view' => Pages\ViewTask::route('/{record}'),
            'edit' => Pages\EditTask::route('/{record}/edit'),
        ];
    }

    public static function getEloquentQuery(): Builder
    {
        return parent::getEloquentQuery();
    }

    // public static function getNavigationBadge(): ?string
    // {
    //     return static::getModel()::count();
    // }

    public static function getNavigationBadgeColor(): ?string
    {
        return static::getModel()::count() > 10 ? 'warning' : 'primary';
    }

    public static function getNavigationItems(): array
    {
        return parent::getNavigationItems();
    }

    public static function shouldRegisterNavigation(): bool
    {
        $user = Auth::user();
        // Super admin can edit any task
        if ($user->hasRole('super_admin') || $user->is_admin) {
            return true;
        }
        return false;
    }

    protected function afterCreate(): void
    {
        $record = $this->getRecord();
        $formData = $this->getFormData();
        
        // Handle custom fields
        if (isset($formData['custom_fields'])) {
            foreach ($formData['custom_fields'] as $fieldId => $fieldData) {
                $record->customFieldValues()->create([
                    'project_custom_field_id' => $fieldId,
                    'value' => $fieldData['value']
                ]);
            }
        }

        // Handle files
        if (isset($formData['uploaded_files'])) {
            foreach ($formData['uploaded_files'] as $file) {
                // Skip if file is already a string (existing file)
                if (is_string($file)) {
                    continue;
                }

                try {
                    // Debug information
                    \Illuminate\Support\Facades\Log::info('Attempting to upload file:', [
                        'file_name' => $file->getClientOriginalName(),
                        'mime_type' => $file->getMimeType(),
                        'is_valid' => $file->isValid()
                    ]);

                    // Validate file
                    if (!$file->isValid()) {
                        throw new \Exception('Invalid file upload');
                    }

                    // Get the file path from the uploaded file
                    $filePath = $file->getClientOriginalName();
                    $fullPath = 'task-files/' . $filePath;

                    // Store in FTP using Livewire's store method
                    $storedPath = $file->storeAs('task-files', $filePath, 'ftp');
                    if (!$storedPath) {
                        throw new \Exception('Failed to store file in FTP');
                    }
                    
                    // Create record in database
                    $taskFile = $record->files()->create([
                        'task_id' => $record->id,
                        'file_name' => $filePath,
                        'file_path' => $fullPath,
                        'file_type' => $file->getMimeType() ?: 'application/octet-stream',
                        'file_size' => $file->getSize(),
                        'uploaded_by' => Auth::id()
                    ]);

                    // Log success
                    \Illuminate\Support\Facades\Log::info('File uploaded successfully:', [
                        'task_file_id' => $taskFile->id,
                        'file_path' => $fullPath,
                        'stored_path' => $storedPath
                    ]);

                } catch (\Exception $e) {
                    // Log detailed error information
                    \Illuminate\Support\Facades\Log::error('Error uploading file:', [
                        'error' => $e->getMessage(),
                        'error_trace' => $e->getTraceAsString(),
                        'file' => $file->getClientOriginalName(),
                        'file_info' => [
                            'mime_type' => $file->getMimeType(),
                            'is_valid' => $file->isValid()
                        ]
                    ]);
                    
                    // Show error notification with more details
                    \Filament\Notifications\Notification::make()
                        ->title('Error uploading file')
                        ->body('Failed to upload ' . $file->getClientOriginalName() . '. Error: ' . $e->getMessage())
                        ->danger()
                        ->send();
                }
            }
        }
    }

    protected function mutateFormDataBeforeCreate(array $data): array
    {
        // Handle custom fields
        if (isset($data['custom_fields'])) {
            foreach ($data['custom_fields'] as $fieldId => $fieldData) {
                $data["custom_field_{$fieldId}"] = $fieldData['value'];
            }
        }
        return $data;
    }

    protected function mutateFormDataBeforeSave(array $data): array
    {
        // Handle custom fields
        if (isset($data['custom_fields'])) {
            foreach ($data['custom_fields'] as $fieldId => $fieldData) {
                $data["custom_field_{$fieldId}"] = $fieldData['value'];
            }
        }
        return $data;
    }
} 