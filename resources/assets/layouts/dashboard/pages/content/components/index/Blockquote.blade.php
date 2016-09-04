<div class="container-fluid">
    <div class="row sortable sortableBlockquote">
        <div class="col-xs-12 panel-group" id="accordion_blockquote" role="tablist" aria-multiselectable="true" >

            @foreach($Blockquote as $quote)
            <div class="panel panel-default item" data-order="{{$quote->order}}" data-id="{{$quote->id}}">
                <div class="panel-heading" role="tab" id="heading_{{$quote->id}}">
                    <h4 class="panel-title">
                        <a role="button" data-toggle="collapse" data-parent="#accordion_blockquote" href="#collapse_{{$quote->id}}" aria-expanded="false" aria-controls="collapse_{{$quote->id}}">
                            <h4 class="name">{{$quote->name}}</h4>
                        </a>
                    </h4>

                </div>
                <div id="collapse_{{$quote->id}}" class="panel-collapse collapse" role="tabpanel" aria-labelledby="heading_{{$quote->id}}">
                    <div class="panel-body">
                        <div class="container-fluid">
                            <div class="row">
                                <div class="col-sm-3">
                                    <h4 contenteditable="true" class="name">{{$quote->name}}</h4>
                                    <label for="img_{{$quote->id}}">
                                        <img src="{{asset($quote->image)}}" alt="{{$quote->name}}" class="img-thumbnail img-responsive">
                                        <input type="file" class="image hidden" id="img_{{$quote->id}}">
                                    </label>
                                    <h6 contenteditable="true">{{$quote->description}}</h6>
                                </div>
                                <div class="col-sm-9">
                                    <p class="text-right">
                                        <span class="stars">
                                             @for($i = 0; $i < 5; $i++)
                                                @if($i < $quote->stars)
                                                    <span class="glyphicon glyphicon-star active"></span>
                                                @else
                                                    <span class="glyphicon glyphicon-star"></span>
                                                @endif
                                            @endfor
                                        </span>
                                    </p>
                                    <h5 contenteditable="true">{{$quote->text}}</h5>

                                </div>
                            </div>
                        </div>
                        <button type="button" class="btn btn-danger pull-right">Delete</button>
                    </div>
                </div>

            </div>
            @endforeach
                <div class="panel panel-default cloneable hidden">
                    <div class="panel-heading" role="tab">
                        <h4 class="panel-title">
                            <a role="button" data-toggle="collapse" data-parent="#accordion_blockquote" aria-expanded="true">
                                <h4 class="name">Enter Name</h4>
                            </a>
                        </h4>

                    </div>
                    <div class="panel-collapse collapse in" role="tabpanel">
                        <div class="panel-body">
                            <div class="container-fluid">
                                <div class="row">
                                    <div class="col-sm-3">
                                        <h4 contenteditable="true" class="name">Enter Name</h4>
                                        <label>
                                            <img alt="Click to choose image" class="img-thumbnail img-responsive">
                                            <input type="file" class="image hidden">
                                        </label>
                                        <h6 contenteditable="true">Enter Job</h6>
                                    </div>
                                    <div class="col-sm-9">
                                        <p class="text-right">
                                        <span class="stars">
                                                <span class="glyphicon glyphicon-star"></span>
                                                <span class="glyphicon glyphicon-star"></span>
                                                <span class="glyphicon glyphicon-star"></span>
                                                <span class="glyphicon glyphicon-star"></span>
                                                <span class="glyphicon glyphicon-star"></span>
                                        </span>
                                        </p>
                                        <h5 contenteditable="true">Enter Blockquote</h5>

                                    </div>
                                </div>
                            </div>
                            <button type="button" class="btn btn-danger pull-right">Delete</button>
                        </div>
                    </div>
                </div>
        </div>
        <div class="col-xs-12 more">
            <button type="button" class="btn btn-default new-item">
                <span class="glyphicon glyphicon-plus"></span>
                New blockquote
            </button>
            <button type="button" class="btn btn-success save-all">
                <span class="glyphicon glyphicon-ok"></span>
                Save changes
            </button>
        </div>
    </div>
    <!-- /.row sortable -->
</div>
<!-- /.container-fluid -->