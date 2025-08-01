<?php

namespace App\Filament\Resources\TaskResource\Pages;

use App\Filament\Resources\TaskResource;
use App\Filament\Resources\TaskResource\Pages\Traits\HasNoRelationManagers;
use Filament\Actions;
use Filament\Resources\Pages\ViewRecord;
use Filament\Forms\Components\Textarea;
use Filament\Forms\Components\RichEditor;
use Filament\Forms\Components\FileUpload;
use Filament\Forms\Form;
use Filament\Notifications\Notification;
use Illuminate\Support\Facades\Auth;
use App\Models\TaskComment;
use Filament\Infolists\Components\Section;
use Filament\Infolists\Components\TextEntry;
use Filament\Infolists\Components\Grid;
use Filament\Infolists\Infolist;
use Filament\Infolists\Components\ViewEntry;
use Filament\Infolists\Components\Actions as InfolistActions;
use Filament\Infolists\Components\Actions\Action;
use Filament\Infolists\Components\Tabs;
use Filament\Infolists\Components\Tabs\Tab;
use Filament\Forms\Components\TextInput;
use Filament\Forms\Components\Select;
use Filament\Forms\Components\DatePicker;
use Filament\Forms\Components\Toggle;
use Filament\Forms\Components\DateTimePicker;

class ViewTask extends ViewRecord
{
    use HasNoRelationManagers;

    protected static string $resource = TaskResource::class;

    public ?array $data = [];

    public function mount(int | string $record): void
    {
        parent::mount($record);
        $this->data = [
            'comment' => '',
            'files' => [],
        ];
    }

