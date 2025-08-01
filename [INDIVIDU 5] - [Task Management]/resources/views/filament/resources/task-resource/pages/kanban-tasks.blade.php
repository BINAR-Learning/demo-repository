<x-filament-panels::page>
    <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
        @foreach($statuses as $status => $title)
            <div 
                class="rounded-lg shadow p-4"
                wire:sortable.item="{{ $status }}"
                wire:sortable.options="{ group: 'tasks' }"
            >
                <h3 class="text-lg font-semibold mb-4">{{ $title }}</h3>
                <div 
                    class="space-y-4 min-h-[200px]"
                    wire:sortable.handle
                >
                    @foreach($tasks->where('status', $status) as $task)
                        <div 
                            class="bg-gray-50 rounded-lg p-4 cursor-move hover:shadow-md transition-shadow"
                            wire:key="task-{{ $task->id }}"
                            wire:sortable.item="{{ $task->id }}"
                        >
                            <div class="flex justify-between items-start mb-2">
                                <h4 class="font-medium">{{ $task->title }}</h4>
                                <div class="flex space-x-2">
                                    <x-filament::icon-button
                                        icon="heroicon-m-pencil-square"
                                        wire:click="$dispatch('open-modal', { id: 'edit-task-{{ $task->id }}' })"
                                        size="sm"
                                    />
                                </div>
                            </div>
                            <p class="text-sm text-gray-600 mb-2">{{ Str::limit($task->description, 100) }}</p>
                            <div class="flex items-center space-x-2 text-sm text-gray-500">
                                <span>{{ $task->project?->name }}</span>
                                <span>•</span>
                                <span>{{ $task->assignee?->name }}</span>
                            </div>
                        </div>

                        <x-filament::modal
                            id="edit-task-{{ $task->id }}"
                            width="2xl"
                        >
                            <x-slot name="heading">
                                Edit Task
                            </x-slot>

                            <x-filament-panels::form wire:submit="updateTask({{ $task->id }})">
                                <div class="space-y-4">
                                    <x-filament::input
                                        type="text"
                                        wire:model="form.title"
                                        label="Title"
                                        required
                                    />
                                    <x-filament::input
                                        type="textarea"
                                        wire:model="form.description"
                                        label="Description"
                                        required
                                    />
                                    <x-filament::input
                                        type="select"
                                        wire:model="form.status"
                                        label="Status"
                                        :options="$statuses"
                                        required
                                    />
                                </div>

                                <x-slot name="footerActions">
                                    <x-filament::button type="submit">
                                        Save changes
                                    </x-filament::button>
                                </x-slot>
                            </x-filament-panels::form>
                        </x-filament::modal>
                    @endforeach
                </div>
            </div>
        @endforeach
    </div>

    @push('scripts')
        <script>
            document.addEventListener('livewire:initialized', () => {
                Livewire.on('taskStatusUpdated', () => {
                    // Refresh the page or update the UI as needed
                });
            });
        </script>
    @endpush
</x-filament-panels::page> 