<?php

namespace App\Filament\Resources\TaskResource\Pages;

use App\Filament\Resources\TaskResource;
use Filament\Actions;
use Filament\Resources\Pages\EditRecord;
use Filament\Forms\Components\TextInput;
use Filament\Forms\Components\Select;
use Filament\Forms\Components\DatePicker;
use Filament\Forms\Components\Section;
use Filament\Forms\Form;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\File;
use Illuminate\Support\Facades\Route;
use Illuminate\Support\Facades\Session;
use Illuminate\Support\Facades\Redirect;
use Illuminate\Support\Facades\Request;
use Filament\Actions\Action;
use App\Filament\Actions\CustomDeleteTaskAction;
use function route;
use Illuminate\Support\Facades\Log;

class EditTask extends EditRecord
{
    protected static string $resource = TaskResource::class;

    protected function getHeaderActions(): array
    {
        return [
            CustomDeleteTaskAction::make('delete_task'),
        ];
    }

    protected function authorizeEdit(): void
    {
        $record = $this->getRecord();
        $user = Auth::user();

        // Check if user can edit this task (only assignee, project manager, or super admin)
        $canEditTask = false;
        
        // Super admin can edit any task
        if ($user->hasRole('super_admin') || $user->is_admin) {
            $canEditTask = true;
        }
        // Task assignee can edit their own task
        elseif ($record->assigned_to == $user->id) {
            $canEditTask = true;
        }
        // Project manager can edit any task in their project
        elseif ($record->project && $record->project->project_manager_id == $user->id) {
            $canEditTask = true;
        }

        if (!$canEditTask) {
            Log::warning('User attempted to edit task without permission', [
                'user_id' => $user->id,
                'task_id' => $record->id,
                'project_id' => $record->project_id,
                'assigned_to' => $record->assigned_to,
                'project_manager_id' => $record->project ? $record->project->project_manager_id : null
            ]);

            // Redirect to kanban board with error message
            $this->redirect(route('filament.admin.pages.task-kanban', [
                'project_id' => $record->project_id
            ]));

            // Show error notification
            \Filament\Notifications\Notification::make()
                ->title('Access denied')
                ->body('You can only edit tasks that are assigned to you, or tasks in projects you manage')
                ->danger()
                ->send();

            abort(403, 'You can only edit tasks that are assigned to you, or tasks in projects you manage');
        }
    }

    public function mount(int | string $record): void
    {
        parent::mount($record);

        // Check authorization before allowing edit
        $this->authorizeEdit();

        // Get the record's project
        $record = $this->getRecord();
        $project = $record->project;

        if ($project) {
            $customFields = $project->customFields()->orderBy('order')->get();
            
            if ($customFields->isNotEmpty()) {
                // Get all custom field values at once
                $customFieldValues = $record->customFieldValues()
                    ->pluck('value', 'project_custom_field_id')
                    ->toArray();
                
                // Get record data
                $recordData = $this->record->toArray();
                
                // Add custom field values
                foreach ($customFields as $field) {
                    $value = $customFieldValues[$field->id] ?? null;
                    
                    // Handle multiple values for enum type
                    if ($field->type === 'enum' && $field->is_allow_multiple && $value) {
                        // Try to decode JSON if it's stored as JSON
                        $decodedValue = json_decode($value, true);
                        $recordData["custom_field_{$field->id}"] = $decodedValue ?: [$value];
                    } else {
                        $recordData["custom_field_{$field->id}"] = $value;
                    }
                }

                // Fill form with combined data
                $this->form->fill($recordData);
            }
        }
    }

