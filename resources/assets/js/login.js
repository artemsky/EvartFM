$(function(){
    "use strict";

    var form = $("form"),
        tooltipOptions = {
            placement: "bottom",
            trigger: "manual"
        },
        onError = function(response){
            button.addClass("login-error");
            $("#password").val("");
            if(response.status === 406){
                if(Object.keys(response.responseJSON).length > 0){
                    for(var key in response.responseJSON){
                        tooltipOptions.title = response.responseJSON[key][0];
                        $("#"+key).tooltip(tooltipOptions).tooltip('show');
                    }
                }
            }
            if(response.status === 422){
                if(Object.keys(response.responseJSON).length > 0){
                    tooltipOptions.placement = 'top';
                    tooltipOptions.title = response.responseJSON.msg;
                    $('.title').tooltip(tooltipOptions).tooltip('show');
                }
            }
            if(response.status === 429){
                console.log(response)
            }
        },
        onSuccess = function(response){
            button.addClass("login-success");
            location.href = response.redirect;
        };

    var url = '/login',
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
            $that.tooltip('hide');
        }, 5000)
    });


    button.click(function(e){
        e.preventDefault();
        requestOptions.data = form.serialize();
        $.ajax(url, requestOptions);
    });

});