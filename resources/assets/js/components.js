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