@extends('dashboard.main')

@section('styles')
    <meta name="lang" content="{{ \Session::get('locale') }}">
    <link rel="stylesheet" href="{{ URL::to('libs/vendor/iCheck/skins/square/blue.css') }}">
    <link rel="stylesheet" href="{{ URL::to('libs/vendor/malihu-custom-scrollbar-plugin/jquery.mCustomScrollbar.css') }}">
    <link rel="stylesheet" href="{{ URL::to('libs/vendor/datetimepicker/jquery.datetimepicker.css') }}">
    <link rel="stylesheet" href="{{ URL::to('libs/vendor/bootstrap-select/dist/css/bootstrap-select.css') }}">

@endsection

@section('scripts')
    <script src="{{ URL::to('libs/vendor/moment/moment.js') }}"></script>
    <script src="{{ URL::to('libs/vendor/moment/locale/en-gb.js') }}"></script>
    <script src="{{ URL::to('libs/dashboard/moment-ru.js') }}"></script>
    <script src="{{ URL::to('libs/vendor/underscore/underscore.js') }}"></script>
    <script src="{{ URL::to('libs/dashboard/notify.min.js') }}"></script>

    <script src="{{ URL::to('libs/vendor/bootstrap-select/dist/js/bootstrap-select.js') }}"></script>
    <script src="{{ URL::to('libs/vendor/malihu-custom-scrollbar-plugin/jquery.mCustomScrollbar.js') }}"></script>
    <script src="{{ URL::to('libs/vendor/datetimepicker/build/jquery.datetimepicker.full.js') }}"></script>
    <script src="{{ URL::asset('libs/vendor/clndr/src/clndr.js') }}"></script>
    <script src="{{ URL::asset('libs/vendor/iCheck/icheck.js') }}"></script>
    <script src="{{ URL::to('libs/dashboard/schedule.js') }}"></script>
@endsection

@section('navigation')
    @include('dashboard.components.nav')
@endsection

@section('body-class', 'page-schedule')
@section('content')
    <div id="full-clndr" class="clearfix">
        @include('dashboard.components.clndr')
    </div>
    <div id="fountainTextG"><div id="fountainTextG_1" class="fountainTextG">L</div><div id="fountainTextG_2" class="fountainTextG">o</div><div id="fountainTextG_3" class="fountainTextG">a</div><div id="fountainTextG_4" class="fountainTextG">d</div><div id="fountainTextG_5" class="fountainTextG">i</div><div id="fountainTextG_6" class="fountainTextG">n</div><div id="fountainTextG_7" class="fountainTextG">g</div></div>

    <div class="modal fade" tabindex="-1" role="dialog" id="modal">
        <div class="modal-dialog">
            <div class="modal-content">
                <div class="modal-header">
                    <button type="button" class="close" data-dismiss="modal" aria-label="Close"><span aria-hidden="true">&times;</span></button>
                    <h4 class="modal-title">@lang('dashboard.components.scheduler.modal.modalTitle')</h4>
                </div>
                <div class="modal-body">
                    <form>
                        <div class="form-group">
                            <label for="Title">@lang('dashboard.components.scheduler.modal.title')</label>
                            <input type="text" class="form-control" id="Title" placeholder="@lang('dashboard.components.scheduler.modal.title')" title="@lang('dashboard.components.scheduler.modal.titleTip')">
                        </div>
                        <div class="form-group">
                            <label for="Description">@lang('dashboard.components.scheduler.modal.desc')</label>
                            <input type="text" class="form-control" id="Description" placeholder="@lang('dashboard.components.scheduler.modal.desc')">
                        </div>
                        <div class="form-group">
                            <label for="playlist">@lang('dashboard.components.scheduler.modal.playlist')</label>
                            <select class="selectpicker form-control" id="playlist" name="playlist">
                                <option value="0">@lang('dashboard.components.scheduler.modal.emptyPlaylist')</option>
                            </select>
                        </div>

                        <div class="form-group">
                            <input type="checkbox" id="repeat-day">
                            <label for="repeat-day">@lang('dashboard.components.scheduler.modal.repeat.everyDay')</label>
                        </div>
                        <div class="form-group">
                            <input type="checkbox" id="repeat-month">
                            <label for="repeat-month">@lang('dashboard.components.scheduler.modal.repeat.everyWeek')</label>
                            <div class="form-group" id="repeat-on">
                                <input type="checkbox" id="repeat-on-mon">
                                <label for="repeat-on-mon">@lang('dashboard.components.scheduler.modal.repeat.weeks.mon')</label>
                                <input type="checkbox" id="repeat-on-tue">
                                <label for="repeat-on-tue">@lang('dashboard.components.scheduler.modal.repeat.weeks.tue')</label>
                                <input type="checkbox" id="repeat-on-wed">
                                <label for="repeat-on-wed">@lang('dashboard.components.scheduler.modal.repeat.weeks.wed')</label>
                                <input type="checkbox" id="repeat-on-thu">
                                <label for="repeat-on-thu">@lang('dashboard.components.scheduler.modal.repeat.weeks.thu')</label>
                                <input type="checkbox" id="repeat-on-fri">
                                <label for="repeat-on-fri">@lang('dashboard.components.scheduler.modal.repeat.weeks.fri')</label>
                                <input type="checkbox" id="repeat-on-sat">
                                <label for="repeat-on-sat">@lang('dashboard.components.scheduler.modal.repeat.weeks.sat')</label>
                                <input type="checkbox" id="repeat-on-sun">
                                <label for="repeat-on-sun">@lang('dashboard.components.scheduler.modal.repeat.weeks.sun')</label>
                            </div>
                        </div>
                        <div class="form-group">
                            <label for="datetimepicker">@lang('dashboard.components.scheduler.modal.datetime')</label>
                            <input type="text" class="form-control" id="datetimepicker" placeholder="Datetime" autocomplete="off">
                        </div>

                    </form>
                </div>
                <div class="modal-footer">
                    <button type="button" class="btn btn-danger pull-left delete-event">@lang('dashboard.core.buttons.delete')</button>
                    <button type="button" class="btn btn-default" data-dismiss="modal">@lang('dashboard.core.buttons.close')</button>
                    <button type="button" class="btn btn-primary save-changes">@lang('dashboard.core.buttons.save')</button>
                </div>
            </div><!-- /.modal-content -->
        </div><!-- /.modal-dialog -->
    </div><!-- /.modal -->

@endsection