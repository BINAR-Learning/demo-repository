<?php

namespace App\Livewire;

use App\Models\Task;
use Livewire\Component;
use Livewire\Attributes\On;

class TaskKanban extends Component
{
    public $tasks;
    public $statuses;

    public function mount()
    {
        $this->statuses = Task::getStatuses();
        $this->loadTasks();
    }

    public function loadTasks()
    {
        $this->tasks = Task::with(['project', 'assignee'])
            ->orderBy('order')
            ->get();
    }

    #[On('task-status-updated')]
    public function updateTaskStatus($taskId, $newStatus)
    {
        $task = Task::find($taskId);
        if ($task) {
            $task->update(['status' => $newStatus]);
            $this->loadTasks();
        }
    }

    #[On('task-order-updated')]
    public function updateTaskOrder($taskId, $newOrder)
    {
        $task = Task::find($taskId);
        if ($task) {
            $task->update(['order' => $newOrder]);
            $this->loadTasks();
        }
    }

    public function render()
    {
        return view('livewire.task-kanban');
    }
} 