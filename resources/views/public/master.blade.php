<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="utf-8">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta name="viewport" content="width=device-width, initial-scale=1">

    <title>@yield('title')</title>

    <link rel="apple-touch-icon" type="image/png" href="{{ URL::asset('img/favicons/favicon-57x57.png') }}" sizes="57x57">
    <link rel="apple-touch-icon" type="image/png" href="{{ URL::asset('img/favicons/favicon-60x60.png') }}" sizes="60x60">
    <link rel="apple-touch-icon" type="image/png" href="{{ URL::asset('img/favicons/favicon-72x72.png') }}" sizes="72x72">
    <link rel="apple-touch-icon" type="image/png" href="{{ URL::asset('img/favicons/favicon-76x76.png') }}" sizes="76x76">
    <link rel="apple-touch-icon" type="image/png" href="{{ URL::asset('img/favicons/favicon-120x120.png') }}" sizes="120x120">
    <link rel="apple-touch-icon" type="image/png" href="{{ URL::asset('img/favicons/favicon-152x152.png') }}" sizes="152x152">

    <link rel="icon" type="image/png" href="{{ URL::asset('img/favicons/favicon-16x16.png') }}" sizes="16x16">
    <link rel="icon" type="image/png" href="{{ URL::asset('img/favicons/favicon-24x24.png') }}" sizes="24x24">
    <link rel="icon" type="image/png" href="{{ URL::asset('img/favicons/favicon-32x32.png') }}" sizes="32x32">
    <link rel="icon" type="image/png" href="{{ URL::asset('img/favicons/favicon-48x48.png') }}" sizes="48x48">
    <link rel="icon" type="image/png" href="{{ URL::asset('img/favicons/favicon-64x64.png') }}" sizes="64x64">
    <link rel="icon" type="image/png" href="{{ URL::asset('img/favicons/favicon-96x96.png') }}" sizes="96x96">
    <link rel="icon" type="image/png" href="{{ URL::asset('img/favicons/favicon-128x128.png') }}" sizes="128x128">
    <link rel="icon" type="image/png" href="{{ URL::asset('img/favicons/favicon-256x256.png') }}" sizes="256x256">
    <link rel="icon" type="image/png" href="{{ URL::asset('img/favicons/favicon-512x512.png') }}" sizes="512x512">

    <!-- HTML5 shim and Respond.js for IE8 support of HTML5 elements and media queries -->
    <!-- WARNING: Respond.js doesn't work if you view the page via file:// -->
    <!--[if lt IE 9]>
    <script src="https://oss.maxcdn.com/html5shiv/3.7.2/html5shiv.min.js"></script>
    <script src="https://oss.maxcdn.com/respond/1.4.2/respond.min.js"></script>
    <![endif]-->

    <link rel="stylesheet" href="{{ URL::to('libs/vendor/bootstrap/dist/css/bootstrap.css') }}">
    <link rel="stylesheet" href="{{ asset('libs/index.css') }}">

    @yield('styles')


</head>

<body>
    <header>
        <div class="container">
            <nav id="navbar" class="navbar wow fadeInRight" data-wow-duration="400ms" data-wow-delay="0ms">
                <!-- Brand and toggle get grouped for better mobile display -->
                <div class="col-sm-3 text-center">
                    <div class="row">
                        <div class="navbar-header ">
                            <button type="button" class="navbar-toggle collapsed" data-toggle="collapse" data-target="#navigation" aria-expanded="false">
                                <span class="sr-only">Toggle navigation</span>
                                <span class="glyphicon glyphicon-menu-hamburger"></span>
                            </button>
                            <a class="navbar-brand wow fadeInDown" data-wow-duration="500ms" data-wow-delay="300ms" href="/"></a>
                        </div>
                    </div>
                </div>
                <div class="col-sm-9">
                    <div class="row">
                        <div class="collapse navbar-collapse" id="navigation">
                            <div class="nav-container">
                                <ul class="nav nav-subnav navbar-nav navbar-right">
                                    <li><a class="active" href="./?lang=ru-ru">Рус</a></li>
                                    <!--<li><a class="active" href="./?lang=en-gb">Eng</a></li>-->
                                </ul>
                            </div>
                            <div class="nav-container">
                                <ul class="nav nav-mainnav navbar-nav navbar-right">
                                    <li><a href="/">Главная</a></li>
                                    <li><a href="news.php">Новости & Информация</a></li>
                                    <li><a href="contacts.html">Контакты</a></li>
                                </ul>
                            </div>
                        </div><!-- /.navbar-collapse -->
                    </div>

                </div>

                <!-- Collect the nav links, forms, and other content for toggling -->


            </nav>
        </div><!-- /.container -->
        @yield('header')
    </header>

    @yield('content')

    <footer>
        <div class="container-fluid">
            <div class="col-xs-12 col-md-8 text-center">
                <img src="{{asset('img/logo_footer.png')}}" alt="">
                <p class="text-center">© Evart Systems Incorporated. All rights reserved. Part of the Evart corporation.</p>
            </div>
            <div class="col-xs-12 col-md-4 text-center">
                <div class="socials text-center">
                    <a href="#" class="sprite sprite-facebook"></a>
                    <a href="#" class="sprite sprite-twitter"></a>
                    <a href="https://new.vk.com/evartcorporation" target="_blank" class="sprite sprite-vkontakte"></a>
                </div>
            </div>


        </div>
    </footer>

    <audio lang="ua" title="Evart FM" id="evartplayer" src="{{url()->current()}}:8000/play"></audio>
    <script src="{{ URL::to('libs/vendor/jquery/dist/jquery.js') }}"></script>
    <script src="{{ URL::to('libs/vendor/bootstrap/dist/js/bootstrap.js') }}"></script>
    @yield('scripts')
</body>


</html>