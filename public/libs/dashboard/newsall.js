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

    $(".delete-item").on("click", function(){
        var id = modal.find("#id").val();
        $.ajax($(this).attr('data-url'), {
            type: "DELETE",
            data: {id: id },
            headers: {
                'X-CSRF-TOKEN': $('meta[name="csrf-token"]').attr('content')
            },
            success: function(){
                $('[data-id="'+id+'"]').parent().remove();
                modal.modal('hide');
            }
        });
    });


    
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiIiwic291cmNlcyI6WyJkYXNoYm9hcmQvbmV3c2FsbC5qcyJdLCJzb3VyY2VzQ29udGVudCI6WyIkKGZ1bmN0aW9uKCl7XG4gICAgXCJ1c2Ugc3RyaWN0XCI7XG5cbiAgICB2YXIgUk9PVCA9ICcvZGFzaGJvYXJkL25ld3MnO1xuICAgIHZhciBvbkVkaXRFcnJvciA9IGZ1bmN0aW9uKHJlc3BvbnNlKXtcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKHJlc3BvbnNlKTtcbiAgICAgICAgICAgIGlmKHJlc3BvbnNlLnN0YXR1cyA9PT0gNDA2KXtcbiAgICAgICAgICAgICAgICB2YXIgcmVzdWx0ID0gJyc7XG4gICAgICAgICAgICAgICAgZm9yKHZhciBpIGluIHJlc3BvbnNlLnJlc3BvbnNlSlNPTilcbiAgICAgICAgICAgICAgICAgICAgcmVzdWx0ICs9IHJlc3BvbnNlLnJlc3BvbnNlSlNPTltpXSArICdcXG4nO1xuICAgICAgICAgICAgICAgIGFsZXJ0KHJlc3VsdCk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBlbHNle1xuICAgICAgICAgICAgICAgICQoXCJib2R5XCIpLmFwcGVuZChyZXNwb25zZS5yZXNwb25zZVRleHQpXG4gICAgICAgICAgICB9XG4gICAgICAgIH0sXG4gICAgICAgIG9uRWRpdFN1Y2Nlc3MgPSBmdW5jdGlvbihyZXNwb25zZSl7XG4gICAgICAgICAgICBjb25zb2xlLmxvZyhyZXNwb25zZSk7XG4gICAgICAgICAgICBtb2RhbC5maW5kKFwiLnNhdmUtY2hhbmdlc1wiKS5hZGRDbGFzcygnYnRuLXN1Y2Nlc3MnKTtcbiAgICAgICAgICAgIHNldFRpbWVvdXQoZnVuY3Rpb24oKXtcbiAgICAgICAgICAgICAgICBtb2RhbC5maW5kKFwiLnNhdmUtY2hhbmdlc1wiKS5yZW1vdmVDbGFzcygnYnRuLXN1Y2Nlc3MnKTtcbiAgICAgICAgICAgICAgICBtb2RhbC5tb2RhbCgnaGlkZScpO1xuICAgICAgICAgICAgfSwgMTAwMCk7XG5cbiAgICAgICAgfTtcblxuICAgIHZhciBtb2RhbCA9ICQoXCIjbW9kYWxcIik7XG4gICAgdmFyIFVSTFVwZGF0ZUl0ZW0gPSAnJztcbiAgICB2YXIgZm9ybSA9IG1vZGFsLmZpbmQoJ2Zvcm0nKTtcbiAgICB2YXIgcmVxdWVzdE9wdGlvbnMgPSB7XG4gICAgICAgIHR5cGU6IFwiUE9TVFwiLFxuICAgICAgICBjYWNoZTogZmFsc2UsXG4gICAgICAgIHByb2Nlc3NEYXRhOiBmYWxzZSxcbiAgICAgICAgY29udGVudFR5cGU6IGZhbHNlLFxuICAgICAgICBoZWFkZXJzOiB7XG4gICAgICAgICAgICAnWC1DU1JGLVRPS0VOJzogJCgnbWV0YVtuYW1lPVwiY3NyZi10b2tlblwiXScpLmF0dHIoJ2NvbnRlbnQnKVxuICAgICAgICB9LFxuICAgICAgICBzdWNjZXNzOiBvbkVkaXRTdWNjZXNzLFxuICAgICAgICBlcnJvcjogb25FZGl0RXJyb3JcbiAgICB9O1xuICAgICQoXCJhcnRpY2xlXCIpLm9uKFwiY2xpY2tcIiwgZnVuY3Rpb24oKXtcbiAgICAgICAgVVJMVXBkYXRlSXRlbSA9IGZvcm0uYXR0cignZGF0YS11cGRhdGUnKTtcbiAgICAgICAgdmFyICR0aGlzID0gJCh0aGlzKTtcbiAgICAgICAgbW9kYWwuZmluZChcIi5tb2RhbC10aXRsZSBzcGFuXCIpLnRleHQoJHRoaXMuYXR0cihcImRhdGEtaWRcIikpO1xuICAgICAgICBtb2RhbC5maW5kKFwiI2lkXCIpLnZhbCgkdGhpcy5hdHRyKFwiZGF0YS1pZFwiKSk7XG4gICAgICAgIG1vZGFsLmZpbmQoXCIjbG9uZ1wiKS52YWwoJHRoaXMuZmluZChcIi50aXRsZV9sb25nXCIpLnRleHQoKSk7XG4gICAgICAgIG1vZGFsLmZpbmQoXCIjc2hvcnRcIikudmFsKCR0aGlzLmZpbmQoXCIudGl0bGVfc2hvcnRcIikudGV4dCgpKTtcbiAgICAgICAgbW9kYWwuZmluZChcIiNhcnRpY2xlXCIpLnZhbCgkdGhpcy5maW5kKFwiLmFydGljbGVcIikudGV4dCgpKTtcbiAgICAgICAgbW9kYWwuZmluZChcIiNwcmV2aWV3XCIpLmF0dHIoJ3NyYycsICR0aGlzLmNzcygnYmFja2dyb3VuZC1pbWFnZScpLnJlcGxhY2UoJ3VybChcIicsJycpLnJlcGxhY2UoJ1wiKScsJycpKTtcblxuXG4gICAgICAgIG1vZGFsLmZpbmQoXCIuZGVsZXRlLXVzZXJcIikuc2hvdygpO1xuICAgICAgICBtb2RhbC5maW5kKFwiLnNhdmUtY2hhbmdlc1wiKS50ZXh0KFwiU2F2ZSBjaGFuZ2VzXCIpO1xuXG4gICAgICAgIG1vZGFsLm1vZGFsKCdzaG93Jyk7XG4gICAgfSk7XG5cbiAgICAkKFwiI3NvcnRieSBsaSBhXCIpLmNsaWNrKGZ1bmN0aW9uKGUpe1xuICAgICAgICBlLnByZXZlbnREZWZhdWx0KCk7XG4gICAgICAgIHZhciBwYXRoID0gbG9jYXRpb24ucGF0aG5hbWUuc3BsaXQoJy8nKTtcbiAgICAgICAgaWYocGF0aC5sZW5ndGggIT09IDUpe1xuICAgICAgICAgICAgbG9jYXRpb24ucGF0aG5hbWUgPSBST09UICsgJy8nICsgJCh0aGlzKS5hdHRyKFwiaHJlZlwiKTtcbiAgICAgICAgfWVsc2V7XG4gICAgICAgICAgICBsb2NhdGlvbi5wYXRobmFtZSA9IFJPT1QgKyAnLycgKyAkKHRoaXMpLmF0dHIoXCJocmVmXCIpICsgJy8nICsgcGF0aFs0XTtcbiAgICAgICAgfVxuICAgIH0pO1xuXG4gICAgJChcIiNvcmRlcmJ5IGxpIGFcIikuY2xpY2soZnVuY3Rpb24oZSl7XG4gICAgICAgIGUucHJldmVudERlZmF1bHQoKTtcbiAgICAgICAgdmFyIHBhdGggPSBsb2NhdGlvbi5wYXRobmFtZS5zcGxpdCgnLycpO1xuICAgICAgICBpZihwYXRoLmxlbmd0aCAhPT0gNSl7XG4gICAgICAgICAgICBsb2NhdGlvbi5wYXRobmFtZSA9IFJPT1QgKyAnL2Rlc2MvJyArICQodGhpcykuYXR0cihcImhyZWZcIik7XG4gICAgICAgIH1lbHNle1xuICAgICAgICAgICAgbG9jYXRpb24ucGF0aG5hbWUgPSBST09UICsgJy8nICsgcGF0aFszXSArICcvJyArICQodGhpcykuYXR0cihcImhyZWZcIik7XG4gICAgICAgIH1cbiAgICB9KTtcblxuICAgIGZ1bmN0aW9uIHJlYWRVUkwoaW5wdXQpIHtcbiAgICAgICAgaWYgKGlucHV0LmZpbGVzICYmIGlucHV0LmZpbGVzWzBdKSB7XG4gICAgICAgICAgICB2YXIgcmVhZGVyID0gbmV3IEZpbGVSZWFkZXIoKTtcbiAgICAgICAgICAgIHJlYWRlci5vbmxvYWQgPSBmdW5jdGlvbiAoZSkge1xuICAgICAgICAgICAgICAgICQoJyNwcmV2aWV3JykuYXR0cignc3JjJywgZS50YXJnZXQucmVzdWx0KTtcbiAgICAgICAgICAgIH07XG4gICAgICAgICAgICByZWFkZXIucmVhZEFzRGF0YVVSTChpbnB1dC5maWxlc1swXSk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICAkKFwiI2ltYWdlXCIpLmNoYW5nZShmdW5jdGlvbigpe1xuICAgICAgICByZWFkVVJMKHRoaXMpO1xuICAgIH0pO1xuXG4gICAgbW9kYWwuZmluZChcIi5zYXZlLWNoYW5nZXNcIikuY2xpY2soZnVuY3Rpb24oZSl7XG4gICAgICAgIGUucHJldmVudERlZmF1bHQoKTtcbiAgICAgICAgcmVxdWVzdE9wdGlvbnMuZGF0YSA9IG5ldyBGb3JtRGF0YShmb3JtLmdldCgwKSk7XG4gICAgICAgICQuYWpheChVUkxVcGRhdGVJdGVtLCByZXF1ZXN0T3B0aW9ucyk7XG4gICAgfSk7XG5cbiAgICAvL05ldyBJdGVtXG5cbiAgICAkKFwiLm5ldy1pdGVtXCIpLm9uKFwiY2xpY2tcIiwgZnVuY3Rpb24oKXtcbiAgICAgICAgVVJMVXBkYXRlSXRlbSA9IGZvcm0uYXR0cignZGF0YS1hZGQnKTtcbiAgICAgICAgbW9kYWwuZmluZChcIi5tb2RhbC10aXRsZSBzcGFuXCIpLnRleHQoXCJOZXcgaXRlbVwiKTtcbiAgICAgICAgZm9ybS5nZXQoMCkucmVzZXQoKTtcbiAgICAgICAgbW9kYWwuZmluZChcIiNwcmV2aWV3XCIpLmF0dHIoJ3NyYycsIFwiXCIpO1xuICAgICAgICBtb2RhbC5maW5kKFwiI2RhdGVcIikuZ2V0KDApLnZhbHVlQXNEYXRlID0gbmV3IERhdGUoKTtcbiAgICAgICAgbW9kYWwuZmluZChcIi5kZWxldGUtdXNlclwiKS5oaWRlKCk7XG4gICAgICAgIG1vZGFsLmZpbmQoXCIuc2F2ZS1jaGFuZ2VzXCIpLnRleHQoXCJBZGRcIik7XG4gICAgICAgIG1vZGFsLm1vZGFsKCdzaG93Jyk7XG4gICAgfSk7XG5cbiAgICAkKFwiLmRlbGV0ZS1pdGVtXCIpLm9uKFwiY2xpY2tcIiwgZnVuY3Rpb24oKXtcbiAgICAgICAgdmFyIGlkID0gbW9kYWwuZmluZChcIiNpZFwiKS52YWwoKTtcbiAgICAgICAgJC5hamF4KCQodGhpcykuYXR0cignZGF0YS11cmwnKSwge1xuICAgICAgICAgICAgdHlwZTogXCJERUxFVEVcIixcbiAgICAgICAgICAgIGRhdGE6IHtpZDogaWQgfSxcbiAgICAgICAgICAgIGhlYWRlcnM6IHtcbiAgICAgICAgICAgICAgICAnWC1DU1JGLVRPS0VOJzogJCgnbWV0YVtuYW1lPVwiY3NyZi10b2tlblwiXScpLmF0dHIoJ2NvbnRlbnQnKVxuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIHN1Y2Nlc3M6IGZ1bmN0aW9uKCl7XG4gICAgICAgICAgICAgICAgJCgnW2RhdGEtaWQ9XCInK2lkKydcIl0nKS5wYXJlbnQoKS5yZW1vdmUoKTtcbiAgICAgICAgICAgICAgICBtb2RhbC5tb2RhbCgnaGlkZScpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICB9KTtcblxuXG4gICAgXG59KTsiXSwiZmlsZSI6ImRhc2hib2FyZC9uZXdzYWxsLmpzIiwic291cmNlUm9vdCI6Ii9zb3VyY2UvIn0=
