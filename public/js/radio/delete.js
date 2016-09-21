$(function(){
    "use strict";
    var forDelete = [];
    var btnDelete = $(".delete");
    $( ".selectable" ).selectable({
        filter: ".item",
        unselected: function( event, ui ) {
            var deletetable = $(ui.unselected).find('span').text();
            forDelete = forDelete.filter(function(el){
                return el != deletetable;
            });
            console.log(2);
        },
        selected: function( event, ui ) {
            var selected = $(ui.selected).find('span').text();
            forDelete.push(selected);
            console.log(1);
        },
        stop: function(){
            if(forDelete.length)
                btnDelete.show();
            else{
                btnDelete.hide();
            }
            console.log(forDelete);
        }
    });

    btnDelete.on("click", function(){
        $.ajax($(this).attr("data-url"), {
            type: "POST",
            headers: {
                'X-CSRF-TOKEN': $('meta[name="csrf-token"]').attr('content')
            },
            data: {delete: forDelete},
            error: function(response){
                var w = window.open('', ':Error Message', 'menubar=no, location=no');
                w.document.write(response.responseText);
            },
            success: function(response){
                $.notify(response, "success");
                $(".selectable .item span").each(function(i, obj){
                    if(forDelete.indexOf($(obj).text()) !== -1)
                        $(obj).parent().parent().remove();
                });
                forDelete = [];
            }
        })
    })
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiIiwic291cmNlcyI6WyJyYWRpby9kZWxldGUuanMiXSwic291cmNlc0NvbnRlbnQiOlsiJChmdW5jdGlvbigpe1xyXG4gICAgXCJ1c2Ugc3RyaWN0XCI7XHJcbiAgICB2YXIgZm9yRGVsZXRlID0gW107XHJcbiAgICB2YXIgYnRuRGVsZXRlID0gJChcIi5kZWxldGVcIik7XHJcbiAgICAkKCBcIi5zZWxlY3RhYmxlXCIgKS5zZWxlY3RhYmxlKHtcclxuICAgICAgICBmaWx0ZXI6IFwiLml0ZW1cIixcclxuICAgICAgICB1bnNlbGVjdGVkOiBmdW5jdGlvbiggZXZlbnQsIHVpICkge1xyXG4gICAgICAgICAgICB2YXIgZGVsZXRldGFibGUgPSAkKHVpLnVuc2VsZWN0ZWQpLmZpbmQoJ3NwYW4nKS50ZXh0KCk7XHJcbiAgICAgICAgICAgIGZvckRlbGV0ZSA9IGZvckRlbGV0ZS5maWx0ZXIoZnVuY3Rpb24oZWwpe1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIGVsICE9IGRlbGV0ZXRhYmxlO1xyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgY29uc29sZS5sb2coMik7XHJcbiAgICAgICAgfSxcclxuICAgICAgICBzZWxlY3RlZDogZnVuY3Rpb24oIGV2ZW50LCB1aSApIHtcclxuICAgICAgICAgICAgdmFyIHNlbGVjdGVkID0gJCh1aS5zZWxlY3RlZCkuZmluZCgnc3BhbicpLnRleHQoKTtcclxuICAgICAgICAgICAgZm9yRGVsZXRlLnB1c2goc2VsZWN0ZWQpO1xyXG4gICAgICAgICAgICBjb25zb2xlLmxvZygxKTtcclxuICAgICAgICB9LFxyXG4gICAgICAgIHN0b3A6IGZ1bmN0aW9uKCl7XHJcbiAgICAgICAgICAgIGlmKGZvckRlbGV0ZS5sZW5ndGgpXHJcbiAgICAgICAgICAgICAgICBidG5EZWxldGUuc2hvdygpO1xyXG4gICAgICAgICAgICBlbHNle1xyXG4gICAgICAgICAgICAgICAgYnRuRGVsZXRlLmhpZGUoKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBjb25zb2xlLmxvZyhmb3JEZWxldGUpO1xyXG4gICAgICAgIH1cclxuICAgIH0pO1xyXG5cclxuICAgIGJ0bkRlbGV0ZS5vbihcImNsaWNrXCIsIGZ1bmN0aW9uKCl7XHJcbiAgICAgICAgJC5hamF4KCQodGhpcykuYXR0cihcImRhdGEtdXJsXCIpLCB7XHJcbiAgICAgICAgICAgIHR5cGU6IFwiUE9TVFwiLFxyXG4gICAgICAgICAgICBoZWFkZXJzOiB7XHJcbiAgICAgICAgICAgICAgICAnWC1DU1JGLVRPS0VOJzogJCgnbWV0YVtuYW1lPVwiY3NyZi10b2tlblwiXScpLmF0dHIoJ2NvbnRlbnQnKVxyXG4gICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICBkYXRhOiB7ZGVsZXRlOiBmb3JEZWxldGV9LFxyXG4gICAgICAgICAgICBlcnJvcjogZnVuY3Rpb24ocmVzcG9uc2Upe1xyXG4gICAgICAgICAgICAgICAgdmFyIHcgPSB3aW5kb3cub3BlbignJywgJzpFcnJvciBNZXNzYWdlJywgJ21lbnViYXI9bm8sIGxvY2F0aW9uPW5vJyk7XHJcbiAgICAgICAgICAgICAgICB3LmRvY3VtZW50LndyaXRlKHJlc3BvbnNlLnJlc3BvbnNlVGV4dCk7XHJcbiAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgIHN1Y2Nlc3M6IGZ1bmN0aW9uKHJlc3BvbnNlKXtcclxuICAgICAgICAgICAgICAgICQubm90aWZ5KHJlc3BvbnNlLCBcInN1Y2Nlc3NcIik7XHJcbiAgICAgICAgICAgICAgICAkKFwiLnNlbGVjdGFibGUgLml0ZW0gc3BhblwiKS5lYWNoKGZ1bmN0aW9uKGksIG9iail7XHJcbiAgICAgICAgICAgICAgICAgICAgaWYoZm9yRGVsZXRlLmluZGV4T2YoJChvYmopLnRleHQoKSkgIT09IC0xKVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAkKG9iaikucGFyZW50KCkucGFyZW50KCkucmVtb3ZlKCk7XHJcbiAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgICAgIGZvckRlbGV0ZSA9IFtdO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfSlcclxuICAgIH0pXHJcbn0pOyJdLCJmaWxlIjoicmFkaW8vZGVsZXRlLmpzIiwic291cmNlUm9vdCI6Ii9zb3VyY2UvIn0=
