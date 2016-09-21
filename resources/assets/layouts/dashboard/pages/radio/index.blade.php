@extends('dashboard.main')

@section('scripts')
    <script src="{{ URL::to('js/broadcast.js') }}"></script>
@endsection

@section('styles')
    <meta name="csrf-token" content="{{ csrf_token() }}">
    <link rel="stylesheet" href="{{ URL::asset('css/dashboard.css') }}">
@endsection

@section('navigation')
    @include('dashboard.components.nav')
@endsection

@section('body-class', 'radio-ctrl')
@section('content')
    <div class="row row-flex">
        <div class="col-sm-6 col-md-4">
            <div class="thumbnail">
                <div class="icon">
                    <span class="glyphicon glyphicon-cloud-upload"></span>
                </div>
                <div class="caption">
                    <h3>Manage music files</h3>
                    <p>Upload or Delete mp3 files using file manager</p>
                    <a href="{{route('radio.upload')}}" class="btn btn-default" role="button">Upload files</a>
                    <a href="{{route('radio.delete')}}" class="btn btn-danger" role="button">Delete files</a>
                    </p>

                </div>
            </div>
        </div>
        <div class="col-sm-6 col-md-4">
            <div class="thumbnail">
                <div class="icon">
                    <span class="glyphicon glyphicon-list-alt"></span>
                </div>
                <div class="caption">
                    <h3>Manage playlist</h3>
                    <p>Create new, edit old and manage schedule</p>
                    <p>
                        <a href="{{route('radio.playlist.get')}}" class="btn btn-primary" role="button">Playlist's</a>
                        <a href="{{route('schedule.index')}}" class="btn btn-info" role="button">Schedule</a>
                    </p>
                </div>
            </div>
        </div>
        <div class="col-sm-6 col-md-4">
            <div class="thumbnail">
                <div class="icon">
                    <span id="serverStatus" class="glyphicon glyphicon-bullhorn" data-status-url="{{route('radio.server.status')}}"></span>
                </div>
                <div class="caption">
                    <h3>Manage radio station</h3>
                    <p>Click button to turn ON/OFF broadcasting</p>
                    <p>
                        <button type="button" class="btn btn-success radio-on" role="button">Turn on</button>
                        <button type="button" class="btn btn-danger radio-off" role="button">Turn off</button>
                        <button type="button"  class="btn btn-warning radio-refresh" role="button">Refresh Playlist</button></p>
                </div>
            </div>
        </div>
    </div>
@endsection