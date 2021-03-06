@extends('dashboard.main')

@section('styles')
    <link rel="stylesheet" href="{{ URL::to('libs/vendor/datetimepicker/jquery.datetimepicker.css') }}">
@endsection

@section('scripts')
    <script src="{{ URL::to('libs/dashboard/jquery-ui.min.js') }}"></script>
    <script src="{{ URL::to('libs/vendor/moment/moment.js') }}"></script>
    <script src="{{ URL::to('libs/vendor/moment/locale/en-gb.js') }}"></script>
    <script src="{{ URL::to('libs/vendor/datetimepicker/build/jquery.datetimepicker.full.js') }}"></script>
    <script src="{{ URL::to('libs/dashboard/notify.min.js') }}"></script>
    <script src="{{ URL::to('libs/dashboard/components.js') }}"></script>
@endsection

@section('navigation')
    @include('dashboard.components.nav')
@endsection

@section('body-class', 'page-components')
@section('content')
    <div>
        <!-- Nav tabs -->
        <div>
            <!-- Nav tabs -->
            <ul class="nav nav-pills nav-justified" role="tablist">
                <li role="presentation" class="active"><a href="#Slider" aria-controls="Slider" role="tab" data-toggle="tab">@lang('dashboard.components.slider')</a></li>
                <li role="presentation"><a href="#Blockquote" aria-controls="Blockquote" role="tab" data-toggle="tab">@lang('dashboard.components.blockquote')</a></li>
                <li role="presentation"><a href="#Events" aria-controls="Events" role="tab" data-toggle="tab">@lang('dashboard.components.events')</a></li>
                <li role="presentation"><a href="#Video" aria-controls="Video" role="tab" data-toggle="tab">@lang('dashboard.components.video')</a></li>
            </ul>

            <!-- Tab panes -->
            <div class="tab-content">
                <div role="tabpanel" class="tab-pane fade in active" id="Slider">
                    @include('dashboard.pages.content.components.index.Slider')
                </div>
                <div role="tabpanel" class="tab-pane fade" id="Blockquote">
                    @include('dashboard.pages.content.components.index.Blockquote')
                </div>
                <div role="tabpanel" class="tab-pane fade" id="Events">
                    @include('dashboard.pages.content.components.index.Events')
                </div>
                <div role="tabpanel" class="tab-pane fade" id="Video">
                    @include('dashboard.pages.content.components.index.Video')
                </div>
            </div>

            <div id="modal" class="modal fade" tabindex="-1" role="dialog">
                <div class="modal-dialog">
                    <div class="modal-content">
                        <div class="modal-header">
                            <button type="button" class="close" data-dismiss="modal" aria-label="Close"><span aria-hidden="true">&times;</span></button>
                            <h4 class="modal-title hidden">@lang('dashboard.components.modal.order') #<span id="modal_order"></span></h4>
                        </div>
                        <div class="modal-body">
                            <form>
                                <div class="form-group hidden">
                                    <label for="modal_title">@lang('dashboard.components.modal.title')</label>
                                    <input type="text" class="form-control" id="modal_title" placeholder="@lang('dashboard.components.modal.title')">
                                </div>
                                <div class="form-group hidden">
                                    <label for="modal_name">@lang('dashboard.components.modal.name')</label>
                                    <input type="text" class="form-control" id="modal_name" placeholder="@lang('dashboard.components.modal.name')">
                                </div>
                                <div class="form-group hidden">
                                    <label for="modal_description">@lang('dashboard.components.modal.desc')</label>
                                    <input type="text" class="form-control" id="modal_description" placeholder="@lang('dashboard.components.modal.desc')">
                                </div>
                                <div class="form-group hidden">
                                    <label for="modal_video">@lang('dashboard.components.video') @lang('dashboard.components.modal.url')</label>
                                    <input type="text" class="form-control" id="modal_video" placeholder="@lang('dashboard.components.modal.url')">
                                </div>
                                <div class="form-group hidden">
                                    <label for="modal_text">@lang('dashboard.components.blockquote')</label>
                                    <textarea type="text" class="form-control" id="modal_text" placeholder="@lang('dashboard.components.blockquote')"></textarea>
                                </div>
                                <div class="form-group hidden">
                                    <label for="modal_date">@lang('dashboard.components.modal.date')</label>
                                    <input class="form-control" type="text" id="modal_date" placeholder="@lang('dashboard.components.modal.date')" autocomplete="off">
                                </div>
                                <div class="form-group hidden">
                                    <label for="modal_image">@lang('dashboard.components.modal.image')</label>
                                    <input type="file" id="modal_image">
                                    <p class="help-block">@lang('dashboard.components.modal.imageDesc')</p>
                                    <img class="img-thumbnail" id="modal_preview">
                                </div>
                            </form>
                        </div>
                        <div class="modal-footer">
                            <button type="button" class="btn btn-danger pull-left delete-item">@lang('dashboard.core.buttons.delete')</button>
                            <button type="button" class="btn btn-default" data-dismiss="modal">@lang('dashboard.core.buttons.close')</button>
                            <button type="button" class="btn btn-primary save-item">@lang('dashboard.core.buttons.save')</button>
                        </div>
                    </div><!-- /.modal-content -->
                </div><!-- /.modal-dialog -->
            </div><!-- /.modal -->
        </div>
<div class="text-right">
    <button id="save-changes" type="button" class="btn btn-success pull-right">
        <span class="glyphicon glyphicon-ok"></span>
        @lang('dashboard.core.buttons.save')
    </button>
    <button class="btn btn-info mr20" type="button" data-toggle="collapse" data-target="#componentsControl" aria-expanded="false" aria-controls="componentsControl">
        Components Control
    </button>
    <div class="collapse" id="componentsControl" data-url="{{route('content.activate')}}">
        <div class="well">
            <table class="table table-striped">
                <thead>
                <tr>
                    <th class="text-left">Component</th>
                    <th class="text-right">Status</th>
                </tr>
                </thead>
                <tbody>
                @foreach($Components as $component)
                    <tr>
                        <td class="text-left">{{$component['component']}}</td>
                        <td class="text-right">
                            <label class="switch">
                                <input type="checkbox" class="isActive" {{$component['active'] != 0 ? 'checked' : ''}} data-id="{{$component->id}}">
                                <div class="slider"></div>
                            </label>
                        </td>
                    </tr>
                @endforeach
                </tbody>
            </table>
        </div>
    </div>
</div>
<!-- /.text-right -->


    </div>
@endsection