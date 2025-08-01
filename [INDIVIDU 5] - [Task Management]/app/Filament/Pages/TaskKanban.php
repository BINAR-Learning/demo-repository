<?php

namespace App\Filament\Pages;

use App\Models\Task;
use App\Models\TaskLabel;
use App\Models\Project;
use Filament\Pages\Page;
use Filament\Forms\Form;
use Filament\Forms\Components\Select;
use Filament\Forms\Components\Section;
use Filament\Forms\Components\Grid;
use Illuminate\Database\Eloquent\Builder;
use Filament\Support\Enums\MaxWidth;
use Filament\Forms\Concerns\InteractsWithForms;
use Filament\Forms\Contracts\HasForms;
use Filament\Forms\Components\Hidden;
use Filament\Forms\Components\TextInput;
use Filament\Forms\Components\RichEditor;
use Filament\Forms\Components\DatePicker;
use Filament\Forms\Components\FileUpload;
use Livewire\Attributes\On;
use Filament\Forms\Components\DatePicker as FormsDatePicker;
use App\Models\User;
use Filament\Forms\Components\Toggle;
use Illuminate\Support\Facades\Auth;
use Illuminate\Foundation\Auth\Access\AuthorizesRequests;
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
use App\Models\TaskCustomFieldValue;
use App\Models\ProjectCustomField;
use App\Enums\TaskStatus;
use Illuminate\Validation\ValidationException;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\Request;
use Illuminate\Support\Facades\Session;
use Illuminate\Support\Facades\Cache;

class TaskKanban extends Page implements HasForms
{
    use InteractsWithForms, WithFileUploads, AuthorizesRequests;

    protected static ?string $navigationIcon = 'heroicon-o-view-columns';

    protected static ?string $navigationLabel = 'Kanban Board';

    protected static ?string $navigationGroup = 'Project Management';

    protected static ?string $title = '';

    protected static ?string $slug = 'task-kanban';

    protected static string $view = 'filament.pages.task-kanban';

    public ?array $data = [];
    public bool $showModal = false;
    public bool $isVerticalView = false;
    public bool $showNotification = true;

    public function mount(): void
    {
        $this->authorize('viewAny', Task::class);
        
        // Get latest project if no project is selected
        $user = Auth::user();
        $latestProject = null;
        
        if ($user->hasRole('super_admin')) {
            $latestProject = Project::withoutTrashed()->latest()->first();
        } else {
            $latestProject = Project::withoutTrashed()->where(function ($query) use ($user) {
                $query->whereHas('members', function ($q) use ($user) {
                    $q->where('users.id', $user->id);
                })
                ->orWhere('project_manager_id', $user->id);
            })->latest()->first();
        }
        
        // Get filter values from session or URL parameters
        $this->data = [
            'project_id' => Request::get('project_id') ?? Session::get('task_kanban_project_id', $latestProject?->id),
            'assigned_to' => Request::get('assigned_to') ?? Session::get('task_kanban_assigned_to'),
            'priority' => Request::get('priority') ?? Session::get('task_kanban_priority'),
            'show_completed' => session('task_kanban_show_completed', false),
            'title_filter' => session('task_kanban_title_filter', ''),
            'title' => '',
            'description' => '',
            'task_label_id' => null,
            'due_date' => null,
            'files' => [],
        ];

        // Store current filters in session
        session([
            'task_kanban_project_id' => $this->data['project_id'],
            'task_kanban_assigned_to' => $this->data['assigned_to'],
            'task_kanban_priority' => $this->data['priority'],
        ]);

        // Initialize custom field values
        if ($this->data['project_id']) {
            $project = Project::withoutTrashed()->find($this->data['project_id']);
            if ($project) {
                $customFields = $project->customFields()
                    ->where('is_use_for_filter', true)
                    ->get();

                foreach ($customFields as $field) {
                    $this->data["custom_field_{$field->id}"] = null;
                }
            } else {
                // If the project from session doesn't exist or is soft-deleted, reset to null
                $this->data['project_id'] = null;
            }
        }

        // Set showNotification flag if there's a notification in session
        if (session('task_notification')) {
            $this->showNotification = true;
        }
    }

