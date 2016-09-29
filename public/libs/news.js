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

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiIiwic291cmNlcyI6WyJuZXdzLmpzIl0sInNvdXJjZXNDb250ZW50IjpbIiQoZnVuY3Rpb24oKXtcbiAgICBcInVzZSBzdHJpY3RcIjtcblxuICAgIC8vTmV3c1xuICAgICQoZnVuY3Rpb24oKXtcblxuICAgICAgICAkKFwiLml0ZW0gLm1pbmlcIikuY2xpY2soZnVuY3Rpb24oKXtcbiAgICAgICAgICAgIHZhciBjb250YWluZXIgPSAkKHRoaXMpLm5leHQoKTtcbiAgICAgICAgICAgIHZhciAkdGhpcyA9ICQodGhpcyk7XG4gICAgICAgICAgICB2YXIgbWFpbiA9ICQoXCJtYWluXCIpO1xuICAgICAgICAgICAgJHRoaXMuc2xpZGVVcCgzMDApO1xuICAgICAgICAgICAgY29udGFpbmVyLnNsaWRlRG93bigzMDApO1xuICAgICAgICAgICAgJHRoaXMubmV4dCgpLmZpbmQoXCIuY29udGVudCAuZGV0YWlsc1wiKS5vbmUoXCJjbGlja1wiLCBmdW5jdGlvbigpe1xuICAgICAgICAgICAgICAgICR0aGlzLnNsaWRlRG93bigzMDApO1xuICAgICAgICAgICAgICAgIGNvbnRhaW5lci5zbGlkZVVwKDMwMCk7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfSk7XG4gICAgfSk7XG5cbiAgICAkKFwiI2xpdmUgLm1vcmVpbmZvXCIpLmhpZGUoMCk7XG4gICAgJChmdW5jdGlvbigpe1xuICAgICAgICB2YXIgbGl2ZSA9ICQoXCIjbGl2ZVwiKTtcbiAgICAgICAgdmFyIG1vcmUgPSBsaXZlLmZpbmQoXCIubW9yZWluZm9cIik7XG4gICAgICAgIG1vcmUuaGlkZSgwKTtcbiAgICAgICAgbGl2ZS5jbGljayhmdW5jdGlvbigpe1xuICAgICAgICAgICAgbW9yZS5jc3MoXCJvcGFjaXR5XCIsIFwiMVwiKTtcbiAgICAgICAgICAgIG1vcmUudG9nZ2xlKDIwMCk7XG4gICAgICAgIH0pO1xuICAgIH0pO1xuXG59KTtcbiQoXCIjbGl2ZSAubW9yZWluZm9cIikuaGlkZSgwKTtcbiJdLCJmaWxlIjoibmV3cy5qcyIsInNvdXJjZVJvb3QiOiIvc291cmNlLyJ9
