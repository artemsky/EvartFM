@extends('dashboard.main')

@section('scripts')
    <script src="{{ URL::to('js/newsall.js') }}"></script>
@endsection

@section('styles')
    <meta name="csrf-token" content="{{ csrf_token() }}">
    <link rel="stylesheet" href="{{ URL::asset('css/dashboard.css') }}">
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
                    Sort by <span class="caret"></span>
                </a>
                <ul class="dropdown-menu">
                    <li><a href="desc">Descending</a></li>
                    <li><a href="asc">Ascending</a></li>
                </ul>
            </li>
            <li role="presentation" class="dropdown text-center" >
                <button type="button" class="btn btn-info new-item">Add new</button>
            </li>
            <li role="presentation" class="dropdown" id="orderby">
                <a class="dropdown-toggle" data-toggle="dropdown" href="#" role="button" aria-haspopup="true" aria-expanded="false">
                    Order By <span class="caret"></span>
                </a>
                <ul class="dropdown-menu">
                    <li><a href="id">Identity</a></li>
                    <li><a href="created_at">Created</a></li>
                    <li><a href="updated_at">Updated</a></li>
                    <li><a href="title_long">Long Title</a></li>
                    <li><a href="title_short">Short Title</a></li>
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
                    <h4 class="modal-title">ID #<span></span></h4>
                </div>
                <div class="modal-body">
                    <form data-update="{{route('newsUpdate')}}" data-add="{{route('newsAdd')}}">
                        <input type="hidden" name="id" id="id">
                        <div class="form-group">
                            <label for="long">Long Title</label>
                            <input type="text" class="form-control" id="long" placeholder="Full Title" name="title_long">
                            <p class="help-block">Max length: 300</p>
                        </div>
                        <div class="form-group">
                            <label for="short">Short Title</label>
                            <input type="text" class="form-control" id="short" placeholder="Short Title" name="title_short">
                            <p class="help-block">Max length: 100</p>
                        </div>
                        <div class="form-group">
                            <label for="article">News Text</label>
                            <textarea class="form-control" rows="12" id="article" name="article"></textarea>
                            <p class="help-block">Max length: 2500</p>
                        </div>
                        <div class="form-group">
                            <label for="image">Select Image</label>
                            <input type="file" id="image" name="image_url">
                            <p class="help-block">PNG, JPEG, JPG and not more than 1MB.</p>
                            <img class="img-thumbnail" src="" alt="" id="preview">
                        </div>
                        <div class="form-group">
                            <label for="date">Date</label>
                            <input class="form-control" type="date" id="date" name="created_at">
                        </div>
                    </form>
                </div>
                <div class="modal-footer">
                    <button type="button" class="btn btn-danger pull-left delete-user">Delete</button>
                    <button type="button" class="btn btn-default" data-dismiss="modal">Close</button>
                    <button type="button" class="btn btn-primary save-changes">Save changes</button>
                </div>
            </div><!-- /.modal-content -->
        </div><!-- /.modal-dialog -->
    </div><!-- /.modal -->
@endsection