@extends('dashboard.main')

@section('styles')
    <meta name="csrf-token" content="{{ csrf_token() }}">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/jquery-datetimepicker/2.5.4/jquery.datetimepicker.min.css" onerror="onErrorLoader(this, '{{ URL::to('vendor/datetimepicker/build/jquery.datetimepicker.min.css') }}')">
    <link rel="stylesheet" href="{{ URL::to('css/dashboard.css') }}">
@endsection

@section('scripts')
    <script src="{{ URL::to('js/jquery-ui.min.js') }}"></script>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/moment.js/2.10.6/moment.min.js" onerror="onErrorLoader(this, '{{ URL::to('vendor/moment/moment.js') }}')"></script>
    <script src="{{ URL::to('vendor/moment/locale/en-gb.js') }}"></script>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/jquery-datetimepicker/2.5.4/build/jquery.datetimepicker.full.min.js" onerror="onErrorLoader(this, '{{ URL::to('vendor/datetimepicker/build/jquery.datetimepicker.full.min.js') }}')"></script>
    <script src="{{ URL::to('js/components.js') }}"></script>

@endsection

@section('navigation')
    @include('dashboard.components.nav')
@endsection

@section('body-class', 'page-components')
@section('content')
    <div>

        <!-- Nav tabs -->
        <ul class="nav nav-tabs" role="tablist">
            <li role="presentation" class="active"><a href="#home" aria-controls="home" role="tab" data-toggle="tab">Home</a></li>
            <li role="presentation"><a href="#news" aria-controls="profile" role="tab" data-toggle="tab">News</a></li>
            <li role="presentation"><a href="#contacts" aria-controls="messages" role="tab" data-toggle="tab">Contacts</a></li>
        </ul>

        <!-- Tab panes -->
        <div class="tab-content">
            <div role="tabpanel" class="tab-pane fade in active" id="home">
                @include('dashboard.pages.content.components.index.layout')
            </div>
            <div role="tabpanel" class="tab-pane fade" id="news">...</div>
            <div role="tabpanel" class="tab-pane fade" id="contacts">...</div>
        </div>

    </div>
@endsection