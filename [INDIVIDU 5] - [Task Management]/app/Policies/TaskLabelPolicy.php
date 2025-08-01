<?php

namespace App\Policies;

use App\Models\TaskLabel;
use App\Models\User;
use Illuminate\Auth\Access\HandlesAuthorization;

class TaskLabelPolicy
{
    use HandlesAuthorization;

    public function viewAny(User $user): bool
    {
        return $user->can('view_any_task_label');
    }

    public function view(User $user, TaskLabel $taskLabel): bool
    {
        return $user->can('view_task_label');
    }

    public function create(User $user): bool
    {
        return $user->can('create_task_label');
    }

    public function update(User $user, TaskLabel $taskLabel): bool
    {
        return $user->can('update_task_label');
    }

    public function delete(User $user, TaskLabel $taskLabel): bool
    {
        return $user->can('delete_task_label');
    }

    public function deleteAny(User $user): bool
    {
        return $user->can('delete_any_task_label');
    }

    public function forceDelete(User $user, TaskLabel $taskLabel): bool
    {
        return $user->can('force_delete_task_label');
    }

    public function forceDeleteAny(User $user): bool
    {
        return $user->can('force_delete_any_task_label');
    }

    public function restore(User $user, TaskLabel $taskLabel): bool
    {
        return $user->can('restore_task_label');
    }

    public function restoreAny(User $user): bool
    {
        return $user->can('restore_any_task_label');
    }

    public function replicate(User $user, TaskLabel $taskLabel): bool
    {
        return $user->can('replicate_task_label');
    }

    public function reorder(User $user): bool
    {
        return $user->can('reorder_task_label');
    }
} 