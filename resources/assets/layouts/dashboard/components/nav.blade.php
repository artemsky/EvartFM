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
                {{--<li class="active"><a href="#">Link <span class="sr-only">(current)</span></a></li>--}}

                @php($userRole = Auth::user()->role)
                @if(str_contains('super, admin', $userRole))
                    <li><a href="{{route('user')}}">All Users</a></li>
                    <li><a href="{{route('adduser')}}">Add Users</a></li>
                @endif
                @if(str_contains('super, admin, writer', $userRole))
                    <li><a href="{{route('allnews')}}">All News</a></li>
                @endif
                @if(str_contains('super, admin, writer, dj', $userRole))
                    <li><a href="{{route('schedule.index')}}">Schedule</a></li>
                @endif
                @if(str_contains('super, admin, writer', $userRole))
                    <li><a href="{{route('content.index')}}">Content Management</a></li>
                @endif

            </ul>
            <ul class="nav navbar-nav navbar-right">
                <li><a href="{{route('logout')}}">Logout</a></li>
            </ul>
        </div><!-- /.navbar-collapse -->
    </div><!-- /.container-fluid -->
</nav>