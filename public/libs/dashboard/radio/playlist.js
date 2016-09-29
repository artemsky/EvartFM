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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiIiwic291cmNlcyI6WyJkYXNoYm9hcmQvcmFkaW8vcGxheWxpc3QuanMiXSwic291cmNlc0NvbnRlbnQiOlsiJChmdW5jdGlvbigpe1xuICAgIFwidXNlIHN0cmljdFwiO1xuICAgIHZhciByZW1vdmVJbnRlbnQgPSBmYWxzZTtcbiAgICB2YXIgZm9yRGVsZXRlVHJhY2sgPSBbXTtcbiAgICB2YXIgZm9yU2F2ZSA9IFtdO1xuICAgIHZhciBpbml0U29ydGFibGUgPSBmdW5jdGlvbigpe1xuICAgICAgICByZXR1cm4gJCggXCIuc29ydGFibGUucGxheWxpc3RcIiApLnNvcnRhYmxlKHtcbiAgICAgICAgICAgIHJlY2VpdmU6IGZ1bmN0aW9uKGV2ZW50LCB1aSkge1xuICAgICAgICAgICAgICAgIHZhciBpdGVtID0gdWkuaXRlbS5jbG9uZSgpO1xuICAgICAgICAgICAgICAgIHZhciBpZCA9IERhdGUubm93KCk7XG4gICAgICAgICAgICAgICAgaXRlbS5maW5kKFwiLm5hbWVcIikuYXR0cihcImRhdGEtdHJhY2staWRcIiwgaWQpO1xuICAgICAgICAgICAgICAgICQodGhpcykuYXBwZW5kKGl0ZW0pO1xuICAgICAgICAgICAgICAgIHZhciBwYXJlbnQgPSBpdGVtLnBhcmVudCgpLnBhcmVudCgpO1xuICAgICAgICAgICAgICAgIHZhciBpbmZvID0gaXRlbS5maW5kKFwiLm5hbWVcIik7XG4gICAgICAgICAgICAgICAgdmFyIHBsYXlsaXN0TmFtZSA9IHBhcmVudC5hdHRyKFwiaWRcIik7XG4gICAgICAgICAgICAgICAgdmFyIGluQXJyYXkgPSAtMTtcbiAgICAgICAgICAgICAgICBmb3JTYXZlLmZvckVhY2goZnVuY3Rpb24ocGxheWxpc3QsIGkpe1xuICAgICAgICAgICAgICAgICAgICBpZihwbGF5bGlzdC5uYW1lID09IHBsYXlsaXN0TmFtZSlcbiAgICAgICAgICAgICAgICAgICAgICAgIGluQXJyYXkgPSBpO1xuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgIGlmKGluQXJyYXkgPj0gMCl7XG4gICAgICAgICAgICAgICAgICAgIGZvclNhdmVbaW5BcnJheV0udHJhY2tsaXN0LnB1c2goe1xuICAgICAgICAgICAgICAgICAgICAgICAgaWQ6IGlkLFxuICAgICAgICAgICAgICAgICAgICAgICAgbmFtZTogaW5mby50ZXh0KClcbiAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgfWVsc2V7XG4gICAgICAgICAgICAgICAgICAgIGZvclNhdmUucHVzaCh7XG4gICAgICAgICAgICAgICAgICAgICAgICBpZDogcGFyZW50LmF0dHIoXCJkYXRhLXBsYXlsaXN0LWlkXCIpLFxuICAgICAgICAgICAgICAgICAgICAgICAgbmFtZTogcGFyZW50LmF0dHIoXCJpZFwiKSxcbiAgICAgICAgICAgICAgICAgICAgICAgIHRyYWNrbGlzdDogW3tcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZDogaWQsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbmFtZTogaW5mby50ZXh0KClcbiAgICAgICAgICAgICAgICAgICAgICAgIH1dXG4gICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIG92ZXI6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICByZW1vdmVJbnRlbnQgPSBmYWxzZTtcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICBvdXQ6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICByZW1vdmVJbnRlbnQgPSB0cnVlO1xuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIGJlZm9yZVN0b3A6IGZ1bmN0aW9uIChldmVudCwgdWkpIHtcbiAgICAgICAgICAgICAgICBpZihyZW1vdmVJbnRlbnQgPT0gdHJ1ZSl7XG4gICAgICAgICAgICAgICAgICAgIHVpLml0ZW0ucmVtb3ZlKCk7XG4gICAgICAgICAgICAgICAgICAgIHZhciBpZCA9IHVpLml0ZW0uZmluZChcIi5uYW1lXCIpLmF0dHIoXCJkYXRhLXRyYWNrLWlkXCIpO1xuICAgICAgICAgICAgICAgICAgICBmb3JEZWxldGVUcmFjay5wdXNoKHBhcnNlSW50KGlkKSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICB9O1xuICAgIHZhciByZXF1ZXN0T3B0aW9ucyA9IHtcbiAgICAgICAgdHlwZTogXCJQT1NUXCIsXG4gICAgICAgIGhlYWRlcnM6IHtcbiAgICAgICAgICAgICdYLUNTUkYtVE9LRU4nOiAkKCdtZXRhW25hbWU9XCJjc3JmLXRva2VuXCJdJykuYXR0cignY29udGVudCcpXG4gICAgICAgIH0sXG4gICAgICAgIGVycm9yOiBmdW5jdGlvbihyZXNwb25zZSl7XG4gICAgICAgICAgICB2YXIgdyA9IHdpbmRvdy5vcGVuKCcnLCAnOkVycm9yIE1lc3NhZ2UnLCAnbWVudWJhcj1ubywgbG9jYXRpb249bm8nKTtcbiAgICAgICAgICAgIHcuZG9jdW1lbnQud3JpdGUocmVzcG9uc2UucmVzcG9uc2VUZXh0KTtcbiAgICAgICAgfVxuICAgIH07XG4gICAgdmFyIHNvcnRhYmxlID0gaW5pdFNvcnRhYmxlKCk7XG4gICAgJCggXCIuc29ydGFibGUuZmlsZXNcIiApLnNvcnRhYmxlKHtcbiAgICAgICAgY29ubmVjdFdpdGg6IFwiLnNvcnRhYmxlLnBsYXlsaXN0XCIsXG4gICAgICAgIHJlbW92ZTogZnVuY3Rpb24oZXZlbnQsIHVpKSB7XG4gICAgICAgICAgICAkKHRoaXMpLnNvcnRhYmxlKCdjYW5jZWwnKTtcbiAgICAgICAgfVxuICAgIH0pO1xuXG4gICAgJChcIi50YWItY29udGVudFwiKS5vbihcImNsaWNrXCIsIFwiLmRlbGV0ZS1jdXJyZW50XCIsIGZ1bmN0aW9uKCl7XG4gICAgICAgIHZhciBpZCA9ICQodGhpcykucGFyZW50KCkuYXR0cihcImlkXCIpO1xuICAgICAgICBpZighY29uZmlybShcIkFyZSB5b3Ugc2h1cmUgeW91IHdhbnQgdG8gZGVsZXRlIFwiICsgaWQgKyBcIj9cIikpXG4gICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgIHJlcXVlc3RPcHRpb25zLnR5cGUgPSBcImRlbGV0ZVwiO1xuICAgICAgICByZXF1ZXN0T3B0aW9ucy5kYXRhID0ge2lkOiAkKHRoaXMpLnBhcmVudCgpLmF0dHIoXCJkYXRhLXBsYXlsaXN0LWlkXCIpfTtcbiAgICAgICAgcmVxdWVzdE9wdGlvbnMuc3VjY2VzcyA9ICBmdW5jdGlvbihyZXNwb25zZSl7XG4gICAgICAgICAgICAkLm5vdGlmeShcIlBsYXlsaXN0OiBcIisgaWQgKyBcIiAtIFwiICsgcmVzcG9uc2UubWVzc2FnZSwgXCJzdWNjZXNzXCIpO1xuICAgICAgICB9O1xuICAgICAgICAkLmFqYXgoJCh0aGlzKS5hdHRyKFwiZGF0YS11cmxcIiksIHJlcXVlc3RPcHRpb25zKTtcbiAgICAgICAgJCh0aGlzKS5wYXJlbnQoKS5yZW1vdmUoKTtcbiAgICAgICAgJChcIiNcIitpZCtcIi10YWJcIikucGFyZW50KCkucmVtb3ZlKCk7XG5cbiAgICB9KTtcblxuICAgICQoXCIubmV3LWxpc3RcIikub24oXCJjbGlja1wiLCBmdW5jdGlvbigpe1xuICAgICAgICB2YXIgaWQgPSAkLnRyaW0ocHJvbXB0KFwiRW50ZXIgcGxheWxpc3QgbmFtZVwiKSk7XG4gICAgICAgIGlmKCFpZClcbiAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgJChcIi50YWItY29udGVudFwiKS5hcHBlbmQoJzxkaXYgcm9sZT1cInRhYnBhbmVsXCIgY2xhc3M9XCJ0YWItcGFuZVwiIGlkPVwiJytpZCsnXCIgZGF0YS1wbGF5bGlzdC1pZD1cIicrIERhdGUubm93KCkgKydcIj48ZGl2IGNsYXNzPVwic29ydGFibGUgcGxheWxpc3RcIj48L2Rpdj48YnV0dG9uIHR5cGU9XCJidXR0b25cIiBjbGFzcz1cImJ0biBidG4td2FybmluZyB3MTAwIGRlbGV0ZS1jdXJyZW50XCI+RGVsZXRlIHRoaXMgbGlzdDwvYnV0dG9uPjwvZGl2PicpO1xuICAgICAgICAkKFwidWwuZHJvcGRvd24tbWVudVwiKS5hcHBlbmQoJzxsaT48YSBocmVmPVwiIycrIGlkICsnXCIgcm9sZT1cInRhYlwiIGlkPVwiJyArIGlkICsgJy10YWJcIiBkYXRhLXRvZ2dsZT1cInRhYlwiIGFyaWEtY29udHJvbHM9XCInKyBpZCArJ1wiIGFyaWEtZXhwYW5kZWQ9XCJ0cnVlXCI+JytpZCsnPC9hPjwvbGk+Jyk7XG4gICAgICAgIHZhciB0YWIgPSAkKFwiI1wiK2lkKTtcbiAgICAgICAgdmFyIGxpID0gJChcIiNcIitpZCArIFwiLXRhYlwiKTtcbiAgICAgICAgJChcInVsLmRyb3Bkb3duLW1lbnUgbGlcIikucmVtb3ZlQ2xhc3MoXCJhY3RpdmVcIik7XG4gICAgICAgIGxpLnRyaWdnZXIoXCJjbGlja1wiKTtcbiAgICAgICAgJChcInVsLmRyb3Bkb3duLW1lbnUgbGkgI1wiK2lkK1wiLXRhYlwiKS5wYXJlbnQoKS5hZGRDbGFzcyhcImFjdGl2ZVwiKTtcblxuICAgICAgICBzb3J0YWJsZS5zb3J0YWJsZSggXCJkZXN0cm95XCIgKTtcbiAgICAgICAgc29ydGFibGUgPSBpbml0U29ydGFibGUoKTtcblxuICAgIH0pO1xuXG4gICAgJChcIi5zYXZlLWNoYW5nZXNcIikub24oXCJjbGlja1wiLCBmdW5jdGlvbigpe1xuXG4gICAgICAgIGZvclNhdmUuZm9yRWFjaChmdW5jdGlvbihwbGF5bGlzdCl7XG4gICAgICAgICAgICBwbGF5bGlzdC50cmFja2xpc3QgPSBwbGF5bGlzdC50cmFja2xpc3QuZmlsdGVyKGZ1bmN0aW9uKHZhbCl7XG4gICAgICAgICAgICAgICAgcmV0dXJuIGZvckRlbGV0ZVRyYWNrLmluZGV4T2YodmFsLmlkKSA8IDA7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfSk7XG4gICAgICAgIHJlcXVlc3RPcHRpb25zLmRhdGEgPSB7XG4gICAgICAgICAgICBmb3JTYXZlOiBmb3JTYXZlLFxuICAgICAgICAgICAgZm9yRGVsZXRlOiBmb3JEZWxldGVUcmFja1xuICAgICAgICB9O1xuICAgICAgICByZXF1ZXN0T3B0aW9ucy5zdWNjZXNzID0gIGZ1bmN0aW9uKHJlc3BvbnNlKXtcbiAgICAgICAgICAgIGlmKHJlc3BvbnNlLmlkcyl7XG4gICAgICAgICAgICAgICAgcmVzcG9uc2UuaWRzWyd0cmFja0lkcyddLmZvckVhY2goZnVuY3Rpb24odmFsKXtcbiAgICAgICAgICAgICAgICAgICAgJChcIltkYXRhLXRyYWNrLWlkPSdcIit2YWwub2xkK1wiJ11cIikuYXR0cihcImRhdGEtdHJhY2staWRcIiwgdmFsLm5ldyk7XG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgcmVzcG9uc2UuaWRzWydwbGF5bGlzdElkcyddLmZvckVhY2goZnVuY3Rpb24odmFsKXtcbiAgICAgICAgICAgICAgICAgICAgJChcIltkYXRhLXBsYXlsaXN0LWlkPSdcIit2YWwub2xkK1wiJ11cIikuYXR0cihcImRhdGEtcGxheWxpc3QtaWRcIiwgdmFsLm5ldyk7XG5cbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgICQubm90aWZ5KHJlc3BvbnNlLm1lc3NhZ2UsIFwic3VjY2Vzc1wiKTtcbiAgICAgICAgICAgIGZvclNhdmUgPSBbXTtcbiAgICAgICAgICAgIGZvckRlbGV0ZVRyYWNrID0gW107XG4gICAgICAgIH07XG4gICAgICAgICQuYWpheCgkKHRoaXMpLmF0dHIoXCJkYXRhLXVybFwiKSwgcmVxdWVzdE9wdGlvbnMpO1xuICAgIH0pXG4gICAgJChmdW5jdGlvbigpe1xuICAgICAgICB2YXIgcHJldiA9IG51bGw7XG4gICAgICAgIHZhciBzd2l0Y2hBdWRpbyA9IGZ1bmN0aW9uKGl0ZW0pe1xuICAgICAgICAgICAgdmFyIGF1ZGlvID0gJChpdGVtKS5wYXJlbnQoKS5maW5kKFwiYXVkaW9cIikuZ2V0KDApO1xuICAgICAgICAgICAgaWYoYXVkaW8ucGF1c2VkKXtcbiAgICAgICAgICAgICAgICBhdWRpby5wbGF5KCk7XG4gICAgICAgICAgICAgICAgJChpdGVtKS5hZGRDbGFzcygnZ2x5cGhpY29uLXBhdXNlJykucmVtb3ZlQ2xhc3MoJ2dseXBoaWNvbi1wbGF5Jyk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBlbHNle1xuICAgICAgICAgICAgICAgIGF1ZGlvLnBhdXNlKCk7XG4gICAgICAgICAgICAgICAgJChpdGVtKS5hZGRDbGFzcygnZ2x5cGhpY29uLXBsYXknKS5yZW1vdmVDbGFzcygnZ2x5cGhpY29uLXBhdXNlJyk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH07XG4gICAgICAgICQoXCIuc29ydGFibGVcIikub24oXCJjbGlja1wiLCBcIi5wbGF5XCIsIGZ1bmN0aW9uKCl7XG4gICAgICAgICAgICBpZihwcmV2ID09IG51bGwpe1xuICAgICAgICAgICAgICAgIHByZXYgPSAkKHRoaXMpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaWYocHJldi5pcygkKHRoaXMpKSl7XG4gICAgICAgICAgICAgICAgc3dpdGNoQXVkaW8odGhpcyk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBlbHNle1xuICAgICAgICAgICAgICAgIHN3aXRjaEF1ZGlvKHByZXYpO1xuICAgICAgICAgICAgICAgIHN3aXRjaEF1ZGlvKHRoaXMpO1xuICAgICAgICAgICAgICAgIHByZXYgPSAkKHRoaXMpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9KVxuICAgIH0pO1xuXG5cbn0pOyJdLCJmaWxlIjoiZGFzaGJvYXJkL3JhZGlvL3BsYXlsaXN0LmpzIiwic291cmNlUm9vdCI6Ii9zb3VyY2UvIn0=
