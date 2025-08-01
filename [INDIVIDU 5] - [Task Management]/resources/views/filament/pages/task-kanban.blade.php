<x-filament-panels::page>
    <div class="space-y-6">
        {{-- Filter Section --}}
        <div class="rounded-lg shadow">
            <div class="p-6">
                <div class="flex items-center justify-between mb-6">
                    <h2 class="text-lg font-medium text-gray-900">Filter Tasks</h2>
                    <div class="flex items-center gap-2">
                        <x-filament::button
                            color="gray"
                            wire:click="toggleViewMode"
                            size="sm"
                            wire:loading.attr="disabled"
                            wire:target="toggleViewMode"
                        >
                            <div class="flex items-center gap-2">
                                <div wire:loading wire:target="toggleViewMode">
                                    <x-filament::loading-indicator class="w-4 h-4" />
                                </div>
                                <div wire:loading.remove wire:target="toggleViewMode">
                                    @if($isVerticalView)
                                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
                                        </svg>
                                    @else
                                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
                                        </svg>
                                    @endif
                                </div>
                                <span wire:loading.remove wire:target="toggleViewMode">
                                    @if($isVerticalView)
                                        Horizontal View
                                    @else
                                        Vertical View
                                    @endif
                                </span>
                                <span wire:loading wire:target="toggleViewMode">Loading...</span>
                            </div>
                        </x-filament::button>
                        <x-filament::button
                            color="gray"
                            wire:click="resetFilters"
                            size="sm"
                            wire:loading.attr="disabled"
                            wire:target="resetFilters"
                        >
                            <div class="flex items-center gap-2">
                                <div wire:loading wire:target="resetFilters">
                                    <x-filament::loading-indicator class="w-4 h-4" />
                                </div>
                                <span wire:loading.remove wire:target="resetFilters">Reset Filters</span>
                                <span wire:loading wire:target="resetFilters">Resetting...</span>
                            </div>
                        </x-filament::button>
                        @if($data['project_id'])
                            <x-filament::button
                                color="primary"
                                wire:click="redirectToCreateTask"
                                size="sm"
                                wire:loading.attr="disabled"
                                wire:target="redirectToCreateTask"
                            >
                                <div class="flex items-center gap-2">
                                    <div wire:loading wire:target="redirectToCreateTask">
                                        <x-filament::loading-indicator class="w-4 h-4" />
                                    </div>
                                    <span wire:loading.remove wire:target="redirectToCreateTask">Add Task</span>
                                    <span wire:loading wire:target="redirectToCreateTask">Loading...</span>
                                </div>
                            </x-filament::button>
                        @endif
                        <x-filament::button
                            color="warning"
                            wire:click="redirectToImport"
                            size="sm"
                            :disabled="!$data['project_id']"
                            wire:loading.attr="disabled"
                            wire:target="redirectToImport"
                        >
                            <div class="flex items-center gap-2">
                                <div wire:loading wire:target="redirectToImport">
                                    <x-filament::loading-indicator class="w-4 h-4" />
                                </div>
                                <div wire:loading.remove wire:target="redirectToImport">
                                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3V10" />
                                    </svg>
                                </div>
                                <span wire:loading.remove wire:target="redirectToImport">Import</span>
                                <span wire:loading wire:target="redirectToImport">Loading...</span>
                            </div>
                        </x-filament::button>
                        <x-filament::button
                            color="success"
                            wire:click="exportTasks"
                            size="sm"
                            :disabled="!$data['project_id']"
                            wire:loading.attr="disabled"
                            wire:target="exportTasks"
                        >
                            <div class="flex items-center gap-2">
                                <div wire:loading wire:target="exportTasks">
                                    <x-filament::loading-indicator class="w-4 h-4" />
                                </div>
                                <div wire:loading.remove wire:target="exportTasks">
                                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                    </svg>
                                </div>
                                <span wire:loading.remove wire:target="exportTasks">Export</span>
                                <span wire:loading wire:target="exportTasks">Exporting...</span>
                            </div>
                        </x-filament::button>
                    </div>
                </div>

                <div class="mt-6">
                    <x-filament-panels::form>
                        <div class="grid grid-cols-1 lg:grid-cols-2 2xl:grid-cols-3 gap-6">
                            {{ $this->form }}
                        </div>
                    </x-filament-panels::form>
                    
                    {{-- Loading indicator for form filters --}}
                    <div wire:loading wire:target="data" class="mt-4">
                        <br>
                        <div class="flex items-center gap-2 text-sm text-gray-600">
                            <x-filament::loading-indicator class="w-4 h-4" />
                            <span>Updating tasks...</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        {{-- Task Notification --}}
        @if(session('task_notification') && $showNotification)
            @php
                $notification = session('task_notification');
                $type = $notification['type'];
                $title = $notification['title'];
                $label = $notification['label'];
                $project = $notification['project'];
                $taskId = $notification['task_id'] ?? null;
            @endphp
            <div style="background-color: #FEF3C7; border: 1px solid #FCD34D; border-radius: 0.5rem; padding: 1rem; margin-bottom: 1rem; box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05);">
                <div class="flex items-start">
                    <div class="flex-shrink-0">
                        @if($type === 'created')
                            <div style="height: 2.5rem; width: 2.5rem; border-radius: 9999px; background-color: #FDE68A; display: flex; align-items: center; justify-content: center;">
                                <svg class="h-6 w-6" style="color: #D97706;" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
                                </svg>
                            </div>
                        @else
                            <div style="height: 2.5rem; width: 2.5rem; border-radius: 9999px; background-color: #FDE68A; display: flex; align-items: center; justify-center: center;">
                                <svg class="h-6 w-6" style="color: #D97706;" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path>
                                </svg>
                            </div>
                        @endif
                    </div>
                    <div class="ml-3 w-0 flex-1">
                        @if($taskId)
                            <a href="{{ route('filament.admin.resources.tasks.view', ['record' => $taskId]) }}" style="display: block; padding: 0.5rem; margin: -0.5rem; border-radius: 0.5rem; transition: background-color 0.2s;" onmouseover="this.style.backgroundColor='#FDE68A'" onmouseout="this.style.backgroundColor='transparent'">
                        @endif
                            <p style="font-size: 0.875rem; font-weight: 500; color: #92400E;">
                                Task {{ $type === 'created' ? 'Created' : 'Updated' }}
                            </p>
                            <div style="margin-top: 0.25rem; font-size: 0.875rem; color: #78350F;">
                                <p style="font-weight: 500;">{{ $title }}</p>
                                <p style="font-size: 0.75rem; margin-top: 0.25rem;">
                                    <span style="display: inline-flex; align-items: center; padding: 0.125rem 0.5rem; border-radius: 0.25rem; font-size: 0.75rem; font-weight: 500; background-color: #FDE68A; color: #92400E;">
                                        {{ $label }}
                                    </span>
                                    <span style="margin-left: 0.5rem; color: #92400E;">{{ $project }}</span>
                                </p>
                            </div>
                        @if($taskId)
                            </a>
                        @endif
                    </div>
                    <div class="ml-4 flex-shrink-0 flex">
                        <button wire:click="closeNotification" style="background-color: transparent; border-radius: 0.375rem; display: inline-flex; color: #D97706; padding: 0.25rem; transition: color 0.2s;" onmouseover="this.style.color='#92400E'" onmouseout="this.style.color='#D97706'">
                            <span class="sr-only">Close</span>
                            <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
                            </svg>
                        </button>
                    </div>
                </div>
            </div>
        @endif

        {{-- Kanban Board --}}
        @php
            $labelSectionWidth = "w-[450px]";
            $taskCardClasses = "w-full rounded-lg p-4 cursor-pointer border border-gray-300 transition-colors";
        @endphp

        {{-- Simple loading indicator for task updates --}}
        <div wire:loading wire:target="moveTask, updateTaskStatus"
             class="fixed top-4 right-4 z-50">
            <div class="flex items-center gap-2 bg-white rounded-lg shadow-lg px-4 py-2 border">
                <x-filament::loading-indicator class="w-4 h-4" />
                <span class="text-sm font-medium text-gray-700">Updating task...</span>
            </div>
        </div>

        @if($isVerticalView)
            <div class="dark:bg-gray-800 rounded-lg shadow overflow-hidden">
                <div class="overflow-x-auto">
                    <table class="min-w-full divide-y divide-gray-200">
                        <thead class="bg-gray-50 dark:bg-gray-800">
                            <tr>
                                <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Task</th>
                                <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Priority</th>
                                <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Assignee</th>
                                <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Due Date</th>
                                @if(!empty($customFields))
                                    @foreach($customFields as $field)
                                        <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{{ $field->name }}</th>
                                    @endforeach
                                @endif
                                <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Comments</th>
                            </tr>
                        </thead>
                        <tbody class="bg-white dark:bg-gray-800 divide-y divide-gray-200">
                            @php
                                $allTasks = collect();
                                foreach ($labels as $label) {
                                    foreach ($label['tasks'] as $task) {
                                        $task->label_info = $label;
                                        $allTasks->push($task);
                                    }
                                }
                            @endphp
                            
                            @foreach($allTasks as $task)
                                @php
                                    $currentUser = Auth::user();
                                    $canMoveTaskVertical = false;
                                    
                                    // Super admin can move any task
                                    if ($currentUser->hasRole('super_admin') || $currentUser->is_admin) {
                                        $canMoveTaskVertical = true;
                                    }
                                    // Task assignee can move their own task
                                    elseif ($task->assigned_to == $currentUser->id) {
                                        $canMoveTaskVertical = true;
                                    }
                                    // Project manager can move any task in their project
                                    elseif ($task->project && $task->project->project_manager_id == $currentUser->id) {
                                        $canMoveTaskVertical = true;
                                    }
                                @endphp
                                <tr wire:loading.class="opacity-50" wire:target="redirectToTask({{ $task->id }})" class="{{ !$canMoveTaskVertical ? 'opacity-75' : '' }}">
                                    <td class="px-6 py-4 whitespace-nowrap cursor-pointer" wire:click="redirectToTask({{ $task->id }})">
                                        <div class="flex items-center">
                                            <div class="ml-3">
                                                <div class="text-sm font-medium text-gray-900 flex items-center gap-2">
                                                    <span class="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium border border-primary-500">
                                                        {{ $task->project->code }}-{{ $task->id }}
                                                    </span>
                                                    @if($task->is_completed)
                                                        <span class="text-gray-500" style="text-decoration: line-through;">{{ $task->title }}</span>
                                                    @else
                                                        {{ $task->title }}
                                                    @endif
                                                    @if(!$canMoveTaskVertical)
                                                        <svg class="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" title="You cannot move this task">
                                                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                                                        </svg>
                                                    @endif
                                                </div>
                                                <div class="text-sm text-gray-500 mt-1">{{ $task->project->name }}</div>
                                                
                                                {{-- Files --}}
                                                @if($task->files->isNotEmpty())
                                                    <div class="flex flex-wrap gap-1 mt-1">
                                                        @foreach($task->files as $file)
                                                            <span class="inline-flex items-center gap-1 px-1.5 py-0.5 text-xs text-gray-600 bg-gray-100 rounded">
                                                                <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                                                                </svg>
                                                                {{ Str::limit($file->file_name, 15) }}
                                                            </span>
                                                        @endforeach
                                                    </div>
                                                @endif
                                            </div>
                                        </div>
                                    </td>
                                    <td class="px-6 py-4 whitespace-nowrap" wire:click.stop>
                                        <div class="flex items-center gap-2">
                                            <div class="relative">
                                                @php
                                                    $currentUser = Auth::user();
                                                    $canUpdateTask = false;
                                                    
                                                    // Super admin can update any task
                                                    if ($currentUser->hasRole('super_admin') || $currentUser->is_admin) {
                                                        $canUpdateTask = true;
                                                    }
                                                    // Task assignee can update their own task
                                                    elseif ($task->assigned_to == $currentUser->id) {
                                                        $canUpdateTask = true;
                                                    }
                                                    // Project manager can update any task in their project
                                                    elseif ($task->project && $task->project->project_manager_id == $currentUser->id) {
                                                        $canUpdateTask = true;
                                                    }
                                                @endphp
                                                <select 
                                                    wire:change="updateTaskStatus({{ $task->id }}, $event.target.value)"
                                                    class="text-sm border border-gray-200 rounded px-2 py-1 dark:bg-gray-800 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:outline-none font-medium min-w-[120px] {{ !$canUpdateTask ? 'opacity-50 cursor-not-allowed' : '' }}"
                                                    style="color: {{ $task->label_info['color'] }}"
                                                    @if(!$canUpdateTask) disabled title="You don't have permission to change this task's status" @endif
                                                >
                                                    @foreach($labels as $label)
                                                        @if($label['id'] !== null)
                                                            <option 
                                                                value="{{ $label['id'] }}" 
                                                                @if($task->task_label_id == $label['id']) selected @endif
                                                                style="color: {{ $label['color'] }}"
                                                            >
                                                                {{ $label['name'] }}
                                                            </option>
                                                        @endif
                                                    @endforeach
                                                </select>

                                            </div>
                                            @if($task->label_info['icon'])
                                                <x-filament::icon
                                                    :icon="$task->label_info['icon']"
                                                    class="w-4 h-4 flex-shrink-0"
                                                    :style="'color: ' . $task->label_info['color']"
                                                />
                                            @endif
                                        </div>
                                    </td>
                                    <td class="px-6 py-4 whitespace-nowrap cursor-pointer" wire:click="redirectToTask({{ $task->id }})">
                                        @if($task->priority)
                                            <x-filament::badge :color="match($task->priority) {
                                                'high' => 'danger',
                                                'medium' => 'warning',
                                                'low' => 'success',
                                                default => 'gray'
                                            }">
                                                {{ ucfirst($task->priority) }}
                                            </x-filament::badge>
                                        @else
                                            <span class="text-sm text-gray-400">-</span>
                                        @endif
                                    </td>
                                    <td class="px-6 py-4 whitespace-nowrap cursor-pointer" wire:click="redirectToTask({{ $task->id }})">
                                        @if($task->assignee)
                                            <div class="flex items-center gap-2">
                                                @if ($task->assignee->avatar)
                                                    <img 
                                                        src="{{ $task->assignee->profile_photo_url }}" 
                                                        alt="{{ $task->assignee->name }}"
                                                        class="w-8 h-8 rounded-full"
                                                    >
                                                @else
                                                    <div class="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-xs font-medium">
                                                        @php
                                                            $words = explode(' ', $task->assignee->name);
                                                            $initials = '';
                                                            foreach ($words as $index => $word) {
                                                                if ($index > 1) break;
                                                                $initials .= strtoupper(substr($word, 0, 1));
                                                            }
                                                            echo $initials;
                                                        @endphp
                                                    </div>
                                                @endif
                                                <span class="text-sm text-gray-900">{{ $task->assignee->name }}</span>
                                            </div>
                                        @else
                                            <span class="text-sm text-gray-400">Unassigned</span>
                                        @endif
                                    </td>
                                    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500 cursor-pointer" wire:click="redirectToTask({{ $task->id }})">
                                        @if($task->due_date)
                                            <span class="{{ $task->due_date->isPast() ? 'text-red-600 font-medium' : '' }}">
                                                {{ $task->due_date->format('M d, Y') }}
                                            </span>
                                        @else
                                            <span class="text-gray-400">-</span>
                                        @endif
                                    </td>
                                    @if(!empty($customFields))
                                        @foreach($customFields as $field)
                                            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500 cursor-pointer" wire:click="redirectToTask({{ $task->id }})">
                                                @php
                                                    $customFieldValue = $task->formatted_custom_fields[$field->name] ?? null;
                                                @endphp
                                                @if($customFieldValue)
                                                    <span class="text-sm text-gray-900">{{ $customFieldValue }}</span>
                                                @else
                                                    <span class="text-gray-400">-</span>
                                                @endif
                                            </td>
                                        @endforeach
                                    @endif
                                    <td class="px-6 py-4 whitespace-nowrap cursor-pointer" wire:click="redirectToTask({{ $task->id }})">
                                        @if($task->comments->isNotEmpty())
                                            <div class="flex items-center gap-2 text-sm text-gray-500">
                                                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                                                </svg>
                                                <span>{{ $task->comments->count() }}</span>
                                            </div>
                                        @else
                                            <span class="text-sm text-gray-400">0</span>
                                        @endif
                                    </td>
                                </tr>
                            @endforeach
                            
                            @if($allTasks->isEmpty())
                                <tr>
                                    <td colspan="{{ 6 + (!empty($customFields) ? count($customFields) : 0) }}" class="px-6 py-12 text-center">
                                        <div class="text-gray-500">
                                            {{-- <svg class="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                                            </svg> --}}
                                            <p class="mt-2 text-sm">No tasks found</p>
                                        </div>
                                    </td>
                                </tr>
                            @endif
                        </tbody>
                    </table>
                </div>
            </div>
        @else
            <div class="overflow-x-auto pb-4">
                <div class="flex gap-4" style="min-width: max-content;">
                    @foreach ($labels as $label)
                        <div class="{{ $labelSectionWidth }} flex-shrink-0" style="border-radius: 10px 10px 0 0;">
                            <div class="p-3 border-b border-gray-300 dark:border-gray-300 bg-gray-100 dark:bg-gray-800" style="color: {{ $label['color'] }}; border-radius: 10px 10px 0 0;">
                                <div class="flex items-center justify-between">
                                    <div class="flex items-center gap-2">
                                        @if($label['icon'])
                                            <x-filament::icon
                                                :icon="$label['icon']"
                                                class="w-5 h-5"
                                            />
                                        @endif
                                        <span class="font-semibold">
                                            {{ ($label['name']) }}
                                        </span>
                                        @if(isset($label['project_name']))
                                            <span class="text-sm">
                                                ({{ $label['project_name'] }})
                                            </span>
                                        @endif
                                    </div>
                                    <span class="text-sm">
                                        {{ $label['tasks']->count() }} tasks
                                    </span>
                                </div>
                            </div>

                            <div class="p-4 space-y-3 max-h-[calc(100vh-16rem)] overflow-y-auto min-h-[200px] relative"
                                x-data="{ 
                                    dragOver: false,
                                    isMoving: false,
                                    handleDragOver(e) {
                                        e.preventDefault();
                                        this.dragOver = true;
                                    },
                                    handleDragLeave() {
                                        this.dragOver = false;
                                    },
                                    handleDrop(e, labelId) {
                                        e.preventDefault();
                                        this.dragOver = false;
                                        this.isMoving = true;
                                        const taskId = e.dataTransfer.getData('taskId');
                                        console.log('Drop event - Task ID:', taskId, 'Label ID:', labelId);
                                        
                                        if (taskId) {
                                            console.log('Calling moveTask with:', { taskId, labelId });
                                            $wire.moveTask(taskId, labelId)
                                                .then(() => {
                                                    console.log('Task moved successfully');
                                                    this.isMoving = false;
                                                    $dispatch('notify', {
                                                        type: 'success',
                                                        message: 'Task moved successfully'
                                                    });
                                                })
                                                .catch((error) => {
                                                    console.error('Error moving task:', error);
                                                    this.isMoving = false;
                                                    $dispatch('notify', {
                                                        type: 'error',
                                                        message: 'Failed to move task'
                                                    });
                                                });
                                        } else {
                                            console.log('No taskId found in dataTransfer');
                                            this.isMoving = false;
                                        }
                                    }
                                }"
                                x-on:dragover="handleDragOver"
                                x-on:dragleave="handleDragLeave"
                                x-on:drop="handleDrop($event, {{ $label['id'] }})"
                                :class="{ 'bg-blue-50 border-2 border-dashed border-blue-300': dragOver }"
                                style="width: 400px;"
                            >
                                {{-- Drop zone indicator when dragging over --}}
                                <div x-show="dragOver" 
                                     x-transition:enter="transition ease-out duration-200"
                                     x-transition:enter-start="opacity-0"
                                     x-transition:enter-end="opacity-100"
                                     x-transition:leave="transition ease-in duration-150"
                                     x-transition:leave-start="opacity-100"
                                     x-transition:leave-end="opacity-0"
                                     class="absolute inset-0 flex items-center justify-center bg-blue-50 bg-opacity-90 rounded-lg z-10 pointer-events-none">
                                    <div class="text-center text-blue-600">
                                        <svg class="mx-auto h-12 w-12 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                                        </svg>
                                        <p class="mt-2 text-sm font-medium">Drop task here</p>
                                    </div>
                                </div>



                                @if($label['tasks']->isEmpty())
                                    <div class="h-[200px] flex items-center justify-center rounded-lg p-4">
                                        <div class="text-center text-gray-500">
                                            <svg class="mx-auto h-8 w-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                                            </svg>
                                            <p class="mt-1 text-xs">Drop tasks here</p>
                                        </div>
                                    </div>
                                @else
                                @foreach ($label['tasks'] as $task)
                                    @php
                                        $currentUser = Auth::user();
                                        $canMoveTask = false;
                                        
                                        // Super admin can move any task
                                        if ($currentUser->hasRole('super_admin') || $currentUser->is_admin) {
                                            $canMoveTask = true;
                                        }
                                        // Task assignee can move their own task
                                        elseif ($task->assigned_to == $currentUser->id) {
                                            $canMoveTask = true;
                                        }
                                        // Project manager can move any task in their project
                                        elseif ($task->project && $task->project->project_manager_id == $currentUser->id) {
                                            $canMoveTask = true;
                                        }
                                    @endphp
                                    <div 
                                        wire:key="task-{{ $task->id }}" 
                                        class="{{ $taskCardClasses }} relative {{ !$canMoveTask ? 'opacity-75' : '' }}"
                                        wire:click="redirectToTask({{ $task->id }})"
                                        wire:loading.class="opacity-50"
                                        wire:target="redirectToTask({{ $task->id }})"
                                        @if($canMoveTask)
                                            draggable="true"
                                            x-data="{ 
                                                handleDragStart(e) {
                                                    console.log('Drag start for task:', {{ $task->id }});
                                                    e.dataTransfer.setData('taskId', {{ $task->id }});
                                                    e.dataTransfer.effectAllowed = 'move';
                                                }
                                            }"
                                            x-on:dragstart="handleDragStart"
                                        @else
                                            draggable="false"
                                            title="You don't have permission to move this task"
                                        @endif
                                    >

                                        <div class="space-y-3">
                                            {{-- Title and Project --}}
                                            <div>
                                                <div class="flex items-start justify-between">
                                                    <div class="flex-1">
                                                        <h3 class="text-sm font-medium text-gray-900">
                                                            @if($task->is_completed)
                                                                <span class="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium border border-primary-500 mr-2">{{ $task->project->code }}-{{ $task->id }}</span>
                                                                <span class="text-gray-500" style="text-decoration: line-through;">{{ $task->title }}</span>
                                                            @else
                                                                <span class="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium border border-primary-500 mr-2">{{ $task->project->code }}-{{ $task->id }}</span>
                                                                {{ $task->title }}
                                                            @endif
                                                        </h3>
                                                        <p class="text-xs text-gray-500 mt-1">{{ $task->project->name }}</p>
                                                    </div>
                                                    @if(!$canMoveTask)
                                                        <div class="flex-shrink-0 ml-2" title="You cannot move this task">
                                                            <svg class="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                                                            </svg>
                                                        </div>
                                                    @endif
                                                </div>
                                            </div>

                                            {{-- Custom Fields --}}
                                                @if($task->formatted_custom_fields)
                                                    <div class="mt-2 space-y-1">
                                                        @foreach($task->formatted_custom_fields as $fieldName => $value)
                                                            <div class="text-sm text-gray-500">
                                                                <span class="font-medium">{{ $fieldName }}:</span>
                                                                <span>{{ $value }}</span>
                                                            </div>
                                                    @endforeach
                                                </div>
                                            @endif

                                            {{-- Priority and Due Date --}}
                                            <div class="flex items-center gap-2">
                                                @if($task->priority)
                                                    <x-filament::badge :color="match($task->priority) {
                                                        'high' => 'danger',
                                                        'medium' => 'warning',
                                                        'low' => 'success',
                                                        default => 'gray'
                                                    }">
                                                        {{ ucfirst($task->priority) }}
                                                    </x-filament::badge>
                                                @endif
                                                @if($task->due_date)
                                                    <span class="text-xs text-gray-500">
                                                        Due: {{ $task->due_date->format('M d, Y') }}
                                                    </span>
                                                @endif
                                            </div>

                                            {{-- Comments --}}
                                            @if($task->comments->isNotEmpty())
                                                <div class="flex items-center gap-2 text-xs text-gray-500">
                                                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                                                    </svg>
                                                    <span>{{ $task->comments->count() }} comments</span>
                                                    @if($task->comments->isNotEmpty())
                                                        <span class="text-gray-400">•</span>
                                                        <span class="truncate max-w-[150px]">
                                                            {{ Str::limit(strip_tags($task->comments->last()->comment), 50) }}
                                                        </span>
                                                    @endif
                                                </div>
                                            @endif

                                            {{-- Files --}}
                                            @if($task->files->isNotEmpty())
                                                <div class="flex flex-wrap gap-2">
                                                    @foreach($task->files as $file)
                                                        <div class="inline-flex items-center gap-1 px-2 py-1 text-xs  text-gray-600 rounded" style="background-color: #FDFAF6;">
                                                            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                                                            </svg>
                                                            {{ $file->file_name }}
                                                        </div>
                                                    @endforeach
                                                </div>
                                            @endif

                                            {{-- Assignee --}}
                                            <div class="flex items-center justify-between pt-2">
                                                @if($task->assignee)
                                                    <div class="flex items-center gap-2">
                                                        @if ($task->assignee->avatar)
                                                            <img 
                                                                src="{{ $task->assignee->profile_photo_url }}" 
                                                                alt="{{ $task->assignee->name }}"
                                                                class="w-6 h-6 rounded-full"
                                                            >
                                                        @else
                                                            <div class="w-6 h-6 rounded-full bg-gray-200 flex items-center justify-center" style="font-size: 10px;">
                                                                @php
                                                                    $words = explode(' ', $task->assignee->name);
                                                                    $initials = '';
                                                                    foreach ($words as $index => $word) {
                                                                        if ($index > 1) {
                                                                            break;
                                                                        }
                                                                        $initials .= strtoupper(substr($word, 0, 1));
                                                                    }
                                                                    echo $initials;
                                                                @endphp
                                                            </div>
                                                        @endif
                                                        <span class="text-xs text-gray-600" style="font-size: 12px;">{{ $task->assignee->name }}</span>
                                                    </div>
                                                @endif
                                                <div wire:loading wire:target="redirectToTask({{ $task->id }})">
                                                    <x-filament::loading-indicator class="w-4 h-4" />
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                @endforeach
                                @endif
                            </div>
                        </div>
                    @endforeach
                </div>
            </div>
        @endif
    </div>
</x-filament-panels::page>
