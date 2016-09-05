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

</div>