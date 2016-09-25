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
