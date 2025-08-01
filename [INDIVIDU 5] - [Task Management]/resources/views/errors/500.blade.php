<!DOCTYPE html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>500 - Server Error | {{ \App\Models\Setting::getSettings()->site_name ?? config('app.name') }}</title>
    <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap">
    <style>
        body {
            font-family: 'Inter', sans-serif;
            background-color: #f8fafc;
            color: #1f2937;
            margin: 0;
            padding: 0;
            display: flex;
            justify-content: center;
            align-items: center;
            min-height: 100vh;
        }
        .error-container {
            text-align: center;
            padding: 2rem;
        }
        .logo-container {
            margin-bottom: 2rem;
        }
        .logo {
            max-width: 150px;
            height: auto;
        }
        .error-code {
            font-size: 8rem;
            font-weight: 700;
            color: {{ \App\Models\Setting::getSettings()->button_colors['danger'] ?? '#ef4444' }};
            margin: 0;
            line-height: 1;
        }
        .error-title {
            font-size: 1.875rem;
            font-weight: 600;
            margin: 1rem 0;
        }
        .error-message {
            color: #6b7280;
            margin-bottom: 2rem;
        }
        .back-button {
            display: inline-block;
            padding: 0.75rem 1.5rem;
            background-color: {{ \App\Models\Setting::getSettings()->button_colors['danger'] ?? '#ef4444' }};
            color: white;
            text-decoration: none;
            border-radius: 0.375rem;
            font-weight: 500;
            transition: background-color 0.2s;
        }
        .back-button:hover {
            background-color: {{ \App\Models\Setting::getSettings()->button_colors['danger'] ?? '#dc2626' }};
            opacity: 0.9;
        }
    </style>
</head>
<body>
    <div class="error-container">
        <div class="logo-container">
            @if(\App\Models\Setting::getSettings()->site_logo)
                <img src="{{ asset('storage/' . \App\Models\Setting::getSettings()->site_logo) }}" alt="{{ \App\Models\Setting::getSettings()->site_name ?? config('app.name') }}" class="logo">
            @endif
        </div>
        <h1 class="error-code">500</h1>
        <h2 class="error-title">Server Error</h2>
        <p class="error-message">Something went wrong on our end. Our team has been notified and we're working to fix the issue. Please try again later.</p>
        <a href="{{ url('/admin') }}" class="back-button">Go Back</a>
    </div>
</body>
</html> 