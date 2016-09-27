@if(  App\Components::where('component', 'Events')->first()->active)
<section id="efir-upper">
    <div class="owl-carousel owl-efir">
        @foreach($Events['data'] as $event)
        <div class="item" style="background-image: url({{$event['image']}}); background-position: left">
            <div class="slider-inner">
                <div class="carousel-content">
                    <div class="event-handler">
                             <span>
                                <h4>{{$event['title']}}</h4> {{$event['description']}}
                            </span>
                        <time datetime="{{$event['date']}}">{{Carbon\Carbon::createFromFormat('Y-m-d', $event['date'])->format('m/d')}}</time>
                    </div>
                </div>
            </div>
        </div><!--/.item-->
        @endforeach

    </div>
</section><!-- /#efir-upper -->
@endif