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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiIiwic291cmNlcyI6WyJuZXdzYWxsLmpzIl0sInNvdXJjZXNDb250ZW50IjpbIiQoZnVuY3Rpb24oKXtcbiAgICBcInVzZSBzdHJpY3RcIjtcblxuICAgIHZhciBST09UID0gJy9kYXNoYm9hcmQvbmV3cyc7XG4gICAgdmFyIG9uRWRpdEVycm9yID0gZnVuY3Rpb24ocmVzcG9uc2Upe1xuICAgICAgICAgICAgY29uc29sZS5sb2cocmVzcG9uc2UpO1xuICAgICAgICAgICAgaWYocmVzcG9uc2Uuc3RhdHVzID09PSA0MDYpe1xuICAgICAgICAgICAgICAgIHZhciByZXN1bHQgPSAnJztcbiAgICAgICAgICAgICAgICBmb3IodmFyIGkgaW4gcmVzcG9uc2UucmVzcG9uc2VKU09OKVxuICAgICAgICAgICAgICAgICAgICByZXN1bHQgKz0gcmVzcG9uc2UucmVzcG9uc2VKU09OW2ldICsgJ1xcbic7XG4gICAgICAgICAgICAgICAgYWxlcnQocmVzdWx0KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGVsc2V7XG4gICAgICAgICAgICAgICAgJChcImJvZHlcIikuYXBwZW5kKHJlc3BvbnNlLnJlc3BvbnNlVGV4dClcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSxcbiAgICAgICAgb25FZGl0U3VjY2VzcyA9IGZ1bmN0aW9uKHJlc3BvbnNlKXtcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKHJlc3BvbnNlKTtcbiAgICAgICAgICAgIG1vZGFsLmZpbmQoXCIuc2F2ZS1jaGFuZ2VzXCIpLmFkZENsYXNzKCdidG4tc3VjY2VzcycpO1xuICAgICAgICAgICAgc2V0VGltZW91dChmdW5jdGlvbigpe1xuICAgICAgICAgICAgICAgIG1vZGFsLmZpbmQoXCIuc2F2ZS1jaGFuZ2VzXCIpLnJlbW92ZUNsYXNzKCdidG4tc3VjY2VzcycpO1xuICAgICAgICAgICAgICAgIG1vZGFsLm1vZGFsKCdoaWRlJyk7XG4gICAgICAgICAgICB9LCAxMDAwKTtcblxuICAgICAgICB9O1xuXG4gICAgdmFyIG1vZGFsID0gJChcIiNtb2RhbFwiKTtcbiAgICB2YXIgVVJMVXBkYXRlSXRlbSA9ICcnO1xuICAgIHZhciBmb3JtID0gbW9kYWwuZmluZCgnZm9ybScpO1xuICAgIHZhciByZXF1ZXN0T3B0aW9ucyA9IHtcbiAgICAgICAgdHlwZTogXCJQT1NUXCIsXG4gICAgICAgIGNhY2hlOiBmYWxzZSxcbiAgICAgICAgcHJvY2Vzc0RhdGE6IGZhbHNlLFxuICAgICAgICBjb250ZW50VHlwZTogZmFsc2UsXG4gICAgICAgIGhlYWRlcnM6IHtcbiAgICAgICAgICAgICdYLUNTUkYtVE9LRU4nOiAkKCdtZXRhW25hbWU9XCJjc3JmLXRva2VuXCJdJykuYXR0cignY29udGVudCcpXG4gICAgICAgIH0sXG4gICAgICAgIHN1Y2Nlc3M6IG9uRWRpdFN1Y2Nlc3MsXG4gICAgICAgIGVycm9yOiBvbkVkaXRFcnJvclxuICAgIH07XG4gICAgJChcImFydGljbGVcIikub24oXCJjbGlja1wiLCBmdW5jdGlvbigpe1xuICAgICAgICBVUkxVcGRhdGVJdGVtID0gZm9ybS5hdHRyKCdkYXRhLXVwZGF0ZScpO1xuICAgICAgICB2YXIgJHRoaXMgPSAkKHRoaXMpO1xuICAgICAgICBtb2RhbC5maW5kKFwiLm1vZGFsLXRpdGxlIHNwYW5cIikudGV4dCgkdGhpcy5hdHRyKFwiZGF0YS1pZFwiKSk7XG4gICAgICAgIG1vZGFsLmZpbmQoXCIjaWRcIikudmFsKCR0aGlzLmF0dHIoXCJkYXRhLWlkXCIpKTtcbiAgICAgICAgbW9kYWwuZmluZChcIiNsb25nXCIpLnZhbCgkdGhpcy5maW5kKFwiLnRpdGxlX2xvbmdcIikudGV4dCgpKTtcbiAgICAgICAgbW9kYWwuZmluZChcIiNzaG9ydFwiKS52YWwoJHRoaXMuZmluZChcIi50aXRsZV9zaG9ydFwiKS50ZXh0KCkpO1xuICAgICAgICBtb2RhbC5maW5kKFwiI2FydGljbGVcIikudmFsKCR0aGlzLmZpbmQoXCIuYXJ0aWNsZVwiKS50ZXh0KCkpO1xuICAgICAgICBtb2RhbC5maW5kKFwiI3ByZXZpZXdcIikuYXR0cignc3JjJywgJHRoaXMuY3NzKCdiYWNrZ3JvdW5kLWltYWdlJykucmVwbGFjZSgndXJsKFwiJywnJykucmVwbGFjZSgnXCIpJywnJykpO1xuXG5cbiAgICAgICAgbW9kYWwuZmluZChcIi5kZWxldGUtdXNlclwiKS5zaG93KCk7XG4gICAgICAgIG1vZGFsLmZpbmQoXCIuc2F2ZS1jaGFuZ2VzXCIpLnRleHQoXCJTYXZlIGNoYW5nZXNcIik7XG5cbiAgICAgICAgbW9kYWwubW9kYWwoJ3Nob3cnKTtcbiAgICB9KTtcblxuICAgICQoXCIjc29ydGJ5IGxpIGFcIikuY2xpY2soZnVuY3Rpb24oZSl7XG4gICAgICAgIGUucHJldmVudERlZmF1bHQoKTtcbiAgICAgICAgdmFyIHBhdGggPSBsb2NhdGlvbi5wYXRobmFtZS5zcGxpdCgnLycpO1xuICAgICAgICBpZihwYXRoLmxlbmd0aCAhPT0gNSl7XG4gICAgICAgICAgICBsb2NhdGlvbi5wYXRobmFtZSA9IFJPT1QgKyAnLycgKyAkKHRoaXMpLmF0dHIoXCJocmVmXCIpO1xuICAgICAgICB9ZWxzZXtcbiAgICAgICAgICAgIGxvY2F0aW9uLnBhdGhuYW1lID0gUk9PVCArICcvJyArICQodGhpcykuYXR0cihcImhyZWZcIikgKyAnLycgKyBwYXRoWzRdO1xuICAgICAgICB9XG4gICAgfSk7XG5cbiAgICAkKFwiI29yZGVyYnkgbGkgYVwiKS5jbGljayhmdW5jdGlvbihlKXtcbiAgICAgICAgZS5wcmV2ZW50RGVmYXVsdCgpO1xuICAgICAgICB2YXIgcGF0aCA9IGxvY2F0aW9uLnBhdGhuYW1lLnNwbGl0KCcvJyk7XG4gICAgICAgIGlmKHBhdGgubGVuZ3RoICE9PSA1KXtcbiAgICAgICAgICAgIGxvY2F0aW9uLnBhdGhuYW1lID0gUk9PVCArICcvZGVzYy8nICsgJCh0aGlzKS5hdHRyKFwiaHJlZlwiKTtcbiAgICAgICAgfWVsc2V7XG4gICAgICAgICAgICBsb2NhdGlvbi5wYXRobmFtZSA9IFJPT1QgKyAnLycgKyBwYXRoWzNdICsgJy8nICsgJCh0aGlzKS5hdHRyKFwiaHJlZlwiKTtcbiAgICAgICAgfVxuICAgIH0pO1xuXG4gICAgZnVuY3Rpb24gcmVhZFVSTChpbnB1dCkge1xuICAgICAgICBpZiAoaW5wdXQuZmlsZXMgJiYgaW5wdXQuZmlsZXNbMF0pIHtcbiAgICAgICAgICAgIHZhciByZWFkZXIgPSBuZXcgRmlsZVJlYWRlcigpO1xuICAgICAgICAgICAgcmVhZGVyLm9ubG9hZCA9IGZ1bmN0aW9uIChlKSB7XG4gICAgICAgICAgICAgICAgJCgnI3ByZXZpZXcnKS5hdHRyKCdzcmMnLCBlLnRhcmdldC5yZXN1bHQpO1xuICAgICAgICAgICAgfTtcbiAgICAgICAgICAgIHJlYWRlci5yZWFkQXNEYXRhVVJMKGlucHV0LmZpbGVzWzBdKTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgICQoXCIjaW1hZ2VcIikuY2hhbmdlKGZ1bmN0aW9uKCl7XG4gICAgICAgIHJlYWRVUkwodGhpcyk7XG4gICAgfSk7XG5cbiAgICBtb2RhbC5maW5kKFwiLnNhdmUtY2hhbmdlc1wiKS5jbGljayhmdW5jdGlvbihlKXtcbiAgICAgICAgZS5wcmV2ZW50RGVmYXVsdCgpO1xuICAgICAgICByZXF1ZXN0T3B0aW9ucy5kYXRhID0gbmV3IEZvcm1EYXRhKGZvcm0uZ2V0KDApKTtcbiAgICAgICAgJC5hamF4KFVSTFVwZGF0ZUl0ZW0sIHJlcXVlc3RPcHRpb25zKTtcbiAgICB9KTtcblxuICAgIC8vTmV3IEl0ZW1cblxuICAgICQoXCIubmV3LWl0ZW1cIikub24oXCJjbGlja1wiLCBmdW5jdGlvbigpe1xuICAgICAgICBVUkxVcGRhdGVJdGVtID0gZm9ybS5hdHRyKCdkYXRhLWFkZCcpO1xuICAgICAgICBtb2RhbC5maW5kKFwiLm1vZGFsLXRpdGxlIHNwYW5cIikudGV4dChcIk5ldyBpdGVtXCIpO1xuICAgICAgICBmb3JtLmdldCgwKS5yZXNldCgpO1xuICAgICAgICBtb2RhbC5maW5kKFwiI3ByZXZpZXdcIikuYXR0cignc3JjJywgXCJcIik7XG4gICAgICAgIG1vZGFsLmZpbmQoXCIjZGF0ZVwiKS5nZXQoMCkudmFsdWVBc0RhdGUgPSBuZXcgRGF0ZSgpO1xuICAgICAgICBtb2RhbC5maW5kKFwiLmRlbGV0ZS11c2VyXCIpLmhpZGUoKTtcbiAgICAgICAgbW9kYWwuZmluZChcIi5zYXZlLWNoYW5nZXNcIikudGV4dChcIkFkZFwiKTtcbiAgICAgICAgbW9kYWwubW9kYWwoJ3Nob3cnKTtcbiAgICB9KTtcblxuXG4gICAgXG59KTsiXSwiZmlsZSI6Im5ld3NhbGwuanMiLCJzb3VyY2VSb290IjoiL3NvdXJjZS8ifQ==
