@php
    // Convert hex color to RGB
    $hex = ltrim($color, '#');
    $r = hexdec(substr($hex, 0, 2));
    $g = hexdec(substr($hex, 2, 2));
    $b = hexdec(substr($hex, 4, 2));
    
    // Calculate brightness
    $brightness = (($r * 299) + ($g * 587) + ($b * 114)) / 1000;
    
    // Determine text color based on brightness
    $textColor = $brightness > 128 ? 'text-gray-900' : 'text-white';
@endphp

<style>
    /* Top Navigation Bar */
    .fi-main-ctn {
        background-color: {{ $color }} !important;
    }

    /* Top Navigation Text Color */
    .fi-main-ctn .fi-topbar-item-label,
    .fi-main-ctn .fi-topbar-item-icon,
    .fi-main-ctn .fi-topbar-item-button {
        color: {{ $textColor }} !important;
    }

    /* Menu Items */
    .fi-sidebar-item-label {
        color: #1f2937 !important;
    }

    /* Icons */
    .fi-sidebar-item-icon {
        color: #1f2937 !important;
    }

    /* Dark Mode */
    .dark .fi-sidebar-item-label,
    .dark .fi-sidebar-item-icon {
        color: #ffffff !important;
    }
</style>
