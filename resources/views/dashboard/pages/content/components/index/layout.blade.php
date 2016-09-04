<div>

    <!-- Nav tabs -->
    <ul class="nav nav-pills nav-justified" role="tablist">
        <li role="presentation" class="active"><a href="#Slider" aria-controls="home" role="tab" data-toggle="tab">Slider</a></li>
        <li role="presentation"><a href="#Blockquote" aria-controls="profile" role="tab" data-toggle="tab">Blockquote</a></li>
        <li role="presentation"><a href="#messages1" aria-controls="messages" role="tab" data-toggle="tab">Messages</a></li>
        <li role="presentation"><a href="#settings1" aria-controls="settings" role="tab" data-toggle="tab">Settings</a></li>
    </ul>

    <!-- Tab panes -->
    <div class="tab-content">
        <div role="tabpanel" class="tab-pane fade in active" id="Slider">
            @include('dashboard.pages.content.components.index.Slider')
        </div>
        <div role="tabpanel" class="tab-pane fade" id="Blockquote">
            @include('dashboard.pages.content.components.index.Blockquote')
        </div>
        <div role="tabpanel" class="tab-pane fade" id="messages1">...</div>
        <div role="tabpanel" class="tab-pane fade" id="settings1">...</div>
    </div>

</div>