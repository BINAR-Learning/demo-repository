<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Setting extends Model
{
    protected $fillable = [
        'site_name',
        'site_logo',
        'button_colors',
    ];

    protected $casts = [
        'button_colors' => 'array',
    ];

    public static function getSettings()
    {
        return static::first() ?? static::create([
            'site_name' => config('app.name'),
            'button_colors' => [
                'success' => '#22c55e',
                'warning' => '#f59e0b',
                'danger' => '#ef4444',
                'info' => '#3b82f6',
            ],
        ]);
    }
}
