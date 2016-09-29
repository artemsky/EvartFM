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

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiIiwic291cmNlcyI6WyJuZXdzLmpzIl0sInNvdXJjZXNDb250ZW50IjpbIiQoZnVuY3Rpb24oKXtcclxuICAgIFwidXNlIHN0cmljdFwiO1xyXG5cclxuICAgIC8vTmV3c1xyXG4gICAgJChmdW5jdGlvbigpe1xyXG5cclxuICAgICAgICAkKFwiLml0ZW0gLm1pbmlcIikuY2xpY2soZnVuY3Rpb24oKXtcclxuICAgICAgICAgICAgdmFyIGNvbnRhaW5lciA9ICQodGhpcykubmV4dCgpO1xyXG4gICAgICAgICAgICB2YXIgJHRoaXMgPSAkKHRoaXMpO1xyXG4gICAgICAgICAgICB2YXIgbWFpbiA9ICQoXCJtYWluXCIpO1xyXG4gICAgICAgICAgICAkdGhpcy5zbGlkZVVwKDMwMCk7XHJcbiAgICAgICAgICAgIGNvbnRhaW5lci5zbGlkZURvd24oMzAwKTtcclxuICAgICAgICAgICAgJHRoaXMubmV4dCgpLmZpbmQoXCIuY29udGVudCAuZGV0YWlsc1wiKS5vbmUoXCJjbGlja1wiLCBmdW5jdGlvbigpe1xyXG4gICAgICAgICAgICAgICAgJHRoaXMuc2xpZGVEb3duKDMwMCk7XHJcbiAgICAgICAgICAgICAgICBjb250YWluZXIuc2xpZGVVcCgzMDApO1xyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICB9KTtcclxuICAgIH0pO1xyXG5cclxuICAgICQoXCIjbGl2ZSAubW9yZWluZm9cIikuaGlkZSgwKTtcclxuICAgICQoZnVuY3Rpb24oKXtcclxuICAgICAgICB2YXIgbGl2ZSA9ICQoXCIjbGl2ZVwiKTtcclxuICAgICAgICB2YXIgbW9yZSA9IGxpdmUuZmluZChcIi5tb3JlaW5mb1wiKTtcclxuICAgICAgICBtb3JlLmhpZGUoMCk7XHJcbiAgICAgICAgbGl2ZS5jbGljayhmdW5jdGlvbigpe1xyXG4gICAgICAgICAgICBtb3JlLmNzcyhcIm9wYWNpdHlcIiwgXCIxXCIpO1xyXG4gICAgICAgICAgICBtb3JlLnRvZ2dsZSgyMDApO1xyXG4gICAgICAgIH0pO1xyXG4gICAgfSk7XHJcblxyXG59KTtcclxuJChcIiNsaXZlIC5tb3JlaW5mb1wiKS5oaWRlKDApO1xyXG4iXSwiZmlsZSI6Im5ld3MuanMiLCJzb3VyY2VSb290IjoiL3NvdXJjZS8ifQ==
