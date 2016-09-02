@extends('dashboard.main')

@section('styles')


@endsection

@section('scripts')

@endsection

@section('navigation')
    @include('dashboard.components.nav')
@endsection

@section('body-class', 'page-schedule')
@section('content')
    <div>

        <!-- Nav tabs -->
        <ul class="nav nav-tabs" role="tablist">
            <li role="presentation" class="active"><a href="#home" aria-controls="home" role="tab" data-toggle="tab">Home</a></li>
            <li role="presentation"><a href="#profile" aria-controls="profile" role="tab" data-toggle="tab">Profile</a></li>
            <li role="presentation"><a href="#messages" aria-controls="messages" role="tab" data-toggle="tab">Messages</a></li>
            <li role="presentation"><a href="#settings" aria-controls="settings" role="tab" data-toggle="tab">Settings</a></li>
        </ul>

        <!-- Tab panes -->
        <div class="tab-content">
            <div role="tabpanel" class="tab-pane fade in active" id="home">
                @include('dashboard.pages.content.components.Slider')
            </div>
            <div role="tabpanel" class="tab-pane fade" id="profile">...</div>
            <div role="tabpanel" class="tab-pane fade" id="messages">...</div>
            <div role="tabpanel" class="tab-pane fade" id="settings">...</div>
        </div>

    </div>
@endsection