    public function loadLabels(): void
    {
        $projectId = $this->data['project_id'] ?? null;
        if ($projectId) {
            // Check if the project exists and is not soft-deleted
            $project = Project::withoutTrashed()->find($projectId);
            if ($project) {
                $labels = TaskLabel::where('project_id', $projectId)
                    ->orderBy('order')
                    ->get();
                
                // Update the task_label_id options
                $this->data['task_label_id'] = null;
            }
        }
    }

    public function updatedDataProjectId($value): void
    {
        // Reset custom field values when project changes
        if ($value) {
            $project = Project::find($value);
            if ($project) {
                $customFields = $project->customFields()
                    ->where('is_use_for_filter', true)
                    ->get();

                foreach ($customFields as $field) {
                    $this->data["custom_field_{$field->id}"] = null;
                }
            }
        }

        // Load labels for the new project
        $this->loadLabels();
    }

    public function updatedDataShowCompleted($value): void
    {
        // Store the show_completed value in session
        session(['task_kanban_show_completed' => $value]);
    }

    public function updatedDataTitleFilter($value): void
    {
        // Store the title_filter value in session
        session(['task_kanban_title_filter' => $value]);
    }

    public function updatedDataAssignedTo($value): void
    {
        // Store the assigned_to value in session
        session(['task_kanban_assigned_to' => $value]);
    }

    public function updatedDataPriority($value): void
    {
        // Store the priority value in session
        session(['task_kanban_priority' => $value]);
    }

    public function redirectToTask($taskId): void
    {
        // Store current filters in session
        session([
            'task_kanban_project_id' => $this->data['project_id'],
            'task_kanban_assigned_to' => $this->data['assigned_to'],
            'task_kanban_priority' => $this->data['priority'],
        ]);

        // Redirect to task view with back parameter
        $this->redirect(route('filament.admin.resources.tasks.view', [
            'record' => $taskId,
            'back' => true,
            'project_id' => $this->data['project_id'],
            'assigned_to' => $this->data['assigned_to'],
            'priority' => $this->data['priority'],
        ]));
    }

    public function redirectToCreateTask()
    {
        return redirect()->route('filament.admin.resources.tasks.create', ['project_id' => $this->data['project_id']]);
    }

    #[On('open-modal')] 
    public function openTaskModal($params = []): void
    {
        $this->showModal = true;
    }

    public function closeModal(): void
    {
        $this->showModal = false;
        $currentProjectId = $this->data['project_id'] ?? null;
        
        $this->data = [
            'project_id' => $currentProjectId,
            'assigned_to' => session('task_kanban_assigned_to'),
            'priority' => session('task_kanban_priority'),
            'title' => '',
            'description' => '',
            'task_label_id' => null,
            'due_date' => null,
            'files' => [],
        ];
    }

    public function getTaskForm(): Form
    {
        return $this->form(Form::make($this))
            ->schema([
                TextInput::make('title')
                    ->required()
                    ->maxLength(255),
                RichEditor::make('description')
                    ->columnSpanFull(),
                Select::make('task_label_id')
                    ->label('Label')
                    ->options(function () {
                        $projectId = $this->data['project_id'] ?? null;
                        if (!$projectId) {
                            return [];
                        }
                        return TaskLabel::where('project_id', $projectId)
                            ->pluck('name', 'id');
                    })
                    ->preload()
                    ->required(),
                Select::make('assigned_to')
                    ->label('Assignee')
                    ->options(function (callable $get) {
                        $projectId = $get('project_id');
                        if (!$projectId) {
                            return \App\Models\User::whereHas('assignedTasks')
                                ->select('id', 'name')
                                ->distinct()
                                ->pluck('name', 'id');
                        }
                        return Project::find($projectId)
                            ->members()
                            ->pluck('users.name', 'users.id');
                    })
                    ->searchable()
                    ->preload()
                    ->live()
                    ->columnSpan(1)
                    ->extraAttributes(['class' => 'w-48']),
                DatePicker::make('due_date'),
                Select::make('priority')
                    ->label('Priority')
                    ->options([
                        'low' => 'Low',
                        'medium' => 'Medium',
                        'high' => 'High',
                    ])
                    ->searchable()
                    ->preload()
                    ->live(),
                Toggle::make('show_completed')
                    ->label('Show Completed Tasks')
                    ->helperText('Toggle to show/hide completed tasks')
                    ->default(false)
                    ->live()
                    ->columnSpan(1)
                    ->extraAttributes(['class' => 'w-40']),
                TextInput::make('title_filter')
                    ->label('Filter by Title')
                    ->placeholder('Search tasks by title...')
                    ->live()
                    ->columnSpan(1)
                    ->extraAttributes(['class' => 'w-48']),
                FileUpload::make('files')
                    ->multiple()
                    ->directory('files')
                    ->visibility('public')
                    ->preserveFilenames()
                    ->disk('ftp')
                    ->columnSpanFull(),
            ])
            ->statePath('data')
            ->model(Task::class);
    }

