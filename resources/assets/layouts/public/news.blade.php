@extends('public.master')

@section('title', 'Evart.FM News')

@section('scripts')
    <script type="text/javascript" src="{{asset('libs/news.js')}}"></script>
@endsection

@section('content')
    <main>
        <section id="news">
            <div class="container">
                {{--<div class="row">--}}
                    {{--<div class="col-xs-12">--}}
                        {{--<div id="live">--}}
                            {{--<div class="live">--}}
                                {{--<span class="glyphicon glyphicon-record"></span>--}}
                                {{--<span>LIVE</span>--}}
                            {{--</div>--}}
                            {{--<article>--}}
                                {{--<div class="title">--}}
                                    {{--<h1>“Партнер Evart, блоггер, путешественник”</h1>--}}
                                    {{--<h2>Евгений Гащенко</h2>--}}
                                {{--</div>--}}
                                {{--<div class="about">--}}
                                    {{--<div class="photo" style="background-image: url(img/evgen.jpg)"></div>--}}
                                    {{--<span>Показать делали</span>--}}
                                    {{--<span class="glyphicon glyphicon-chevron-down"></span>--}}
                                {{--</div>--}}
                            {{--</article>--}}
                            {{--<div class="moreinfo" style="display: table-row; opacity: 0">--}}
                                {{--<span style="display: table-cell;"></span>--}}
                                {{--<span>--}}
                                {{--<div style="background: #cdcecf; padding: 10px; font-family: 'Open Sans Regular';">--}}
                                    {{--<h3>Новое лицо успеха Evart FM : Евгений Гащенко</h3>--}}
	{{--Доброго времени суток, уважаемые слушатели нашего радио! Сегодня мы рады сообщить вам потрясающую новость: в нашей семье появился новый ведущий, воистину интереснейший человек, Евгений Гащенко, и с сегодняшнего дня он будет неустанно вещать для вас различные рубрики, приготовленные для лидеров, акул бизнеса, предпринимателей и просто людей, которые хотят быть успешными.<br>--}}
	{{--Евгений - человек, который достиг многого. Помимо статуса партнера нашей корпорации, он также владелец нескольких успешных бизнесов, гуру предпринимательства. А еще Евгений -весьма успешный блоггер, который неустанно делится секретами благополучия. Он увлекается путешествиями и старается передать все впечатления, которые он получил во время очередного туризма! В целом, этот человек передаст вам весь дух успешного предпринимателя и научит вас быть такими же.<br>--}}
	{{--Евгений будет вещать для вас шесть дней в неделю. Он приготовил целых три рубрики специально под ваш интерес! Эти рубрики: Финансы, Личная Эффективность, Luxury & Путешествия. <br>--}}
	{{--В рубрике "Финансы" вы узнаете, как стать миллионером за считанные года. Вы получите массу опыта, уроки от бабушки Евгения Гащенко о правильной атмосфере в воспитании предпринимателя. Вы откроете для себя секретный способ поднятия самооценки. Также вы услышите о способах привлечения капитала в бизнес, построении дружеских отношений с миллионерами, возможности незаметно накопить капитал на бизнес и прочее. Рубрика, которая идеально подходит для предпринимателей, и дает ответ на повседневные вопросы!<br>--}}
	{{--В рубрике  "Личная Эффективность" Евгений поведает вам, как жить на пределе и за ним, как ставить цели и достигать их. Вы получите кипу приемов визуализации и планирования, познаете всю суть тайм-менеджмента, научитесь делать в 2, а то и в 3 раза больше за имеющийся промежуток времени. Евгений также даст вам задания\квесты, которые помогут вам воспитать в себе успешного человека!<br>--}}
	{{--В рубрике "Luxury & Путешествия" вы узнаете все о том, как отдыхают успешные люди! Евгений расскажет вам о путешествиях в разные страны и о культурных традициях тех мест. Вы почувствуете весь азарт и экстрим этих путешествий, узнаете много нового о современных технологиях, откроете кипу здоровских местр для траты своих $ . Вы получите знания о самых лучших еде и напитках в мире, почувствуете всю задорность азартных игр, ощутите себя воистину вольным и свободным предпринимателем. А еще Евгений специально для вас приготовил задания, суть которых заключается в посещении того или иного действительно крутого места!<br>--}}
	{{--В целом, наш эфир Evart FM вместе с нашим потрясающим ведущим Евгением Гащенко теперь уж точно не дадут вам соскучиться! Оставайтесь на волнах Evart FM, следите за новостями и обновлениями, растите и развивайтесь вместе с нами, дабы получать самые-самые крутые возможности и эмоции, доступные в этом мире! Мы знаем, как хотим жить, и будем жить именно так. Добро пожаловать на борт! Be Evart!--}}

                                {{--</div>--}}

                            {{--</span>--}}

                            {{--</div>--}}
                        {{--</div>--}}
                    {{--</div>--}}
                {{--</div>--}}
                <hr/>
                <div class="row news">
                    <?php $lastDate = Carbon\Carbon::now() ?>

                    @foreach($News as $item)
                    <div class="col-xs-12">
                        <div class="item">
                            <div class="date">
                                <?php
                                $date = Carbon\Carbon::createFromFormat('Y-m-d H:i:s', $item->updated_at);
                                if($date->lt($lastDate)){
                                    echo '<time>' . $date->format('m.d') . '</time>';
                                    $lastDate = $date;
                                }
                                ?>
                            </div>
                            <article>
                                <div class="mini" style="background-image: url({{ asset($item->image_url) }})">
                                    {{$item->title_long}}
                                    <div class="details"><span>Показать делали</span><span
                                                class="glyphicon glyphicon-chevron-down"></span></div>
                                </div>
                                <div class="full">
                                    <div class="ico" style="background-image: url({{ asset($item->image_url) }})">
                                        {{$item->title_short}}
                                    </div>
                                    <div class="content">
                                        <p>{{$item->article}}</p>
                                        <div class="details">
                                            <span>Скрыть детали</span>
                                            <span class="glyphicon glyphicon-chevron-up"></span>
                                        </div>
                                    </div>
                                </div>
                            </article>
                        </div>
                    </div>
                    @endforeach
                </div>
                <div class="row text-center">
                    {{$News->links()}}
                </div>
            </div>
        </section>
    </main>
@endsection