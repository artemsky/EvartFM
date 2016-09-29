$(function(){
    "use strict";
    var removeIntent = false;
    var forDeleteTrack = [];
    var forSave = [];
    var initSortable = function(){
        return $( ".sortable.playlist" ).sortable({
            receive: function(event, ui) {
                var item = ui.item.clone();
                var id = Date.now();
                item.find(".name").attr("data-track-id", id);
                $(this).append(item);
                var parent = item.parent().parent();
                var info = item.find(".name");
                var playlistName = parent.attr("id");
                var inArray = -1;
                forSave.forEach(function(playlist, i){
                    if(playlist.name == playlistName)
                        inArray = i;
                });
                if(inArray >= 0){
                    forSave[inArray].tracklist.push({
                        id: id,
                        name: info.text()
                    });
                }else{
                    forSave.push({
                        id: parent.attr("data-playlist-id"),
                        name: parent.attr("id"),
                        tracklist: [{
                            id: id,
                            name: info.text()
                        }]
                    });
                }
               
            },
            over: function () {
                removeIntent = false;
            },
            out: function () {
                removeIntent = true;
            },
            beforeStop: function (event, ui) {
                if(removeIntent == true){
                    ui.item.remove();
                    var id = ui.item.find(".name").attr("data-track-id");
                    forDeleteTrack.push(parseInt(id));
                }
            }
        });
    };
    var requestOptions = {
        type: "POST",
        headers: {
            'X-CSRF-TOKEN': $('meta[name="csrf-token"]').attr('content')
        },
        error: function(response){
            var w = window.open('', ':Error Message', 'menubar=no, location=no');
            w.document.write(response.responseText);
        }
    };
    var sortable = initSortable();
    $( ".sortable.files" ).sortable({
        connectWith: ".sortable.playlist",
        remove: function(event, ui) {
            $(this).sortable('cancel');
        }
    });

    $(".tab-content").on("click", ".delete-current", function(){
        var id = $(this).parent().attr("id");
        if(!confirm("Are you shure you want to delete " + id + "?"))
            return false;
        requestOptions.type = "delete";
        requestOptions.data = {id: $(this).parent().attr("data-playlist-id")};
        requestOptions.success =  function(response){
            $.notify("Playlist: "+ id + " - " + response.message, "success");
        };
        $.ajax($(this).attr("data-url"), requestOptions);
        $(this).parent().remove();
        $("#"+id+"-tab").parent().remove();

    });

    $(".new-list").on("click", function(){
        var id = $.trim(prompt("Enter playlist name"));
        if(!id)
            return false;
        $(".tab-content").append('<div role="tabpanel" class="tab-pane" id="'+id+'" data-playlist-id="'+ Date.now() +'"><div class="sortable playlist"></div><button type="button" class="btn btn-warning w100 delete-current">Delete this list</button></div>');
        $("ul.dropdown-menu").append('<li><a href="#'+ id +'" role="tab" id="' + id + '-tab" data-toggle="tab" aria-controls="'+ id +'" aria-expanded="true">'+id+'</a></li>');
        var tab = $("#"+id);
        var li = $("#"+id + "-tab");
        $("ul.dropdown-menu li").removeClass("active");
        li.trigger("click");
        $("ul.dropdown-menu li #"+id+"-tab").parent().addClass("active");

        sortable.sortable( "destroy" );
        sortable = initSortable();

    });

    $(".save-changes").on("click", function(){

        forSave.forEach(function(playlist){
            playlist.tracklist = playlist.tracklist.filter(function(val){
                return forDeleteTrack.indexOf(val.id) < 0;
            });
        });
        requestOptions.data = {
            forSave: forSave,
            forDelete: forDeleteTrack
        };
        requestOptions.success =  function(response){
            if(response.ids){
                response.ids['trackIds'].forEach(function(val){
                    $("[data-track-id='"+val.old+"']").attr("data-track-id", val.new);
                });
                response.ids['playlistIds'].forEach(function(val){
                    $("[data-playlist-id='"+val.old+"']").attr("data-playlist-id", val.new);

                });
            }
            $.notify(response.message, "success");
            forSave = [];
            forDeleteTrack = [];
        };
        $.ajax($(this).attr("data-url"), requestOptions);
    })
    $(function(){
        var prev = null;
        var switchAudio = function(item){
            var audio = $(item).parent().find("audio").get(0);
            if(audio.paused){
                audio.play();
                $(item).addClass('glyphicon-pause').removeClass('glyphicon-play');
            }
            else{
                audio.pause();
                $(item).addClass('glyphicon-play').removeClass('glyphicon-pause');
            }
        };
        $(".sortable").on("click", ".play", function(){
            if(prev == null){
                prev = $(this);
            }
            if(prev.is($(this))){
                switchAudio(this);
            }
            else{
                switchAudio(prev);
                switchAudio(this);
                prev = $(this);
            }
        })
    });


});