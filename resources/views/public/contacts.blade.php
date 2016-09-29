@extends('public.master')

@section('title', 'Evart.FM')
@section('styles')

    <link rel="stylesheet" href="{{asset('libs/vendor/owl.carousel/dist/assets/owl.carousel.css')}}" />
    <link rel="stylesheet" href="{{asset('libs/vendor/perfect-scrollbar/css/perfect-scrollbar.css')}}" />
@endsection
@section('scripts')
    <script type="text/javascript" src="{{asset('libs/vendor/owl.carousel/dist/owl.carousel.js')}}"></script>
    <script type="text/javascript" src="{{asset('libs/vendor/rangeslider.js/dist/rangeslider.js')}}"></script>
    <script type="text/javascript" src="{{asset('libs/vendor/perfect-scrollbar/js/perfect-scrollbar.jquery.js')}}"></script>
    <script type="text/javascript" src="{{asset('libs/app.js')}}"></script>
@endsection

@section('content')
    <main>
        @include('public.components.Contacts.Contacts')
    </main>
@endsection