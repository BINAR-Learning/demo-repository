<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class TaskLabelLog extends Model
{
    use HasFactory;

    protected $fillable = [
        'task_id',
        'label_id',
        'user_id',
        'action',
    ];

    public function task()
    {
        return $this->belongsTo(Task::class);
    }

    public function label()
    {
        return $this->belongsTo(TaskLabel::class, 'label_id');
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