    public function saveTask(): void
    {
        $form = $this->getTaskForm();
        $data = $form->getState();

        // Store the current project_id from filter
        $currentProjectId = $this->data['project_id'];
        
        // Add the project_id from the filter section
        $data['project_id'] = $currentProjectId;

        Task::create($data);

        $this->closeModal();
        
        // Reset form but maintain the project_id in filter
        $form->fill();
        $this->data['project_id'] = $currentProjectId;

        // Show success notification
        \Filament\Notifications\Notification::make()
            ->title('Task created successfully')
            ->success()
            ->send();
    }

    public function form(Form $form): Form
    {
        $components = [
            Grid::make(5)
                ->schema([
                    Select::make('project_id')
                        ->label('Project')
                        ->options(function () {
                            $user = Auth::user();
                            
                            // Super admin can see all projects
                            if ($user->hasRole('super_admin')) {
                                return Project::withoutTrashed()->pluck('name', 'id');
                            }
                            
                            // For other users, only show projects where they are manager or member
                            return Project::withoutTrashed()->where(function ($query) use ($user) {
                                $query->whereHas('members', function ($q) use ($user) {
                                    $q->where('users.id', $user->id);
                                })
                                ->orWhere('project_manager_id', $user->id);
                            })
                            ->pluck('name', 'id');
                        })
                        ->required()
                        ->default(fn () => Project::withoutTrashed()->first()?->id)
                        ->live()
                        ->afterStateUpdated(function ($state) {
                            $this->loadLabels();
                        }),
                    TextInput::make('title_filter')
                        ->label('Filter by Title')
                        ->placeholder('Search tasks by title...')
                        ->live()
                        ->columnSpan(1)
                        ->extraAttributes(['class' => 'w-48']),
                    Select::make('assigned_to')
                        ->label('Assignee')
                        ->options(function (callable $get) {
                            $projectId = $get('project_id');
                            if (!$projectId) {
                                return \App\Models\User::whereHas('assignedTasks')
                                    ->select('id', 'name')
                                    ->distinct()
                                    ->pluck('name', 'id');
                            }
                            $project = Project::find($projectId);
                            if (!$project) {
                                return [];
                            }
                            return $project->members()
                                ->pluck('users.name', 'users.id');
                        })
                        ->searchable()
                        ->preload()
                        ->live()
                        ->columnSpan(1)
                        ->extraAttributes(['class' => 'w-48']),
                    Select::make('priority')
                        ->label('Priority')
                        ->options([
                            'low' => 'Low',
                            'medium' => 'Medium',
                            'high' => 'High',
                        ])
                        ->searchable()
                        ->preload()
                        ->live(),
                    Toggle::make('show_completed')
                        ->label('Show Completed Tasks')
                        ->helperText('Toggle to show/hide completed tasks')
                        ->default(false)
                        ->live()
                        ->columnSpan(1)
                        ->extraAttributes(['class' => 'w-40']),
                ]),
        ];

        // Add custom field filters if project is selected
        if ($this->data['project_id'] ?? null) {
            $project = Project::find($this->data['project_id']);
            if ($project) {
                $customFields = $project->customFields()
                    ->where('is_use_for_filter', true)
                    ->orderBy('order')
                    ->get();

                if ($customFields->isNotEmpty()) {
                    $customFieldComponents = [];
                    foreach ($customFields as $field) {
                        $component = match ($field->type) {
                            'text' => Select::make("custom_field_{$field->id}")
                                ->label($field->name)
                                ->options(function () use ($field) {
                                    return Task::whereHas('customFieldValues', function ($query) use ($field) {
                                        $query->where('project_custom_field_id', $field->id);
                                    })
                                    ->with(['customFieldValues' => function ($query) use ($field) {
                                        $query->where('project_custom_field_id', $field->id);
                                    }])
                                    ->get()
                                    ->pluck('customFieldValues.0.value', 'customFieldValues.0.value')
                                    ->unique()
                                    ->filter()
                                    ->toArray();
                                })
                                ->searchable()
                                ->preload()
                                ->live(),
                            'number' => Select::make("custom_field_{$field->id}")
                                ->label($field->name)
                                ->options(function () use ($field) {
                                    return Task::whereHas('customFieldValues', function ($query) use ($field) {
                                        $query->where('project_custom_field_id', $field->id);
                                    })
                                    ->with(['customFieldValues' => function ($query) use ($field) {
                                        $query->where('project_custom_field_id', $field->id);
                                    }])
                                    ->get()
                                    ->pluck('customFieldValues.0.value', 'customFieldValues.0.value')
                                    ->unique()
                                    ->filter()
                                    ->toArray();
                                })
                                ->searchable()
                                ->preload()
                                ->live(),
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
                                ->searchable()
                                ->preload()
                                ->live(),
                            'date' => DatePicker::make("custom_field_{$field->id}")
                                ->label($field->name)
                                ->live(),
                            default => null,
                        };

                        if ($component) {
                            $customFieldComponents[] = $component;
                        }
                    }

                    if (!empty($customFieldComponents)) {
                        $components[] = Grid::make(5)
                            ->schema($customFieldComponents);
                    }
                }
            }
        }

        return $form
            ->schema($components)
            ->statePath('data');
    }

