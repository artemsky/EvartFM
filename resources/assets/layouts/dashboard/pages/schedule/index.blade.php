@extends('dashboard.main')

@section('styles')
    <link rel="stylesheet" href="{{ URL::to('css/dashboard.css') }}">
@endsection

@section('scripts')
    <script src="https://cdnjs.cloudflare.com/ajax/libs/moment.js/2.10.6/moment.min.js" onerror="onErrorLoader(this, '{{ URL::to('js/moment.js') }}')"></script>
    <script src="{{ URL::to('js/en-gb.js') }}"></script>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/underscore.js/1.8.3/underscore-min.js" onerror="onErrorLoader(this, '{{ URL::to('js/underscore.js') }}')"></script>
    <script src="{{ URL::to('js/clndr.js') }}"></script>
    <script src="{{ URL::to('js/schedule.js') }}"></script>
@endsection

@section('navigation')
    @include('dashboard.components.nav')
@endsection

@section('body-class', 'page-schedule')
@section('content')
     <div id="full-clndr" class="clearfix">
        @include('dashboard.components.clndr')
    </div>

</div>
@endsection