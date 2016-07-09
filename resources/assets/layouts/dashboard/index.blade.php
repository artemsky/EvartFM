@extends('controls.main')

@section('styles')
    <link rel="stylesheet" href="{{ URL::to('css/dashboard.css') }}">
@endsection


@section('body-class', 'login-page')

@section('content')
        <div class="row">
                <div class="card"></div>
                <div class="card">
                    <h1 class="title">Dashboard</h1>
                    <form action="{{route('login')}}" method="post">
                        <div class="input-container">
                            <input type="text" id="login" required="required" name="login" />
                            <label for="Username">Username</label>
                            <div class="bar"></div>
                        </div>
                        <div class="input-container">
                            <input type="password" id="password" required="required" name="password" />
                            <label for="Password">Password</label>
                            <div class="bar"></div>
                        </div>
                        <input type="hidden" name="_token" value="{{ csrf_token() }}">
                        <div class="button-container">
                            <button type="submit"><span>Go</span></button>
                        </div>
                    </form>
                </div>
        </div>
@endsection