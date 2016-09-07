<div>

    <!-- Nav tabs -->
    <ul class="nav nav-pills nav-justified" role="tablist">
        <li role="presentation" class="active"><a href="#Slider" aria-controls="Slider" role="tab" data-toggle="tab">Slider</a></li>
        <li role="presentation"><a href="#Blockquote" aria-controls="Blockquote" role="tab" data-toggle="tab">Blockquote</a></li>
        <li role="presentation"><a href="#Events" aria-controls="Events" role="tab" data-toggle="tab">Events</a></li>
        <li role="presentation"><a href="#Video" aria-controls="Video" role="tab" data-toggle="tab">Video</a></li>
    </ul>

    <!-- Tab panes -->
    <div class="tab-content">
        <div role="tabpanel" class="tab-pane fade in active" id="Slider">
            @include('dashboard.pages.content.components.index.Slider')
        </div>
        <div role="tabpanel" class="tab-pane fade" id="Blockquote">
            @include('dashboard.pages.content.components.index.Blockquote')
        </div>
        <div role="tabpanel" class="tab-pane fade" id="Events">
            @include('dashboard.pages.content.components.index.Events')
        </div>
        <div role="tabpanel" class="tab-pane fade" id="Video">
            @include('dashboard.pages.content.components.index.Video')
        </div>
    </div>

    <div id="modal" class="modal fade" tabindex="-1" role="dialog">
        <div class="modal-dialog">
            <div class="modal-content">
                <div class="modal-header">
                    <button type="button" class="close" data-dismiss="modal" aria-label="Close"><span aria-hidden="true">&times;</span></button>
                    <h4 class="modal-title hidden">Order #<span id="modal_order"></span></h4>
                </div>
                <div class="modal-body">
                    <form>
                        <div class="form-group hidden">
                            <label for="modal_title">Title</label>
                            <input type="text" class="form-control" id="modal_title" placeholder="Title">
                        </div>
                        <div class="form-group hidden">
                            <label for="modal_name">Name</label>
                            <input type="text" class="form-control" id="modal_name" placeholder="Name">
                        </div>
                        <div class="form-group hidden">
                            <label for="modal_description">Description</label>
                            <input type="text" class="form-control" id="modal_description" placeholder="Description">
                        </div>
                        <div class="form-group hidden">
                            <label for="modal_video">Video URL</label>
                            <input type="text" class="form-control" id="modal_video" placeholder="Link">
                        </div>
                        <div class="form-group hidden">
                            <label for="modal_text">Blockquote</label>
                            <textarea type="text" class="form-control" id="modal_text" placeholder="Blockquote"></textarea>
                        </div>
                        <div class="form-group hidden">
                            <label for="modal_date">Date</label>
                            <input class="form-control" type="text" id="modal_date" placeholder="Click to select Date" autocomplete="off">
                        </div>
                        <div class="form-group hidden">
                            <label for="modal_image">Select Image</label>
                            <input type="file" id="modal_image">
                            <p class="help-block">PNG, JPEG, JPG and not more than 2MB.</p>
                            <img class="img-thumbnail" id="modal_preview">
                        </div>
                    </form>
                </div>
                <div class="modal-footer">
                    <button type="button" class="btn btn-danger pull-left delete-item">Delete</button>
                    <button type="button" class="btn btn-default" data-dismiss="modal">Close</button>
                    <button type="button" class="btn btn-primary save-item">Save changes</button>
                </div>
            </div><!-- /.modal-content -->
        </div><!-- /.modal-dialog -->
    </div><!-- /.modal -->

</div>