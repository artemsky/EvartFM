<!DOCTYPE html>
<html lang="en">
    <head>
        <meta charset="utf-8">
        <meta http-equiv="X-UA-Compatible" content="IE=edge">
        <meta name="viewport" content="width=device-width, initial-scale=1">

        <title>@yield('title')</title>

        <link rel="apple-touch-icon" type="image/png" href="{{ URL::asset('favicons/favicon-16x16.png') }}" sizes="57x57">
        <link rel="apple-touch-icon" type="image/png" href="{{ URL::asset('favicons/favicon-16x16.png') }}" sizes="60x60">
        <link rel="apple-touch-icon" type="image/png" href="{{ URL::asset('favicons/favicon-16x16.png') }}" sizes="72x72">
        <link rel="apple-touch-icon" type="image/png" href="{{ URL::asset('favicons/favicon-16x16.png') }}" sizes="76x76">
        <link rel="apple-touch-icon" type="image/png" href="{{ URL::asset('favicons/favicon-16x16.png') }}" sizes="120x120">
        <link rel="apple-touch-icon" type="image/png" href="{{ URL::asset('favicons/favicon-16x16.png') }}" sizes="152x152">

        <link rel="icon" type="image/png" href="{{ URL::asset('favicons/favicon-16x16.png') }}" sizes="16x16">
        <link rel="icon" type="image/png" href="{{ URL::asset('favicons/favicon-16x16.png') }}" sizes="24x24">
        <link rel="icon" type="image/png" href="{{ URL::asset('favicons/favicon-16x16.png') }}" sizes="32x32">
        <link rel="icon" type="image/png" href="{{ URL::asset('favicons/favicon-16x16.png') }}" sizes="48x48">
        <link rel="icon" type="image/png" href="{{ URL::asset('favicons/favicon-16x16.png') }}" sizes="64x64">
        <link rel="icon" type="image/png" href="{{ URL::asset('favicons/favicon-16x16.png') }}" sizes="96x96">
        <link rel="icon" type="image/png" href="{{ URL::asset('favicons/favicon-16x16.png') }}" sizes="128x128">
        <link rel="icon" type="image/png" href="{{ URL::asset('favicons/favicon-16x16.png') }}" sizes="256x256">
        <link rel="icon" type="image/png" href="{{ URL::asset('favicons/favicon-16x16.png') }}" sizes="512x512">

        <!-- HTML5 shim and Respond.js for IE8 support of HTML5 elements and media queries -->
        <!-- WARNING: Respond.js doesn't work if you view the page via file:// -->
        <!--[if lt IE 9]>
        <script src="https://oss.maxcdn.com/html5shiv/3.7.2/html5shiv.min.js"></script>
        <script src="https://oss.maxcdn.com/respond/1.4.2/respond.min.js"></script>
        <![endif]-->

        <script src="{{ URL::asset('js/onErrorLoader.js') }}"></script>

        <link rel="stylesheet" href="https://maxcdn.bootstrapcdn.com/bootstrap/3.3.6/css/bootstrap.min.css" integrity="sha384-1q8mTJOASx8j1Au+a5WDVnPi2lkFfwwEAa8hDDdjZlpLegxhjVME1fgjWPGmkzs7" crossorigin="anonymous" onerror="onErrorLoader(this, '{{ URL::to('css/bootstrap.css') }}')">



    </head>
    <body>
        <main role="main">
            <div class="container">
                @yield('content')
            </div>
        </main>


        <script src="https://ajax.googleapis.com/ajax/libs/jquery/2.2.4/jquery.min.js" onerror="onErrorLoader(this, '{{ URL::to('js/jquery.js') }}')"></script>
        <script src="https://maxcdn.bootstrapcdn.com/bootstrap/3.3.6/js/bootstrap.min.js" integrity="sha384-0mSbJDEHialfmuBBQP6A4Qrprq5OVfW37PRR3j5ELqxss1yVqOtnepnHVP9aJ7xS" crossorigin="anonymous" onerror="onErrorLoader(this, '{{ URL::to('js/bootstrap.js') }}')"></script>
    </body>
</html>
