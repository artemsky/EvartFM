$(function(){
    var ROOT = '/dashboard/news';
    "use strict";
    var modal = $("#modal");
    $("article").on("click", function(){
        var $this = $(this);
        modal.find(".modal-title span").text($this.attr("data-id"));

        modal.find("#long").val($this.find(".title_long").text());
        modal.find("#short").val($this.find(".title_short").text());
        modal.find("#article").val($this.find(".article").text());
        modal.find("#date").val($.trim($this.find(".news-date").text()));

        // .valueAsDate = new Date()




        modal.modal('show');
    });

    $("#sortby li a").click(function(e){
        e.preventDefault();
        var path = location.pathname.split('/');
        if(path.length !== 5){
            location.pathname = ROOT + '/' + $(this).attr("href");
        }else{
            location.pathname = ROOT + '/' + $(this).attr("href") + '/' + path[4];
        }
    });

    $("#orderby li a").click(function(e){
        e.preventDefault();
        var path = location.pathname.split('/');
        if(path.length !== 5){
            location.pathname = ROOT + '/desc/' + $(this).attr("href");
        }else{
            location.pathname = ROOT + '/' + path[3] + '/' + $(this).attr("href");
        }
    });


    
});