    public function getViewData(): array
    {
        $projectId = $this->data['project_id'] ?? null;
        $assignedTo = $this->data['assigned_to'] ?? null;
        $priority = $this->data['priority'] ?? null;
        $showCompleted = $this->data['show_completed'] ?? false;
        $titleFilter = $this->data['title_filter'] ?? '';

        $user = Auth::user();

        // Validate project access for non-super-admin users
        if ($projectId && !$user->hasRole('super_admin')) {
            $hasProjectAccess = Project::where('id', $projectId)
                ->where(function ($query) use ($user) {
                    $query->whereHas('members', function ($q) use ($user) {
                        $q->where('users.id', $user->id);
                    })
                    ->orWhere('project_manager_id', $user->id);
                })
                ->exists();

            // If user doesn't have access to the selected project, clear the project filter
            if (!$hasProjectAccess) {
                $projectId = null;
                $this->data['project_id'] = null;
            }
        }

        $query = Task::query()
            ->when($projectId, function (Builder $query) use ($projectId) {
                $query->where('project_id', $projectId);
            })
            ->when($assignedTo, function (Builder $query) use ($assignedTo) {
                $query->where('assigned_to', $assignedTo);
            })
            ->when($priority, function (Builder $query) use ($priority) {
                $query->where('priority', $priority);
            })
            ->when($titleFilter, function (Builder $query) use ($titleFilter) {
                $query->where('title', 'like', "%{$titleFilter}%");
            })
            ->when(!$showCompleted, function (Builder $query) {
                $query->where('is_completed', false);
            });

        // Apply project access authorization
        if (!$user->hasRole('super_admin')) {
            // For non-super-admin users, only show tasks from projects they have access to
            $query->whereHas('project', function (Builder $query) use ($user) {
                $query->where(function ($q) use ($user) {
                    $q->whereHas('members', function ($memberQuery) use ($user) {
                        $memberQuery->where('users.id', $user->id);
                    })
                    ->orWhere('project_manager_id', $user->id);
                });
            });
        }

        // Apply project filter
        if ($this->data['project_id'] ?? null) {
            $query->where('project_id', $this->data['project_id']);
        }

        // Apply assignee filter
        if ($this->data['assigned_to'] ?? null) {
            $query->where('assigned_to', $this->data['assigned_to']);
        }

        // Apply priority filter
        if ($this->data['priority'] ?? null) {
            $query->where('priority', $this->data['priority']);
        }

        // Apply custom field filters
        if ($this->data['project_id'] ?? null) {
            $project = Project::find($this->data['project_id']);
            if ($project) {
                $customFields = $project->customFields()
                    ->where('is_use_for_filter', true)
                    ->get();

                foreach ($customFields as $field) {
                    $fieldKey = "custom_field_{$field->id}";
                    if (isset($this->data[$fieldKey]) && $this->data[$fieldKey] !== null) {
                        $query->whereHas('customFieldValues', function ($query) use ($field, $fieldKey) {
                            if ($field->is_allow_multiple) {
                                // For multiple values, we need to check if any of the selected values exist
                                $selectedValues = (array) $this->data[$fieldKey];
                                $query->where('project_custom_field_id', $field->id)
                                    ->where(function ($subQuery) use ($selectedValues) {
                                        foreach ($selectedValues as $value) {
                                            $subQuery->orWhere(function ($q) use ($value) {
                                                // Try to find the value in both array and string formats
                                                $q->whereRaw("value LIKE ?", ['%' . $value . '%'])
                                                  ->orWhereRaw("value = ?", [$value]);
                                            });
                                        }
                                    });
                            } else {
                                // For single values, just check exact match
                                $query->where('project_custom_field_id', $field->id)
                                    ->where('value', $this->data[$fieldKey]);
                            }
                        });
                    }
                }
            }
        }

        // Single query with all relationships loaded
        $allTasks = $query->with([
            'customFieldValues.customField', 
            'project', 
            'assignee', 
            'files', 
            'comments',
            'label'
        ])->get();

        // Get labels in a separate single query
        $labels = TaskLabel::where('project_id', $this->data['project_id'])
            ->orderBy('order')
            ->get();

        // Group tasks by label in PHP (much faster than multiple DB queries)
        $tasksByLabel = $allTasks->groupBy('task_label_id');
        
        // Process tasks and format custom fields
        $processedLabels = $labels->map(function (TaskLabel $label) use ($tasksByLabel) {
            $tasks = $tasksByLabel->get($label->id, collect())->map(function ($task) {
                return $this->formatTaskCustomFields($task);
            });

            return [
                'id' => $label->id,
                'name' => $label->name,
                'color' => $label->color,
                'icon' => $label->icon,
                'tasks' => $tasks,
            ];
        });

        // Get unlabeled tasks
        $unlabeledTasks = $tasksByLabel->get(null, collect())->map(function ($task) {
            return $this->formatTaskCustomFields($task);
        });

        // Add unlabeled section if there are unlabeled tasks
        if ($unlabeledTasks->isNotEmpty()) {
            $processedLabels[] = [
                'id' => null,
                'name' => 'Unlabeled',
                'color' => 'gray',
                'icon' => 'heroicon-o-tag',
                'tasks' => $unlabeledTasks,
            ];
        }

        $labels = $processedLabels;

        // Get custom fields for the current project (cached)
        $customFields = [];
        if ($this->data['project_id'] ?? null) {
            $customFieldsCacheKey = "project_custom_fields_{$this->data['project_id']}";
            $customFields = Cache::remember($customFieldsCacheKey, 300, function () {
                $project = Project::find($this->data['project_id']);
                return $project ? $project->customFields()->orderBy('order')->get() : collect();
            });
        }

        return [
            'labels' => $labels,
            'isVerticalView' => $this->isVerticalView,
            'customFields' => $customFields,
        ];
    }