    public function infolist(Infolist $infolist): Infolist
    {
        return $infolist
            ->schema([
                Tabs::make('Task Details')
                    ->tabs([
                        Tab::make('Details')
                            ->schema([
                                TextEntry::make('title')
                                    ->label('Title'),
                                TextEntry::make('description')
                                    ->label('Description')
                                    ->columnSpanFull()
                                    ->html(),
                                TextEntry::make('project.name')
                                    ->label('Project'),
                                TextEntry::make('label.name')
                                    ->label('Label'),
                                TextEntry::make('assignee.name')
                                    ->label('Assigned To'),
                                TextEntry::make('due_date')
                                    ->label('Due Date')
                                    ->date(),
                                TextEntry::make('priority')
                                    ->label('Priority')
                                    ->badge()
                                    ->color(fn (string $state): string => match ($state) {
                                        'high' => 'danger',
                                        'medium' => 'warning',
                                        'low' => 'success',
                                        default => 'gray',
                                    }),
                                TextEntry::make('share_with')
                                    ->label('Share With')
                                    ->listWithLineBreaks()
                                    ->formatStateUsing(function ($state) {
                                        if (empty($state)) return 'None';
                                        
                                        // Convert to array if single value
                                        if (is_numeric($state)) {
                                            $workingUnitIds = [$state];
                                        } else if (is_string($state)) {
                                            $workingUnitIds = json_decode($state, true) ?: [];
                                        } else {
                                            $workingUnitIds = $state;
                                        }
                                            
                                        if (empty($workingUnitIds)) return 'None';
                                        
                                        return \App\Models\WorkingUnit::whereIn('id', $workingUnitIds)
                                            ->pluck('name')
                                            ->join(', ');
                                    }),
                                TextEntry::make('is_completed')
                                    ->label('Status')
                                    ->badge()
                                    ->color(fn (bool $state): string => $state ? 'success' : 'warning')
                                    ->formatStateUsing(fn (bool $state): string => $state ? 'Completed' : 'In Progress'),
                                TextEntry::make('completed_at')
                                    ->label('Completed At')
                                    ->dateTime()
                                    ->visible(fn ($record) => $record->is_completed),
                                Section::make('Custom Fields')
                                    ->schema(function ($record) {
                                        $project = $record->project;
                                        if (!$project) {
                                            return [];
                                        }

                                        $customFields = $project->customFields()
                                            ->orderBy('order')
                                            ->get();

                                        $components = [];
                                        foreach ($customFields as $field) {
                                            $value = $record->getCustomFieldValue($field->id);
                                            
                                            if ($field->type === 'enum' && $field->is_allow_multiple && $value) {
                                                $decodedValue = json_decode($value, true);
                                                $value = $decodedValue ?: [$value];
                                                
                                                $formattedValue = collect($value)->map(function ($v) use ($field) {
                                                    $option = collect($field->options)->firstWhere('value', $v);
                                                    return $option['label'] ?? $v;
                                                })->join(', ');
                                            } else if ($field->type === 'enum' && $value) {
                                                $option = collect($field->options)->firstWhere('value', $value);
                                                $value = $option['label'] ?? $value;
                                            }

                                            $components[] = TextEntry::make("custom_field_{$field->id}")
                                                ->label($field->name)
                                                ->state($value)
                                                ->visible(fn () => $value !== null);
                                        }

                                        return $components;
                                    })
                                    ->columns(2),
                                Section::make('Files')
                                    ->schema([
                                        ViewEntry::make('files')
                                            ->view('filament.forms.components.existing-files-table')
                                            ->viewData([
                                                'files' => $this->record->files()->with('uploader')->get()
                                            ])
                                    ])
                                    ->columnSpanFull(),
                            ])
                            ->columns(2),
                        
                        Tab::make('Comments')
                            ->schema([
                                Section::make()
                                    ->schema([
                                        InfolistActions::make([
                                            Action::make('add_comment')
                                                ->label('Add Comment')
                                                ->icon('heroicon-m-chat-bubble-left')
                                                ->form([
                                                    RichEditor::make('comment')
                                                        ->label('Comment')
                                                        ->placeholder('Write your comment here...')
                                                        ->required()
                                                        ->toolbarButtons([
                                                            'blockquote',
                                                            'bold',
                                                            'bulletList',
                                                            'codeBlock',
                                                            'h2',
                                                            'h3',
                                                            'italic',
                                                            'link',
                                                            'orderedList',
                                                            'redo',
                                                            'strike',
                                                            'underline',
                                                            'undo',
                                                        ])
                                                ])
                                                ->action(function (array $data): void {
                                                    $comment = new TaskComment([
                                                        'comment' => $data['comment'],
                                                        'user_id' => Auth::id(),
                                                        'task_id' => $this->record->id,
                                                    ]);
                                                    
                                                    $comment->save();

                                                    Notification::make()
                                                        ->title('Comment added successfully')
                                                        ->success()
                                                        ->send();

                                                    $this->dispatch('comment-added');
                                                }),
                                        ]),
                                        ViewEntry::make('comments')
                                            ->view('filament.infolists.components.chat-messages')
                                            ->viewData([
                                                'task' => $this->record,
                                                'comments' => $this->record->comments()->with('user')->get()
                                            ])
                                            ->columnSpanFull(),
                                    ]),
                            ]),

                        Tab::make('Activity Log')
                            ->schema([
                                ViewEntry::make('activity_log')
                                    ->view('filament.infolists.components.task-activity-log')
                                    ->label('')
                                    ->columnSpanFull(),
                            ]),
                    ])
                    ->columnSpanFull(),
            ]);
    }

    protected function getHeaderActions(): array
    {
        $user = Auth::user();
        $record = $this->getRecord();
        
        // Check if user can edit this task
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

        $actions = [
            Actions\Action::make('back')
                ->label('Back to Kanban')
                ->icon('heroicon-m-arrow-left')
                ->url(fn () => route('filament.admin.pages.task-kanban', ['project_id' => $this->record->project_id]))
                ->color('gray'),
        ];

        // Only show edit action if user has permission
        if ($canEditTask) {
            $actions[] = Actions\EditAction::make();
        }

        return $actions;
    }
} 