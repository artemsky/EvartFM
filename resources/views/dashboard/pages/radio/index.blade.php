@extends('dashboard.main')

@section('scripts')
    <script src="{{ URL::to('libs/dashboard/broadcast.js') }}"></script>
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
                    <h3>@lang('dashboard.radio.files.title')</h3>
                    <p>@lang('dashboard.radio.files.desc')</p>
                    <p class="text-center">
                    <a href="{{route('radio.upload')}}" class="btn btn-default" role="button">@lang('dashboard.radio.files.upload.title')</a>
                    <a href="{{route('radio.delete')}}" class="btn btn-danger" role="button">@lang('dashboard.radio.files.delete')</a>
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
                    <h3>@lang('dashboard.radio.playlist.title')</h3>
                    <p>@lang('dashboard.radio.playlist.desc')</p>
                    <p class="text-center">
                        <a href="{{route('radio.playlist.get')}}" class="btn btn-primary" role="button">@lang('dashboard.radio.playlist.playlists')</a>
                        <a href="{{route('schedule.index')}}" class="btn btn-info" role="button">@lang('dashboard.radio.playlist.schedule')</a>
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
                    <h3>@lang('dashboard.radio.broadcast.title')</h3>
                    <p>@lang('dashboard.radio.broadcast.desc')</p>
                    <p class="text-center">
                        <button type="button" class="btn btn-success radio-on" role="button">@lang('dashboard.radio.broadcast.on')</button>
                        <button type="button" class="btn btn-danger radio-off" role="button">@lang('dashboard.radio.broadcast.off')</button>
                        <button type="button"  class="btn btn-warning radio-refresh" role="button">@lang('dashboard.radio.broadcast.refresh')</button>
                        <button type="button"  class="btn btn-info radio-next" role="button">@lang('dashboard.radio.broadcast.next')</button>
                    </p>
                </div>
            </div>
        </div>
    </div>
@endsection