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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiIiwic291cmNlcyI6WyJkYXNoYm9hcmQvcmFkaW8vZGVsZXRlLmpzIl0sInNvdXJjZXNDb250ZW50IjpbIiQoZnVuY3Rpb24oKXtcclxuICAgIFwidXNlIHN0cmljdFwiO1xyXG4gICAgdmFyIGZvckRlbGV0ZSA9IFtdO1xyXG4gICAgdmFyIGJ0bkRlbGV0ZSA9ICQoXCIuZGVsZXRlXCIpO1xyXG4gICAgJCggXCIuc2VsZWN0YWJsZVwiICkuc2VsZWN0YWJsZSh7XHJcbiAgICAgICAgZmlsdGVyOiBcIi5pdGVtXCIsXHJcbiAgICAgICAgdW5zZWxlY3RlZDogZnVuY3Rpb24oIGV2ZW50LCB1aSApIHtcclxuICAgICAgICAgICAgdmFyIGRlbGV0ZXRhYmxlID0gJCh1aS51bnNlbGVjdGVkKS5maW5kKCdzcGFuJykudGV4dCgpO1xyXG4gICAgICAgICAgICBmb3JEZWxldGUgPSBmb3JEZWxldGUuZmlsdGVyKGZ1bmN0aW9uKGVsKXtcclxuICAgICAgICAgICAgICAgIHJldHVybiBlbCAhPSBkZWxldGV0YWJsZTtcclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKDIpO1xyXG4gICAgICAgIH0sXHJcbiAgICAgICAgc2VsZWN0ZWQ6IGZ1bmN0aW9uKCBldmVudCwgdWkgKSB7XHJcbiAgICAgICAgICAgIHZhciBzZWxlY3RlZCA9ICQodWkuc2VsZWN0ZWQpLmZpbmQoJ3NwYW4nKS50ZXh0KCk7XHJcbiAgICAgICAgICAgIGZvckRlbGV0ZS5wdXNoKHNlbGVjdGVkKTtcclxuICAgICAgICAgICAgY29uc29sZS5sb2coMSk7XHJcbiAgICAgICAgfSxcclxuICAgICAgICBzdG9wOiBmdW5jdGlvbigpe1xyXG4gICAgICAgICAgICBpZihmb3JEZWxldGUubGVuZ3RoKVxyXG4gICAgICAgICAgICAgICAgYnRuRGVsZXRlLnNob3coKTtcclxuICAgICAgICAgICAgZWxzZXtcclxuICAgICAgICAgICAgICAgIGJ0bkRlbGV0ZS5oaWRlKCk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgY29uc29sZS5sb2coZm9yRGVsZXRlKTtcclxuICAgICAgICB9XHJcbiAgICB9KTtcclxuXHJcbiAgICBidG5EZWxldGUub24oXCJjbGlja1wiLCBmdW5jdGlvbigpe1xyXG4gICAgICAgICQuYWpheCgkKHRoaXMpLmF0dHIoXCJkYXRhLXVybFwiKSwge1xyXG4gICAgICAgICAgICB0eXBlOiBcIlBPU1RcIixcclxuICAgICAgICAgICAgaGVhZGVyczoge1xyXG4gICAgICAgICAgICAgICAgJ1gtQ1NSRi1UT0tFTic6ICQoJ21ldGFbbmFtZT1cImNzcmYtdG9rZW5cIl0nKS5hdHRyKCdjb250ZW50JylcclxuICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgZGF0YToge2RlbGV0ZTogZm9yRGVsZXRlfSxcclxuICAgICAgICAgICAgZXJyb3I6IGZ1bmN0aW9uKHJlc3BvbnNlKXtcclxuICAgICAgICAgICAgICAgIHZhciB3ID0gd2luZG93Lm9wZW4oJycsICc6RXJyb3IgTWVzc2FnZScsICdtZW51YmFyPW5vLCBsb2NhdGlvbj1ubycpO1xyXG4gICAgICAgICAgICAgICAgdy5kb2N1bWVudC53cml0ZShyZXNwb25zZS5yZXNwb25zZVRleHQpO1xyXG4gICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICBzdWNjZXNzOiBmdW5jdGlvbihyZXNwb25zZSl7XHJcbiAgICAgICAgICAgICAgICAkLm5vdGlmeShyZXNwb25zZSwgXCJzdWNjZXNzXCIpO1xyXG4gICAgICAgICAgICAgICAgJChcIi5zZWxlY3RhYmxlIC5pdGVtIHNwYW5cIikuZWFjaChmdW5jdGlvbihpLCBvYmope1xyXG4gICAgICAgICAgICAgICAgICAgIGlmKGZvckRlbGV0ZS5pbmRleE9mKCQob2JqKS50ZXh0KCkpICE9PSAtMSlcclxuICAgICAgICAgICAgICAgICAgICAgICAgJChvYmopLnBhcmVudCgpLnBhcmVudCgpLnJlbW92ZSgpO1xyXG4gICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgICAgICBmb3JEZWxldGUgPSBbXTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH0pXHJcbiAgICB9KVxyXG59KTsiXSwiZmlsZSI6ImRhc2hib2FyZC9yYWRpby9kZWxldGUuanMiLCJzb3VyY2VSb290IjoiL3NvdXJjZS8ifQ==
