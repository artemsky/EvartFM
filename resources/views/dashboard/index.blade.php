@extends('controls.main')

@section('styles')
    <link rel="stylesheet" href="{{ URL::to('css/dashboard.css') }}">
@endsection


@section('body-class', 'login-page')

@section('content')
        <div class="row">
            <div class="pen-title">
                <h1>EvartFM Dashboard</h1>
            </div>
            <div class="container">
                <div class="card"></div>
                <div class="card">
                    <h1 class="title">Sign In</h1>
                    <form>
                        <div class="input-container">
                            <input type="text" id="Username" required="required"/>
                            <label for="Username">Username</label>
                            <div class="bar"></div>
                        </div>
                        <div class="input-container">
                            <input type="password" id="Password" required="required"/>
                            <label for="Password">Password</label>
                            <div class="bar"></div>
                        </div>
                        <div class="button-container">
                            <button><span>Go</span></button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
@endsection