    public function form(Form $form): Form
    {
        $form = parent::form($form);

        // Get the record's project
        $record = $this->getRecord();
        $project = $record->project;

        // Get existing files
        $existingFiles = $record->files()->with('uploader')->get();

        // Get current schema
        $currentSchema = $form->getComponents();

        // Add existing files section
        if ($existingFiles->isNotEmpty()) {
            $currentSchema[] = Section::make('Existing Files')
                ->description('Files that have been uploaded to this task')
                ->schema([
                    \Filament\Forms\Components\View::make('filament.forms.components.existing-files-table')
                        ->viewData([
                            'files' => $existingFiles
                        ])
                ]);
        }

        if ($project) {
            $customFields = $project->customFields()->orderBy('order')->get();
            
            if ($customFields->isNotEmpty()) {
                $customFieldsComponents = [];
                
                foreach ($customFields as $field) {
                    $component = match ($field->type) {
                        'text' => TextInput::make("custom_field_{$field->id}")
                            ->label($field->name)
                            ->required($field->is_required),
                        'number' => TextInput::make("custom_field_{$field->id}")
                            ->label($field->name)
                            ->numeric()
                            ->required($field->is_required),
                        'enum' => Select::make("custom_field_{$field->id}")
                            ->label($field->name)
                            ->options(function () use ($field) {
                                return collect($field->options)
                                    ->mapWithKeys(function ($option) {
                                        return [$option['value'] => $option['label'] ?? $option['value']];
                                    })
                                    ->toArray();
                            })
                            ->multiple($field->is_allow_multiple)
                            ->required($field->is_required),
                        'date' => DatePicker::make("custom_field_{$field->id}")
                            ->label($field->name)
                            ->required($field->is_required),
                        default => null,
                    };

                    if ($component) {
                        $customFieldsComponents[] = $component;
                    }
                }

                if (!empty($customFieldsComponents)) {
                    // Add custom fields section to the schema
                    $currentSchema[] = Section::make('Custom Fields')
                        ->schema($customFieldsComponents);
                }
            }
        }

        // Update the form schema
        $form->schema($currentSchema);

        return $form;
    }

    protected function mutateFormDataBeforeSave(array $data): array
    {
        $record = $this->getRecord();
        $project = $record->project;
        
        if ($project) {
            $customFields = $project->customFields()->get();
            
            foreach ($customFields as $field) {
                $fieldKey = "custom_field_{$field->id}";
                $value = $data[$fieldKey] ?? null;
                
                if ($value !== null) {
                    // Handle multiple values for enum type
                    if ($field->type === 'enum' && $field->is_allow_multiple) {
                        // Convert array to JSON string
                        $value = json_encode($value);
                    }
                    
                    $record->customFieldValues()->updateOrCreate(
                        ['project_custom_field_id' => $field->id],
                        ['value' => $value]
                    );
                }
            }
        }

        return $data;
    }

    protected function getRedirectUrl(): string
    {
        // Check if this is a delete action by looking at the request
        if (request()->has('_action') && request()->get('_action') === 'delete') {
            // For delete actions, redirect to kanban board
            $projectId = session('task_kanban_project_id');
            $assignedTo = session('task_kanban_assigned_to');
            $priority = session('task_kanban_priority');

            $url = route('filament.admin.pages.task-kanban');
            $params = [];

            if ($projectId) {
                $params['project_id'] = $projectId;
            }
            if ($assignedTo) {
                $params['assigned_to'] = $assignedTo;
            }
            if ($priority) {
                $params['priority'] = $priority;
            }

            return $url . '?' . http_build_query($params);
        }

        // For update actions, store task info in session for notification
        session([
            'task_notification' => [
                'type' => 'updated',
                'title' => $this->record->title,
                'label' => $this->record->label?->name,
                'project' => $this->record->project?->name,
                'task_id' => $this->record->id
            ]
        ]);

        // Get current filters from session
        $projectId = session('task_kanban_project_id');
        $assignedTo = session('task_kanban_assigned_to');
        $priority = session('task_kanban_priority');

        // Build redirect URL with filters
        $url = route('filament.admin.pages.task-kanban');
        $params = [];

        if ($projectId) {
            $params['project_id'] = $projectId;
        }
        if ($assignedTo) {
            $params['assigned_to'] = $assignedTo;
        }
        if ($priority) {
            $params['priority'] = $priority;
        }

        return $url . '?' . http_build_query($params);
    }

