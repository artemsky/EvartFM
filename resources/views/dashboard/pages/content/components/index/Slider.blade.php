<div class="container-fluid">
    <div class="row sortable">
        @foreach($Slider as $Slide)
            <div class="col-sm-3 item" data-order="{{$Slide->order}}">
                <img src="{{asset($Slide->image)}}" alt="" class="img-responsive img-thumbnail">
                <h1>{{$Slide->title}}</h1>
                <p>{{$Slide->description}}</p>
            </div>

        @endforeach
            <div class="col-sm-3 more">
                <button type="button" class="btn btn-success">
                    <span class="glyphicon glyphicon-plus"></span>
                    Add More
                </button>
            </div>
    </div>
    <!-- /.row -->
</div>
<!-- /.container-fluid -->