    private function formatTaskCustomFields($task)
    {
        // Format custom field values for display
        $task->formatted_custom_fields = $task->customFieldValues->mapWithKeys(function ($value) {
            $field = $value->customField;
            if ($field->type === 'enum' && $field->is_allow_multiple) {
                // For multiple enum values, get the labels for each value
                $values = json_decode($value->value, true) ?? [$value->value];
                $labels = collect($field->options)
                    ->filter(function ($option) use ($values) {
                        return in_array($option['value'], $values);
                    })
                    ->pluck('label', 'value')
                    ->toArray();
                
                return [$field->name => implode(', ', $labels)];
            } else {
                // For single values, just get the label
                $option = collect($field->options)
                    ->firstWhere('value', $value->value);
                return [$field->name => $option['label'] ?? $value->value];
            }
        })->toArray();
        
        return $task;
    }

    // Clear cache when tasks are updated
    public function clearCache(): void
    {
        $user = Auth::user();
        $projectId = $this->data['project_id'] ?? null;
        
        // Clear all cache keys for this user and project
        $pattern = "kanban_data_{$user->id}_{$projectId}_*";
        
        // Note: This is a simplified cache clearing. In production, you might want to use Redis SCAN
        // or implement a more sophisticated cache invalidation strategy
        Cache::forget("kanban_data_{$user->id}_{$projectId}_null_null_false_");
        Cache::forget("kanban_data_{$user->id}_{$projectId}_null_null_true_");
    }

