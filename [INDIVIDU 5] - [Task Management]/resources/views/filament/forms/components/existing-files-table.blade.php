<div class="space-y-4">
    @foreach($files as $file)
        <div class="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <div class="flex items-center space-x-3">
                <div class="flex-shrink-0" style="width: 2.5rem; height: 2.5rem; border-radius: 9999px; background-color: #FDE68A; display: flex; align-items: center; justify-content: center; margin-right: 0.5rem;">
                    @php
                        $fileExtension = strtolower(pathinfo($file->file_name, PATHINFO_EXTENSION));
                        $fileType = strtolower($file->file_type);
                        
                        $iconAndColor = match(true) {
                            str_contains($fileType, 'pdf') => [
                                'icon' => '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />',
                                'color' => 'text-red-500'
                            ],
                            str_contains($fileType, 'word') || in_array($fileExtension, ['doc', 'docx']) => [
                                'icon' => '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />',
                                'color' => 'text-blue-500'
                            ],
                            str_contains($fileType, 'excel') || in_array($fileExtension, ['xls', 'xlsx']) => [
                                'icon' => '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />',
                                'color' => 'text-green-500'
                            ],
                            str_contains($fileType, 'image') || in_array($fileExtension, ['jpg', 'jpeg', 'png', 'gif']) => [
                                'icon' => '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />',
                                'color' => 'text-purple-500'
                            ],
                            str_contains($fileType, 'zip') || in_array($fileExtension, ['zip', 'rar']) => [
                                'icon' => '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />',
                                'color' => 'text-yellow-500'
                            ],
                            default => [
                                'icon' => '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />',
                                'color' => 'text-gray-400'
                            ]
                        };
                    @endphp
                    <svg class="w-6 h-6 {{ $iconAndColor['color'] }}" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        {!! $iconAndColor['icon'] !!}
                    </svg>
                </div>
                <div class="flex-1 min-w-0">
                    <p class="text-sm font-medium text-gray-900 truncate">
                        {{ $file->file_name }}
                    </p>
                    <div class="flex items-center space-x-2 text-xs text-gray-500">
                        <span>{{ $file->file_type }} | </span>
                        <span><b>({{ number_format($file->file_size / 1024, 2) }} KB) </b> </span>
                        <span> | Uploaded by {{ $file->uploader->name }} on {{ $file->created_at->format('M d, Y H:i') }}</span>
                    </div>
                </div>
            </div>
            <div class="flex items-center space-x-2">
                <a href="{{ Storage::disk('ftp')->url($file->file_path) }}" 
                   target="_blank"
                   class="inline-flex items-center px-2.5 py-1.5 border border-gray-300 shadow-sm text-xs font-medium rounded text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500">
                    <svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                    </svg>
                    Download
                </a>
                @if(request()->routeIs('filament.admin.resources.tasks.edit'))
                    <button type="button"
                            wire:click="deleteFile({{ $file->id }})"
                            wire:confirm="Are you sure you want to delete this file?"
                            style="display: inline-flex; align-items: center; padding: 0.375rem 0.75rem; border: none; border-radius: 0.175rem; font-size: 0.75rem; font-weight: 500; color: white; background-color: #DC2626; transition: background-color 0.2s; margin-left: 0.5rem;"
                            onmouseover="this.style.backgroundColor='#B91C1C'"
                            onmouseout="this.style.backgroundColor='#DC2626'">
                        <svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                        Delete
                    </button>
                @endif
            </div>
        </div>
    @endforeach
</div> 