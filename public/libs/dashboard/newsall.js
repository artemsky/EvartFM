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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiIiwic291cmNlcyI6WyJkYXNoYm9hcmQvbmV3c2FsbC5qcyJdLCJzb3VyY2VzQ29udGVudCI6WyIkKGZ1bmN0aW9uKCl7XHJcbiAgICBcInVzZSBzdHJpY3RcIjtcclxuXHJcbiAgICB2YXIgUk9PVCA9ICcvZGFzaGJvYXJkL25ld3MnO1xyXG4gICAgdmFyIG9uRWRpdEVycm9yID0gZnVuY3Rpb24ocmVzcG9uc2Upe1xyXG4gICAgICAgICAgICBjb25zb2xlLmxvZyhyZXNwb25zZSk7XHJcbiAgICAgICAgICAgIGlmKHJlc3BvbnNlLnN0YXR1cyA9PT0gNDA2KXtcclxuICAgICAgICAgICAgICAgIHZhciByZXN1bHQgPSAnJztcclxuICAgICAgICAgICAgICAgIGZvcih2YXIgaSBpbiByZXNwb25zZS5yZXNwb25zZUpTT04pXHJcbiAgICAgICAgICAgICAgICAgICAgcmVzdWx0ICs9IHJlc3BvbnNlLnJlc3BvbnNlSlNPTltpXSArICdcXG4nO1xyXG4gICAgICAgICAgICAgICAgYWxlcnQocmVzdWx0KTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBlbHNle1xyXG4gICAgICAgICAgICAgICAgJChcImJvZHlcIikuYXBwZW5kKHJlc3BvbnNlLnJlc3BvbnNlVGV4dClcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH0sXHJcbiAgICAgICAgb25FZGl0U3VjY2VzcyA9IGZ1bmN0aW9uKHJlc3BvbnNlKXtcclxuICAgICAgICAgICAgY29uc29sZS5sb2cocmVzcG9uc2UpO1xyXG4gICAgICAgICAgICBtb2RhbC5maW5kKFwiLnNhdmUtY2hhbmdlc1wiKS5hZGRDbGFzcygnYnRuLXN1Y2Nlc3MnKTtcclxuICAgICAgICAgICAgc2V0VGltZW91dChmdW5jdGlvbigpe1xyXG4gICAgICAgICAgICAgICAgbW9kYWwuZmluZChcIi5zYXZlLWNoYW5nZXNcIikucmVtb3ZlQ2xhc3MoJ2J0bi1zdWNjZXNzJyk7XHJcbiAgICAgICAgICAgICAgICBtb2RhbC5tb2RhbCgnaGlkZScpO1xyXG4gICAgICAgICAgICB9LCAxMDAwKTtcclxuXHJcbiAgICAgICAgfTtcclxuXHJcbiAgICB2YXIgbW9kYWwgPSAkKFwiI21vZGFsXCIpO1xyXG4gICAgdmFyIFVSTFVwZGF0ZUl0ZW0gPSAnJztcclxuICAgIHZhciBmb3JtID0gbW9kYWwuZmluZCgnZm9ybScpO1xyXG4gICAgdmFyIHJlcXVlc3RPcHRpb25zID0ge1xyXG4gICAgICAgIHR5cGU6IFwiUE9TVFwiLFxyXG4gICAgICAgIGNhY2hlOiBmYWxzZSxcclxuICAgICAgICBwcm9jZXNzRGF0YTogZmFsc2UsXHJcbiAgICAgICAgY29udGVudFR5cGU6IGZhbHNlLFxyXG4gICAgICAgIGhlYWRlcnM6IHtcclxuICAgICAgICAgICAgJ1gtQ1NSRi1UT0tFTic6ICQoJ21ldGFbbmFtZT1cImNzcmYtdG9rZW5cIl0nKS5hdHRyKCdjb250ZW50JylcclxuICAgICAgICB9LFxyXG4gICAgICAgIHN1Y2Nlc3M6IG9uRWRpdFN1Y2Nlc3MsXHJcbiAgICAgICAgZXJyb3I6IG9uRWRpdEVycm9yXHJcbiAgICB9O1xyXG4gICAgJChcImFydGljbGVcIikub24oXCJjbGlja1wiLCBmdW5jdGlvbigpe1xyXG4gICAgICAgIFVSTFVwZGF0ZUl0ZW0gPSBmb3JtLmF0dHIoJ2RhdGEtdXBkYXRlJyk7XHJcbiAgICAgICAgdmFyICR0aGlzID0gJCh0aGlzKTtcclxuICAgICAgICBtb2RhbC5maW5kKFwiLm1vZGFsLXRpdGxlIHNwYW5cIikudGV4dCgkdGhpcy5hdHRyKFwiZGF0YS1pZFwiKSk7XHJcbiAgICAgICAgbW9kYWwuZmluZChcIiNpZFwiKS52YWwoJHRoaXMuYXR0cihcImRhdGEtaWRcIikpO1xyXG4gICAgICAgIG1vZGFsLmZpbmQoXCIjbG9uZ1wiKS52YWwoJHRoaXMuZmluZChcIi50aXRsZV9sb25nXCIpLnRleHQoKSk7XHJcbiAgICAgICAgbW9kYWwuZmluZChcIiNzaG9ydFwiKS52YWwoJHRoaXMuZmluZChcIi50aXRsZV9zaG9ydFwiKS50ZXh0KCkpO1xyXG4gICAgICAgIG1vZGFsLmZpbmQoXCIjYXJ0aWNsZVwiKS52YWwoJHRoaXMuZmluZChcIi5hcnRpY2xlXCIpLnRleHQoKSk7XHJcbiAgICAgICAgbW9kYWwuZmluZChcIiNwcmV2aWV3XCIpLmF0dHIoJ3NyYycsICR0aGlzLmNzcygnYmFja2dyb3VuZC1pbWFnZScpLnJlcGxhY2UoJ3VybChcIicsJycpLnJlcGxhY2UoJ1wiKScsJycpKTtcclxuXHJcblxyXG4gICAgICAgIG1vZGFsLmZpbmQoXCIuZGVsZXRlLXVzZXJcIikuc2hvdygpO1xyXG4gICAgICAgIG1vZGFsLmZpbmQoXCIuc2F2ZS1jaGFuZ2VzXCIpLnRleHQoXCJTYXZlIGNoYW5nZXNcIik7XHJcblxyXG4gICAgICAgIG1vZGFsLm1vZGFsKCdzaG93Jyk7XHJcbiAgICB9KTtcclxuXHJcbiAgICAkKFwiI3NvcnRieSBsaSBhXCIpLmNsaWNrKGZ1bmN0aW9uKGUpe1xyXG4gICAgICAgIGUucHJldmVudERlZmF1bHQoKTtcclxuICAgICAgICB2YXIgcGF0aCA9IGxvY2F0aW9uLnBhdGhuYW1lLnNwbGl0KCcvJyk7XHJcbiAgICAgICAgaWYocGF0aC5sZW5ndGggIT09IDUpe1xyXG4gICAgICAgICAgICBsb2NhdGlvbi5wYXRobmFtZSA9IFJPT1QgKyAnLycgKyAkKHRoaXMpLmF0dHIoXCJocmVmXCIpO1xyXG4gICAgICAgIH1lbHNle1xyXG4gICAgICAgICAgICBsb2NhdGlvbi5wYXRobmFtZSA9IFJPT1QgKyAnLycgKyAkKHRoaXMpLmF0dHIoXCJocmVmXCIpICsgJy8nICsgcGF0aFs0XTtcclxuICAgICAgICB9XHJcbiAgICB9KTtcclxuXHJcbiAgICAkKFwiI29yZGVyYnkgbGkgYVwiKS5jbGljayhmdW5jdGlvbihlKXtcclxuICAgICAgICBlLnByZXZlbnREZWZhdWx0KCk7XHJcbiAgICAgICAgdmFyIHBhdGggPSBsb2NhdGlvbi5wYXRobmFtZS5zcGxpdCgnLycpO1xyXG4gICAgICAgIGlmKHBhdGgubGVuZ3RoICE9PSA1KXtcclxuICAgICAgICAgICAgbG9jYXRpb24ucGF0aG5hbWUgPSBST09UICsgJy9kZXNjLycgKyAkKHRoaXMpLmF0dHIoXCJocmVmXCIpO1xyXG4gICAgICAgIH1lbHNle1xyXG4gICAgICAgICAgICBsb2NhdGlvbi5wYXRobmFtZSA9IFJPT1QgKyAnLycgKyBwYXRoWzNdICsgJy8nICsgJCh0aGlzKS5hdHRyKFwiaHJlZlwiKTtcclxuICAgICAgICB9XHJcbiAgICB9KTtcclxuXHJcbiAgICBmdW5jdGlvbiByZWFkVVJMKGlucHV0KSB7XHJcbiAgICAgICAgaWYgKGlucHV0LmZpbGVzICYmIGlucHV0LmZpbGVzWzBdKSB7XHJcbiAgICAgICAgICAgIHZhciByZWFkZXIgPSBuZXcgRmlsZVJlYWRlcigpO1xyXG4gICAgICAgICAgICByZWFkZXIub25sb2FkID0gZnVuY3Rpb24gKGUpIHtcclxuICAgICAgICAgICAgICAgICQoJyNwcmV2aWV3JykuYXR0cignc3JjJywgZS50YXJnZXQucmVzdWx0KTtcclxuICAgICAgICAgICAgfTtcclxuICAgICAgICAgICAgcmVhZGVyLnJlYWRBc0RhdGFVUkwoaW5wdXQuZmlsZXNbMF0pO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICAkKFwiI2ltYWdlXCIpLmNoYW5nZShmdW5jdGlvbigpe1xyXG4gICAgICAgIHJlYWRVUkwodGhpcyk7XHJcbiAgICB9KTtcclxuXHJcbiAgICBtb2RhbC5maW5kKFwiLnNhdmUtY2hhbmdlc1wiKS5jbGljayhmdW5jdGlvbihlKXtcclxuICAgICAgICBlLnByZXZlbnREZWZhdWx0KCk7XHJcbiAgICAgICAgcmVxdWVzdE9wdGlvbnMuZGF0YSA9IG5ldyBGb3JtRGF0YShmb3JtLmdldCgwKSk7XHJcbiAgICAgICAgJC5hamF4KFVSTFVwZGF0ZUl0ZW0sIHJlcXVlc3RPcHRpb25zKTtcclxuICAgIH0pO1xyXG5cclxuICAgIC8vTmV3IEl0ZW1cclxuXHJcbiAgICAkKFwiLm5ldy1pdGVtXCIpLm9uKFwiY2xpY2tcIiwgZnVuY3Rpb24oKXtcclxuICAgICAgICBVUkxVcGRhdGVJdGVtID0gZm9ybS5hdHRyKCdkYXRhLWFkZCcpO1xyXG4gICAgICAgIG1vZGFsLmZpbmQoXCIubW9kYWwtdGl0bGUgc3BhblwiKS50ZXh0KFwiTmV3IGl0ZW1cIik7XHJcbiAgICAgICAgZm9ybS5nZXQoMCkucmVzZXQoKTtcclxuICAgICAgICBtb2RhbC5maW5kKFwiI3ByZXZpZXdcIikuYXR0cignc3JjJywgXCJcIik7XHJcbiAgICAgICAgbW9kYWwuZmluZChcIiNkYXRlXCIpLmdldCgwKS52YWx1ZUFzRGF0ZSA9IG5ldyBEYXRlKCk7XHJcbiAgICAgICAgbW9kYWwuZmluZChcIi5kZWxldGUtdXNlclwiKS5oaWRlKCk7XHJcbiAgICAgICAgbW9kYWwuZmluZChcIi5zYXZlLWNoYW5nZXNcIikudGV4dChcIkFkZFwiKTtcclxuICAgICAgICBtb2RhbC5tb2RhbCgnc2hvdycpO1xyXG4gICAgfSk7XHJcblxyXG5cclxuICAgIFxyXG59KTsiXSwiZmlsZSI6ImRhc2hib2FyZC9uZXdzYWxsLmpzIiwic291cmNlUm9vdCI6Ii9zb3VyY2UvIn0=
