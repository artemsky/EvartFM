<!DOCTYPE html>
<html lang="en">
    <head>
        <meta charset="utf-8">
        <meta http-equiv="X-UA-Compatible" content="IE=edge">
        <meta content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no" name="viewport">
        <meta name="csrf-token" content="{{ csrf_token() }}">

        <title>@yield('title')</title>

        <link rel="apple-touch-icon" sizes="57x57" href="{{ URL::asset('img/favicons/apple-icon-57x57.png') }}">
        <link rel="apple-touch-icon" sizes="60x60" href="{{ URL::asset('img/favicons/apple-icon-60x60.png') }}">
        <link rel="apple-touch-icon" sizes="72x72" href="{{ URL::asset('img/favicons/apple-icon-72x72.png') }}">
        <link rel="apple-touch-icon" sizes="76x76" href="{{ URL::asset('img/favicons/apple-icon-76x76.png') }}">
        <link rel="apple-touch-icon" sizes="114x114" href="{{ URL::asset('img/favicons/apple-icon-114x114.png') }}">
        <link rel="apple-touch-icon" sizes="120x120" href="{{ URL::asset('img/favicons/apple-icon-120x120.png') }}">
        <link rel="apple-touch-icon" sizes="144x144" href="{{ URL::asset('img/favicons/apple-icon-144x144.png') }}">
        <link rel="apple-touch-icon" sizes="152x152" href="{{ URL::asset('img/favicons/apple-icon-152x152.png') }}">
        <link rel="apple-touch-icon" sizes="180x180" href="{{ URL::asset('img/favicons/apple-icon-180x180.png') }}">
        <link rel="icon" type="image/png" sizes="192x192"  href="{{ URL::asset('img/favicons/android-icon-192x192.png') }}">
        <link rel="icon" type="image/png" sizes="32x32" href="{{ URL::asset('img/favicons/favicon-32x32.png') }}">
        <link rel="icon" type="image/png" sizes="96x96" href="{{ URL::asset('img/favicons/favicon-96x96.png') }}">
        <link rel="icon" type="image/png" sizes="16x16" href="{{ URL::asset('img/favicons/favicon-16x16.png') }}">
        <link rel="manifest" href="{{ URL::asset('img/favicons/manifest.json') }}">
        <meta name="msapplication-TileColor" content="#ffffff">
        <meta name="msapplication-TileImage" content="{{ URL::asset('img/favicons/ms-icon-144x144.png') }}">
        <meta name="theme-color" content="#ffffff">

        <!-- HTML5 shim and Respond.js for IE8 support of HTML5 elements and media queries -->
        <!-- WARNING: Respond.js doesn't work if you view the page via file:// -->
        <!--[if lt IE 9]>
        <script src="https://oss.maxcdn.com/html5shiv/3.7.2/html5shiv.min.js"></script>
        <script src="https://oss.maxcdn.com/respond/1.4.2/respond.min.js"></script>
        <![endif]-->

        <script src="{{ URL::asset('libs/vendor/system.js/dist/system.js')}}"></script>
        <!-- 2. Configure SystemJS -->
        <script src="{{ URL::asset('libs/dashboard/systemjs.config.js')}}"></script>

        <link rel="stylesheet" href="{{ URL::to('libs/vendor/bootstrap/dist/css/bootstrap.css') }}">
        @yield('styles')
        <link rel="stylesheet" href="{{ URL::to('libs/dashboard.css') }}">

    </head>
    <body class="@yield('body-class')">
        @yield('navigation')
        <main role="main">
            <div class="container">
                @yield('content')
            </div>
        </main>

        <script>
//            $("#online").on('click', function(e){
//                e.preventDefault();
//                window.open(
//                        $(this).attr("href"),
//                        'Evart.FM Online',
//                        'menubar=no, location=no, width=400, height=50, resizable=no, status=no, top=100, left=100'
//                );
//                return false;
//            });
        </script>
        @yield('scripts')
    </body>
</html>
