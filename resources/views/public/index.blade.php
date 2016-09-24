@extends('public.master')

@section('title', 'Evart.FM')
@section('styles')

    <link rel="stylesheet" href="{{asset('public/css/vendor/owl.carousel.min.css')}}" />
    <link rel="stylesheet" href="{{asset('public/css/vendor/perfect-scrollbar.min.css')}}" />
@endsection
@section('scripts')
    <script type="text/javascript" src="{{asset('public/js/vendor/owl.carousel.min.js')}}"></script>
    <script type="text/javascript" src="{{asset('public/js/vendor/rangeslider.min.js')}}"></script>
    <script type="text/javascript" src="{{asset('public/js/vendor/perfect-scrollbar.jquery.min.js')}}"></script>
    <script type="text/javascript" src="{{asset('public/js/app.js')}}"></script>
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
                                                <p class="description"></p>
                                                <p class="name">{{--{{nowplaying}}--}}</p>
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
                                            <input type="checkbox" {{--{{islive}}--}}>
                                            <div class="slider" data-off="Слушать прямой эфир" data-on="Прямой эфир"></div>
                                        </label>
                                    </div>
                                </div><!-- /.audioplayer -->
                            </div><!-- /.row -->
                        </div><!-- /.col-md-7 -->
                        <div class="col-sm-offset-2 col-sm-8 col-md-offset-1 col-md-5 col-lg-offset-0 col-lg-5">
                            <div class="row">
                                <div class="program">
                                    <!--<div class="head">-->
                                    <!--<select>-->
                                    <!--<option value="program">Program</option>-->
                                    <!--<option value="program">Program</option>-->
                                    <!--<option value="program">Program</option>-->
                                    <!--</select>-->
                                    <!--<span class="glyphicon glyphicon-search"></span>-->
                                    <!--</div>-->
                                    <div class="body">
                                        <div id="program">
                                            <ul class="nav" >
                                                {{--{{playlist}}--}}
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

    @include('public.components.Contacts')

    </main>
@endsection