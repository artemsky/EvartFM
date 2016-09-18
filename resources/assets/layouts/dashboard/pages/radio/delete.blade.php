@extends('dashboard.main')

@section('scripts')
    <script src="{{asset('js/jquery-ui.min.js')}}"></script>
    <script src="{{asset('js/notify.min.js')}}"></script>
    <script src="{{asset('js/radio/delete.js')}}"></script>
@endsection


@section('styles')
    <meta name="csrf-token" content="{{ csrf_token() }}">
    <link rel="stylesheet" href="{{ URL::asset('css/dashboard.css') }}">
@endsection

@section('navigation')
    @include('dashboard.components.nav')
@endsection

@section('body-class', 'radio-delete')
@section('content')
    <div class="row">
        <div class="col-sm-12">
            <h1>Click to select</h1>
            <h6><strong>CTRL+click</strong> or <strong>click+mouse drag over items</strong> to select many</h6>
            <div class="selectable">
                <?php $counter = 0 ?>
                @foreach($Files as $file)
                     <div class="item">
                         <h4>{{++$counter}}. <span>{{basename($file)}}</span></h4>
                     </div>
                @endforeach
            </div>
            <button class="btn btn-danger delete pull-right" data-url="{{route("radio.delete.files")}}">Delete</button>

        </div>
    </div>
@endsection