    protected function afterSave(): void
    {
        // Log that we're entering afterSave
        \Illuminate\Support\Facades\Log::info('Entering EditTask::afterSave');

        $record = $this->getRecord();
        $data = $this->data;

        // Log the data we received
        \Illuminate\Support\Facades\Log::info('EditTask::afterSave data:', [
            'has_uploaded_files' => isset($data['uploaded_files']),
            'uploaded_files_count' => isset($data['uploaded_files']) ? count($data['uploaded_files']) : 0,
            'data_keys' => array_keys($data)
        ]);

        // Handle files
        if (isset($data['uploaded_files'])) {
            foreach ($data['uploaded_files'] as $file) {
                try {
                    if (is_string($file)) {
                        // This is an existing file, check if it's already in the database
                        $existingFile = $record->files()->where('file_path', $file)->first();
                        if (!$existingFile) {
                            // File exists in FTP but not in database, create record
                            $fileName = basename($file);
                            // Get file content from FTP
                            $fileContent = Storage::disk('ftp')->get($file);
                            $finfo = new \finfo(FILEINFO_MIME_TYPE);
                            $fileType = $finfo->buffer($fileContent) ?: 'application/octet-stream';
                            $fileSize = Storage::disk('ftp')->size($file);

                            $taskFile = $record->files()->create([
                                'task_id' => $record->id,
                                'file_name' => $fileName,
                                'file_path' => $file,
                                'file_type' => $fileType,
                                'file_size' => $fileSize,
                                'uploaded_by' => Auth::id()
                            ]);

                            \Illuminate\Support\Facades\Log::info('Created database record for existing file:', [
                                'task_file_id' => $taskFile->id,
                                'file_path' => $file,
                                'file_type' => $fileType
                            ]);
                        } else {
                            \Illuminate\Support\Facades\Log::info('File already exists in database:', [
                                'task_file_id' => $existingFile->id,
                                'file_path' => $file
                            ]);
                        }
                        continue;
                    }

                    // This is a new file upload
                    \Illuminate\Support\Facades\Log::info('Processing new file upload:', [
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

                    // Get the actual mime type from the uploaded file
                    $fileType = $file->getMimeType() ?: 'application/octet-stream';
                    
                    // Create record in database
                    $taskFile = $record->files()->create([
                        'task_id' => $record->id,
                        'file_name' => $filePath,
                        'file_path' => $fullPath,
                        'file_type' => $fileType,
                        'file_size' => $file->getSize(),
                        'uploaded_by' => Auth::id()
                    ]);

                    // Log success
                    \Illuminate\Support\Facades\Log::info('File uploaded successfully:', [
                        'task_file_id' => $taskFile->id,
                        'file_path' => $fullPath,
                        'stored_path' => $storedPath,
                        'file_type' => $fileType
                    ]);

                } catch (\Exception $e) {
                    // Log detailed error information
                    \Illuminate\Support\Facades\Log::error('Error handling file:', [
                        'error' => $e->getMessage(),
                        'error_trace' => $e->getTraceAsString(),
                        'file' => is_string($file) ? $file : $file->getClientOriginalName(),
                        'file_info' => is_string($file) ? ['type' => 'existing'] : [
                            'mime_type' => $file->getMimeType(),
                            'is_valid' => $file->isValid()
                        ]
                    ]);
                    
                    // Show error notification with more details
                    \Filament\Notifications\Notification::make()
                        ->title('Error handling file')
                        ->body('Failed to process file. Error: ' . $e->getMessage())
                        ->danger()
                        ->send();
                }
            }
        }

        // Handle custom fields
        if (isset($data['custom_fields'])) {
            foreach ($data['custom_fields'] as $fieldId => $fieldData) {
                $record->customFieldValues()->updateOrCreate(
                    ['project_custom_field_id' => $fieldId],
                    ['value' => $fieldData['value']]
                );
            }
        }

        // Log that we're exiting afterSave
        \Illuminate\Support\Facades\Log::info('Exiting EditTask::afterSave');
    }

    #[Action]
    public function deleteFile($fileId): void
    {
        try {
            $file = \App\Models\TaskFile::findOrFail($fileId);
            $task = $this->getRecord();

            // Log the activity before deleting
            activity()
                ->performedOn($task)
                ->causedBy(auth()->user())
                ->withProperties([
                    'file_name' => $file->file_name,
                    'file_path' => $file->file_path,
                    'file_type' => $file->file_type,
                    'file_size' => $file->file_size,
                ])
                ->log('deleted_file');

            // Delete file from FTP
            if (Storage::disk('ftp')->exists($file->file_path)) {
                Storage::disk('ftp')->delete($file->file_path);
            }

            // Delete record from database
            $file->delete();

            // Show success notification
            \Filament\Notifications\Notification::make()
                ->title('File deleted successfully')
                ->success()
                ->send();

        } catch (\Exception $e) {
            // Log error
            \Illuminate\Support\Facades\Log::error('Error deleting file:', [
                'error' => $e->getMessage(),
                'file_id' => $fileId,
                'task_id' => $this->getRecord()->id
            ]);

            // Show error notification
            \Filament\Notifications\Notification::make()
                ->title('Error deleting file')
                ->body('Failed to delete file. Error: ' . $e->getMessage())
                ->danger()
                ->send();
        }
    }
} 