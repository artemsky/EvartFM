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

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiIiwic291cmNlcyI6WyJldmVudHMuanMiXSwic291cmNlc0NvbnRlbnQiOlsiJChmdW5jdGlvbigpe1xyXG4gICAgXCJ1c2Ugc3RyaWN0XCI7XHJcblxyXG4gICAgLy9OZXdzXHJcbiAgICAkKGZ1bmN0aW9uKCl7XHJcbiAgICAgICAgdmFyIGNvbnRhaW5lcjtcclxuICAgICAgICB2YXIgbWFpbiA9ICQoXCJtYWluXCIpO1xyXG4gICAgICAgICQoXCIuaXRlbS5pdGVtLWhpZGVcIikuY2xpY2soZnVuY3Rpb24oKXtcclxuICAgICAgICAgICAgY29udGFpbmVyID0gJCh0aGlzKS5uZXh0KCk7XHJcbiAgICAgICAgICAgIGNvbnRhaW5lci5zaG93KCkuYW5pbWF0ZSh7b3BhY2l0eTogMX0sIDUwMCk7XHJcbiAgICAgICAgICAgIGlmKGNvbnRhaW5lci5vZmZzZXQoKS50b3AgKyBjb250YWluZXIuaGVpZ2h0KCkgPiBtYWluLm9mZnNldCgpLnRvcCArIG1haW4uaGVpZ2h0KCkpXHJcbiAgICAgICAgICAgICAgICBjb250YWluZXIuY3NzKHtcclxuICAgICAgICAgICAgICAgICAgICB0b3A6IC1jb250YWluZXIucGFyZW50KCkuaGVpZ2h0KClcclxuICAgICAgICAgICAgICAgIH0pO1xyXG5cclxuXHJcblxyXG4gICAgICAgIH0pO1xyXG4gICAgICAgICQoZG9jdW1lbnQpLm1vdXNldXAoZnVuY3Rpb24gKGUpe1xyXG4gICAgICAgICAgICBpZighY29udGFpbmVyKSByZXR1cm47XHJcbiAgICAgICAgICAgIGUuc3RvcFByb3BhZ2F0aW9uKCk7XHJcbiAgICAgICAgICAgIGlmICghY29udGFpbmVyLmlzKGUudGFyZ2V0KSAmJiBjb250YWluZXIuaGFzKGUudGFyZ2V0KS5sZW5ndGggPT09IDApe1xyXG4gICAgICAgICAgICAgICAgY29udGFpbmVyLmhpZGUoKS5zdG9wKCkuY3NzKFwib3BhY2l0eVwiLCBcIjBcIik7XHJcbiAgICAgICAgICAgICAgICBjb250YWluZXIgPSBudWxsO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfSk7XHJcbiAgICB9KTtcclxuXHJcbn0pO1xyXG4iXSwiZmlsZSI6ImV2ZW50cy5qcyIsInNvdXJjZVJvb3QiOiIvc291cmNlLyJ9