    public function getMaxContentWidth(): MaxWidth
    {
        return MaxWidth::Full;
    }

    public function getHeaderWidgets(): array
    {
        return [];
    }

    public function getFooterWidgets(): array
    {
        return [];
    }

    public function getHeaderWidgetsColumns(): int | array
    {
        return 3;
    }

    public function getFooterWidgetsColumns(): int | array
    {
        return 3;
    }

    public static function getNavigationLabel(): string
    {
        return 'Kanban Board';
    }

    protected function getFilters(): array
    {
        return [
            'all' => 'All',
            'todo' => 'To Do',
            'in_progress' => 'In Progress',
            'done' => 'Done',
        ];
    }

    public function resetFilters(): void
    {
        // Reset all filters except project_id
        $currentProjectId = $this->data['project_id'];
        
        $this->data = [
            'project_id' => $currentProjectId,
            'assigned_to' => null,
            'priority' => null,
            'title' => '',
            'description' => '',
            'task_label_id' => null,
            'due_date' => null,
            'files' => [],
        ];

        // Reset custom field values
        if ($currentProjectId) {
            $project = Project::find($currentProjectId);
            if ($project) {
                $customFields = $project->customFields()
                    ->where('is_use_for_filter', true)
                    ->get();

                foreach ($customFields as $field) {
                    $this->data["custom_field_{$field->id}"] = null;
                }
            }
        }

        // Clear session filters
        session()->forget([
            'task_kanban_assigned_to',
            'task_kanban_priority',
        ]);
    }

    protected function getFormSchema(): array
    {
        return [
            Forms\Components\Select::make('assigned_to')
                ->label('Assignee')
                ->relationship('assignee', 'name')
                ->searchable()
                ->preload()
                ->extraAttributes(['class' => 'w-48']),
            Forms\Components\Toggle::make('show_completed')
                ->label('Show Completed Tasks')
                ->helperText('Toggle to show/hide completed tasks')
                ->default(fn () => session('task_kanban_show_completed', false))
                ->live()
                ->afterStateUpdated(function ($state) {
                    session(['task_kanban_show_completed' => $state]);
                })
                ->extraAttributes(['class' => 'w-40']),
        ];
    }

    public function toggleViewMode(): void
    {
        $this->isVerticalView = !$this->isVerticalView;
    }

    public function moveTask($taskId, $labelId)
    {
        \Log::info('Moving task', ['task_id' => $taskId, 'label_id' => $labelId]);
        
        $task = Task::find($taskId);
        if (!$task) {
            \Log::error('Task not found', ['task_id' => $taskId]);
            \Filament\Notifications\Notification::make()
                ->title('Task not found')
                ->danger()
                ->send();
            return;
        }

        $user = Auth::user();

        // Check if user can move this task (only assignee, project manager, or super admin)
        $canMoveTask = false;
        
        // Super admin can move any task
        if ($user->hasRole('super_admin') || $user->is_admin) {
            $canMoveTask = true;
        }
        // Task assignee can move their own task
        elseif ($task->assigned_to == $user->id) {
            $canMoveTask = true;
        }
        // Project manager can move any task in their project
        elseif ($task->project && $task->project->project_manager_id == $user->id) {
            $canMoveTask = true;
        }

        if (!$canMoveTask) {
            \Log::warning('User attempted to move task without permission', [
                'user_id' => $user->id,
                'task_id' => $taskId,
                'project_id' => $task->project_id,
                'assigned_to' => $task->assigned_to,
                'project_manager_id' => $task->project ? $task->project->project_manager_id : null
            ]);
            \Filament\Notifications\Notification::make()
                ->title('Access denied')
                ->body('You can only move tasks that are assigned to you, or tasks in projects you manage')
                ->danger()
                ->send();
            return;
        }

        try {
            $task->update([
                'task_label_id' => $labelId
            ]);
            
            \Log::info('Task moved successfully', ['task_id' => $taskId, 'label_id' => $labelId]);
            
            // Show success notification
            \Filament\Notifications\Notification::make()
                ->title('Task moved successfully')
                ->success()
                ->send();
            
            $this->dispatch('task-moved', [
                'task_id' => $taskId,
                'label_id' => $labelId
            ]);
            
            // Clear cache after task update
            $this->clearCache();
        } catch (\Exception $e) {
            \Log::error('Failed to move task', [
                'task_id' => $taskId,
                'label_id' => $labelId,
                'error' => $e->getMessage()
            ]);
            
            \Filament\Notifications\Notification::make()
                ->title('Failed to move task')
                ->body('An error occurred while moving the task')
                ->danger()
                ->send();
        }
    }

