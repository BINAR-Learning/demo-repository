<?php

namespace App\Filament\Pages;

use App\Models\Task;
use App\Models\TaskLabel;
use App\Models\Project;
use App\Models\User;
use App\Models\TaskCustomFieldValue;
use App\Models\ProjectCustomField;
use Filament\Pages\Page;
use Filament\Forms\Form;
use Filament\Forms\Components\Select;
use Filament\Forms\Components\FileUpload;
use Filament\Forms\Components\Section;
use Filament\Forms\Concerns\InteractsWithForms;
use Filament\Forms\Contracts\HasForms;
use Filament\Support\Enums\MaxWidth;
use Illuminate\Support\Facades\Auth;
use PhpOffice\PhpSpreadsheet\Spreadsheet;
use PhpOffice\PhpSpreadsheet\Writer\Xlsx;
use PhpOffice\PhpSpreadsheet\Style\Border;
use PhpOffice\PhpSpreadsheet\Style\Fill;
use PhpOffice\PhpSpreadsheet\Style\Alignment;
use PhpOffice\PhpSpreadsheet\IOFactory;
use PhpOffice\PhpSpreadsheet\Reader\Exception as ReaderException;
use Symfony\Component\HttpFoundation\StreamedResponse;
use Livewire\WithFileUploads;
use Carbon\Carbon;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\Gate;
use Livewire\Features\SupportFileUploads\TemporaryUploadedFile;
use Livewire\Attributes\Rule;

class TaskIntegration extends Page implements HasForms
{
    use InteractsWithForms, WithFileUploads;

    protected static ?string $navigationIcon = 'heroicon-o-arrow-down-tray';

    protected static ?string $navigationLabel = 'Task Integration';

    protected static ?string $navigationGroup = 'Project Management';

    protected static ?string $title = 'Task Integration';

    protected static ?string $slug = 'task-integration';

    protected static string $view = 'filament.pages.task-integration';

    public array $data = [];
    
    public $uploadedFile;
    
    public array $importPreview = [];
    public array $validationErrors = [];
    public array $customFieldsHeaders = [];
    public ?string $currentStep = 'select_project';

    public static function shouldRegisterNavigation(): bool
    {
        return false;
    }

    public function mount(): void
    {
        $this->authorize('viewAny', Task::class);
        
        // Get project from URL parameter or latest project
        $projectId = request()->get('project_id');
        
        if (!$projectId) {
            $user = Auth::user();
            $latestProject = null;
            
            if ($user->hasRole('super_admin')) {
                $latestProject = Project::latest()->first();
            } else {
                $latestProject = Project::where(function ($query) use ($user) {
                    $query->whereHas('members', function ($q) use ($user) {
                        $q->where('users.id', $user->id);
                    })
                    ->orWhere('project_manager_id', $user->id);
                })->latest()->first();
            }
            
            $projectId = $latestProject?->id;
        }

        $this->data = [
            'project_id' => $projectId,
        ];

        if ($projectId) {
            $this->currentStep = 'download_template';
        }
    }

    public function form(Form $form): Form
    {
        return $form
            ->schema([
                Section::make('Select Project')
                    ->schema([
                        Select::make('data.project_id')
                            ->label('Project')
                            ->options(function () {
                                $user = Auth::user();
                                
                                if ($user->hasRole('super_admin')) {
                                    return Project::pluck('name', 'id');
                                }
                                
                                return Project::where(function ($query) use ($user) {
                                    $query->whereHas('members', function ($q) use ($user) {
                                        $q->where('users.id', $user->id);
                                    })
                                    ->orWhere('project_manager_id', $user->id);
                                })
                                ->pluck('name', 'id');
                            })
                            ->required()
                            ->searchable()
                            ->preload()
                            ->live()
                            ->afterStateUpdated(function ($state) {
                                if ($state) {
                                    $this->currentStep = 'download_template';
                                    $this->resetImportData();
                                } else {
                                    $this->currentStep = 'select_project';
                                }
                            }),
                    ])
                    ->visible(fn () => $this->currentStep === 'select_project' || !$this->data['project_id']),

                Section::make('Upload File')
                    ->schema([
                        \Filament\Forms\Components\View::make('filament.forms.components.file-upload-section')
                            ->viewData([
                                'projectId' => $this->data['project_id'] ?? null,
                                'currentStep' => $this->currentStep
                            ])
                    ])
                    ->visible(fn () => $this->data['project_id'] && ($this->currentStep === 'download_template' || $this->currentStep === 'upload_file')),
            ]);
    }

