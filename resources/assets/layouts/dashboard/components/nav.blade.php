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
            <a class="navbar-brand" href="#">@lang('dashboard.title')</a>
        </div>

        <!-- Collect the nav links, forms, and other content for toggling -->
        <div class="collapse navbar-collapse" id="bs-example-navbar-collapse-1">
            <ul class="nav navbar-nav">

                @php($userRole = Auth::user()->role)
                @if(str_contains('super, admin', $userRole))
                    <li role="presentation" class="dropdown">
                        <a class="dropdown-toggle" data-toggle="dropdown" href="#" role="button" aria-haspopup="true" aria-expanded="false">
                            Users <span class="caret"></span>
                        </a>
                        <ul class="dropdown-menu">
                            <li><a href="{{route('user')}}">All Users</a></li>
                            <li><a href="{{route('adduser')}}">Add User</a></li>
                        </ul>
                    </li>
                @endif
                @if(str_contains('super, admin, writer, dj', $userRole))
                    <li><a href="{{route('schedule.index')}}">Schedule</a></li>
                @endif
                @if(str_contains('super, admin, writer', $userRole))
                    <li role="presentation" class="dropdown">
                        <a class="dropdown-toggle" data-toggle="dropdown" href="#" role="button" aria-haspopup="true" aria-expanded="false">
                            Content Management <span class="caret"></span>
                        </a>
                        <ul class="dropdown-menu">
                            <li><a href="{{route('allnews')}}">News</a></li>
                            <li><a href="{{route('content.index')}}">Components</a></li>
                        </ul>
                    </li>

                @endif

                @if(str_contains('super, admin', $userRole))
                    <li><a href="{{route('radio.index')}}">Broadcast</a></li>

                @endif

            </ul>
            <ul class="nav navbar-nav navbar-right">
                <li role="presentation" class="dropdown">
                    <a class="dropdown-toggle" data-toggle="dropdown" href="#" role="button" aria-haspopup="true" aria-expanded="false">
                        Language <span class="caret"></span>
                    </a>
                    <ul class="dropdown-menu">
                        <li><a href="#">Eng</a></li>
                        <li><a href="#">Ru</a></li>
                    </ul>
                </li>
                <li><a href="{{route('logout')}}">Logout</a></li>
            </ul>
        </div><!-- /.navbar-collapse -->
    </div><!-- /.container-fluid -->
</nav>