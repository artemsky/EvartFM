@extends('dashboard.main')

@section('scripts')
    <script>
        System.import('components/users.component').catch(function(err){ console.error(err); });
    </script>
@endsection

@section('styles')
    <link rel="stylesheet" href="{{ asset('libs/vendor/notie/dist/notie.css') }}">
@endsection

@section('navigation')
    @include('dashboard.components.nav')
@endsection

@section('body-class', 'user-all')
@section('content')
    <div class="row">
        <table class="table table-striped">
            <thead>
                <tr>
                    <th>#</th>
                    <th>@lang('dashboard.users.login')</th>
                    <th>@lang('dashboard.users.role')</th>
                    <th>@lang('dashboard.users.name')</th>
                    <th>@lang('dashboard.users.email')</th>
                </tr>
            </thead>
            <tbody>
            @foreach ($users as $user)
                <tr data-id="{{ $user->id }}" data-login="{{ $user->login }}" data-role="{{ $user->role }}" data-name="{{ $user->name }}" data-email="{{ $user->email }}">
                    <td class="user-id">{{ $user->id }}</td>
                    <td class="user-login">{{ $user->login }}</td>
                    <td class="user-role">{{ $user->role }}</td>
                    <td class="user-name">{{ $user->name }}</td>
                    <td class="user-email">{{ $user->email }}</td>
                </tr>
            @endforeach
            </tbody>
        </table>


        </ul>
    </div>
    <div class="modal fade" tabindex="-1" role="dialog" id="edit">
        <div class="vertical-alignment-helper">
            <div class="modal-dialog">
                <div class="modal-content">
                    <div class="modal-header">
                        <button type="button" class="close" data-dismiss="modal" aria-label="Close"><span aria-hidden="true">&times;</span></button>
                        <h4 class="modal-title">@lang('dashboard.users.userInfo')</h4>
                    </div>
                    <div class="modal-body">
                        <form>
                            <table class="table">
                                <tbody>
                                    <tr>
                                        <td>@lang('dashboard.users.login')</td>
                                        <td>
                                            <div class="form-group">
                                                <input id="user-login" type="text" class="form-control" disabled>
                                            </div>
                                        </td>
                                    </tr>
                                    <tr>
                                        <td>@lang('dashboard.users.role')</td>
                                        <td>
                                            <div class="form-group">
                                                <select id="user-role" class="form-control">
                                                    <option value="super">Super Admin</option>
                                                    <option value="admin">Admin</option>
                                                    <option value="writer">Writer</option>
                                                    <option value="dj">DJ</option>
                                                </select>
                                            </div>
                                        </td>
                                    </tr>
                                    <tr>
                                        <td>@lang('dashboard.users.password')</td>
                                        <td>
                                            <button id="user-password" type="button" class="btn btn-info fullwidth">Change Password</button>
                                        </td>
                                    </tr>
                                    <tr>
                                        <td>@lang('dashboard.users.name')</td>
                                        <td>
                                            <div class="form-group">
                                                <input id="user-name" type="text" class="form-control" placeholder="@lang('dashboard.users.name')">
                                            </div>
                                        </td>
                                    </tr>
                                    <tr>
                                        <td>@lang('dashboard.users.email')</td>
                                        <td>
                                            <div class="form-group">
                                                <input id="user-email" type="email" class="form-control" placeholder="@lang('dashboard.users.email')">
                                            </div>
                                        </td>
                                    </tr>
                                </tbody>
                            </table>
                        </form>
                    </div>
                    <div class="modal-footer">
                        <button type="button" id="user-delete" class="btn btn-danger pull-left" data-url="{{route('user.delete')}}">@lang('dashboard.core.buttons.delete')</button>
                        <button type="button" class="btn btn-default" data-dismiss="modal">@lang('dashboard.core.buttons.close')</button>
                        <button type="button" id="user-save" class="btn btn-primary" data-url="{{route('user.update')}}">@lang('dashboard.core.buttons.save')</button>
                    </div>
                </div><!-- /.modal-content -->
            </div><!-- /.modal-dialog -->
        </div><!-- /.vertical-alignment-helper" -->
    </div><!-- /.modal -->
@endsection