    public function updateTaskStatus($taskId, $labelId)
    {
        \Log::info('Updating task status', ['task_id' => $taskId, 'label_id' => $labelId]);
        
        $task = Task::find($taskId);
        if (!$task) {
            \Log::error('Task not found', ['task_id' => $taskId]);
            \Filament\Notifications\Notification::make()
                ->title('Task not found')
                ->danger()
                ->send();
            return;
        }

        $user = Auth::user();

        // Check if user can update this task (only assignee, project manager, or super admin)
        $canUpdateTask = false;
        
        // Super admin can update any task
        if ($user->hasRole('super_admin') || $user->is_admin) {
            $canUpdateTask = true;
        }
        // Task assignee can update their own task
        elseif ($task->assigned_to == $user->id) {
            $canUpdateTask = true;
        }
        // Project manager can update any task in their project
        elseif ($task->project && $task->project->project_manager_id == $user->id) {
            $canUpdateTask = true;
        }

        if (!$canUpdateTask) {
            \Log::warning('User attempted to update task without permission', [
                'user_id' => $user->id,
                'task_id' => $taskId,
                'project_id' => $task->project_id,
                'assigned_to' => $task->assigned_to,
                'project_manager_id' => $task->project ? $task->project->project_manager_id : null
            ]);
            \Filament\Notifications\Notification::make()
                ->title('Access denied')
                ->body('You can only update tasks that are assigned to you, or tasks in projects you manage')
                ->danger()
                ->send();
            return;
        }

        try {
            $task->update([
                'task_label_id' => $labelId
            ]);
            
            \Log::info('Task status updated successfully', ['task_id' => $taskId, 'label_id' => $labelId]);
            
            // Show success notification
            \Filament\Notifications\Notification::make()
                ->title('Task status updated successfully')
                ->success()
                ->send();
            
            // Clear cache after task update
            $this->clearCache();
            
        } catch (\Exception $e) {
            \Log::error('Failed to update task status', [
                'task_id' => $taskId,
                'label_id' => $labelId,
                'error' => $e->getMessage()
            ]);
            
            \Filament\Notifications\Notification::make()
                ->title('Failed to update task status')
                ->body('An error occurred while updating the task status')
                ->danger()
                ->send();
        }
    }

    public function closeNotification(): void
    {
        $this->showNotification = false;
        session()->forget('task_notification');
    }

