<div>
    <x-filament::modal wire:model="showModal" width="2xl">
        <div class="p-6">
            <h2 class="text-lg font-medium text-gray-900 mb-4">
                Edit Task
            </h2>

            <x-filament-panels::form wire:submit="save">
                <div class="space-y-4">
                    <x-filament::input
                        type="text"
                        wire:model="task.title"
                        label="Title"
                        required
                    />

                    <x-filament::input
                        type="textarea"
                        wire:model="task.description"
                        label="Description"
                        required
                    />

                    <x-filament::input
                        type="select"
                        wire:model="task.status"
                        label="Status"
                        :options="[
                            'todo' => 'To Do',
                            'in_progress' => 'In Progress',
                            'in_review' => 'In Review',
                            'done' => 'Done',
                        ]"
                        required
                    />

                    <x-filament::input
                        type="select"
                        wire:model="task.project_id"
                        label="Project"
                        :options="\App\Models\Project::pluck('name', 'id')"
                        required
                    />

                    <x-filament::input
                        type="select"
                        wire:model="task.assignee_id"
                        label="Assignee"
                        :options="\App\Models\User::pluck('name', 'id')"
                        required
                    />
                </div>

                <div class="mt-6 flex justify-end space-x-3">
                    <x-filament::button
                        color="gray"
                        wire:click="$set('showModal', false)"
                    >
                        Cancel
                    </x-filament::button>
                    <x-filament::button type="submit">
                        Save changes
                    </x-filament::button>
                </div>
            </x-filament-panels::form>
        </div>
    </x-filament::modal>
</div> 