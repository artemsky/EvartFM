<section id="blockquote">
    <div class="owl-carousel owl-theme">

        @foreach($Blockquote['data'] as $quote)
        <div class="item">
            <div class="slider-inner">
                <div class="container">
                    <div class="row">
                        <div class="col-sm-7">
                            <div class="row">
                                <div class="carousel-content">
                                    <article>
                                        <div class="img-wrap">
                                            <img src="{{$quote['image']}}" alt="Maksym Blazhkün" class="img-responsive">
                                        </div>
                                        <div class="info-wrap">
                                            <h4>{{$quote['name']}}</h4>
                                            <p>{{$quote['description']}}</p>
                                            @for($i = $quote['stars']; $i--;)
                                            <span class="glyphicon glyphicon-star"></span>
                                            @endfor
                                        </div>
                                    </article>
                                </div>
                            </div>
                        </div>
                        <div class="col-sm-12">
                            <blockquote class="center-block">
                                <p class="text-center">
                                    {{$quote['text']}}
                                </p>

                            </blockquote>
                        </div>
                    </div>
                </div>
            </div>
        </div><!--/.item-->
        @endforeach

    </div>
</section><!-- /#blockquote -->