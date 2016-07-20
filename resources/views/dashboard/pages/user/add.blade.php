@extends('dashboard.main')

@section('styles')
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/bootstrap-select/1.10.0/css/bootstrap-select.min.css" onerror="onErrorLoader(this, '{{ URL::to('vendor/bootstrap-select/dist/css/bootstrap-select.css') }}')">
    <link rel="stylesheet" href="{{ URL::to('css/dashboard.css') }}">
@endsection

@section('scripts')
    <script src="https://cdnjs.cloudflare.com/ajax/libs/bootstrap-select/1.10.0/js/bootstrap-select.min.js" onerror="onErrorLoader(this, '{{ URL::to('vendor/bootstrap-select/dist/js/bootstrap-select.js') }}')"></script>
    <script src="{{ URL::to('js/useradd.js') }}"></script>
@endsection

@section('navigation')
    @include('dashboard.components.nav')
@endsection

@section('body-class', 'useradd')
@section('content')
    <div class="row">
        <div class="col-md-offset-3 col-md-6">

            <h1>Add Users</h1>
            <form class="form-horizontal">
                <div class="form-group">
                    <label for="login" class="col-sm-2 control-label required">Login</label>
                    <div class="col-sm-10">
                        <div class="input-group">
                            <span class="input-group-addon">
                                <span class="glyphicon glyphicon-user"></span>
                            </span>
                            <input type="text" class="form-control" placeholder="Enter login" name="login" id="login">
                        </div><!-- /input-group -->
                    </div>
                </div>

                <div class="form-group">
                    <label for="password" class="col-sm-2 control-label required">Password</label>
                    <div class="col-sm-10">
                        <div class="input-group">
                            <span class="input-group-addon">
                                <span class="glyphicon glyphicon glyphicon-lock"></span>
                            </span>
                            <input type="text" class="form-control" placeholder="Min: 6 - Max: 32" name="password" id="password">
                        </div><!-- /input-group -->
                    </div>
                </div>

                <div class="form-group">
                    <label for="password_confirmation" class="col-sm-2 control-label required">Repeat</label>
                    <div class="col-sm-10">
                        <div class="input-group">
                            <span class="input-group-addon">
                                <span class="glyphicon glyphicon glyphicon-lock"></span>
                            </span>
                            <input type="text" class="form-control" placeholder="Repeat password" name="password_confirmation" id="password_confirmation">
                        </div><!-- /input-group -->
                    </div>
                </div>


                <div class="form-group">
                    <label for="email" class="col-sm-2 control-label">Email</label>
                    <div class="col-sm-10">
                        <div class="input-group">
                            <span class="input-group-addon">
                                <span class="glyphicon glyphicon-envelope"></span>
                            </span>
                            <input type="text" class="form-control" placeholder="Enter e-mail" name="email" id="email">
                        </div><!-- /input-group -->
                    </div>
                </div>

                <div class="form-group">
                    <label for="name" class="col-sm-2 control-label">Name</label>
                    <div class="col-sm-10">
                        <div class="input-group">
                            <span class="input-group-addon">
                                <span class="glyphicon glyphicon glyphicon-sunglasses"></span>
                            </span>
                            <input type="text" class="form-control" placeholder="Enter Username" name="name" id="name">
                        </div><!-- /input-group -->
                    </div>
                </div>

                <div class="form-group">
                    <label for="role" class="col-sm-2 control-label required">Role</label>
                    <div class="col-sm-10">
                        <select class="selectpicker" id="role" name="role">
                            <option value="super">Super Admin</option>
                            <option value="admin">Admin</option>
                            <option value="writer">Writer</option>
                            <option value="dj">DJ</option>
                        </select>
                    </div>
                </div>

                <input type="hidden" name="_token" value="{{ csrf_token() }}">

                <div class="form-group">
                    <div class="col-sm-offset-2 col-sm-10">
                        <button type="submit" class="btn btn-default">Add user</button>
                    </div>
                </div>
            </form>
        </div>
    </div>
@endsection