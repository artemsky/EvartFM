@if(  App\Components::where('component', 'Slider')->first()->active)
<section id="main-slider">
    <div class="owl-carousel owl-theme">
        @foreach($Slider['data'] as $slide)
        <div class="item" style="background-image: url({{$slide['image']}});">
            <div class="slider-inner">
                <div class="container">
                    <div class="row">
                        <div class="col-sm-8 col-md-6">
                            <div class="row">
                                <div class="carousel-content">
                                    <p>{{$slide['title']}}</p>
                                    <h1>{{$slide['description']}}</h1>
                                    <!--<div class="event-handler">-->
                                    <!--<time datetime="2016-01-31 20:00">31/05</time>-->
                                    <!--<span>-->
                                    <!--<h4>Hall of Music</h4> 28 JACKSON BLVD STE 1020 CHICAGO, IL 60604-2340-->
                                    <!--</span>-->
                                    <!--</div>-->
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div><!--/.item-->
        @endforeach
    </div>
</section><!-- /#main-slider -->
@endif