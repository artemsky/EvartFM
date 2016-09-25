$(function(){
    "use strict";

    //News
    $(function(){

        $(".item .mini").click(function(){
            var container = $(this).next();
            var $this = $(this);
            var main = $("main");
            $this.slideUp(300);
            container.slideDown(300);
            $this.next().find(".content .details").one("click", function(){
                $this.slideDown(300);
                container.slideUp(300);
            });
        });
    });

    $("#live .moreinfo").hide(0);
    $(function(){
        var live = $("#live");
        var more = live.find(".moreinfo");
        more.hide(0);
        live.click(function(){
            more.css("opacity", "1");
            more.toggle(200);
        });
    });

});
$("#live .moreinfo").hide(0);
