@extends('dashboard.main')

@section('styles')
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/bootstrap-select/1.10.0/css/bootstrap-select.min.css" onerror="onErrorLoader(this, '{{ URL::to('js/bootstrap-select.js') }}')">
    <link rel="stylesheet" href="{{ URL::to('css/dashboard.css') }}">
@endsection

@section('scripts')
    <script src="https://cdnjs.cloudflare.com/ajax/libs/bootstrap-select/1.10.0/js/bootstrap-select.min.js" onerror="onErrorLoader(this, '{{ URL::to('css/bootstrap-select.css') }}')"></script>
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
                            <span class="input-group-addon" id="login">
                                <span class="glyphicon glyphicon-user"></span>
                            </span>
                            <input type="text" class="form-control" placeholder="Enter login">
                        </div><!-- /input-group -->
                    </div>
                </div>

                <div class="form-group">
                    <label for="password" class="col-sm-2 control-label required">Password</label>
                    <div class="col-sm-10">
                        <div class="input-group">
                            <span class="input-group-addon" id="password">
                                <span class="glyphicon glyphicon glyphicon-lock"></span>
                            </span>
                            <input type="text" class="form-control" placeholder="Min: 6 - Max: 32">
                        </div><!-- /input-group -->
                    </div>
                </div>

                <div class="form-group">
                    <label for="passwordrepeat" class="col-sm-2 control-label required">Repeat</label>
                    <div class="col-sm-10">
                        <div class="input-group">
                            <span class="input-group-addon" id="passwordrepeat">
                                <span class="glyphicon glyphicon glyphicon-lock"></span>
                            </span>
                            <input type="text" class="form-control" placeholder="Repeat password">
                        </div><!-- /input-group -->
                    </div>
                </div>


                <div class="form-group">
                    <label for="email" class="col-sm-2 control-label">Email</label>
                    <div class="col-sm-10">
                        <div class="input-group">
                            <span class="input-group-addon" id="email">
                                <span class="glyphicon glyphicon-envelope"></span>
                            </span>
                            <input type="text" class="form-control" placeholder="Enter e-mail">
                        </div><!-- /input-group -->
                    </div>
                </div>

                <div class="form-group">
                    <label for="username" class="col-sm-2 control-label">Name</label>
                    <div class="col-sm-10">
                        <div class="input-group">
                            <span class="input-group-addon" id="username">
                                <span class="glyphicon glyphicon glyphicon-sunglasses"></span>
                            </span>
                            <input type="text" class="form-control" placeholder="Enter Username">
                        </div><!-- /input-group -->
                    </div>
                </div>

                <div class="form-group">
                    <label for="role" class="col-sm-2 control-label required">Role</label>
                    <div class="col-sm-10">
                        <select class="selectpicker" id="role">
                            <option>Super Admin</option>
                            <option>Admin</option>
                            <option>Writer</option>
                            <option>DJ</option>
                        </select>
                    </div>
                </div>

                <div class="form-group">
                    <div class="col-sm-offset-2 col-sm-10">
                        <button type="submit" class="btn btn-default">Add user</button>
                    </div>
                </div>
            </form>
        </div>
    </div>
@endsection