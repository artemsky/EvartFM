$(function(){
    "use strict";

    //News
    $(function(){
        var container;
        var main = $("main");
        $(".item.item-hide").click(function(){
            container = $(this).next();
            container.show().animate({opacity: 1}, 500);
            if(container.offset().top + container.height() > main.offset().top + main.height())
                container.css({
                    top: -container.parent().height()
                });



        });
        $(document).mouseup(function (e){
            if(!container) return;
            e.stopPropagation();
            if (!container.is(e.target) && container.has(e.target).length === 0){
                container.hide().stop().css("opacity", "0");
                container = null;
            }
        });
    });

});

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiIiwic291cmNlcyI6WyJldmVudHMuanMiXSwic291cmNlc0NvbnRlbnQiOlsiJChmdW5jdGlvbigpe1xuICAgIFwidXNlIHN0cmljdFwiO1xuXG4gICAgLy9OZXdzXG4gICAgJChmdW5jdGlvbigpe1xuICAgICAgICB2YXIgY29udGFpbmVyO1xuICAgICAgICB2YXIgbWFpbiA9ICQoXCJtYWluXCIpO1xuICAgICAgICAkKFwiLml0ZW0uaXRlbS1oaWRlXCIpLmNsaWNrKGZ1bmN0aW9uKCl7XG4gICAgICAgICAgICBjb250YWluZXIgPSAkKHRoaXMpLm5leHQoKTtcbiAgICAgICAgICAgIGNvbnRhaW5lci5zaG93KCkuYW5pbWF0ZSh7b3BhY2l0eTogMX0sIDUwMCk7XG4gICAgICAgICAgICBpZihjb250YWluZXIub2Zmc2V0KCkudG9wICsgY29udGFpbmVyLmhlaWdodCgpID4gbWFpbi5vZmZzZXQoKS50b3AgKyBtYWluLmhlaWdodCgpKVxuICAgICAgICAgICAgICAgIGNvbnRhaW5lci5jc3Moe1xuICAgICAgICAgICAgICAgICAgICB0b3A6IC1jb250YWluZXIucGFyZW50KCkuaGVpZ2h0KClcbiAgICAgICAgICAgICAgICB9KTtcblxuXG5cbiAgICAgICAgfSk7XG4gICAgICAgICQoZG9jdW1lbnQpLm1vdXNldXAoZnVuY3Rpb24gKGUpe1xuICAgICAgICAgICAgaWYoIWNvbnRhaW5lcikgcmV0dXJuO1xuICAgICAgICAgICAgZS5zdG9wUHJvcGFnYXRpb24oKTtcbiAgICAgICAgICAgIGlmICghY29udGFpbmVyLmlzKGUudGFyZ2V0KSAmJiBjb250YWluZXIuaGFzKGUudGFyZ2V0KS5sZW5ndGggPT09IDApe1xuICAgICAgICAgICAgICAgIGNvbnRhaW5lci5oaWRlKCkuc3RvcCgpLmNzcyhcIm9wYWNpdHlcIiwgXCIwXCIpO1xuICAgICAgICAgICAgICAgIGNvbnRhaW5lciA9IG51bGw7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgIH0pO1xuXG59KTtcbiJdLCJmaWxlIjoiZXZlbnRzLmpzIiwic291cmNlUm9vdCI6Ii9zb3VyY2UvIn0=
