<?php

return [
    /*
    |--------------------------------------------------------------------------
    | Redirect URL
    |--------------------------------------------------------------------------
    |
    | The URL to redirect to after impersonating a user.
    |
    */
    'redirect_url' => '/admin',

    /*
    |--------------------------------------------------------------------------
    | Redirect To
    |--------------------------------------------------------------------------
    |
    | The route name to redirect to after impersonating a user.
    |
    */
    'redirect_to' => 'filament.admin.pages.custom-dashboard',

    /*
    |--------------------------------------------------------------------------
    | Leave Redirect URL
    |--------------------------------------------------------------------------
    |
    | The URL to redirect to after leaving impersonation.
    |
    */
    'leave_redirect_url' => '/admin',

    /*
    |--------------------------------------------------------------------------
    | Leave Redirect To
    |--------------------------------------------------------------------------
    |
    | The route name to redirect to after leaving impersonation.
    |
    */
    'leave_redirect_to' => 'filament.admin.pages.custom-dashboard',
]; 