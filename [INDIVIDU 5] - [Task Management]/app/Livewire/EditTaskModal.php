<?php

namespace App\Livewire;

use App\Models\Task;
use Livewire\Component;
use Livewire\Attributes\On;

class EditTaskModal extends Component
{
    public ?Task $task = null;
    public bool $showModal = false;

    #[On('open-modal')]
    public function openModal($component, $arguments)
    {
        if ($component === 'edit-task') {
            $this->task = Task::with(['project', 'assignee'])->find($arguments['taskId']);
            $this->showModal = true;
        }
    }

    public function closeModal()
    {
        $this->showModal = false;
        $this->task = null;
    }

    public function save()
    {
        $this->validate([
            'task.title' => 'required|string|max:255',
            'task.description' => 'required|string',
            'task.status' => 'required|string',
            'task.project_id' => 'required|exists:projects,id',
            'task.assignee_id' => 'required|exists:users,id',
        ]);

        $this->task->save();
        $this->closeModal();
        $this->dispatch('task-updated');
    }

    public function render()
    {
        return view('livewire.edit-task-modal');
    }
} 