@php
    $comments = $getState();
@endphp

<div class="space-y-4">
    @if (!is_null($comments))
        @foreach($comments as $comment)

            <div class="flex items-start space-x-3">
                <div class="flex-shrink-0">
                    <div class="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center">
                        {{ strtoupper(substr($comment->user->name, 0, 1)) }}
                    </div>
                </div>
                <div class="flex-1">
                    <div class="rounded-lg p-3 shadow-sm">
                        <div class="flex items-center justify-between mb-1">
                            <div class="font-medium text-sm">{{ $comment->user->name }}</div>
                            <div class="text-xs text-gray-500">{{ $comment->created_at->diffForHumans() }}</div>
                        </div>
                        <div class="text-sm text-gray-700 prose prose-sm max-w-none">
                            {!! $comment->comment !!}
                        </div>
                        
                        @if($comment->files && count($comment->files) > 0)
                            <div class="mt-2 grid grid-cols-4 gap-2">
                                @foreach($comment->files as $file)
                                    <a href="{{ $file['url'] }}" target="_blank" class="block">
                                        <img src="{{ $file['url'] }}" alt="File" class="w-full h-20 object-cover rounded">
                                    </a>
                                @endforeach
                            </div>
                        @endif
                    </div>
                </div>
            </div>
        @endforeach
    @endif
</div> 