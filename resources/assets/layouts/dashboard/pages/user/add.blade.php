@extends('dashboard.main')


@section('scripts')
    <script>
        System.import('components/userAdd.component').catch(function(err){ console.error(err); });
    </script>
@endsection

@section('styles')
    <link rel="stylesheet" href="{{ asset('libs/vendor/notie/dist/notie.css') }}">
@endsection


@section('navigation')
    @include('dashboard.components.nav')
@endsection

@section('body-class', 'useradd')
@section('content')
    <div class="row">
        <div class="col-md-offset-2 col-md-7">

            <h1>@lang('dashboard.users.add')</h1>
            <form class="form-horizontal">
                <div class="form-group">
                    <label for="login" class="col-sm-2 control-label required">@lang('dashboard.users.login')</label>
                    <div class="col-sm-10">
                        <div class="input-group">
                            <span class="input-group-addon">
                                <span class="glyphicon glyphicon-user"></span>
                            </span>
                            <input id="user-login" type="text" class="form-control" placeholder="@lang('dashboard.users.loginPlaceholder')" autocomplete="off" spellcheck="false">
                        </div><!-- /input-group -->
                    </div>
                </div>

                <div class="form-group">
                    <label for="password" class="col-sm-2 control-label required">@lang('dashboard.users.password')</label>
                    <div class="col-sm-10">
                        <div class="input-group">
                            <span class="input-group-addon">
                                <span class="glyphicon glyphicon glyphicon-lock"></span>
                            </span>
                            <input id="user-password" type="password" class="form-control" placeholder="@lang('dashboard.users.passwordPlaceholder')" autocomplete="off" spellcheck="false">
                        </div><!-- /input-group -->
                    </div>
                </div>

                <div class="form-group">
                    <label for="password_confirmation" class="col-sm-2 control-label required">@lang('dashboard.users.passwordRepeat')</label>
                    <div class="col-sm-10">
                        <div class="input-group">
                            <span class="input-group-addon">
                                <span class="glyphicon glyphicon glyphicon-lock"></span>
                            </span>
                            <input id="user-passwordConfirmation"type="password" class="form-control" placeholder="@lang('dashboard.users.passwordRepeatPlaceholder')" autocomplete="off" spellcheck="false">
                        </div><!-- /input-group -->
                    </div>
                </div>


                <div class="form-group">
                    <label for="email" class="col-sm-2 control-label">@lang('dashboard.users.email')</label>
                    <div class="col-sm-10">
                        <div class="input-group">
                            <span class="input-group-addon">
                                <span class="glyphicon glyphicon-envelope"></span>
                            </span>
                            <input id="user-email" type="enail" class="form-control" placeholder="@lang('dashboard.users.emailPlaceholder')" autocomplete="off" spellcheck="false">
                        </div><!-- /input-group -->
                    </div>
                </div>

                <div class="form-group">
                    <label for="name" class="col-sm-2 control-label">@lang('dashboard.users.name')</label>
                    <div class="col-sm-10">
                        <div class="input-group">
                            <span class="input-group-addon">
                                <span class="glyphicon glyphicon glyphicon-sunglasses"></span>
                            </span>
                            <input id="user-name" type="text" class="form-control" placeholder="@lang('dashboard.users.namePlaceholder')" autocomplete="off" spellcheck="false">
                        </div><!-- /input-group -->
                    </div>
                </div>

                <div class="form-group">
                    <label for="role" class="col-sm-2 control-label required">@lang('dashboard.users.role')</label>
                    <div class="col-sm-10">
                        <div class="form-group" style="margin: 0">
                            <select id="user-role" class="form-control">
                                <option value="super">Super Admin</option>
                                <option value="admin">Admin</option>
                                <option value="writer">Writer</option>
                                <option value="dj">DJ</option>
                            </select>
                        </div><!-- /input-group -->
                    </div>
                </div>

                <div class="form-group">
                    <div class="col-sm-offset-2 col-sm-10">
                        <button type="button" id="user-add" class="btn btn-primary pull-right" data-url="{{route("user.register")}}">@lang('dashboard.users.add')</button>
                    </div>
                </div>
            </form>
        </div>
    </div>
@endsection