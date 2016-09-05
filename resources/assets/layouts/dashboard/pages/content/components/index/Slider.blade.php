<div class="container-fluid">
    <div class="row sortable sortableSlider">
        @foreach($Slider as $slide)
            <div class="col-sm-3 item" data-order="{{$slide->order}}" data-id="{{$slide->id}}">
                <img src="{{asset($slide->image)}}" alt="" class="img-responsive img-thumbnail">
                <h1>{{$slide->title}}</h1>
                <p>{{$slide->description}}</p>
            </div>

        @endforeach
            <div class="col-sm-3 cloneable hidden" data-order="" data-id="">
                <img src="" alt="" class="img-responsive img-thumbnail">
                <h1></h1>
                <p></p>
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

<div id="modal_slider" class="modal fade" tabindex="-1" role="dialog">
    <div class="modal-dialog">
        <div class="modal-content">
            <div class="modal-header">
                <button type="button" class="close" data-dismiss="modal" aria-label="Close"><span aria-hidden="true">&times;</span></button>
                <h4 class="modal-title">Order #<span></span></h4>
            </div>
            <div class="modal-body">
                <form>
                    <div class="form-group">
                        <label for="title">Title</label>
                        <input type="text" class="form-control" id="title" placeholder="Title" name="title">
                        <p class="help-block">Max length: 300</p>
                    </div>
                    <div class="form-group">
                        <label for="description">Description</label>
                        <input type="text" class="form-control" id="description" placeholder="Description" name="description">
                        <p class="help-block">Max length: 100</p>
                    </div>
                    <div class="form-group">
                        <label for="image">Select Image</label>
                        <input type="file" id="image" name="image_url">
                        <p class="help-block">PNG, JPEG, JPG and not more than 1MB.</p>
                        <img class="img-thumbnail" src="" alt="" id="preview">
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
