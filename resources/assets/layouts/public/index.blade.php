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
    <audio lang="ua" title="Evart FM" id="evartplayer" data-src="{{url()->current()}}:{{config('radio.icecast.port')}}/play"></audio>
@endsection

@section('header')

    @include('public.components.Slider')

@endsection
@section('content')
    <main>
        <div class="wrap-gradient">
            <section id="player">
                <div class="container">
                    <div class="row">
                        <div class="col-sm-offset-2 col-sm-8 col-md-offset-0 col-md-6 col-lg-7">
                            <div class="row">
                                <div class="audioplayer">
                                    <div class="tablecell">

                                        <div class="tablerow track">
                                            <div class="tablecell play">
                                                <span class="glyphicon glyphicon-play"></span>
                                            </div>
                                            <div class="tablecell song">
                                                @if(count($Playlist['all']) > 0)
                                                <p class="description">{{$Playlist['all'][$Playlist['current']]['description']}}</p>
                                                <p class="name">{{$Playlist['all'][$Playlist['current']]['title']}}</p>
                                                @endif
                                            </div>
                                            <div class="tablecell"></div>
                                        </div>
                                        <div class="tablerow volume-control">
                                            <div class="tablecell volume-down">
                                                <span class="glyphicon glyphicon-volume-down"></span>
                                            </div>
                                            <div class="tablecell volume">
                                                <input id="volume" type="range"
                                                       min="0"
                                                       max="100"
                                                       step="1">
                                            </div>
                                            <div class="tablecell volume-up">
                                                <span class="glyphicon glyphicon-volume-up"></span>
                                            </div>
                                        </div>

                                    </div>
                                    <div class="tablecell toggle">
                                        <label class="switch">
                                            <input type="checkbox" checked disabled>
                                            <div class="slider" data-off="Evart.FM Offline" data-on="Evart.FM Online"></div>
                                        </label>
                                    </div>
                                </div><!-- /.audioplayer -->
                            </div><!-- /.row -->
                        </div><!-- /.col-md-7 -->
                        <div class="col-sm-offset-2 col-sm-8 col-md-offset-1 col-md-5 col-lg-offset-0 col-lg-5">
                            <div class="row">
                                <div class="program">
                                    <div class="body">
                                        <div id="program">
                                            <ul class="nav" >
                                                @foreach($Playlist['all'] as $key=>$value)
                                                    <li>
                                                        <div class='num'>{{$key+1}}

                                                            @if($key < $Playlist['current'])
                                                                <span class='glyphicon glyphicon-minus'></span>
                                                            @elseif($key == $Playlist['current'])
                                                                <span class='glyphicon glyphicon-triangle-right'></span>
                                                            @else
                                                                <span class='glyphicon glyphicon-triangle-top'></span>
                                                            @endif
                                                        </div>
                                                        <div class='text'>
                                                            <h6>{{$value['title']}}</h6>
                                                            <p>{{$value['description']}}</p>
                                                        </div>
                                                        <time>{{$value['time']}}</time>
                                                    </li>
                                                    @endforeach
                                            </ul>
                                        </div>
                                    </div>

                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section><!-- /#player -->

            <section id="features">
                <div class="container">
                    <div class="row">
                        <div class="col-md-6">
                            <div class="row">
                                <h2>Слушай <span>Evart radio</span></h2>
                                <h3>Правильное время, правильное место!</h3>
                                <h4></h4>
                            </div>
                        </div>
                    </div>
                </div>
            </section><!-- /#features -->

            @include('public.components.Blockquote')
        </div>


    @include('public.components.Events')

    @include('public.components.Video')

    @include('public.components.Contacts.Contacts')

    </main>
@endsection