    public function exportTasks(): StreamedResponse
    {
        // Get the current filtered tasks
        $projectId = $this->data['project_id'] ?? null;
        $assignedTo = $this->data['assigned_to'] ?? null;
        $priority = $this->data['priority'] ?? null;
        $showCompleted = $this->data['show_completed'] ?? false;
        $titleFilter = $this->data['title_filter'] ?? '';

        $user = Auth::user();

        // Build the query based on current filters
        $query = Task::query()
            ->with(['project', 'assignee', 'label', 'customFieldValues.customField', 'files', 'comments'])
            ->when($projectId, function (Builder $query) use ($projectId) {
                $query->where('project_id', $projectId);
            })
            ->when($assignedTo, function (Builder $query) use ($assignedTo) {
                $query->where('assigned_to', $assignedTo);
            })
            ->when($priority, function (Builder $query) use ($priority) {
                $query->where('priority', $priority);
            })
            ->when($titleFilter, function (Builder $query) use ($titleFilter) {
                $query->where('title', 'like', "%{$titleFilter}%");
            })
            ->when(!$showCompleted, function (Builder $query) {
                $query->where('is_completed', false);
            });

        // Apply project access authorization
        if (!$user->hasRole('super_admin')) {
            $query->whereHas('project', function (Builder $query) use ($user) {
                $query->where(function ($q) use ($user) {
                    $q->whereHas('members', function ($memberQuery) use ($user) {
                        $memberQuery->where('users.id', $user->id);
                    })
                    ->orWhere('project_manager_id', $user->id);
                });
            });
        }

        // Apply custom field filters
        if ($projectId) {
            $project = Project::find($projectId);
            if ($project) {
                $customFields = $project->customFields()
                    ->where('is_use_for_filter', true)
                    ->get();

                foreach ($customFields as $field) {
                    $filterValue = $this->data["custom_field_{$field->id}"] ?? null;
                    if ($filterValue) {
                        $query->whereHas('customFieldValues', function (Builder $q) use ($field, $filterValue) {
                            $q->where('project_custom_field_id', $field->id)
                              ->where('value', 'like', "%{$filterValue}%");
                        });
                    }
                }
            }
        }

        $tasks = $query->orderBy('created_at', 'desc')->get();

        // Get custom fields for the project
        $customFields = [];
        if ($projectId) {
            $project = Project::find($projectId);
            if ($project) {
                $customFields = $project->customFields()->orderBy('name')->get();
            }
        }

        // Create spreadsheet
        $spreadsheet = new Spreadsheet();
        $sheet = $spreadsheet->getActiveSheet();
        $sheet->setTitle('Tasks Export');

        // Define headers
        $headers = [
            'Task ID',
            'Project Code',
            'Title',
            'Description',
            'Project',
            'Label',
            'Assignee',
            'Priority',
            'Due Date',
            'Status',
            'Is Completed',
            'Completed At',
            'Created At',
            'Updated At',
            'Files Count',
            'Comments Count'
        ];

        // Add custom field headers
        foreach ($customFields as $field) {
            $headers[] = $field->name;
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

        // Fill data
        $rowIndex = 2;
        foreach ($tasks as $task) {
            // Format custom fields for this task
            $task->formatted_custom_fields = $task->customFieldValues->mapWithKeys(function ($value) {
                return [$value->customField->name => $value->value];
            })->toArray();

            $columnIndex = 1;
            
            // Basic task data
            $taskData = [
                $task->project->code . '-' . $task->id,
                $task->project->code,
                $task->title,
                strip_tags($task->description ?: ''),
                $task->project->name,
                $task->label?->name ?: 'Unlabeled',
                $task->assignee?->name ?: 'Unassigned',
                ucfirst($task->priority ?: ''),
                $task->due_date?->format('Y-m-d') ?: '',
                $task->label?->name ?: 'Unlabeled',
                $task->is_completed ? 'Yes' : 'No',
                $task->completed_at?->format('Y-m-d H:i:s') ?: '',
                $task->created_at->format('Y-m-d H:i:s'),
                $task->updated_at->format('Y-m-d H:i:s'),
                $task->files->count(),
                $task->comments->count()
            ];

            foreach ($taskData as $value) {
                $sheet->setCellValueByColumnAndRow($columnIndex, $rowIndex, $value);
                $columnIndex++;
            }

            // Add custom field values
            foreach ($customFields as $field) {
                $value = $task->formatted_custom_fields[$field->name] ?? '';
                $sheet->setCellValueByColumnAndRow($columnIndex, $rowIndex, $value);
                $columnIndex++;
            }

            $rowIndex++;
        }

        // Auto-size columns
        for ($i = 1; $i <= count($headers); $i++) {
            $sheet->getColumnDimensionByColumn($i)->setAutoSize(true);
        }

        // Add borders to all data
        if ($rowIndex > 2) {
            $dataRange = 'A1:' . chr(64 + count($headers)) . ($rowIndex - 1);
            $sheet->getStyle($dataRange)->applyFromArray([
                'borders' => ['allBorders' => ['borderStyle' => Border::BORDER_THIN]]
            ]);
        }

        // Create filename
        $filename = 'tasks_export_' . now()->format('Y-m-d_H-i-s') . '.xlsx';
        if ($projectId && $project = Project::find($projectId)) {
            $filename = 'tasks_' . \Str::slug($project->name) . '_' . now()->format('Y-m-d_H-i-s') . '.xlsx';
        }

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

    public function redirectToImport()
    {
        return $this->redirect(route('filament.admin.pages.task-integration', [
            'project_id' => $this->data['project_id']
        ]));
    }
}
