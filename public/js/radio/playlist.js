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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiIiwic291cmNlcyI6WyJyYWRpby9wbGF5bGlzdC5qcyJdLCJzb3VyY2VzQ29udGVudCI6WyIkKGZ1bmN0aW9uKCl7XHJcbiAgICBcInVzZSBzdHJpY3RcIjtcclxuICAgIHZhciByZW1vdmVJbnRlbnQgPSBmYWxzZTtcclxuICAgIHZhciBmb3JEZWxldGVUcmFjayA9IFtdO1xyXG4gICAgdmFyIGZvclNhdmUgPSBbXTtcclxuICAgIHZhciBpbml0U29ydGFibGUgPSBmdW5jdGlvbigpe1xyXG4gICAgICAgIHJldHVybiAkKCBcIi5zb3J0YWJsZS5wbGF5bGlzdFwiICkuc29ydGFibGUoe1xyXG4gICAgICAgICAgICByZWNlaXZlOiBmdW5jdGlvbihldmVudCwgdWkpIHtcclxuICAgICAgICAgICAgICAgIHZhciBpdGVtID0gdWkuaXRlbS5jbG9uZSgpO1xyXG4gICAgICAgICAgICAgICAgdmFyIGlkID0gRGF0ZS5ub3coKTtcclxuICAgICAgICAgICAgICAgIGl0ZW0uZmluZChcIi5uYW1lXCIpLmF0dHIoXCJkYXRhLXRyYWNrLWlkXCIsIGlkKTtcclxuICAgICAgICAgICAgICAgICQodGhpcykuYXBwZW5kKGl0ZW0pO1xyXG4gICAgICAgICAgICAgICAgdmFyIHBhcmVudCA9IGl0ZW0ucGFyZW50KCkucGFyZW50KCk7XHJcbiAgICAgICAgICAgICAgICB2YXIgaW5mbyA9IGl0ZW0uZmluZChcIi5uYW1lXCIpO1xyXG4gICAgICAgICAgICAgICAgdmFyIHBsYXlsaXN0TmFtZSA9IHBhcmVudC5hdHRyKFwiaWRcIik7XHJcbiAgICAgICAgICAgICAgICB2YXIgaW5BcnJheSA9IC0xO1xyXG4gICAgICAgICAgICAgICAgZm9yU2F2ZS5mb3JFYWNoKGZ1bmN0aW9uKHBsYXlsaXN0LCBpKXtcclxuICAgICAgICAgICAgICAgICAgICBpZihwbGF5bGlzdC5uYW1lID09IHBsYXlsaXN0TmFtZSlcclxuICAgICAgICAgICAgICAgICAgICAgICAgaW5BcnJheSA9IGk7XHJcbiAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgICAgIGlmKGluQXJyYXkgPj0gMCl7XHJcbiAgICAgICAgICAgICAgICAgICAgZm9yU2F2ZVtpbkFycmF5XS50cmFja2xpc3QucHVzaCh7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGlkOiBpZCxcclxuICAgICAgICAgICAgICAgICAgICAgICAgbmFtZTogaW5mby50ZXh0KClcclxuICAgICAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgICAgIH1lbHNle1xyXG4gICAgICAgICAgICAgICAgICAgIGZvclNhdmUucHVzaCh7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGlkOiBwYXJlbnQuYXR0cihcImRhdGEtcGxheWxpc3QtaWRcIiksXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIG5hbWU6IHBhcmVudC5hdHRyKFwiaWRcIiksXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHRyYWNrbGlzdDogW3tcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlkOiBpZCxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG5hbWU6IGluZm8udGV4dCgpXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH1dXHJcbiAgICAgICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgIFxyXG4gICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICBvdmVyOiBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgICAgICByZW1vdmVJbnRlbnQgPSBmYWxzZTtcclxuICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgb3V0OiBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgICAgICByZW1vdmVJbnRlbnQgPSB0cnVlO1xyXG4gICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICBiZWZvcmVTdG9wOiBmdW5jdGlvbiAoZXZlbnQsIHVpKSB7XHJcbiAgICAgICAgICAgICAgICBpZihyZW1vdmVJbnRlbnQgPT0gdHJ1ZSl7XHJcbiAgICAgICAgICAgICAgICAgICAgdWkuaXRlbS5yZW1vdmUoKTtcclxuICAgICAgICAgICAgICAgICAgICB2YXIgaWQgPSB1aS5pdGVtLmZpbmQoXCIubmFtZVwiKS5hdHRyKFwiZGF0YS10cmFjay1pZFwiKTtcclxuICAgICAgICAgICAgICAgICAgICBmb3JEZWxldGVUcmFjay5wdXNoKHBhcnNlSW50KGlkKSk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9KTtcclxuICAgIH07XHJcbiAgICB2YXIgcmVxdWVzdE9wdGlvbnMgPSB7XHJcbiAgICAgICAgdHlwZTogXCJQT1NUXCIsXHJcbiAgICAgICAgaGVhZGVyczoge1xyXG4gICAgICAgICAgICAnWC1DU1JGLVRPS0VOJzogJCgnbWV0YVtuYW1lPVwiY3NyZi10b2tlblwiXScpLmF0dHIoJ2NvbnRlbnQnKVxyXG4gICAgICAgIH0sXHJcbiAgICAgICAgZXJyb3I6IGZ1bmN0aW9uKHJlc3BvbnNlKXtcclxuICAgICAgICAgICAgdmFyIHcgPSB3aW5kb3cub3BlbignJywgJzpFcnJvciBNZXNzYWdlJywgJ21lbnViYXI9bm8sIGxvY2F0aW9uPW5vJyk7XHJcbiAgICAgICAgICAgIHcuZG9jdW1lbnQud3JpdGUocmVzcG9uc2UucmVzcG9uc2VUZXh0KTtcclxuICAgICAgICB9XHJcbiAgICB9O1xyXG4gICAgdmFyIHNvcnRhYmxlID0gaW5pdFNvcnRhYmxlKCk7XHJcbiAgICAkKCBcIi5zb3J0YWJsZS5maWxlc1wiICkuc29ydGFibGUoe1xyXG4gICAgICAgIGNvbm5lY3RXaXRoOiBcIi5zb3J0YWJsZS5wbGF5bGlzdFwiLFxyXG4gICAgICAgIHJlbW92ZTogZnVuY3Rpb24oZXZlbnQsIHVpKSB7XHJcbiAgICAgICAgICAgICQodGhpcykuc29ydGFibGUoJ2NhbmNlbCcpO1xyXG4gICAgICAgIH1cclxuICAgIH0pO1xyXG5cclxuICAgICQoXCIudGFiLWNvbnRlbnRcIikub24oXCJjbGlja1wiLCBcIi5kZWxldGUtY3VycmVudFwiLCBmdW5jdGlvbigpe1xyXG4gICAgICAgIHZhciBpZCA9ICQodGhpcykucGFyZW50KCkuYXR0cihcImlkXCIpO1xyXG4gICAgICAgIGlmKCFjb25maXJtKFwiQXJlIHlvdSBzaHVyZSB5b3Ugd2FudCB0byBkZWxldGUgXCIgKyBpZCArIFwiP1wiKSlcclxuICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xyXG4gICAgICAgIHJlcXVlc3RPcHRpb25zLnR5cGUgPSBcImRlbGV0ZVwiO1xyXG4gICAgICAgIHJlcXVlc3RPcHRpb25zLmRhdGEgPSB7aWQ6ICQodGhpcykucGFyZW50KCkuYXR0cihcImRhdGEtcGxheWxpc3QtaWRcIil9O1xyXG4gICAgICAgIHJlcXVlc3RPcHRpb25zLnN1Y2Nlc3MgPSAgZnVuY3Rpb24ocmVzcG9uc2Upe1xyXG4gICAgICAgICAgICAkLm5vdGlmeShcIlBsYXlsaXN0OiBcIisgaWQgKyBcIiAtIFwiICsgcmVzcG9uc2UubWVzc2FnZSwgXCJzdWNjZXNzXCIpO1xyXG4gICAgICAgIH07XHJcbiAgICAgICAgJC5hamF4KCQodGhpcykuYXR0cihcImRhdGEtdXJsXCIpLCByZXF1ZXN0T3B0aW9ucyk7XHJcbiAgICAgICAgJCh0aGlzKS5wYXJlbnQoKS5yZW1vdmUoKTtcclxuICAgICAgICAkKFwiI1wiK2lkK1wiLXRhYlwiKS5wYXJlbnQoKS5yZW1vdmUoKTtcclxuXHJcbiAgICB9KTtcclxuXHJcbiAgICAkKFwiLm5ldy1saXN0XCIpLm9uKFwiY2xpY2tcIiwgZnVuY3Rpb24oKXtcclxuICAgICAgICB2YXIgaWQgPSAkLnRyaW0ocHJvbXB0KFwiRW50ZXIgcGxheWxpc3QgbmFtZVwiKSk7XHJcbiAgICAgICAgaWYoIWlkKVxyXG4gICAgICAgICAgICByZXR1cm4gZmFsc2U7XHJcbiAgICAgICAgJChcIi50YWItY29udGVudFwiKS5hcHBlbmQoJzxkaXYgcm9sZT1cInRhYnBhbmVsXCIgY2xhc3M9XCJ0YWItcGFuZVwiIGlkPVwiJytpZCsnXCIgZGF0YS1wbGF5bGlzdC1pZD1cIicrIERhdGUubm93KCkgKydcIj48ZGl2IGNsYXNzPVwic29ydGFibGUgcGxheWxpc3RcIj48L2Rpdj48YnV0dG9uIHR5cGU9XCJidXR0b25cIiBjbGFzcz1cImJ0biBidG4td2FybmluZyB3MTAwIGRlbGV0ZS1jdXJyZW50XCI+RGVsZXRlIHRoaXMgbGlzdDwvYnV0dG9uPjwvZGl2PicpO1xyXG4gICAgICAgICQoXCJ1bC5kcm9wZG93bi1tZW51XCIpLmFwcGVuZCgnPGxpPjxhIGhyZWY9XCIjJysgaWQgKydcIiByb2xlPVwidGFiXCIgaWQ9XCInICsgaWQgKyAnLXRhYlwiIGRhdGEtdG9nZ2xlPVwidGFiXCIgYXJpYS1jb250cm9scz1cIicrIGlkICsnXCIgYXJpYS1leHBhbmRlZD1cInRydWVcIj4nK2lkKyc8L2E+PC9saT4nKTtcclxuICAgICAgICB2YXIgdGFiID0gJChcIiNcIitpZCk7XHJcbiAgICAgICAgdmFyIGxpID0gJChcIiNcIitpZCArIFwiLXRhYlwiKTtcclxuICAgICAgICAkKFwidWwuZHJvcGRvd24tbWVudSBsaVwiKS5yZW1vdmVDbGFzcyhcImFjdGl2ZVwiKTtcclxuICAgICAgICBsaS50cmlnZ2VyKFwiY2xpY2tcIik7XHJcbiAgICAgICAgJChcInVsLmRyb3Bkb3duLW1lbnUgbGkgI1wiK2lkK1wiLXRhYlwiKS5wYXJlbnQoKS5hZGRDbGFzcyhcImFjdGl2ZVwiKTtcclxuXHJcbiAgICAgICAgc29ydGFibGUuc29ydGFibGUoIFwiZGVzdHJveVwiICk7XHJcbiAgICAgICAgc29ydGFibGUgPSBpbml0U29ydGFibGUoKTtcclxuXHJcbiAgICB9KTtcclxuXHJcbiAgICAkKFwiLnNhdmUtY2hhbmdlc1wiKS5vbihcImNsaWNrXCIsIGZ1bmN0aW9uKCl7XHJcblxyXG4gICAgICAgIGZvclNhdmUuZm9yRWFjaChmdW5jdGlvbihwbGF5bGlzdCl7XHJcbiAgICAgICAgICAgIHBsYXlsaXN0LnRyYWNrbGlzdCA9IHBsYXlsaXN0LnRyYWNrbGlzdC5maWx0ZXIoZnVuY3Rpb24odmFsKXtcclxuICAgICAgICAgICAgICAgIHJldHVybiBmb3JEZWxldGVUcmFjay5pbmRleE9mKHZhbC5pZCkgPCAwO1xyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICB9KTtcclxuICAgICAgICByZXF1ZXN0T3B0aW9ucy5kYXRhID0ge1xyXG4gICAgICAgICAgICBmb3JTYXZlOiBmb3JTYXZlLFxyXG4gICAgICAgICAgICBmb3JEZWxldGU6IGZvckRlbGV0ZVRyYWNrXHJcbiAgICAgICAgfTtcclxuICAgICAgICByZXF1ZXN0T3B0aW9ucy5zdWNjZXNzID0gIGZ1bmN0aW9uKHJlc3BvbnNlKXtcclxuICAgICAgICAgICAgaWYocmVzcG9uc2UuaWRzKXtcclxuICAgICAgICAgICAgICAgIHJlc3BvbnNlLmlkc1sndHJhY2tJZHMnXS5mb3JFYWNoKGZ1bmN0aW9uKHZhbCl7XHJcbiAgICAgICAgICAgICAgICAgICAgJChcIltkYXRhLXRyYWNrLWlkPSdcIit2YWwub2xkK1wiJ11cIikuYXR0cihcImRhdGEtdHJhY2staWRcIiwgdmFsLm5ldyk7XHJcbiAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgICAgIHJlc3BvbnNlLmlkc1sncGxheWxpc3RJZHMnXS5mb3JFYWNoKGZ1bmN0aW9uKHZhbCl7XHJcbiAgICAgICAgICAgICAgICAgICAgJChcIltkYXRhLXBsYXlsaXN0LWlkPSdcIit2YWwub2xkK1wiJ11cIikuYXR0cihcImRhdGEtcGxheWxpc3QtaWRcIiwgdmFsLm5ldyk7XHJcblxyXG4gICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgJC5ub3RpZnkocmVzcG9uc2UubWVzc2FnZSwgXCJzdWNjZXNzXCIpO1xyXG4gICAgICAgICAgICBmb3JTYXZlID0gW107XHJcbiAgICAgICAgICAgIGZvckRlbGV0ZVRyYWNrID0gW107XHJcbiAgICAgICAgfTtcclxuICAgICAgICAkLmFqYXgoJCh0aGlzKS5hdHRyKFwiZGF0YS11cmxcIiksIHJlcXVlc3RPcHRpb25zKTtcclxuICAgIH0pXHJcbiAgICAkKGZ1bmN0aW9uKCl7XHJcbiAgICAgICAgdmFyIHByZXYgPSBudWxsO1xyXG4gICAgICAgIHZhciBzd2l0Y2hBdWRpbyA9IGZ1bmN0aW9uKGl0ZW0pe1xyXG4gICAgICAgICAgICB2YXIgYXVkaW8gPSAkKGl0ZW0pLnBhcmVudCgpLmZpbmQoXCJhdWRpb1wiKS5nZXQoMCk7XHJcbiAgICAgICAgICAgIGlmKGF1ZGlvLnBhdXNlZCl7XHJcbiAgICAgICAgICAgICAgICBhdWRpby5wbGF5KCk7XHJcbiAgICAgICAgICAgICAgICAkKGl0ZW0pLmFkZENsYXNzKCdnbHlwaGljb24tcGF1c2UnKS5yZW1vdmVDbGFzcygnZ2x5cGhpY29uLXBsYXknKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBlbHNle1xyXG4gICAgICAgICAgICAgICAgYXVkaW8ucGF1c2UoKTtcclxuICAgICAgICAgICAgICAgICQoaXRlbSkuYWRkQ2xhc3MoJ2dseXBoaWNvbi1wbGF5JykucmVtb3ZlQ2xhc3MoJ2dseXBoaWNvbi1wYXVzZScpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfTtcclxuICAgICAgICAkKFwiLnNvcnRhYmxlXCIpLm9uKFwiY2xpY2tcIiwgXCIucGxheVwiLCBmdW5jdGlvbigpe1xyXG4gICAgICAgICAgICBpZihwcmV2ID09IG51bGwpe1xyXG4gICAgICAgICAgICAgICAgcHJldiA9ICQodGhpcyk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgaWYocHJldi5pcygkKHRoaXMpKSl7XHJcbiAgICAgICAgICAgICAgICBzd2l0Y2hBdWRpbyh0aGlzKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBlbHNle1xyXG4gICAgICAgICAgICAgICAgc3dpdGNoQXVkaW8ocHJldik7XHJcbiAgICAgICAgICAgICAgICBzd2l0Y2hBdWRpbyh0aGlzKTtcclxuICAgICAgICAgICAgICAgIHByZXYgPSAkKHRoaXMpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfSlcclxuICAgIH0pO1xyXG5cclxuXHJcbn0pOyJdLCJmaWxlIjoicmFkaW8vcGxheWxpc3QuanMiLCJzb3VyY2VSb290IjoiL3NvdXJjZS8ifQ==
