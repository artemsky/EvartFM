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