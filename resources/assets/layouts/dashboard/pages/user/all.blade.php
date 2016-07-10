@extends('dashboard.main')

@section('navigation')
    @include('dashboard.components.nav')
@endsection
@section('content')
    <div class="row">
        <ul>
        @foreach ($routes as $name => $route)
            <li><a href="{{$route}}">{{$name}}</a></li>
        @endforeach
        </ul>
    </div>
@endsection