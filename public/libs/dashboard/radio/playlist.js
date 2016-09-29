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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiIiwic291cmNlcyI6WyJkYXNoYm9hcmQvcmFkaW8vcGxheWxpc3QuanMiXSwic291cmNlc0NvbnRlbnQiOlsiJChmdW5jdGlvbigpe1xyXG4gICAgXCJ1c2Ugc3RyaWN0XCI7XHJcbiAgICB2YXIgcmVtb3ZlSW50ZW50ID0gZmFsc2U7XHJcbiAgICB2YXIgZm9yRGVsZXRlVHJhY2sgPSBbXTtcclxuICAgIHZhciBmb3JTYXZlID0gW107XHJcbiAgICB2YXIgaW5pdFNvcnRhYmxlID0gZnVuY3Rpb24oKXtcclxuICAgICAgICByZXR1cm4gJCggXCIuc29ydGFibGUucGxheWxpc3RcIiApLnNvcnRhYmxlKHtcclxuICAgICAgICAgICAgcmVjZWl2ZTogZnVuY3Rpb24oZXZlbnQsIHVpKSB7XHJcbiAgICAgICAgICAgICAgICB2YXIgaXRlbSA9IHVpLml0ZW0uY2xvbmUoKTtcclxuICAgICAgICAgICAgICAgIHZhciBpZCA9IERhdGUubm93KCk7XHJcbiAgICAgICAgICAgICAgICBpdGVtLmZpbmQoXCIubmFtZVwiKS5hdHRyKFwiZGF0YS10cmFjay1pZFwiLCBpZCk7XHJcbiAgICAgICAgICAgICAgICAkKHRoaXMpLmFwcGVuZChpdGVtKTtcclxuICAgICAgICAgICAgICAgIHZhciBwYXJlbnQgPSBpdGVtLnBhcmVudCgpLnBhcmVudCgpO1xyXG4gICAgICAgICAgICAgICAgdmFyIGluZm8gPSBpdGVtLmZpbmQoXCIubmFtZVwiKTtcclxuICAgICAgICAgICAgICAgIHZhciBwbGF5bGlzdE5hbWUgPSBwYXJlbnQuYXR0cihcImlkXCIpO1xyXG4gICAgICAgICAgICAgICAgdmFyIGluQXJyYXkgPSAtMTtcclxuICAgICAgICAgICAgICAgIGZvclNhdmUuZm9yRWFjaChmdW5jdGlvbihwbGF5bGlzdCwgaSl7XHJcbiAgICAgICAgICAgICAgICAgICAgaWYocGxheWxpc3QubmFtZSA9PSBwbGF5bGlzdE5hbWUpXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGluQXJyYXkgPSBpO1xyXG4gICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgICAgICBpZihpbkFycmF5ID49IDApe1xyXG4gICAgICAgICAgICAgICAgICAgIGZvclNhdmVbaW5BcnJheV0udHJhY2tsaXN0LnB1c2goe1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBpZDogaWQsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIG5hbWU6IGluZm8udGV4dCgpXHJcbiAgICAgICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgICAgICB9ZWxzZXtcclxuICAgICAgICAgICAgICAgICAgICBmb3JTYXZlLnB1c2goe1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBpZDogcGFyZW50LmF0dHIoXCJkYXRhLXBsYXlsaXN0LWlkXCIpLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBuYW1lOiBwYXJlbnQuYXR0cihcImlkXCIpLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICB0cmFja2xpc3Q6IFt7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZDogaWQsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBuYW1lOiBpbmZvLnRleHQoKVxyXG4gICAgICAgICAgICAgICAgICAgICAgICB9XVxyXG4gICAgICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICBcclxuICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgb3ZlcjogZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICAgICAgcmVtb3ZlSW50ZW50ID0gZmFsc2U7XHJcbiAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgIG91dDogZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICAgICAgcmVtb3ZlSW50ZW50ID0gdHJ1ZTtcclxuICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgYmVmb3JlU3RvcDogZnVuY3Rpb24gKGV2ZW50LCB1aSkge1xyXG4gICAgICAgICAgICAgICAgaWYocmVtb3ZlSW50ZW50ID09IHRydWUpe1xyXG4gICAgICAgICAgICAgICAgICAgIHVpLml0ZW0ucmVtb3ZlKCk7XHJcbiAgICAgICAgICAgICAgICAgICAgdmFyIGlkID0gdWkuaXRlbS5maW5kKFwiLm5hbWVcIikuYXR0cihcImRhdGEtdHJhY2staWRcIik7XHJcbiAgICAgICAgICAgICAgICAgICAgZm9yRGVsZXRlVHJhY2sucHVzaChwYXJzZUludChpZCkpO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfSk7XHJcbiAgICB9O1xyXG4gICAgdmFyIHJlcXVlc3RPcHRpb25zID0ge1xyXG4gICAgICAgIHR5cGU6IFwiUE9TVFwiLFxyXG4gICAgICAgIGhlYWRlcnM6IHtcclxuICAgICAgICAgICAgJ1gtQ1NSRi1UT0tFTic6ICQoJ21ldGFbbmFtZT1cImNzcmYtdG9rZW5cIl0nKS5hdHRyKCdjb250ZW50JylcclxuICAgICAgICB9LFxyXG4gICAgICAgIGVycm9yOiBmdW5jdGlvbihyZXNwb25zZSl7XHJcbiAgICAgICAgICAgIHZhciB3ID0gd2luZG93Lm9wZW4oJycsICc6RXJyb3IgTWVzc2FnZScsICdtZW51YmFyPW5vLCBsb2NhdGlvbj1ubycpO1xyXG4gICAgICAgICAgICB3LmRvY3VtZW50LndyaXRlKHJlc3BvbnNlLnJlc3BvbnNlVGV4dCk7XHJcbiAgICAgICAgfVxyXG4gICAgfTtcclxuICAgIHZhciBzb3J0YWJsZSA9IGluaXRTb3J0YWJsZSgpO1xyXG4gICAgJCggXCIuc29ydGFibGUuZmlsZXNcIiApLnNvcnRhYmxlKHtcclxuICAgICAgICBjb25uZWN0V2l0aDogXCIuc29ydGFibGUucGxheWxpc3RcIixcclxuICAgICAgICByZW1vdmU6IGZ1bmN0aW9uKGV2ZW50LCB1aSkge1xyXG4gICAgICAgICAgICAkKHRoaXMpLnNvcnRhYmxlKCdjYW5jZWwnKTtcclxuICAgICAgICB9XHJcbiAgICB9KTtcclxuXHJcbiAgICAkKFwiLnRhYi1jb250ZW50XCIpLm9uKFwiY2xpY2tcIiwgXCIuZGVsZXRlLWN1cnJlbnRcIiwgZnVuY3Rpb24oKXtcclxuICAgICAgICB2YXIgaWQgPSAkKHRoaXMpLnBhcmVudCgpLmF0dHIoXCJpZFwiKTtcclxuICAgICAgICBpZighY29uZmlybShcIkFyZSB5b3Ugc2h1cmUgeW91IHdhbnQgdG8gZGVsZXRlIFwiICsgaWQgKyBcIj9cIikpXHJcbiAgICAgICAgICAgIHJldHVybiBmYWxzZTtcclxuICAgICAgICByZXF1ZXN0T3B0aW9ucy50eXBlID0gXCJkZWxldGVcIjtcclxuICAgICAgICByZXF1ZXN0T3B0aW9ucy5kYXRhID0ge2lkOiAkKHRoaXMpLnBhcmVudCgpLmF0dHIoXCJkYXRhLXBsYXlsaXN0LWlkXCIpfTtcclxuICAgICAgICByZXF1ZXN0T3B0aW9ucy5zdWNjZXNzID0gIGZ1bmN0aW9uKHJlc3BvbnNlKXtcclxuICAgICAgICAgICAgJC5ub3RpZnkoXCJQbGF5bGlzdDogXCIrIGlkICsgXCIgLSBcIiArIHJlc3BvbnNlLm1lc3NhZ2UsIFwic3VjY2Vzc1wiKTtcclxuICAgICAgICB9O1xyXG4gICAgICAgICQuYWpheCgkKHRoaXMpLmF0dHIoXCJkYXRhLXVybFwiKSwgcmVxdWVzdE9wdGlvbnMpO1xyXG4gICAgICAgICQodGhpcykucGFyZW50KCkucmVtb3ZlKCk7XHJcbiAgICAgICAgJChcIiNcIitpZCtcIi10YWJcIikucGFyZW50KCkucmVtb3ZlKCk7XHJcblxyXG4gICAgfSk7XHJcblxyXG4gICAgJChcIi5uZXctbGlzdFwiKS5vbihcImNsaWNrXCIsIGZ1bmN0aW9uKCl7XHJcbiAgICAgICAgdmFyIGlkID0gJC50cmltKHByb21wdChcIkVudGVyIHBsYXlsaXN0IG5hbWVcIikpO1xyXG4gICAgICAgIGlmKCFpZClcclxuICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xyXG4gICAgICAgICQoXCIudGFiLWNvbnRlbnRcIikuYXBwZW5kKCc8ZGl2IHJvbGU9XCJ0YWJwYW5lbFwiIGNsYXNzPVwidGFiLXBhbmVcIiBpZD1cIicraWQrJ1wiIGRhdGEtcGxheWxpc3QtaWQ9XCInKyBEYXRlLm5vdygpICsnXCI+PGRpdiBjbGFzcz1cInNvcnRhYmxlIHBsYXlsaXN0XCI+PC9kaXY+PGJ1dHRvbiB0eXBlPVwiYnV0dG9uXCIgY2xhc3M9XCJidG4gYnRuLXdhcm5pbmcgdzEwMCBkZWxldGUtY3VycmVudFwiPkRlbGV0ZSB0aGlzIGxpc3Q8L2J1dHRvbj48L2Rpdj4nKTtcclxuICAgICAgICAkKFwidWwuZHJvcGRvd24tbWVudVwiKS5hcHBlbmQoJzxsaT48YSBocmVmPVwiIycrIGlkICsnXCIgcm9sZT1cInRhYlwiIGlkPVwiJyArIGlkICsgJy10YWJcIiBkYXRhLXRvZ2dsZT1cInRhYlwiIGFyaWEtY29udHJvbHM9XCInKyBpZCArJ1wiIGFyaWEtZXhwYW5kZWQ9XCJ0cnVlXCI+JytpZCsnPC9hPjwvbGk+Jyk7XHJcbiAgICAgICAgdmFyIHRhYiA9ICQoXCIjXCIraWQpO1xyXG4gICAgICAgIHZhciBsaSA9ICQoXCIjXCIraWQgKyBcIi10YWJcIik7XHJcbiAgICAgICAgJChcInVsLmRyb3Bkb3duLW1lbnUgbGlcIikucmVtb3ZlQ2xhc3MoXCJhY3RpdmVcIik7XHJcbiAgICAgICAgbGkudHJpZ2dlcihcImNsaWNrXCIpO1xyXG4gICAgICAgICQoXCJ1bC5kcm9wZG93bi1tZW51IGxpICNcIitpZCtcIi10YWJcIikucGFyZW50KCkuYWRkQ2xhc3MoXCJhY3RpdmVcIik7XHJcblxyXG4gICAgICAgIHNvcnRhYmxlLnNvcnRhYmxlKCBcImRlc3Ryb3lcIiApO1xyXG4gICAgICAgIHNvcnRhYmxlID0gaW5pdFNvcnRhYmxlKCk7XHJcblxyXG4gICAgfSk7XHJcblxyXG4gICAgJChcIi5zYXZlLWNoYW5nZXNcIikub24oXCJjbGlja1wiLCBmdW5jdGlvbigpe1xyXG5cclxuICAgICAgICBmb3JTYXZlLmZvckVhY2goZnVuY3Rpb24ocGxheWxpc3Qpe1xyXG4gICAgICAgICAgICBwbGF5bGlzdC50cmFja2xpc3QgPSBwbGF5bGlzdC50cmFja2xpc3QuZmlsdGVyKGZ1bmN0aW9uKHZhbCl7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gZm9yRGVsZXRlVHJhY2suaW5kZXhPZih2YWwuaWQpIDwgMDtcclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgfSk7XHJcbiAgICAgICAgcmVxdWVzdE9wdGlvbnMuZGF0YSA9IHtcclxuICAgICAgICAgICAgZm9yU2F2ZTogZm9yU2F2ZSxcclxuICAgICAgICAgICAgZm9yRGVsZXRlOiBmb3JEZWxldGVUcmFja1xyXG4gICAgICAgIH07XHJcbiAgICAgICAgcmVxdWVzdE9wdGlvbnMuc3VjY2VzcyA9ICBmdW5jdGlvbihyZXNwb25zZSl7XHJcbiAgICAgICAgICAgIGlmKHJlc3BvbnNlLmlkcyl7XHJcbiAgICAgICAgICAgICAgICByZXNwb25zZS5pZHNbJ3RyYWNrSWRzJ10uZm9yRWFjaChmdW5jdGlvbih2YWwpe1xyXG4gICAgICAgICAgICAgICAgICAgICQoXCJbZGF0YS10cmFjay1pZD0nXCIrdmFsLm9sZCtcIiddXCIpLmF0dHIoXCJkYXRhLXRyYWNrLWlkXCIsIHZhbC5uZXcpO1xyXG4gICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgICAgICByZXNwb25zZS5pZHNbJ3BsYXlsaXN0SWRzJ10uZm9yRWFjaChmdW5jdGlvbih2YWwpe1xyXG4gICAgICAgICAgICAgICAgICAgICQoXCJbZGF0YS1wbGF5bGlzdC1pZD0nXCIrdmFsLm9sZCtcIiddXCIpLmF0dHIoXCJkYXRhLXBsYXlsaXN0LWlkXCIsIHZhbC5uZXcpO1xyXG5cclxuICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICQubm90aWZ5KHJlc3BvbnNlLm1lc3NhZ2UsIFwic3VjY2Vzc1wiKTtcclxuICAgICAgICAgICAgZm9yU2F2ZSA9IFtdO1xyXG4gICAgICAgICAgICBmb3JEZWxldGVUcmFjayA9IFtdO1xyXG4gICAgICAgIH07XHJcbiAgICAgICAgJC5hamF4KCQodGhpcykuYXR0cihcImRhdGEtdXJsXCIpLCByZXF1ZXN0T3B0aW9ucyk7XHJcbiAgICB9KVxyXG4gICAgJChmdW5jdGlvbigpe1xyXG4gICAgICAgIHZhciBwcmV2ID0gbnVsbDtcclxuICAgICAgICB2YXIgc3dpdGNoQXVkaW8gPSBmdW5jdGlvbihpdGVtKXtcclxuICAgICAgICAgICAgdmFyIGF1ZGlvID0gJChpdGVtKS5wYXJlbnQoKS5maW5kKFwiYXVkaW9cIikuZ2V0KDApO1xyXG4gICAgICAgICAgICBpZihhdWRpby5wYXVzZWQpe1xyXG4gICAgICAgICAgICAgICAgYXVkaW8ucGxheSgpO1xyXG4gICAgICAgICAgICAgICAgJChpdGVtKS5hZGRDbGFzcygnZ2x5cGhpY29uLXBhdXNlJykucmVtb3ZlQ2xhc3MoJ2dseXBoaWNvbi1wbGF5Jyk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgZWxzZXtcclxuICAgICAgICAgICAgICAgIGF1ZGlvLnBhdXNlKCk7XHJcbiAgICAgICAgICAgICAgICAkKGl0ZW0pLmFkZENsYXNzKCdnbHlwaGljb24tcGxheScpLnJlbW92ZUNsYXNzKCdnbHlwaGljb24tcGF1c2UnKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH07XHJcbiAgICAgICAgJChcIi5zb3J0YWJsZVwiKS5vbihcImNsaWNrXCIsIFwiLnBsYXlcIiwgZnVuY3Rpb24oKXtcclxuICAgICAgICAgICAgaWYocHJldiA9PSBudWxsKXtcclxuICAgICAgICAgICAgICAgIHByZXYgPSAkKHRoaXMpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGlmKHByZXYuaXMoJCh0aGlzKSkpe1xyXG4gICAgICAgICAgICAgICAgc3dpdGNoQXVkaW8odGhpcyk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgZWxzZXtcclxuICAgICAgICAgICAgICAgIHN3aXRjaEF1ZGlvKHByZXYpO1xyXG4gICAgICAgICAgICAgICAgc3dpdGNoQXVkaW8odGhpcyk7XHJcbiAgICAgICAgICAgICAgICBwcmV2ID0gJCh0aGlzKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH0pXHJcbiAgICB9KTtcclxuXHJcblxyXG59KTsiXSwiZmlsZSI6ImRhc2hib2FyZC9yYWRpby9wbGF5bGlzdC5qcyIsInNvdXJjZVJvb3QiOiIvc291cmNlLyJ9
