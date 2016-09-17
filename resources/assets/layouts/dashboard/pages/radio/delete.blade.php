@extends('dashboard.main')

@section('scripts')
    <script src="{{asset('vendor/dropzone/dist/dropzone.js')}}"></script>
    <script src="{{asset('js/radio/upload.js')}}"></script>
@endsection


@section('styles')
    <meta name="csrf-token" content="{{ csrf_token() }}">
    <link rel="stylesheet" href="{{ URL::asset('vendor/dropzone/dist/dropzone.css') }}">
    <link rel="stylesheet" href="{{ URL::asset('vendor/dropzone/dist/basic.css') }}">
    <link rel="stylesheet" href="{{ URL::asset('css/dashboard.css') }}">
@endsection

@section('navigation')
    @include('dashboard.components.nav')
@endsection

@section('body-class', 'radio-upload')
@section('content')
    <div class="row">
        <div class="col-sm-12">
            <form id="dropzone" action="{{route('radio.upload.file')}}" class="dropzone needsclick dz-clickable">
                <div class="dz-message needsclick">
                    Drop files here or click to upload.<br>
                    <span class="note needsclick">(Only <strong>mp3</strong> filew allowed. Size not more than <strong>300M</strong>)</span>
                </div>

            </form>
        </div>
@endsection