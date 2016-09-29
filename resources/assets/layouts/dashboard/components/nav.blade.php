<nav class="navbar navbar-default" role="navigation">
    <div class="container-fluid">
        <!-- Brand and toggle get grouped for better mobile display -->
        <div class="navbar-header">
            <button type="button" class="navbar-toggle collapsed" data-toggle="collapse" data-target="#bs-example-navbar-collapse-1" aria-expanded="false">
                <span class="sr-only">Toggle navigation</span>
                <span class="icon-bar"></span>
                <span class="icon-bar"></span>
                <span class="icon-bar"></span>
            </button>
            <a class="navbar-brand" href="{{route('dashboard.home')}}">@lang('dashboard.core.navigation.title')</a>
        </div>

        <!-- Collect the nav links, forms, and other content for toggling -->
        <div class="collapse navbar-collapse" id="bs-example-navbar-collapse-1">
            <ul class="nav navbar-nav">

                @php($userRole = Auth::user()->role)
                @if(str_contains('super, admin', $userRole))
                    <li role="presentation" class="dropdown">
                        <a class="dropdown-toggle" data-toggle="dropdown" href="#" role="button" aria-haspopup="true" aria-expanded="false">
                            @lang('dashboard.core.navigation.users.title') <span class="caret"></span>
                        </a>
                        <ul class="dropdown-menu">
                            <li><a href="{{route('user')}}">@lang('dashboard.core.navigation.users.all')</a></li>
                            <li><a href="{{route('adduser')}}">@lang('dashboard.core.navigation.users.add')</a></li>
                        </ul>
                    </li>
                @endif
                @if(str_contains('super, admin, writer, dj', $userRole))
                    <li><a href="{{route('schedule.index')}}">@lang('dashboard.core.navigation.schedule')</a></li>
                @endif
                @if(str_contains('super, admin, writer', $userRole))
                    <li role="presentation" class="dropdown">
                        <a class="dropdown-toggle" data-toggle="dropdown" href="#" role="button" aria-haspopup="true" aria-expanded="false">
                            @lang('dashboard.core.navigation.content.title') <span class="caret"></span>
                        </a>
                        <ul class="dropdown-menu">
                            <li><a href="{{route('allnews')}}">@lang('dashboard.core.navigation.content.news')</a></li>
                            <li><a href="{{route('content.index')}}">@lang('dashboard.core.navigation.content.components')</a></li>
                            <li><a href="{{route('content.contacts.get')}}">@lang('dashboard.core.navigation.content.contacts')</a></li>
                        </ul>
                    </li>

                @endif

                @if(str_contains('super, admin, dj', $userRole))
                    <li><a href="{{route('radio.index')}}">@lang('dashboard.core.navigation.broadcast')</a></li>

                @endif

            </ul>
            <ul class="nav navbar-nav navbar-right">
                <li><a id="online" href="{{URL::to('/')}}:{{config('radio.icecast.port')}}/live">@lang('dashboard.core.navigation.online')</a></li>
                <li><a href="{{route('base')}}" target="_blank">Evart.FM</a></li>
                <li role="presentation" class="dropdown">
                    <a class="dropdown-toggle" data-toggle="dropdown" href="#" role="button" aria-haspopup="true" aria-expanded="false">
                        @lang('dashboard.core.navigation.language') <span class="caret"></span>
                    </a>
                    <ul class="dropdown-menu">
                        <li><a href="/dashboard/lang/en">Eng</a></li>
                        <li><a href="/dashboard/lang/ru">Рус</a></li>
                    </ul>
                </li>
                <li><a href="{{route('logout')}}">@lang('dashboard.core.navigation.logout')</a></li>
            </ul>
        </div><!-- /.navbar-collapse -->
    </div><!-- /.container-fluid -->
</nav>