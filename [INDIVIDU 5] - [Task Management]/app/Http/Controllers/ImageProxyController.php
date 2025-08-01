<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class ImageProxyController extends Controller
{
    public function show($path)
    {
        $file = Storage::disk('ftp')->get($path);
        
        if (!$file) {
            abort(404);
        }

        $mimeType = Storage::disk('ftp')->mimeType($path);
        
        return response($file)
            ->header('Content-Type', $mimeType)
            ->header('Access-Control-Allow-Origin', '*');
    }
} 