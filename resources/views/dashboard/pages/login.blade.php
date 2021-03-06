@extends('dashboard.main')

@section('scripts')
    <script src="{{ URL::to('libs/dashboard/login.js') }}"></script>
@endsection

@section('body-class', 'login-page')

@section('content')
        <div class="row">
                <div class="card"></div>
                <div class="card">
                    <h1 class="title">@lang('dashboard.login.title')</h1>
                    <form action="{{route('signIn')}}" method="post">
                        <div class="input-container">
                            <input type="text" id="login" required="required" name="login"/>
                            <label for="Username">@lang('dashboard.login.username')</label>
                            <div class="bar"></div>
                        </div>
                        <div class="input-container">
                            <input type="password" id="password" required="required" name="password"/>
                            <label for="Password">@lang('dashboard.login.password')</label>
                            <div class="bar"></div>
                        </div>
                        <input type="hidden" name="_token" value="{{ csrf_token() }}">
                        <div class="button-container">
                            <button type="submit"><span>@lang('dashboard.login.enter')</span></button>
                        </div>
                    </form>
                </div>
        </div>
@endsection