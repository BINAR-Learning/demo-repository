@php
    $comments = $getRecord()->comments()->with('user')->latest()->get();
@endphp

<x-filament-panels::page>
    <div class="space-y-6">
        {{-- Comments List --}}
        <div class="rounded-lg shadow">
            <div class="p-6">
                <div class="space-y-4">
                    @foreach($comments as $comment)
                        <div class="flex gap-4">
                            {{-- Avatar --}}
                            <div class="flex-shrink-0">
                                @if($comment->user->avatar)
                                    <img 
                                        src="{{ $comment->user->profile_photo_url }}" 
                                        alt="{{ $comment->user->name }}"
                                        class="w-10 h-10 rounded-full border-2 border-white"
                                    >
                                @else
                                    <div class="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center border-2 border-white">
                                        @php
                                            $words = explode(' ', $comment->user->name);
                                            $initials = '';
                                            foreach ($words as $word) {
                                                $initials .= strtoupper(substr($word, 0, 1));
                                            }
                                            echo $initials;
                                        @endphp
                                    </div>
                                @endif
                            </div>

                            {{-- Comment Content --}}
                            <div class="flex-1">
                                <div class="flex items-center justify-between">
                                    <div class="flex items-center gap-2">
                                        <span class="font-medium text-gray-900">{{ $comment->user->name }}</span>
                                        <span class="text-sm text-gray-500">
                                            {{ $comment->created_at->diffForHumans() }}
                                        </span>
                                    </div>
                                    @if($comment->user_id === auth()->id())
                                        <div class="flex items-center gap-2">
                                            <x-filament::button
                                                color="gray"
                                                size="sm"
                                                wire:click="editComment({{ $comment->id }})"
                                            >
                                                Edit
                                            </x-filament::button>
                                            <x-filament::button
                                                color="danger"
                                                size="sm"
                                                wire:click="deleteComment({{ $comment->id }})"
                                            >
                                                Delete
                                            </x-filament::button>
                                        </div>
                                    @endif
                                </div>
                                <div class="mt-2 prose prose-sm max-w-none">
                                    {!! $comment->comment !!}
                                </div>
                            </div>
                        </div>
                    @endforeach
                </div>
            </div>
        </div>

        {{-- Add Comment Form --}}
        <div class="rounded-lg shadow">
            <div class="p-6">
                <h3 class="text-lg font-medium text-gray-900 mb-4">Add Comment</h3>
                <x-filament-panels::form wire:submit="saveComment">
                    {{ $this->form }}

                    <div class="mt-4">
                        <x-filament::button type="submit">
                            Post Comment
                        </x-filament::button>
                    </div>
                </x-filament-panels::form>
            </div>
        </div>
    </div>
</x-filament-panels::page> 