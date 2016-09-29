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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiIiwic291cmNlcyI6WyJkYXNoYm9hcmQvcmFkaW8vZGVsZXRlLmpzIl0sInNvdXJjZXNDb250ZW50IjpbIiQoZnVuY3Rpb24oKXtcbiAgICBcInVzZSBzdHJpY3RcIjtcbiAgICB2YXIgZm9yRGVsZXRlID0gW107XG4gICAgdmFyIGJ0bkRlbGV0ZSA9ICQoXCIuZGVsZXRlXCIpO1xuICAgICQoIFwiLnNlbGVjdGFibGVcIiApLnNlbGVjdGFibGUoe1xuICAgICAgICBmaWx0ZXI6IFwiLml0ZW1cIixcbiAgICAgICAgdW5zZWxlY3RlZDogZnVuY3Rpb24oIGV2ZW50LCB1aSApIHtcbiAgICAgICAgICAgIHZhciBkZWxldGV0YWJsZSA9ICQodWkudW5zZWxlY3RlZCkuZmluZCgnc3BhbicpLnRleHQoKTtcbiAgICAgICAgICAgIGZvckRlbGV0ZSA9IGZvckRlbGV0ZS5maWx0ZXIoZnVuY3Rpb24oZWwpe1xuICAgICAgICAgICAgICAgIHJldHVybiBlbCAhPSBkZWxldGV0YWJsZTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgY29uc29sZS5sb2coMik7XG4gICAgICAgIH0sXG4gICAgICAgIHNlbGVjdGVkOiBmdW5jdGlvbiggZXZlbnQsIHVpICkge1xuICAgICAgICAgICAgdmFyIHNlbGVjdGVkID0gJCh1aS5zZWxlY3RlZCkuZmluZCgnc3BhbicpLnRleHQoKTtcbiAgICAgICAgICAgIGZvckRlbGV0ZS5wdXNoKHNlbGVjdGVkKTtcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKDEpO1xuICAgICAgICB9LFxuICAgICAgICBzdG9wOiBmdW5jdGlvbigpe1xuICAgICAgICAgICAgaWYoZm9yRGVsZXRlLmxlbmd0aClcbiAgICAgICAgICAgICAgICBidG5EZWxldGUuc2hvdygpO1xuICAgICAgICAgICAgZWxzZXtcbiAgICAgICAgICAgICAgICBidG5EZWxldGUuaGlkZSgpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgY29uc29sZS5sb2coZm9yRGVsZXRlKTtcbiAgICAgICAgfVxuICAgIH0pO1xuXG4gICAgYnRuRGVsZXRlLm9uKFwiY2xpY2tcIiwgZnVuY3Rpb24oKXtcbiAgICAgICAgJC5hamF4KCQodGhpcykuYXR0cihcImRhdGEtdXJsXCIpLCB7XG4gICAgICAgICAgICB0eXBlOiBcIlBPU1RcIixcbiAgICAgICAgICAgIGhlYWRlcnM6IHtcbiAgICAgICAgICAgICAgICAnWC1DU1JGLVRPS0VOJzogJCgnbWV0YVtuYW1lPVwiY3NyZi10b2tlblwiXScpLmF0dHIoJ2NvbnRlbnQnKVxuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIGRhdGE6IHtkZWxldGU6IGZvckRlbGV0ZX0sXG4gICAgICAgICAgICBlcnJvcjogZnVuY3Rpb24ocmVzcG9uc2Upe1xuICAgICAgICAgICAgICAgIHZhciB3ID0gd2luZG93Lm9wZW4oJycsICc6RXJyb3IgTWVzc2FnZScsICdtZW51YmFyPW5vLCBsb2NhdGlvbj1ubycpO1xuICAgICAgICAgICAgICAgIHcuZG9jdW1lbnQud3JpdGUocmVzcG9uc2UucmVzcG9uc2VUZXh0KTtcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICBzdWNjZXNzOiBmdW5jdGlvbihyZXNwb25zZSl7XG4gICAgICAgICAgICAgICAgJC5ub3RpZnkocmVzcG9uc2UsIFwic3VjY2Vzc1wiKTtcbiAgICAgICAgICAgICAgICAkKFwiLnNlbGVjdGFibGUgLml0ZW0gc3BhblwiKS5lYWNoKGZ1bmN0aW9uKGksIG9iail7XG4gICAgICAgICAgICAgICAgICAgIGlmKGZvckRlbGV0ZS5pbmRleE9mKCQob2JqKS50ZXh0KCkpICE9PSAtMSlcbiAgICAgICAgICAgICAgICAgICAgICAgICQob2JqKS5wYXJlbnQoKS5wYXJlbnQoKS5yZW1vdmUoKTtcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICBmb3JEZWxldGUgPSBbXTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSlcbiAgICB9KVxufSk7Il0sImZpbGUiOiJkYXNoYm9hcmQvcmFkaW8vZGVsZXRlLmpzIiwic291cmNlUm9vdCI6Ii9zb3VyY2UvIn0=