    public function updatedDataProjectId($value): void
    {
        if ($value) {
            $this->currentStep = 'download_template';
            $this->resetImportData();
        } else {
            $this->currentStep = 'select_project';
        }
    }

    public function processUploadedFile()
    {
        if (!$this->uploadedFile) {
            \Filament\Notifications\Notification::make()
                ->title('No file uploaded')
                ->body('Please upload a file first.')
                ->warning()
                ->send();
            return;
        }

        // Validate file
        $this->validate([
            'uploadedFile' => 'required|file|mimes:xlsx,xls,csv|max:10240', // 10MB max
        ]);

        try {
            // Get the file path from the uploaded file
            $filePath = $this->uploadedFile->getRealPath();
            
            $this->processImportFileFromPath($filePath);
            $this->currentStep = 'preview';
            
            \Filament\Notifications\Notification::make()
                ->title('File processed successfully')
                ->body('Preview is now available. Please review the data before importing.')
                ->success()
                ->send();
                
        } catch (\Exception $e) {
            \Filament\Notifications\Notification::make()
                ->title('Import Error')
                ->body('Error processing file: ' . $e->getMessage())
                ->danger()
                ->send();
            
            $this->resetImportData();
        }
    }

    public function downloadTemplate()
    {
        $projectId = $this->data['project_id'];
        if (!$projectId) {
            \Filament\Notifications\Notification::make()
                ->title('No project selected')
                ->body('Please select a project first.')
                ->danger()
                ->send();
            return;
        }

        $project = Project::find($projectId);
        if (!$project) {
            \Filament\Notifications\Notification::make()
                ->title('Project not found')
                ->danger()
                ->send();
            return;
        }

        // Create spreadsheet
        $spreadsheet = new Spreadsheet();
        $sheet = $spreadsheet->getActiveSheet();
        $sheet->setTitle('Task Import Template');

        // Define headers
        $headers = [
            'Title*',
            'Description',
            'Label*',
            'Assignee*',
            'Priority*',
            'Due Date'
        ];

        // Add custom field headers
        $customFields = $project->customFields()->orderBy('order')->get();
        foreach ($customFields as $field) {
            $headerName = $field->name;
            if ($field->is_required) {
                $headerName .= '*';
            }
            if ($field->type === 'enum' && !empty($field->options)) {
                $options = collect($field->options)->pluck('value')->join(', ');
                $headerName .= " ({$options})";
            }
            $headers[] = $headerName;
        }

        // Set headers
        $columnIndex = 1;
        foreach ($headers as $header) {
            $sheet->setCellValueByColumnAndRow($columnIndex, 1, $header);
            $columnIndex++;
        }

        // Style headers
        $headerRange = 'A1:' . chr(64 + count($headers)) . '1';
        $sheet->getStyle($headerRange)->applyFromArray([
            'font' => ['bold' => true, 'color' => ['rgb' => 'FFFFFF']],
            'fill' => ['fillType' => Fill::FILL_SOLID, 'startColor' => ['rgb' => '4472C4']],
            'alignment' => ['horizontal' => Alignment::HORIZONTAL_CENTER],
            'borders' => ['allBorders' => ['borderStyle' => Border::BORDER_THIN]]
        ]);

        // Add instruction rows
        $instructionRow = 2;
        $instructions = [
            'Title*: Task title (required)',
            'Description: Task description (optional)',
            'Label*: Task label name (must exist in project)',
            'Assignee*: Username or email of assignee (must be project member)',
            'Priority*: low, medium, or high',
            'Due Date: Date in YYYY-MM-DD format (optional)'
        ];

        foreach ($customFields as $field) {
            $instruction = $field->name . ': ';
            if ($field->is_required) {
                $instruction .= '(required) ';
            }
            
            switch ($field->type) {
                case 'text':
                    $instruction .= 'Text value';
                    break;
                case 'number':
                    $instruction .= 'Numeric value';
                    break;
                case 'date':
                    $instruction .= 'Date in YYYY-MM-DD format';
                    break;
                case 'enum':
                    $options = collect($field->options)->pluck('value')->join(', ');
                    $instruction .= "One of: {$options}";
                    if ($field->is_allow_multiple) {
                        $instruction .= ' (separate multiple values with commas)';
                    }
                    break;
            }
            $instructions[] = $instruction;
        }

        foreach ($instructions as $index => $instruction) {
            $sheet->setCellValue('A' . ($instructionRow + $index), $instruction);
        }

        // Auto-size columns
        foreach (range('A', chr(64 + count($headers))) as $column) {
            $sheet->getColumnDimension($column)->setAutoSize(true);
        }

        // Create filename
        $filename = 'task_import_template_' . $project->code . '_' . now()->format('Y-m-d_H-i-s') . '.xlsx';

        // Create response
        return new StreamedResponse(function () use ($spreadsheet) {
            $writer = new Xlsx($spreadsheet);
            $writer->save('php://output');
        }, 200, [
            'Content-Type' => 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            'Content-Disposition' => 'attachment; filename="' . $filename . '"',
            'Cache-Control' => 'max-age=0',
        ]);
    }

