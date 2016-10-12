@extends('dashboard.main')

@section('styles')
    <meta name="lang" content="{{ \Session::get('locale') }}">
    <link rel="stylesheet" href="{{asset('libs/vendor/owl.carousel/dist/assets/owl.carousel.css')}}">
    <link rel="stylesheet" href="{{asset('libs/vendor/owl.carousel/dist/assets/owl.theme.default.css')}}">
@endsection

@section('scripts')
    <script>
        System.import('components/schedule.component').catch(function(err){ console.error(err); });
    </script>
@endsection

@section('navigation')
    @include('dashboard.components.nav')
@endsection

@section('body-class', 'page-schedule')
@section('content')

    <div id="calendar" data-url="{{route('schedule.events.all')}}"></div>

@endsection