@extends('dashboard.main')

@section('scripts')
    <script src="{{asset('js/jquery-ui.min.js')}}"></script>
    <script src="{{asset('js/notify.min.js')}}"></script>
    <script src="{{asset('js/radio/playlist.js')}}"></script>
@endsection


@section('styles')
    <meta name="csrf-token" content="{{ csrf_token() }}">
    <link rel="stylesheet" href="{{ URL::asset('css/dashboard.css') }}">
@endsection

@section('navigation')
    @include('dashboard.components.nav')
@endsection

@section('body-class', 'playlist-manager')
@section('content')
    <div class="row">
        <div class="col-sm-6 col-md-offset-1 col-md-5 col-lg-offset-2 col-lg-4">
            <h1>@lang('dashboard.radio.playlist.playlist.title')</h1>
                <ul class="nav nav-tabs" role="tablist">
                    <?php $isFirst = true?>
                        <li role="presentation" class="dropdown active">
                            <a href="#" class="dropdown-toggle" id="playlist" data-toggle="dropdown" aria-expanded="false">
                                @lang('dashboard.radio.playlist.select')
                                <span class="caret"></span>
                            </a>
                            <ul class="dropdown-menu" aria-labelledby="playlist" id="playlist-contents">
                            @foreach($Playlists as $playlist)
                                 <li {{$isFirst ? "class=active" : false}}>
                                    <a href="#{{$playlist['name']}}" role="tab" id="{{$playlist['name']}}-tab" data-toggle="tab" aria-controls="{{$playlist['name']}}" aria-expanded="true">{{$playlist['name']}}</a>
                                 </li>
                            <?php $isFirst = false?>
                            @endforeach
                        </ul>
                    </li>
                </ul>
                <!-- Tab panes -->
                <div class="tab-content">
                    <?php $isFirst = true?>
                    @foreach($Playlists as $playlist)
                    <div role="tabpanel" class="tab-pane fade in  {{$isFirst ? "active" : false}}" id="{{$playlist['name']}}" data-playlist-id="{{$playlist['id']}}">
                        <div class="sortable playlist">
                            @foreach($playlist['tracklist'] as $track)
                                <div class="item">
                                    <span class="name" data-track-id="{{$track['id']}}">{{basename($track['track'])}}</span>
                                    <span class="duration text-center">
                                        <span>{{$track['duration']}}</span>
                                        <span class="play glyphicon glyphicon-play"></span>
                                        <audio src="{{asset('app/'.$track['track'])}}"></audio>
                                    </span>
                                </div>
                            @endforeach
                        </div>
                        <button type="button" class="btn btn-warning w100 delete-current" data-url="{{route("radio.playlist.delete")}}">@lang('dashboard.radio.playlist.delete')</button>
                    </div>
                    <?php $isFirst = false?>
                    @endforeach
                </div>
        </div>
        <div class="col-sm-6 col-md-5 col-lg-4">
            <h1>@lang('dashboard.radio.playlist.files.title')</h1>
            <h6 class="mb30">@lang('dashboard.radio.playlist.files.titleDesc')</h6>
            <div class="sortable files">
                @foreach($Files as $file)
                    <div class="item">
                        <span class="name">{{basename($file['file'])}}</span>
                        <span class="duration text-center">
                            <span>{{$file['duration']}}</span>
                            <span class="play glyphicon glyphicon-play"></span>
                            <audio src="{{asset('app/'.$file['file'])}}"></audio>
                        </span>
                    </div>
                @endforeach
            </div>
        </div>
    </div>
    <div class="row">
        <div class="col-sm-12 mt20 text-center">
            <button class="btn btn-info new-list">@lang('dashboard.radio.playlist.new')</button>
            <button class="btn btn-success save-changes" data-url="{{route("radio.playlist.save")}}">@lang('dashboard.core.buttons.save')</button>
        </div>
        <!-- /.col-sm-12 -->
    </div>
    <!-- /.row -->
@endsection