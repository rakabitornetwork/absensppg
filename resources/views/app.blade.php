<!DOCTYPE html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}">
    <head>
        @php
            $browserTitle = \App\Models\SppgSetting::getValue('app_title', 'SPPG MBG');
            $appLogo = \App\Models\SppgSetting::getValue('app_logo');
        @endphp
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <meta name="app-browser-title" content="{{ $browserTitle }}">

        <title inertia>{{ $browserTitle }}</title>
        @if ($appLogo)
            <link rel="icon" href="{{ $appLogo }}">
            <link rel="shortcut icon" href="{{ $appLogo }}">
        @endif

        <!-- Fonts -->
        <link rel="preconnect" href="https://fonts.bunny.net">
        <link href="https://fonts.bunny.net/css?family=instrument-sans:400,500,600,700&display=swap" rel="stylesheet" />

        <!-- Scripts -->
        @viteReactRefresh
        @vite(['resources/js/app.jsx'])
        @inertiaHead
    </head>
    <body class="font-sans antialiased bg-slate-50/50 text-slate-800">
        @inertia
    </body>
</html>
