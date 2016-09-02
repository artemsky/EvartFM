$(function() {
        "use strict";
        var sliderItems = $(".sortable");
        var removeIntent = false;
        sliderItems.sortable({
                items: ".item",
                opacity: 0.8,
                stop: function( event, ui ) {
                        $(event.target).find(".item").each(function(i, obj){
                                $(obj).attr("data-order", i+1);
                        });
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
                        }
                }
        });
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiIiwic291cmNlcyI6WyJjb21wb25lbnRzLmpzIl0sInNvdXJjZXNDb250ZW50IjpbIiQoZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgXCJ1c2Ugc3RyaWN0XCI7XHJcbiAgICAgICAgdmFyIHNsaWRlckl0ZW1zID0gJChcIi5zb3J0YWJsZVwiKTtcclxuICAgICAgICB2YXIgcmVtb3ZlSW50ZW50ID0gZmFsc2U7XHJcbiAgICAgICAgc2xpZGVySXRlbXMuc29ydGFibGUoe1xyXG4gICAgICAgICAgICAgICAgaXRlbXM6IFwiLml0ZW1cIixcclxuICAgICAgICAgICAgICAgIG9wYWNpdHk6IDAuOCxcclxuICAgICAgICAgICAgICAgIHN0b3A6IGZ1bmN0aW9uKCBldmVudCwgdWkgKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICQoZXZlbnQudGFyZ2V0KS5maW5kKFwiLml0ZW1cIikuZWFjaChmdW5jdGlvbihpLCBvYmope1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICQob2JqKS5hdHRyKFwiZGF0YS1vcmRlclwiLCBpKzEpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgICAgICBvdmVyOiBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHJlbW92ZUludGVudCA9IGZhbHNlO1xyXG4gICAgICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgICAgIG91dDogZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICByZW1vdmVJbnRlbnQgPSB0cnVlO1xyXG4gICAgICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgICAgIGJlZm9yZVN0b3A6IGZ1bmN0aW9uIChldmVudCwgdWkpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgaWYocmVtb3ZlSW50ZW50ID09IHRydWUpe1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHVpLml0ZW0ucmVtb3ZlKCk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICB9KTtcclxufSk7Il0sImZpbGUiOiJjb21wb25lbnRzLmpzIiwic291cmNlUm9vdCI6Ii9zb3VyY2UvIn0=