    private function processImportFileFromPath($filePath)
    {
        $projectId = $this->data['project_id'];
        $project = Project::find($projectId);
        
        if (!$project) {
            throw new \Exception('Project not found');
        }

        // Read the uploaded file
        $reader = IOFactory::createReaderForFile($filePath);
        $spreadsheet = $reader->load($filePath);
        $worksheet = $spreadsheet->getActiveSheet();
        $rows = $worksheet->toArray();

        if (empty($rows)) {
            throw new \Exception('File is empty');
        }

        // Get headers from first row
        $headers = array_filter($rows[0] ?? []);
        if (empty($headers)) {
            throw new \Exception('No headers found in file');
        }
        
        // Get custom fields for the project
        $customFields = $project->customFields()->orderBy('order')->get();
        
        // Debug: Log the headers found
        \Log::info('Excel headers found:', $headers);
        \Log::info('Custom fields expected:', $customFields->pluck('name')->toArray());
        $this->customFieldsHeaders = $customFields->pluck('name')->toArray();
        
        // Get project labels and members for validation
        $projectLabels = $project->labels()->pluck('name', 'id')->toArray();
        $projectMembers = $project->members()->pluck('users.name', 'users.id')->toArray();
        $projectMemberEmails = $project->members()->pluck('users.email', 'users.id')->toArray();
        
        // Process data rows (skip header and instruction rows)
        $dataRows = array_slice($rows, 1);
        $this->importPreview = [];
        $this->validationErrors = [];

        // Debug: Log the data rows found
        \Log::info('Data rows found:', [
            'total_rows' => count($rows),
            'data_rows' => count($dataRows),
            'first_few_rows' => array_slice($dataRows, 0, 3)
        ]);

        foreach ($dataRows as $rowIndex => $row) {
            // Skip empty rows
            if (empty(array_filter($row))) {
                continue;
            }

            $rowData = array_combine($headers, array_pad($row, count($headers), ''));
            $errors = [];

            // Clean and validate basic fields
            $title = trim($rowData['Title*'] ?? $rowData['Title'] ?? '');
            $description = trim($rowData['Description'] ?? '');
            $label = trim($rowData['Label*'] ?? $rowData['Label'] ?? '');
            $assignee = trim($rowData['Assignee*'] ?? $rowData['Assignee'] ?? '');
            $priority = strtolower(trim($rowData['Priority*'] ?? $rowData['Priority'] ?? ''));
            $dueDate = trim($rowData['Due Date'] ?? '');

            // Validate required fields
            if (empty($title)) {
                $errors[] = 'Title is required';
            }
            if (empty($label)) {
                $errors[] = 'Label is required';
            }
            if (empty($assignee)) {
                $errors[] = 'Assignee is required';
            }
            if (empty($priority)) {
                $errors[] = 'Priority is required';
            }

            // Validate enum values
            if (!empty($priority) && !in_array($priority, ['low', 'medium', 'high'])) {
                $errors[] = "Priority must be: low, medium, or high. Got: {$priority}";
            }

            // Validate label exists
            if (!empty($label) && !in_array($label, $projectLabels)) {
                $errors[] = "Label '{$label}' does not exist in project";
            }

            // Validate assignee exists in project
            $assigneeId = null;
            if (!empty($assignee)) {
                $assigneeId = array_search($assignee, $projectMembers) ?: array_search($assignee, $projectMemberEmails);
                if (!$assigneeId) {
                    $errors[] = "Assignee '{$assignee}' is not a member of this project";
                }
            }

            // Validate due date format
            $parsedDueDate = null;
            if (!empty($dueDate)) {
                try {
                    // Try multiple date formats
                    $dateFormats = ['Y-m-d', 'm/d/Y', 'd/m/Y', 'Y/m/d', 'd-m-Y', 'm-d-Y'];
                    $parsedDueDate = null;
                    
                    foreach ($dateFormats as $format) {
                        try {
                            $parsedDueDate = Carbon::createFromFormat($format, $dueDate);
                            break;
                        } catch (\Exception $e) {
                            continue;
                        }
                    }
                    
                    if (!$parsedDueDate) {
                        $errors[] = "Due date must be in a valid date format. Got: {$dueDate}";
                    }
                } catch (\Exception $e) {
                    $errors[] = "Due date must be in a valid date format. Got: {$dueDate}";
                }
            }

            // Validate custom fields
            $customFieldValues = [];
            foreach ($customFields as $field) {
                $fieldName = $field->name;
                
                // Try to find the field value with different possible variations
                $fieldValue = '';
                $possibleKeys = [
                    $fieldName,
                    trim($fieldName),
                    strtolower($fieldName),
                    strtolower(trim($fieldName)),
                    ucfirst(strtolower(trim($fieldName))),
                    // Add variations with asterisk
                    $fieldName . '*',
                    trim($fieldName) . '*',
                    strtolower($fieldName) . '*',
                    strtolower(trim($fieldName)) . '*',
                    ucfirst(strtolower(trim($fieldName))) . '*',
                ];
                
                foreach ($possibleKeys as $key) {
                    if (isset($rowData[$key])) {
                        $fieldValue = trim($rowData[$key]);
                        break;
                    }
                }
                
                // If still not found, try case-insensitive search and handle asterisks
                if (empty($fieldValue)) {
                    foreach ($rowData as $header => $value) {
                        $cleanHeader = str_replace('*', '', strtolower(trim($header)));
                        $cleanFieldName = strtolower(trim($fieldName));
                        
                        if ($cleanHeader === $cleanFieldName) {
                            $fieldValue = trim($value);
                            break;
                        }
                    }
                }

                // Debug: Log what we found for this field
                \Log::info("Field '{$fieldName}' search result:", [
                    'field_name' => $fieldName,
                    'found_value' => $fieldValue,
                    'is_required' => $field->is_required,
                    'all_headers' => array_keys($rowData),
                    'all_values' => $rowData
                ]);
                
                // Check if required field is empty
                if ($field->is_required && empty($fieldValue)) {
                    $errors[] = "Custom field '{$fieldName}' is required (searched in: " . implode(', ', array_keys($rowData)) . ")";
                    continue;
                }

                if (!empty($fieldValue)) {
                    // Validate based on field type
                    switch ($field->type) {
                        case 'number':
                            if (!is_numeric($fieldValue)) {
                                $errors[] = "Custom field '{$fieldName}' must be numeric. Got: {$fieldValue}";
                            }
                            break;
                        case 'date':
                            try {
                                // Try multiple date formats
                                $dateFormats = ['Y-m-d', 'm/d/Y', 'd/m/Y', 'Y/m/d', 'd-m-Y', 'm-d-Y'];
                                $parsedDate = null;
                                
                                foreach ($dateFormats as $format) {
                                    try {
                                        $parsedDate = Carbon::createFromFormat($format, $fieldValue);
                                        break;
                                    } catch (\Exception $e) {
                                        continue;
                                    }
                                }
                                
                                if (!$parsedDate) {
                                    $errors[] = "Custom field '{$fieldName}' must be in a valid date format. Got: {$fieldValue}";
                                }
                            } catch (\Exception $e) {
                                $errors[] = "Custom field '{$fieldName}' must be in a valid date format. Got: {$fieldValue}";
                            }
                            break;
                        case 'enum':
                            $validOptions = collect($field->options)->pluck('value')->toArray();
                            if ($field->is_allow_multiple) {
                                $values = array_map('trim', explode(',', $fieldValue));
                                foreach ($values as $value) {
                                    if (!in_array($value, $validOptions)) {
                                        $errors[] = "Custom field '{$fieldName}' value '{$value}' is not valid. Valid options: " . implode(', ', $validOptions);
                                    }
                                }
                            } else {
                                if (!in_array($fieldValue, $validOptions)) {
                                    $errors[] = "Custom field '{$fieldName}' value '{$fieldValue}' is not valid. Valid options: " . implode(', ', $validOptions);
                                }
                            }
                            break;
                    }
                }

                $customFieldValues[$fieldName] = $fieldValue;
            }

            $this->importPreview[] = [
                'title' => $title,
                'description' => $description,
                'label' => $label,
                'assignee' => $assignee,
                'assignee_id' => $assigneeId,
                'priority' => $priority,
                'due_date' => $dueDate,
                'parsed_due_date' => $parsedDueDate,
                'custom_fields' => $customFieldValues,
                'errors' => $errors,
                'has_errors' => !empty($errors),
            ];

            // Collect all errors for summary
            $this->validationErrors = array_merge($this->validationErrors, $errors);
        }

        if (empty($this->importPreview)) {
            throw new \Exception('No valid data rows found in file');
        }
    }

