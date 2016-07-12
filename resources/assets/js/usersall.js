$(function () {

    var mainTable = $(".table-striped tbody"),
        subTable = $(".modal table tr"),
        modal = $("#edit");


    modal.on('hide.bs.modal', function(){
        modal.find("table p").show();
        modal.find("table .form-group").hide();
    });

    var onError = function(response){
        if(response.status === 406)
           console.log(response.responseJSON.Uid);
        },
        onSuccess = function(response){
            for(var i in response)
                subTable.find(".user_"+i+" p").text(response[i]);
            modal.modal('show');
            $(".save-changes").prop("disabled", true);
            modal.find(".form-group input, select").one("change keypress", function(){
                $(".save-changes").prop("disabled", false)
            });
        };
    
    var URLGetAllUsers = 'user/edit',
        requestOptions = {
            type: "POST",
            cache: false,
            success: onSuccess,
            error: onError,
            headers: {
                'X-CSRF-TOKEN': $('meta[name="csrf-token"]').attr('content')
            }
        };
    var current = null;
    mainTable.on("click", "tr", function(){
        current = $(this);
        var id = parseInt($(this).find("td:first").text());
        requestOptions.success = onSuccess;
        requestOptions.error = onError;
        requestOptions.data = {
            Uid: id
        };
        $.ajax(URLGetAllUsers, requestOptions)
    });

    subTable.find("td:odd").each(function(i,obj){
        var password = false;
        if($(obj).hasClass("user_id")) return;
        else if($(obj).hasClass("user_password")){
            var input = $(obj).find("input");
            input.first().on("keypress", function(){
                input.last().val("");
            });
            password = true;
        }
            
        $(obj).on("click", "p", function(){
            var p = $(this);
            var fg = $(this).parent().find(".form-group");
            if(!password) fg.find("input").val(p.text());
            p.slideUp();
            fg.slideDown()
                .focus();
        })

    });


    var onEditError = function(response){
            if(response.status === 406)
                console.log(response);
            var modalHead = modal.find(".modal-header");
            current.addClass("danger");
            modalHead.addClass("btn-danger");
            setTimeout(function () {
                modalHead.removeClass("btn-danger");
                current.removeClass("danger success");
            }, 3000)
        },
        onEditSuccess = function(response){
            modal.modal("hide");
            if(current){
                current.addClass("success");
                var td = current.find("td");
                td.eq(0).text(response.id);
                td.eq(1).text(response.login);
                td.eq(2).text(response.role);
                td.eq(3).text(response.name);
            }
        };

    var URLUpdateUser = "user/update";
    modal.find(".save-changes").click(function(e){
        e.preventDefault();
        var id = "id="+ modal.find(".user_id p").text() + "&";
        requestOptions.success = onEditSuccess;
        requestOptions.error = onEditError;
        requestOptions.data = id + modal.find("form :input").filter(function(index, element) {
            return $.trim($(element).val()).length > 0;
        }).serialize();
        if(requestOptions.data.length > 0)
            $.ajax(URLUpdateUser, requestOptions);
    });

    var URLDeleteUser = "user/delete",
        onDeleteSuccess = function(){
            current.remove();
            modal.modal('hide');
        };
    modal.find(".delete-user").on("click", function(e){
        e.preventDefault();
        var id = modal.find(".user_id p").text();

        requestOptions.success = onDeleteSuccess;
        requestOptions.error = onEditError;
        requestOptions.data = {
            "Uid": id
        };
        $.ajax(URLDeleteUser, requestOptions);
    })
    
});
