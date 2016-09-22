@extends('dashboard.main')

@section('navigation')
    @include('dashboard.components.nav')
@endsection
@section('content')
    <div class="row">
        <h1>@lang('dashboard.core.welcome')</h1>
    </div>
@endsection