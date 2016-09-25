<!DOCTYPE html>
<html lang="en">
    <head>
        <meta charset="utf-8">
        <meta http-equiv="X-UA-Compatible" content="IE=edge">
        <meta content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no" name="viewport">

        <title>@yield('title')</title>

        <link rel="apple-touch-icon" type="image/png" href="{{ URL::asset('img/favicons/favicon-16x16.png') }}" sizes="57x57">
        <link rel="apple-touch-icon" type="image/png" href="{{ URL::asset('img/favicons/favicon-16x16.png') }}" sizes="60x60">
        <link rel="apple-touch-icon" type="image/png" href="{{ URL::asset('img/favicons/favicon-16x16.png') }}" sizes="72x72">
        <link rel="apple-touch-icon" type="image/png" href="{{ URL::asset('img/favicons/favicon-16x16.png') }}" sizes="76x76">
        <link rel="apple-touch-icon" type="image/png" href="{{ URL::asset('img/favicons/favicon-16x16.png') }}" sizes="120x120">
        <link rel="apple-touch-icon" type="image/png" href="{{ URL::asset('img/favicons/favicon-16x16.png') }}" sizes="152x152">

        <link rel="icon" type="image/png" href="{{ URL::asset('img/favicons/favicon-16x16.png') }}" sizes="16x16">
        <link rel="icon" type="image/png" href="{{ URL::asset('img/favicons/favicon-16x16.png') }}" sizes="24x24">
        <link rel="icon" type="image/png" href="{{ URL::asset('img/favicons/favicon-16x16.png') }}" sizes="32x32">
        <link rel="icon" type="image/png" href="{{ URL::asset('img/favicons/favicon-16x16.png') }}" sizes="48x48">
        <link rel="icon" type="image/png" href="{{ URL::asset('img/favicons/favicon-16x16.png') }}" sizes="64x64">
        <link rel="icon" type="image/png" href="{{ URL::asset('img/favicons/favicon-16x16.png') }}" sizes="96x96">
        <link rel="icon" type="image/png" href="{{ URL::asset('img/favicons/favicon-16x16.png') }}" sizes="128x128">
        <link rel="icon" type="image/png" href="{{ URL::asset('img/favicons/favicon-16x16.png') }}" sizes="256x256">
        <link rel="icon" type="image/png" href="{{ URL::asset('img/favicons/favicon-16x16.png') }}" sizes="512x512">

        <!-- HTML5 shim and Respond.js for IE8 support of HTML5 elements and media queries -->
        <!-- WARNING: Respond.js doesn't work if you view the page via file:// -->
        <!--[if lt IE 9]>
        <script src="https://oss.maxcdn.com/html5shiv/3.7.2/html5shiv.min.js"></script>
        <script src="https://oss.maxcdn.com/respond/1.4.2/respond.min.js"></script>
        <![endif]-->

        <link rel="stylesheet" href="{{ URL::to('libs/vendor/bootstrap/dist/css/bootstrap.css') }}">

        @yield('styles')

    </head>
    <body class="@yield('body-class')">
        <main role="main">
            <div class="container">
                @yield('content')
            </div>
        </main>

        <script src="{{ URL::to('libs/vendor/jquery/dist/jquery.js') }}"></script>
        <script src="{{ URL::to('libs/vendor/bootstrap/dist/js/bootstrap.js') }}"></script>
        @yield('scripts')
    </body>
</html>
