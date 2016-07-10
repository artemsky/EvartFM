@extends('dashboard.main')

@section('navigation')
    @include('dashboard.components.nav')
@endsection
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
@endsection