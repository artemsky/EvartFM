<section id="video">
    <div class="owl-carousel owl-theme">
    @foreach($Video['data'] as $slide)
        <div class="item" style="background-image: url({{$slide['image']}});">
            <div class="slider-inner" style="background-image: url({{asset('img/video-slide-micro.png')}});">
                <div class="container">
                    <div class="row">
                        <div class="col-sm-offset-1 col-sm-10 col-md-offset-2 col-md-8">
                            <div class="row">
                                <div class="carousel-content">
                                    <h2 class="text-center">{{$slide['title']}}</h2>
                                    <p class="text-center">{{$slide['description']}}</p>
                                    <div class="video-wrapper">
                                        <iframe width="100%" height="100%" src="{{$slide['video']}}" frameborder="0" allowfullscreen scrolling="no"></iframe>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                </div>
            </div>
        </div>
        <!-- /.item -->
    @endforeach

    </div>
</section><!-- /#video -->