$(function(){
    "use strict";

    var form = $("form"),
        tooltipOptions = {
            placement: "top",
            trigger: "manual"
        },
        onError = function(response){
            button.addClass("login-error");
            $("#password").val("");
            $("#password_confirmation").val("");
            if(response.status === 406){
                if(Object.keys(response.responseJSON).length > 0){
                    for(var key in response.responseJSON){
                        tooltipOptions.title = response.responseJSON[key][0];
                        $("#"+key).tooltip(tooltipOptions).tooltip('show');
                    }
                }
            }
        },
        onSuccess = function(response){
            button.addClass("login-success");
            alert(response.msg);
        };

    var url = 'register',
        button = form.find('button:submit'),
        requestOptions = {
            type: "POST",
            cache: false,
            success: onSuccess,
            error: onError
        };


    $("#login, #password, .title").on("shown.bs.tooltip", function(){
        var $that = $(this);
        setTimeout(function(){
            button.removeClass("login-error");
            button.blur();
            $that.tooltip('destroy');
        }, 5000)
    });


    button.click(function(e){
        e.preventDefault();
        requestOptions.data = form.serialize();
        $.ajax(url, requestOptions);
    });
});