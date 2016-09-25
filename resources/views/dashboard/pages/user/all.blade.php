@extends('dashboard.main')

@section('scripts')
    <script src="{{ URL::to('libs/vendor/bootstrap-select/dist/js/bootstrap-select.js') }}"></script>
    <script src="{{ URL::to('libs/dashboard/usersall.js') }}"></script>
@endsection

@section('styles')
    <link rel="stylesheet" href="{{ URL::to('libs/vendor/bootstrap-select/dist/css/bootstrap-select.css') }}">
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
                    <th>Login</th>
                    <th>Role</th>
                    <th>Name</th>
                </tr>
            </thead>
            <tbody>
            @foreach ($users as $user)
                <tr>
                    <td>{{ $user->id }}</td>
                    <td>{{ $user->login }}</td>
                    <td>{{ $user->role }}</td>
                    <td>{{ $user->name }}</td>
                </tr>
            @endforeach
            </tbody>
        </table>


        </ul>
    </div>
    <div class="modal fade" tabindex="-1" role="dialog" id="edit">
        <div class="modal-dialog">
            <div class="modal-content">
                <div class="modal-header">
                    <button type="button" class="close" data-dismiss="modal" aria-label="Close"><span aria-hidden="true">&times;</span></button>
                    <h4 class="modal-title">User Information</h4>
                </div>
                <div class="modal-body">
                    <form>
                        <table class="table">
                            <tbody>
                                <tr>
                                    <td>id</td>
                                    <td class="user_id"><p></p></td>
                                </tr>
                                <tr>
                                    <td>Login</td>
                                    <td class="user_login">
                                        <p></p>
                                        <div class="form-group">
                                            <input type="text" class="form-control" placeholder="New login" name="login">
                                        </div>
                                    </td>
                                </tr>
                                <tr>
                                    <td>Role</td>
                                    <td class="user_role">
                                        <p></p>
                                        <div class="form-group">
                                            <select class="selectpicker form-control" id="role" name="role">
                                                <option value="super">Super Admin</option>
                                                <option value="admin">Admin</option>
                                                <option value="writer">Writer</option>
                                                <option value="dj">DJ</option>
                                            </select>
                                        </div>
                                    </td>
                                </tr>
                                <tr>
                                    <td>Password</td>
                                    <td class="user_password">
                                        <p>***********</p>
                                        <div class="form-group">
                                            <input type="password" class="form-control" placeholder="New password" name="password">
                                        </div>
                                        <div class="form-group">
                                            <input type="password" class="form-control" placeholder="Repeat password" name="password_confirmation">
                                        </div>
                                    </td>
                                </tr>
                                <tr>
                                    <td>Name</td>
                                    <td class="user_name">
                                        <p></p>
                                        <div class="form-group">
                                            <input type="text" class="form-control" placeholder="New name" name="name">
                                        </div>
                                    </td>
                                </tr>
                                <tr>
                                    <td>Email</td>
                                    <td class="user_email">
                                        <p></p>
                                        <div class="form-group">
                                            <input type="email" class="form-control" placeholder="New email" name="email">
                                        </div>
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </form>
                </div>
                <div class="modal-footer">
                    <button type="button" class="btn btn-danger pull-left delete-user">Delete</button>
                    <button type="button" class="btn btn-default" data-dismiss="modal">Close</button>
                    <button type="button" class="btn btn-primary save-changes">Save changes</button>
                </div>
            </div><!-- /.modal-content -->
        </div><!-- /.modal-dialog -->
    </div><!-- /.modal -->
@endsection