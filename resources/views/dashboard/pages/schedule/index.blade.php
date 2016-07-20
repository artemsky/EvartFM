@extends('dashboard.main')

@section('styles')
    <link rel="stylesheet" href="{{ URL::to('css/dashboard.css') }}">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/malihu-custom-scrollbar-plugin/3.1.5/jquery.mCustomScrollbar.min.css" onerror="onErrorLoader(this, '{{ URL::to('vendor/malihu-custom-scrollbar-plugin/jquery.mCustomScrollbar.min.css') }}')">
@endsection

@section('scripts')
    <script src="https://cdnjs.cloudflare.com/ajax/libs/moment.js/2.10.6/moment.min.js" onerror="onErrorLoader(this, '{{ URL::to('vendor/moment/moment.js') }}')"></script>
    <script src="{{ URL::to('vendor/moment/locale/en-gb.js') }}"></script>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/underscore.js/1.8.3/underscore-min.js" onerror="onErrorLoader(this, '{{ URL::to('vendor/underscore/underscore.js') }}')"></script>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/malihu-custom-scrollbar-plugin/3.1.5/jquery.mCustomScrollbar.min.js" onerror="onErrorLoader(this, '{{ URL::to('vendor/malihu-custom-scrollbar-plugin/jquery.mCustomScrollbar.concat.min.js') }}')"></script>
    <script src="{{ URL::to('vendor/src/clndr.js') }}"></script>
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