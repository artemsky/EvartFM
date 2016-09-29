@extends('dashboard.main')

@section('scripts')
    <script src="{{asset('libs/dashboard/jquery-ui.min.js')}}"></script>
    <script src="{{asset('libs/dashboard/notify.min.js')}}"></script>
    <script src="{{asset('libs/dashboard/radio/delete.js')}}"></script>
@endsection

@section('navigation')
    @include('dashboard.components.nav')
@endsection

@section('body-class', 'radio-delete')
@section('content')
    <div class="row">
        <div class="col-sm-12">
            <h1>@lang('dashboard.radio.delete.select')</h1>
            <h6>@lang('dashboard.radio.delete.selectDesc')</h6>
            <div class="selectable">
                <?php $counter = 0 ?>
                @foreach($Files as $file)
                     <div class="item">
                         <h4>{{++$counter}}. <span>{{basename($file)}}</span></h4>
                     </div>
                @endforeach
            </div>
            <button class="btn btn-danger delete pull-right" data-url="{{route("radio.delete.files")}}">@lang('dashboard.core.buttons.delete')</button>

        </div>
    </div>
@endsection