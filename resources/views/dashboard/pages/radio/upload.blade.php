@extends('dashboard.main')

@section('scripts')
    <script src="{{asset('vendor/dropzone/dist/dropzone.js')}}"></script>
    <script src="{{ URL::to('js/notify.min.js') }}"></script>
    <script src="{{ URL::to('js/radio/upload.js') }}"></script>
@endsection


@section('styles')
    <meta name="csrf-token" content="{{ csrf_token() }}">
    <link rel="stylesheet" href="{{ URL::asset('vendor/dropzone/dist/dropzone.css') }}">
    <link rel="stylesheet" href="{{ URL::asset('vendor/dropzone/dist/basic.css') }}">
    <link rel="stylesheet" href="{{ URL::asset('css/dashboard.css') }}">
@endsection

@section('navigation')
    @include('dashboard.components.nav')
@endsection

@section('body-class', 'radio-upload')
@section('content')
    <div id="actions" class="row">
        <div class="col-md-12">
            <h2>Drop files on the window or click Add Files to upload</h2>
            <p>(Only <strong>mp3</strong> files allowed. Size not more than <strong>300M</strong>)</p>
        </div>
        <!-- /.col-md-12 -->
        <div class="col-md-7">
            <!-- The fileinput-button span is used to style the file input field as button -->
            <span class="btn btn-success fileinput-button dz-clickable">
            <i class="glyphicon glyphicon-plus"></i>
            <span>Add files...</span>
        </span>
            <button type="submit" class="btn btn-primary start">
                <i class="glyphicon glyphicon-upload"></i>
                <span>Start upload</span>
            </button>
            <button type="reset" class="btn btn-warning cancel">
                <i class="glyphicon glyphicon-ban-circle"></i>
                <span>Cancel upload</span>
            </button>
        </div>

        <div class="col-md-5">
            <!-- The global file processing state -->
            <span class="fileupload-process">
          <div id="total-progress" class="progress progress-striped active" style="display:none;" role="progressbar" aria-valuemin="0" aria-valuemax="100" aria-valuenow="0">
            <div class="progress-bar progress-bar-success" style="width:0%;" data-dz-uploadprogress=""></div>
          </div>
        </span>
        </div>

    </div>
    <div class="row">

        <div class="col-md-12">
            <div class="table table-striped files" id="previews">

                <div id="template" class="file-row" data-url="{{route('radio.upload.file')}}">
                    <!-- This is used as the file preview template -->
                    <div>
                        <span class="preview"><img data-dz-thumbnail /></span>
                    </div>
                    <div>
                        <p class="name" data-dz-name></p>
                        <strong class="error text-danger" data-dz-errormessage></strong>
                    </div>
                    <div>
                        <p class="size" data-dz-size></p>
                        <div class="progress progress-striped active" style="display:none;" role="progressbar" aria-valuemin="0" aria-valuemax="100" aria-valuenow="0">
                            <div class="progress-bar progress-bar-success" style="width:0%;" data-dz-uploadprogress></div>
                        </div>
                    </div>
                    <div>
                        <button class="btn btn-primary start">
                            <i class="glyphicon glyphicon-upload"></i>
                            <span>Start</span>
                        </button>
                        <button data-dz-remove class="btn btn-warning cancel">
                            <i class="glyphicon glyphicon-ban-circle"></i>
                            <span>Cancel</span>
                        </button>
                        <button data-dz-remove class="btn btn-danger delete">
                            <i class="glyphicon glyphicon-trash"></i>
                            <span>Delete</span>
                        </button>
                    </div>
                </div>

            </div>
        </div>
        <!-- /.col-md-12 -->
    </div>
    <!-- /.row -->
@endsection