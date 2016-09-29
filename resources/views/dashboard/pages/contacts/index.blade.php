@extends('dashboard.main')

@section('scripts')
    <script src="{{ URL::to('libs/dashboard/notify.min.js') }}"></script>
    <script src="{{ URL::to('libs/dashboard/contacts.js') }}"></script>
@endsection

@section('navigation')
    @include('dashboard.components.nav')
@endsection

@section('body-class', 'contacts')
@section('content')
    <div class="row">
        <div class="col-xs-12 col-sm-offset-2 col-sm-8">
            <form action="{{route('content.contacts.update')}}">
                @foreach($Data as $field=>$value)
                <div class="form-group">
                    <label for="{{$field}}">{{$field}}</label>
                    <input type="text" class="form-control" id="{{$field}}" placeholder="{{$field}}" value="{{trim($value)}}">
                </div>
                @endforeach
                <button type="submit" class="btn btn-primary">Submit</button>
            </form>
        </div>
        <!-- /.col-xs-12 -->
    </div>
@endsection