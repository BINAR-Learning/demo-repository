<?php

namespace App\Filament\Resources\TaskResource\Pages;

use App\Filament\Resources\TaskResource;
use Filament\Resources\Pages\CreateRecord;
use Filament\Forms\Form;
use Filament\Forms\Components\Hidden;
use App\Models\Project;
use Filament\Forms\Components\TextInput;
use Filament\Forms\Components\Select;
use Filament\Forms\Components\DatePicker;
use Illuminate\Validation\Rule;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Storage;
use Filament\Forms\Components\Section;
use Filament\Forms\Get;
use Filament\Forms\Components\FileUpload;
use Filament\Forms\Components\Repeater;
use Illuminate\Support\Facades\File;

class CreateTask extends CreateRecord
{
    protected static string $resource = TaskResource::class;

    public function mount(): void
    {
        parent::mount();

        // Get project_id from request
        $projectId = request()->get('project_id');
        
        if ($projectId) {
            $this->form->fill([
                'project_id' => $projectId
            ]);
        }
    }

    protected function mutateFormDataBeforeCreate(array $data): array
    {
        // Log incoming data
        \Illuminate\Support\Facades\Log::info('CreateTask::mutateFormDataBeforeCreate - Incoming data:', [
            'data_keys' => array_keys($data),
            'has_project_id' => isset($data['project_id']),
            'project_id' => $data['project_id'] ?? null
        ]);

        // Handle custom fields
        $projectId = $data['project_id'];
        $project = Project::find($projectId);
        
        if ($project) {
            $customFields = $project->customFields()->get();
            
            // Log custom fields found
            \Illuminate\Support\Facades\Log::info('CreateTask::mutateFormDataBeforeCreate - Custom fields found:', [
                'project_id' => $projectId,
                'custom_fields_count' => $customFields->count(),
                'custom_fields' => $customFields->pluck('name', 'id')->toArray()
            ]);
            
            $customFieldsData = [];
            foreach ($customFields as $field) {
                $fieldKey = "custom_field_{$field->id}";
                $value = $data[$fieldKey] ?? null;
                
                // Log each field value
                \Illuminate\Support\Facades\Log::info("CreateTask::mutateFormDataBeforeCreate - Processing field {$field->name}:", [
                    'field_id' => $field->id,
                    'field_type' => $field->type,
                    'field_key' => $fieldKey,
                    'has_value' => isset($data[$fieldKey]),
                    'value' => $value
                ]);
                
                if ($value !== null) {
                    // Handle multiple values for enum type
                    if ($field->type === 'enum' && $field->is_allow_multiple) {
                        // Convert array to JSON string
                        $value = json_encode($value);
                    }
                    
                    // Store in custom_fields array
                    $customFieldsData[$field->id] = [
                        'value' => $value,
                        'type' => $field->type
                    ];
                }
                // Remove the temporary field
                unset($data[$fieldKey]);
            }

            // Store custom fields data in session for afterCreate
            session(['task_custom_fields' => $customFieldsData]);
        }

        // Log final data
        \Illuminate\Support\Facades\Log::info('CreateTask::mutateFormDataBeforeCreate - Final data:', [
            'data_keys' => array_keys($data),
            'has_custom_fields' => !empty($customFieldsData),
            'custom_fields' => $customFieldsData ?? []
        ]);

        return $data;
    }

    protected function afterCreate(): void
    {
        // Log that we're entering afterCreate
        \Illuminate\Support\Facades\Log::info('Entering CreateTask::afterCreate');

        $record = $this->getRecord();
        $data = $this->data;

        // Get custom fields data from session
        $customFieldsData = session('task_custom_fields', []);

        // Log the data we received
        \Illuminate\Support\Facades\Log::info('CreateTask::afterCreate data:', [
            'has_uploaded_files' => isset($data['uploaded_files']),
            'uploaded_files_count' => isset($data['uploaded_files']) ? count($data['uploaded_files']) : 0,
            'data_keys' => array_keys($data),
            'has_custom_fields' => !empty($customFieldsData),
            'custom_fields' => $customFieldsData
        ]);

        // Handle custom fields
        if (!empty($customFieldsData)) {
            foreach ($customFieldsData as $fieldId => $fieldData) {
                try {
                    $customFieldValue = $record->customFieldValues()->create([
                        'project_custom_field_id' => $fieldId,
                        'value' => $fieldData['value']
                    ]);

                    \Illuminate\Support\Facades\Log::info('Created custom field value:', [
                        'task_id' => $record->id,
                        'field_id' => $fieldId,
                        'value' => $fieldData['value'],
                        'custom_field_value_id' => $customFieldValue->id
                    ]);
                } catch (\Exception $e) {
                    \Illuminate\Support\Facades\Log::error('Error creating custom field value:', [
                        'error' => $e->getMessage(),
                        'task_id' => $record->id,
                        'field_id' => $fieldId,
                        'value' => $fieldData['value']
                    ]);
                }
            }
        }

        // Clear custom fields data from session
        session()->forget('task_custom_fields');

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

        // Log that we're exiting afterCreate
        \Illuminate\Support\Facades\Log::info('Exiting CreateTask::afterCreate');
    }

    protected function getRedirectUrl(): string
    {
        // Store task info in session for notification
        session([
            'task_notification' => [
                'type' => 'created',
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

    public function form(Form $form): Form
    {
        $form = parent::form($form);

        // Get current schema
        $currentSchema = $form->getComponents();

        // Add custom fields section that updates when project changes
        $currentSchema[] = Section::make('Custom Fields')
            ->schema(function (Get $get) {
                $projectId = $get('project_id');
                if (!$projectId) {
                    return [];
                }

                $project = \App\Models\Project::find($projectId);
                if (!$project) {
                    return [];
                }

                $customFields = $project->customFields()->orderBy('order')->get();
                $components = [];

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
                        $components[] = $component;
                    }
                }

                return $components;
            })
            ->columns(2);

        // Update the form schema
        $form->schema($currentSchema);

        return $form;
    }
} 