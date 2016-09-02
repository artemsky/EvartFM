$(function(){
    "use strict";

    var ROOT = '/dashboard/news';
    var onEditError = function(response){
            console.log(response);
            if(response.status === 406){
                var result = '';
                for(var i in response.responseJSON)
                    result += response.responseJSON[i] + '\n';
                alert(result);
            }
            else{
                $("body").append(response.responseText)
            }
        },
        onEditSuccess = function(response){
            console.log(response);
            modal.find(".save-changes").addClass('btn-success');
            setTimeout(function(){
                modal.find(".save-changes").removeClass('btn-success');
                modal.modal('hide');
            }, 1000);

        };

    var modal = $("#modal");
    var URLUpdateItem = '';
    var form = modal.find('form');
    var requestOptions = {
        type: "POST",
        cache: false,
        processData: false,
        contentType: false,
        headers: {
            'X-CSRF-TOKEN': $('meta[name="csrf-token"]').attr('content')
        },
        success: onEditSuccess,
        error: onEditError
    };
    $("article").on("click", function(){
        URLUpdateItem = form.attr('data-update');
        var $this = $(this);
        modal.find(".modal-title span").text($this.attr("data-id"));
        modal.find("#id").val($this.attr("data-id"));
        modal.find("#long").val($this.find(".title_long").text());
        modal.find("#short").val($this.find(".title_short").text());
        modal.find("#article").val($this.find(".article").text());
        modal.find("#preview").attr('src', $this.css('background-image').replace('url("','').replace('")',''));


        modal.find(".delete-user").show();
        modal.find(".save-changes").text("Save changes");

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

    function readURL(input) {
        if (input.files && input.files[0]) {
            var reader = new FileReader();
            reader.onload = function (e) {
                $('#preview').attr('src', e.target.result);
            };
            reader.readAsDataURL(input.files[0]);
        }
    }

    $("#image").change(function(){
        readURL(this);
    });

    modal.find(".save-changes").click(function(e){
        e.preventDefault();
        requestOptions.data = new FormData(form.get(0));
        $.ajax(URLUpdateItem, requestOptions);
    });

    //New Item

    $(".new-item").on("click", function(){
        URLUpdateItem = form.attr('data-add');
        modal.find(".modal-title span").text("New item");
        form.get(0).reset();
        modal.find("#preview").attr('src', "");
        modal.find("#date").get(0).valueAsDate = new Date();
        modal.find(".delete-user").hide();
        modal.find(".save-changes").text("Add");
        modal.modal('show');
    });


    
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiIiwic291cmNlcyI6WyJuZXdzYWxsLmpzIl0sInNvdXJjZXNDb250ZW50IjpbIiQoZnVuY3Rpb24oKXtcclxuICAgIFwidXNlIHN0cmljdFwiO1xyXG5cclxuICAgIHZhciBST09UID0gJy9kYXNoYm9hcmQvbmV3cyc7XHJcbiAgICB2YXIgb25FZGl0RXJyb3IgPSBmdW5jdGlvbihyZXNwb25zZSl7XHJcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKHJlc3BvbnNlKTtcclxuICAgICAgICAgICAgaWYocmVzcG9uc2Uuc3RhdHVzID09PSA0MDYpe1xyXG4gICAgICAgICAgICAgICAgdmFyIHJlc3VsdCA9ICcnO1xyXG4gICAgICAgICAgICAgICAgZm9yKHZhciBpIGluIHJlc3BvbnNlLnJlc3BvbnNlSlNPTilcclxuICAgICAgICAgICAgICAgICAgICByZXN1bHQgKz0gcmVzcG9uc2UucmVzcG9uc2VKU09OW2ldICsgJ1xcbic7XHJcbiAgICAgICAgICAgICAgICBhbGVydChyZXN1bHQpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGVsc2V7XHJcbiAgICAgICAgICAgICAgICAkKFwiYm9keVwiKS5hcHBlbmQocmVzcG9uc2UucmVzcG9uc2VUZXh0KVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfSxcclxuICAgICAgICBvbkVkaXRTdWNjZXNzID0gZnVuY3Rpb24ocmVzcG9uc2Upe1xyXG4gICAgICAgICAgICBjb25zb2xlLmxvZyhyZXNwb25zZSk7XHJcbiAgICAgICAgICAgIG1vZGFsLmZpbmQoXCIuc2F2ZS1jaGFuZ2VzXCIpLmFkZENsYXNzKCdidG4tc3VjY2VzcycpO1xyXG4gICAgICAgICAgICBzZXRUaW1lb3V0KGZ1bmN0aW9uKCl7XHJcbiAgICAgICAgICAgICAgICBtb2RhbC5maW5kKFwiLnNhdmUtY2hhbmdlc1wiKS5yZW1vdmVDbGFzcygnYnRuLXN1Y2Nlc3MnKTtcclxuICAgICAgICAgICAgICAgIG1vZGFsLm1vZGFsKCdoaWRlJyk7XHJcbiAgICAgICAgICAgIH0sIDEwMDApO1xyXG5cclxuICAgICAgICB9O1xyXG5cclxuICAgIHZhciBtb2RhbCA9ICQoXCIjbW9kYWxcIik7XHJcbiAgICB2YXIgVVJMVXBkYXRlSXRlbSA9ICcnO1xyXG4gICAgdmFyIGZvcm0gPSBtb2RhbC5maW5kKCdmb3JtJyk7XHJcbiAgICB2YXIgcmVxdWVzdE9wdGlvbnMgPSB7XHJcbiAgICAgICAgdHlwZTogXCJQT1NUXCIsXHJcbiAgICAgICAgY2FjaGU6IGZhbHNlLFxyXG4gICAgICAgIHByb2Nlc3NEYXRhOiBmYWxzZSxcclxuICAgICAgICBjb250ZW50VHlwZTogZmFsc2UsXHJcbiAgICAgICAgaGVhZGVyczoge1xyXG4gICAgICAgICAgICAnWC1DU1JGLVRPS0VOJzogJCgnbWV0YVtuYW1lPVwiY3NyZi10b2tlblwiXScpLmF0dHIoJ2NvbnRlbnQnKVxyXG4gICAgICAgIH0sXHJcbiAgICAgICAgc3VjY2Vzczogb25FZGl0U3VjY2VzcyxcclxuICAgICAgICBlcnJvcjogb25FZGl0RXJyb3JcclxuICAgIH07XHJcbiAgICAkKFwiYXJ0aWNsZVwiKS5vbihcImNsaWNrXCIsIGZ1bmN0aW9uKCl7XHJcbiAgICAgICAgVVJMVXBkYXRlSXRlbSA9IGZvcm0uYXR0cignZGF0YS11cGRhdGUnKTtcclxuICAgICAgICB2YXIgJHRoaXMgPSAkKHRoaXMpO1xyXG4gICAgICAgIG1vZGFsLmZpbmQoXCIubW9kYWwtdGl0bGUgc3BhblwiKS50ZXh0KCR0aGlzLmF0dHIoXCJkYXRhLWlkXCIpKTtcclxuICAgICAgICBtb2RhbC5maW5kKFwiI2lkXCIpLnZhbCgkdGhpcy5hdHRyKFwiZGF0YS1pZFwiKSk7XHJcbiAgICAgICAgbW9kYWwuZmluZChcIiNsb25nXCIpLnZhbCgkdGhpcy5maW5kKFwiLnRpdGxlX2xvbmdcIikudGV4dCgpKTtcclxuICAgICAgICBtb2RhbC5maW5kKFwiI3Nob3J0XCIpLnZhbCgkdGhpcy5maW5kKFwiLnRpdGxlX3Nob3J0XCIpLnRleHQoKSk7XHJcbiAgICAgICAgbW9kYWwuZmluZChcIiNhcnRpY2xlXCIpLnZhbCgkdGhpcy5maW5kKFwiLmFydGljbGVcIikudGV4dCgpKTtcclxuICAgICAgICBtb2RhbC5maW5kKFwiI3ByZXZpZXdcIikuYXR0cignc3JjJywgJHRoaXMuY3NzKCdiYWNrZ3JvdW5kLWltYWdlJykucmVwbGFjZSgndXJsKFwiJywnJykucmVwbGFjZSgnXCIpJywnJykpO1xyXG5cclxuXHJcbiAgICAgICAgbW9kYWwuZmluZChcIi5kZWxldGUtdXNlclwiKS5zaG93KCk7XHJcbiAgICAgICAgbW9kYWwuZmluZChcIi5zYXZlLWNoYW5nZXNcIikudGV4dChcIlNhdmUgY2hhbmdlc1wiKTtcclxuXHJcbiAgICAgICAgbW9kYWwubW9kYWwoJ3Nob3cnKTtcclxuICAgIH0pO1xyXG5cclxuICAgICQoXCIjc29ydGJ5IGxpIGFcIikuY2xpY2soZnVuY3Rpb24oZSl7XHJcbiAgICAgICAgZS5wcmV2ZW50RGVmYXVsdCgpO1xyXG4gICAgICAgIHZhciBwYXRoID0gbG9jYXRpb24ucGF0aG5hbWUuc3BsaXQoJy8nKTtcclxuICAgICAgICBpZihwYXRoLmxlbmd0aCAhPT0gNSl7XHJcbiAgICAgICAgICAgIGxvY2F0aW9uLnBhdGhuYW1lID0gUk9PVCArICcvJyArICQodGhpcykuYXR0cihcImhyZWZcIik7XHJcbiAgICAgICAgfWVsc2V7XHJcbiAgICAgICAgICAgIGxvY2F0aW9uLnBhdGhuYW1lID0gUk9PVCArICcvJyArICQodGhpcykuYXR0cihcImhyZWZcIikgKyAnLycgKyBwYXRoWzRdO1xyXG4gICAgICAgIH1cclxuICAgIH0pO1xyXG5cclxuICAgICQoXCIjb3JkZXJieSBsaSBhXCIpLmNsaWNrKGZ1bmN0aW9uKGUpe1xyXG4gICAgICAgIGUucHJldmVudERlZmF1bHQoKTtcclxuICAgICAgICB2YXIgcGF0aCA9IGxvY2F0aW9uLnBhdGhuYW1lLnNwbGl0KCcvJyk7XHJcbiAgICAgICAgaWYocGF0aC5sZW5ndGggIT09IDUpe1xyXG4gICAgICAgICAgICBsb2NhdGlvbi5wYXRobmFtZSA9IFJPT1QgKyAnL2Rlc2MvJyArICQodGhpcykuYXR0cihcImhyZWZcIik7XHJcbiAgICAgICAgfWVsc2V7XHJcbiAgICAgICAgICAgIGxvY2F0aW9uLnBhdGhuYW1lID0gUk9PVCArICcvJyArIHBhdGhbM10gKyAnLycgKyAkKHRoaXMpLmF0dHIoXCJocmVmXCIpO1xyXG4gICAgICAgIH1cclxuICAgIH0pO1xyXG5cclxuICAgIGZ1bmN0aW9uIHJlYWRVUkwoaW5wdXQpIHtcclxuICAgICAgICBpZiAoaW5wdXQuZmlsZXMgJiYgaW5wdXQuZmlsZXNbMF0pIHtcclxuICAgICAgICAgICAgdmFyIHJlYWRlciA9IG5ldyBGaWxlUmVhZGVyKCk7XHJcbiAgICAgICAgICAgIHJlYWRlci5vbmxvYWQgPSBmdW5jdGlvbiAoZSkge1xyXG4gICAgICAgICAgICAgICAgJCgnI3ByZXZpZXcnKS5hdHRyKCdzcmMnLCBlLnRhcmdldC5yZXN1bHQpO1xyXG4gICAgICAgICAgICB9O1xyXG4gICAgICAgICAgICByZWFkZXIucmVhZEFzRGF0YVVSTChpbnB1dC5maWxlc1swXSk7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgICQoXCIjaW1hZ2VcIikuY2hhbmdlKGZ1bmN0aW9uKCl7XHJcbiAgICAgICAgcmVhZFVSTCh0aGlzKTtcclxuICAgIH0pO1xyXG5cclxuICAgIG1vZGFsLmZpbmQoXCIuc2F2ZS1jaGFuZ2VzXCIpLmNsaWNrKGZ1bmN0aW9uKGUpe1xyXG4gICAgICAgIGUucHJldmVudERlZmF1bHQoKTtcclxuICAgICAgICByZXF1ZXN0T3B0aW9ucy5kYXRhID0gbmV3IEZvcm1EYXRhKGZvcm0uZ2V0KDApKTtcclxuICAgICAgICAkLmFqYXgoVVJMVXBkYXRlSXRlbSwgcmVxdWVzdE9wdGlvbnMpO1xyXG4gICAgfSk7XHJcblxyXG4gICAgLy9OZXcgSXRlbVxyXG5cclxuICAgICQoXCIubmV3LWl0ZW1cIikub24oXCJjbGlja1wiLCBmdW5jdGlvbigpe1xyXG4gICAgICAgIFVSTFVwZGF0ZUl0ZW0gPSBmb3JtLmF0dHIoJ2RhdGEtYWRkJyk7XHJcbiAgICAgICAgbW9kYWwuZmluZChcIi5tb2RhbC10aXRsZSBzcGFuXCIpLnRleHQoXCJOZXcgaXRlbVwiKTtcclxuICAgICAgICBmb3JtLmdldCgwKS5yZXNldCgpO1xyXG4gICAgICAgIG1vZGFsLmZpbmQoXCIjcHJldmlld1wiKS5hdHRyKCdzcmMnLCBcIlwiKTtcclxuICAgICAgICBtb2RhbC5maW5kKFwiI2RhdGVcIikuZ2V0KDApLnZhbHVlQXNEYXRlID0gbmV3IERhdGUoKTtcclxuICAgICAgICBtb2RhbC5maW5kKFwiLmRlbGV0ZS11c2VyXCIpLmhpZGUoKTtcclxuICAgICAgICBtb2RhbC5maW5kKFwiLnNhdmUtY2hhbmdlc1wiKS50ZXh0KFwiQWRkXCIpO1xyXG4gICAgICAgIG1vZGFsLm1vZGFsKCdzaG93Jyk7XHJcbiAgICB9KTtcclxuXHJcblxyXG4gICAgXHJcbn0pOyJdLCJmaWxlIjoibmV3c2FsbC5qcyIsInNvdXJjZVJvb3QiOiIvc291cmNlLyJ9
