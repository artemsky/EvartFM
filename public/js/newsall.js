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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiIiwic291cmNlcyI6WyJuZXdzYWxsLmpzIl0sInNvdXJjZXNDb250ZW50IjpbIiQoZnVuY3Rpb24oKXtcclxuICAgIHZhciBST09UID0gJy9kYXNoYm9hcmQvbmV3cyc7XHJcbiAgICBcInVzZSBzdHJpY3RcIjtcclxuICAgIHZhciBtb2RhbCA9ICQoXCIjbW9kYWxcIik7XHJcbiAgICAkKFwiYXJ0aWNsZVwiKS5vbihcImNsaWNrXCIsIGZ1bmN0aW9uKCl7XHJcbiAgICAgICAgdmFyICR0aGlzID0gJCh0aGlzKTtcclxuICAgICAgICBtb2RhbC5maW5kKFwiLm1vZGFsLXRpdGxlIHNwYW5cIikudGV4dCgkdGhpcy5hdHRyKFwiZGF0YS1pZFwiKSk7XHJcblxyXG4gICAgICAgIG1vZGFsLmZpbmQoXCIjbG9uZ1wiKS52YWwoJHRoaXMuZmluZChcIi50aXRsZV9sb25nXCIpLnRleHQoKSk7XHJcbiAgICAgICAgbW9kYWwuZmluZChcIiNzaG9ydFwiKS52YWwoJHRoaXMuZmluZChcIi50aXRsZV9zaG9ydFwiKS50ZXh0KCkpO1xyXG4gICAgICAgIG1vZGFsLmZpbmQoXCIjYXJ0aWNsZVwiKS52YWwoJHRoaXMuZmluZChcIi5hcnRpY2xlXCIpLnRleHQoKSk7XHJcbiAgICAgICAgbW9kYWwuZmluZChcIiNkYXRlXCIpLnZhbCgkLnRyaW0oJHRoaXMuZmluZChcIi5uZXdzLWRhdGVcIikudGV4dCgpKSk7XHJcblxyXG4gICAgICAgIC8vIC52YWx1ZUFzRGF0ZSA9IG5ldyBEYXRlKClcclxuXHJcblxyXG5cclxuXHJcbiAgICAgICAgbW9kYWwubW9kYWwoJ3Nob3cnKTtcclxuICAgIH0pO1xyXG5cclxuICAgICQoXCIjc29ydGJ5IGxpIGFcIikuY2xpY2soZnVuY3Rpb24oZSl7XHJcbiAgICAgICAgZS5wcmV2ZW50RGVmYXVsdCgpO1xyXG4gICAgICAgIHZhciBwYXRoID0gbG9jYXRpb24ucGF0aG5hbWUuc3BsaXQoJy8nKTtcclxuICAgICAgICBpZihwYXRoLmxlbmd0aCAhPT0gNSl7XHJcbiAgICAgICAgICAgIGxvY2F0aW9uLnBhdGhuYW1lID0gUk9PVCArICcvJyArICQodGhpcykuYXR0cihcImhyZWZcIik7XHJcbiAgICAgICAgfWVsc2V7XHJcbiAgICAgICAgICAgIGxvY2F0aW9uLnBhdGhuYW1lID0gUk9PVCArICcvJyArICQodGhpcykuYXR0cihcImhyZWZcIikgKyAnLycgKyBwYXRoWzRdO1xyXG4gICAgICAgIH1cclxuICAgIH0pO1xyXG5cclxuICAgICQoXCIjb3JkZXJieSBsaSBhXCIpLmNsaWNrKGZ1bmN0aW9uKGUpe1xyXG4gICAgICAgIGUucHJldmVudERlZmF1bHQoKTtcclxuICAgICAgICB2YXIgcGF0aCA9IGxvY2F0aW9uLnBhdGhuYW1lLnNwbGl0KCcvJyk7XHJcbiAgICAgICAgaWYocGF0aC5sZW5ndGggIT09IDUpe1xyXG4gICAgICAgICAgICBsb2NhdGlvbi5wYXRobmFtZSA9IFJPT1QgKyAnL2Rlc2MvJyArICQodGhpcykuYXR0cihcImhyZWZcIik7XHJcbiAgICAgICAgfWVsc2V7XHJcbiAgICAgICAgICAgIGxvY2F0aW9uLnBhdGhuYW1lID0gUk9PVCArICcvJyArIHBhdGhbM10gKyAnLycgKyAkKHRoaXMpLmF0dHIoXCJocmVmXCIpO1xyXG4gICAgICAgIH1cclxuICAgIH0pO1xyXG5cclxuXHJcbiAgICBcclxufSk7Il0sImZpbGUiOiJuZXdzYWxsLmpzIiwic291cmNlUm9vdCI6Ii9zb3VyY2UvIn0=
