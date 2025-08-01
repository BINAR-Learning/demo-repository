@php
    $files = $getRecord()->files;
@endphp

<div class="mb-2">
    <h3 class="text-base font-medium text-gray-900">File Attachments</h3>
</div>

<div class="space-y-2">
    @if($files->isNotEmpty())
        <div class="grid grid-cols-1 gap-2">
            @foreach($files as $file)
                <div class="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
                    <div class="flex items-center gap-2">
                        <svg class="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                        </svg>
                        <span class="text-sm text-gray-700">{{ $file->file_name }}</span>
                    </div>
                    <a 
                        href="{{ Storage::disk('ftp')->url($file->file_path) }}" 
                        target="_blank"
                        rel="noopener noreferrer"
                        class="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium text-primary-600 hover:text-primary-500"
                    >
                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                        </svg>
                        Download
                    </a>
                </div>
            @endforeach
        </div>
    @else
        <div class="text-sm text-gray-500">
            No attachments found
        </div>
    @endif
</div> 