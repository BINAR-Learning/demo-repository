@php
    $logoUrl = $logo ? config('filesystems.disks.ftp.url') . '/' . $logo : null;
@endphp

<div class="flex items-center gap-2 px-4 py-4">
    @if($logoUrl)
        <img 
            src="{{ $logoUrl }}" 
            alt="{{ $siteName }}" 
            class="h-8 w-8 rounded-full object-cover"
        >
    @endif
    <span class="text-lg font-bold">{{ $siteName }}</span>
</div>

<style>
    .fi-sidebar-header {
        display: none !important;
    }
</style> 