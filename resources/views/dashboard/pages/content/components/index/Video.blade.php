<div class="container-fluid">
    <div class="row sortable sortableVideo">
        @foreach($Video as $video)
            <div class="col-sm-3 item" data-order="{{$video->order}}" data-id="{{$video->id}}">
                <img src="{{asset($video->image)}}" alt="" class="img-responsive img-thumbnail">
                <h1>{{$video->title}}</h1>
                <p>{{$video->description}}</p>
                <p class="url">{{$video->video}}</p>
            </div>

        @endforeach
            <div class="col-sm-3 cloneable hidden" data-order="" data-id="">
                <img src="" alt="" class="img-responsive img-thumbnail">
                <h1></h1>
                <p></p>
                <p class="url"></p>
            </div>
            <div class="col-xs-12 more">
                <button type="button" class="btn btn-default new-item">
                    <span class="glyphicon glyphicon-plus"></span>
                    New slide
                </button>
                <button type="button" class="btn btn-success save-all">
                    <span class="glyphicon glyphicon-ok"></span>
                    Save changes
                </button>
            </div>
    </div>
    <!-- /.row -->
</div>
<!-- /.container-fluid -->

<div id="modal_video" class="modal fade" tabindex="-1" role="dialog">
    <div class="modal-dialog">
        <div class="modal-content">
            <div class="modal-header">
                <button type="button" class="close" data-dismiss="modal" aria-label="Close"><span aria-hidden="true">&times;</span></button>
                <h4 class="modal-title">Order #<span></span></h4>
            </div>
            <div class="modal-body">
                <form>
                    <div class="form-group">
                        <label for="video_title">Title</label>
                        <input type="text" class="form-control" id="video_title" placeholder="Title">
                        <p class="help-block">Max length: 300</p>
                    </div>
                    <div class="form-group">
                        <label for="video_description">Description</label>
                        <input type="text" class="form-control" id="video_description" placeholder="Description">
                        <p class="help-block">Max length: 100</p>
                    </div>
                    <div class="form-group">
                        <label for="video_url">Video URL</label>
                        <input type="text" class="form-control" id="video_url" placeholder="Link">
                        <p class="help-block">Any iFrame link</p>
                    </div>
                    <div class="form-group">
                        <label for="video_image">Select Image</label>
                        <input type="file" id="video_image">
                        <p class="help-block">PNG, JPEG, JPG and not more than 1MB.</p>
                        <img class="img-thumbnail" src="" alt="" id="video_preview">
                    </div>
                </form>
            </div>
            <div class="modal-footer">
                <button type="button" class="btn btn-danger pull-left delete-item">Delete</button>
                <button type="button" class="btn btn-default" data-dismiss="modal">Close</button>
                <button type="button" class="btn btn-primary save-changes">Save changes</button>
            </div>
        </div><!-- /.modal-content -->
    </div><!-- /.modal-dialog -->
</div><!-- /.modal -->