    public function processImport()
    {
        $projectId = $this->data['project_id'];
        $project = Project::find($projectId);
        
        if (!$project) {
            \Filament\Notifications\Notification::make()
                ->title('Project not found')
                ->danger()
                ->send();
            return;
        }

        // Debug: Log the import preview data
        \Log::info('Import preview data:', [
            'total_rows' => count($this->importPreview),
            'rows_with_errors' => count(array_filter($this->importPreview, fn($row) => $row['has_errors'])),
            'rows_without_errors' => count(array_filter($this->importPreview, fn($row) => !$row['has_errors'])),
            'preview_data' => $this->importPreview
        ]);

        $validRows = array_filter($this->importPreview, fn($row) => !$row['has_errors']);
        
        if (empty($validRows)) {
            \Filament\Notifications\Notification::make()
                ->title('No valid rows to import')
                ->body('Please fix the validation errors and try again.')
                ->warning()
                ->send();
            return;
        }

        $createdCount = 0;
        $customFields = $project->customFields()->orderBy('order')->get()->keyBy('name');
        $projectLabels = $project->labels()->pluck('id', 'name')->toArray();

        foreach ($validRows as $row) {
            try {
                // Create the task
                $task = Task::create([
                    'title' => $row['title'],
                    'description' => $row['description'],
                    'project_id' => $projectId,
                    'task_label_id' => $projectLabels[$row['label']] ?? null,
                    'assigned_to' => $row['assignee_id'],
                    'priority' => $row['priority'],
                    'due_date' => $row['parsed_due_date'],
                    'is_completed' => false,
                    'completed_at' => null,
                ]);

                // Create custom field values
                foreach ($row['custom_fields'] as $fieldName => $fieldValue) {
                    if (empty($fieldValue)) {
                        continue;
                    }

                    $customField = $customFields->get($fieldName);
                    if (!$customField) {
                        continue;
                    }

                    // Handle multiple values for enum fields
                    if ($customField->type === 'enum' && $customField->is_allow_multiple) {
                        $fieldValue = json_encode(array_map('trim', explode(',', $fieldValue)));
                    }

                    TaskCustomFieldValue::create([
                        'task_id' => $task->id,
                        'project_custom_field_id' => $customField->id,
                        'value' => $fieldValue,
                    ]);
                }

                $createdCount++;

            } catch (\Exception $e) {
                \Log::error('Error creating task during import', [
                    'row' => $row,
                    'error' => $e->getMessage()
                ]);
            }
        }

        // Reset and show success notification
        $this->resetImportData();
        $this->currentStep = 'download_template';

        \Filament\Notifications\Notification::make()
            ->title('Import Completed')
            ->body("Successfully imported {$createdCount} tasks.")
            ->success()
            ->send();
    }

    public function resetImport()
    {
        $this->resetImportData();
        $this->currentStep = 'download_template';
    }

    private function resetImportData()
    {
        $this->importFile = null;
        $this->importPreview = [];
        $this->validationErrors = [];
        $this->customFieldsHeaders = [];
    }

    public function getMaxContentWidth(): MaxWidth
    {
        return MaxWidth::Full;
    }

    public static function getNavigationSort(): ?int
    {
        return 2;
    }
} 