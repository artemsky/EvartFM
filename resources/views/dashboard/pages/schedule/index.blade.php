@extends('dashboard.main')

@section('styles')
    <link rel="stylesheet" href="{{ URL::to('css/dashboard.css') }}">
    <link rel="stylesheet" href="{{ URL::to('vendor/icheck/skins/square/blue.css') }}">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/malihu-custom-scrollbar-plugin/3.1.5/jquery.mCustomScrollbar.min.css" onerror="onErrorLoader(this, '{{ URL::to('vendor/malihu-custom-scrollbar-plugin/jquery.mCustomScrollbar.min.css') }}')">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/jquery-datetimepicker/2.5.4/jquery.datetimepicker.min.css" onerror="onErrorLoader(this, '{{ URL::to('vendor/datetimepicker/build/jquery.datetimepicker.min.css') }}')">
@endsection

@section('scripts')
    <script src="https://cdnjs.cloudflare.com/ajax/libs/moment.js/2.10.6/moment.min.js" onerror="onErrorLoader(this, '{{ URL::to('vendor/moment/moment.js') }}')"></script>
    <script src="{{ URL::to('vendor/moment/locale/en-gb.js') }}"></script>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/underscore.js/1.8.3/underscore-min.js" onerror="onErrorLoader(this, '{{ URL::to('vendor/underscore/underscore.js') }}')"></script>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/malihu-custom-scrollbar-plugin/3.1.5/jquery.mCustomScrollbar.min.js" onerror="onErrorLoader(this, '{{ URL::to('vendor/malihu-custom-scrollbar-plugin/jquery.mCustomScrollbar.concat.min.js') }}')"></script>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/jquery-datetimepicker/2.5.4/build/jquery.datetimepicker.full.min.js" onerror="onErrorLoader(this, '{{ URL::to('vendor/datetimepicker/build/jquery.datetimepicker.full.min.js') }}')"></script>
    <script src="{{ URL::asset('vendor/clndr/src/clndr.js') }}"></script>
    <script src="{{ URL::asset('vendor/iCheck/icheck.js') }}"></script>
    <script src="{{ URL::to('js/schedule.js') }}"></script>
@endsection

@section('navigation')
    @include('dashboard.components.nav')
@endsection

@section('body-class', 'page-schedule')
@section('content')
    <div id="full-clndr" class="clearfix">
        @include('dashboard.components.clndr')
    </div>

    <div class="modal fade" tabindex="-1" role="dialog" id="modal">
        <div class="modal-dialog">
            <div class="modal-content">
                <div class="modal-header">
                    <button type="button" class="close" data-dismiss="modal" aria-label="Close"><span aria-hidden="true">&times;</span></button>
                    <h4 class="modal-title">Add new Event</h4>
                </div>
                <div class="modal-body">
                    <form>
                        <div class="form-group">
                            <label for="Title">Title</label>
                            <input type="text" class="form-control" id="Title" placeholder="Title">
                        </div>
                        <div class="form-group">
                            <label for="Description">Description</label>
                            <input type="text" class="form-control" id="Description" placeholder="Description">
                        </div>
                        <div class="form-group">
                            <input type="checkbox" id="repeat-day">
                            <label for="repeat-day">Repeat every day</label>
                        </div>
                        <div class="form-group">
                            <label for="datetimepicker">Date / Time</label>
                            <input type="text" class="form-control" id="datetimepicker" placeholder="Datetime" autocomplete="off">
                        </div>

                    </form>
                </div>
                <div class="modal-footer">
                    <button type="button" class="btn btn-default" data-dismiss="modal">Close</button>
                    <button type="button" class="btn btn-primary">Save</button>
                </div>
            </div><!-- /.modal-content -->
        </div><!-- /.modal-dialog -->
    </div><!-- /.modal -->

    </div>
@endsection