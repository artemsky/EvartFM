@extends('dashboard.main')

@section('scripts')
    <script src="{{ URL::to('libs/dashboard/contacts.js') }}"></script>
@endsection

@section('navigation')
    @include('dashboard.components.nav')
@endsection

@section('body-class', 'contacts')
@section('content')
    <div class="row">
        
    </div>
@endsection