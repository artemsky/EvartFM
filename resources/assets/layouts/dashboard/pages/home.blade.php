@extends('dashboard.main')

@section('navigation')
    @include('dashboard.components.nav')
@endsection
@section('content')
    <div class="row">
        <h1>@lang('dashboard.core.welcome')</h1>

        @if(is_array($Stats))
            <table class="table table-striped table-responsive">
                <thead>
                    <th>@lang('dashboard.stats.title')</th>
                </thead>
            @if(array_key_exists('source', $Stats))
                @foreach(array_get($Stats, 'source') as $key=>$value)
                    @if(is_array($value))
                            <tr>
                                <td class="danger"></td>
                                <td class="danger"></td>
                            </tr>
                        @foreach($value as $itemKey=>$itemValue)
                                <tr>
                                    <td>{{$itemKey}}</td>
                                    <td>{{$itemValue}}</td>
                                </tr>
                        @endforeach
                    @else
                        <tr>
                            <td>{{$key}}</td>
                            <td>{{$value}}</td>
                        </tr>
                    @endif
                @endforeach
            @endif
            </table>
        @else
            <h3>{{$Stats}}</h3>
        @endif
    </div>
@endsection