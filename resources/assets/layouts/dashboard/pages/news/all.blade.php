@extends('dashboard.main')

@section('scripts')
    <script src="{{ URL::to('libs/dashboard/newsall.js') }}"></script>
@endsection

@section('navigation')
    @include('dashboard.components.nav')
@endsection

@section('body-class', 'news-all')
@section('content')
    <div class="row">
        <ul class="nav nav-pills nav-justified">
            <li role="presentation" class="dropdown" id="sortby">
                <a class="dropdown-toggle" data-toggle="dropdown" href="#" role="button" aria-haspopup="true" aria-expanded="false">
                    @lang('dashboard.news.sort.sort')  <span class="caret"></span>
                </a>
                <ul class="dropdown-menu">
                    <li><a href="desc">@lang('dashboard.news.sort.desc')</a></li>
                    <li><a href="asc">@lang('dashboard.news.sort.asc')</a></li>
                </ul>
            </li>
            <li role="presentation" class="dropdown text-center" >
                <button type="button" class="btn btn-info new-item">@lang('dashboard.news.new')</button>
            </li>
            <li role="presentation" class="dropdown" id="orderby">
                <a class="dropdown-toggle" data-toggle="dropdown" href="#" role="button" aria-haspopup="true" aria-expanded="false">
                    @lang('dashboard.news.sort.order') <span class="caret"></span>
                </a>
                <ul class="dropdown-menu">
                    <li><a href="id">@lang('dashboard.news.sort.id')</a></li>
                    <li><a href="created_at">@lang('dashboard.news.sort.created')</a></li>
                    <li><a href="updated_at">@lang('dashboard.news.sort.updated')</a></li>
                    <li><a href="title_long">@lang('dashboard.news.sort.titleLong')</a></li>
                    <li><a href="title_short">@lang('dashboard.news.sort.titleShort')</a></li>
                </ul>
            </li>

            </ul>
        </ul>
    </div>
    <div class="row">
        @foreach($news as $newsItem)
            <div class="col-xs-12 col-md-offset-1 col-md-10">
                <article data-id="{{$newsItem->id}}" style="background-image: url({{ asset($newsItem->image_url) }})" data-text="Edit">
                    <div class="col-md-10">
                        <div class="row">
                            <p class="title_long">{{$newsItem->title_long}}</p>
                        </div>
                    </div>
                    <div class="col-md-2">
                        <div class="row text-right news-date">
                        {{Carbon\Carbon::createFromFormat('Y-m-d H:i:s', $newsItem->created_at)->format('Y-m-d')}}
                        </div>
                    </div>
                    <div class="hidden">
                        <div class="title_short">{{$newsItem->title_short}}</div>
                        <div class="article">{{$newsItem->article}}</div>
                    </div>
                </article>
                </div>
        @endforeach
    </div>
    <div class="row text-center">
        {{$news->links()}}
    </div>

    <div id="modal" class="modal fade" tabindex="-1" role="dialog">
        <div class="modal-dialog">
            <div class="modal-content">
                <div class="modal-header">
                    <button type="button" class="close" data-dismiss="modal" aria-label="Close"><span aria-hidden="true">&times;</span></button>
                    <h4 class="modal-title">@lang('dashboard.news.modal.id') #<span></span></h4>
                </div>
                <div class="modal-body">
                    <form data-update="{{route('newsUpdate')}}" data-add="{{route('newsAdd')}}">
                        <input type="hidden" name="id" id="id">
                        <div class="form-group">
                            <label for="long">@lang('dashboard.news.sort.titleLong')</label>
                            <input type="text" class="form-control" id="long" placeholder="@lang('dashboard.news.sort.titleLong')" name="title_long">
                            <p class="help-block">@lang('dashboard.news.modal.length'): 300</p>
                        </div>
                        <div class="form-group">
                            <label for="short">@lang('dashboard.news.sort.titleShort')</label>
                            <input type="text" class="form-control" id="short" placeholder="@lang('dashboard.news.sort.titleShort')" name="title_short">
                            <p class="help-block">@lang('dashboard.news.modal.length'): 100</p>
                        </div>
                        <div class="form-group">
                            <label for="article">@lang('dashboard.news.modal.text')</label>
                            <textarea class="form-control" rows="12" id="article" name="article"></textarea>
                            <p class="help-block">@lang('dashboard.news.modal.length'): 2500</p>
                        </div>
                        <div class="form-group">
                            <label for="image">@lang('dashboard.news.modal.image')</label>
                            <input type="file" id="image" name="image_url">
                            <p class="help-block">@lang('dashboard.news.modal.imageDesc')</p>
                            <img class="img-thumbnail" src="" alt="" id="preview">
                        </div>
                        <div class="form-group">
                            <label for="date">@lang('dashboard.news.modal.date')</label>
                            <input class="form-control" type="date" id="date" name="created_at">
                        </div>
                    </form>
                </div>
                <div class="modal-footer">
                    <button type="button" class="btn btn-danger pull-left delete-item" data-url="{{route('newsDelete')}}">@lang('dashboard.core.buttons.delete')</button>
                    <button type="button" class="btn btn-default" data-dismiss="modal">@lang('dashboard.core.buttons.close')</button>
                    <button type="button" class="btn btn-primary save-changes">@lang('dashboard.core.buttons.save')</button>
                </div>
            </div><!-- /.modal-content -->
        </div><!-- /.modal-dialog -->
    </div><!-- /.modal -->
@endsection