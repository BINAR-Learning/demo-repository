@php
    $logs = $getRecord()->logs()->with('user')->latest()->get();
@endphp

<div class="space-y-4">
    @forelse($logs as $log)
        <div class="flex items-start space-x-3">
            <div class="flex-shrink-0" style="margin-right: 10px;">
                <div class="w-8 h-8 rounded-full bg-primary-500 flex items-center justify-center text-white">
                    {{ substr($log->user->name, 0, 1) }}
                </div>
            </div>
            <div class="flex-1 min-w-0">
                <div class="text-sm">
                    <span class="font-medium text-gray-900">{{ $log->user->name }}</span>
                    <span class="text-gray-500">
                        @switch($log->field)
                            @case('label')
                                changed the label from
                                <span class="font-medium">{{ $log->old_value ?? 'None' }}</span>
                                to
                                <span class="font-medium">{{ $log->new_value ?? 'None' }}</span>
                                @break
                            @case('status')
                                changed the status from
                                <span class="font-medium">{{ $log->old_value }}</span>
                                to
                                <span class="font-medium">{{ $log->new_value }}</span>
                                @break
                            @case('title')
                                changed the title from
                                <span class="font-medium">{{ $log->old_value }}</span>
                                to
                                <span class="font-medium">{{ $log->new_value }}</span>
                                @break
                            @case('description')
                                updated the description
                                @break
                            @case('project')
                                changed the project from
                                <span class="font-medium">{{ $log->old_value ?? 'None' }}</span>
                                to
                                <span class="font-medium">{{ $log->new_value ?? 'None' }}</span>
                                @break
                            @case('assignee')
                                changed the assignee from
                                <span class="font-medium">{{ $log->old_value ?? 'None' }}</span>
                                to
                                <span class="font-medium">{{ $log->new_value ?? 'None' }}</span>
                                @break
                            @case('due_date')
                                changed the due date from
                                <span class="font-medium">{{ $log->old_value ?? 'None' }}</span>
                                to
                                <span class="font-medium">{{ $log->new_value ?? 'None' }}</span>
                                @break
                            @case('priority')
                                changed the priority from
                                <span class="font-medium">{{ $log->old_value }}</span>
                                to
                                <span class="font-medium">{{ $log->new_value }}</span>
                                @break
                        @endswitch
                    </span>
                </div>
                <div class="mt-1 text-xs text-gray-500">
                    {{ $log->created_at->diffForHumans() }}
                </div>
            </div>
        </div>
    @empty
        <div class="text-center text-gray-500 py-4">
            No activity recorded yet
        </div>
    @endforelse
</div> 