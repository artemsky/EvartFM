@extends('dashboard.main')

@section('scripts')
    <script>
        System.import('components/login.component').catch(function(err){ console.error(err); });
    </script>
@endsection

@section('styles')
    <link rel="stylesheet" href="{{asset('libs/vendor/notie/dist/notie.css')}}">
@endsection

@section('body-class', 'login-page')

@section('content')
        <div class="row">
                <div class="card"></div>
                <div class="card">
                    <h1 class="title">@lang('dashboard.login.title')</h1>
                    <form action="{{route('dashboard.login.post')}}" method="post">
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
                        <div class="button-container">
                            <button type="submit"><span>@lang('dashboard.login.enter')</span></button>
                        </div>
                    </form>
                </div>
        </div>
@endsection