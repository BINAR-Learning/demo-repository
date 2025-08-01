<div>
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        @foreach($statuses as $status)
            <div class="rounded-lg shadow p-4">
                <h3 class="text-lg font-semibold mb-4">{{ ucfirst($status) }}</h3>
                <div 
                    class="space-y-4"
                    wire:sortable="updateTaskOrder"
                    wire:sortable.options="{ group: 'tasks', animation: 150 }"
                >
                    @foreach($tasks->where('status', $status) as $task)
                        <div 
                            class="bg-gray-50 rounded-lg p-4 cursor-move"
                            wire:key="task-{{ $task->id }}"
                            wire:sortable.item="{{ $task->id }}"
                        >
                            <div class="flex justify-between items-start">
                                <div>
                                    <h4 class="font-medium">{{ $task->title }}</h4>
                                    <p class="text-sm text-gray-600 mt-1">
                                        {{ Str::limit($task->description, 100) }}
                                    </p>
                                    <div class="mt-2 text-xs text-gray-500">
                                        <p>Project: {{ $task->project->name }}</p>
                                        <p>Assignee: {{ $task->assignee->name }}</p>
                                    </div>
                                </div>
                                <button 
                                    class="text-blue-600 hover:text-blue-800"
                                    wire:click="$dispatch('open-modal', { component: 'edit-task', arguments: { taskId: {{ $task->id }} } })"
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                        <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                                    </svg>
                                </button>
                            </div>
                        </div>
                    @endforeach
                </div>
            </div>
        @endforeach
    </div>

    @livewire('edit-task-modal')
</div>

@push('scripts')
<script>
    document.addEventListener('livewire:initialized', () => {
        Livewire.on('task-status-updated', (taskId, newStatus) => {
            @this.updateTaskStatus(taskId, newStatus);
        });

        Livewire.on('task-order-updated', (taskId, newOrder) => {
            @this.updateTaskOrder(taskId, newOrder);
        });
    });
</script>
@endpush 