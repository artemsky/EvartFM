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
        console.log(requestOptions);
        $.ajax(url, requestOptions);
    });
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiIiwic291cmNlcyI6WyJ1c2VyYWRkLmpzIl0sInNvdXJjZXNDb250ZW50IjpbIiQoZnVuY3Rpb24oKXtcclxuICAgIFwidXNlIHN0cmljdFwiO1xyXG5cclxuICAgIHZhciBmb3JtID0gJChcImZvcm1cIiksXHJcbiAgICAgICAgdG9vbHRpcE9wdGlvbnMgPSB7XHJcbiAgICAgICAgICAgIHBsYWNlbWVudDogXCJ0b3BcIixcclxuICAgICAgICAgICAgdHJpZ2dlcjogXCJtYW51YWxcIlxyXG4gICAgICAgIH0sXHJcbiAgICAgICAgb25FcnJvciA9IGZ1bmN0aW9uKHJlc3BvbnNlKXtcclxuICAgICAgICAgICAgYnV0dG9uLmFkZENsYXNzKFwibG9naW4tZXJyb3JcIik7XHJcbiAgICAgICAgICAgICQoXCIjcGFzc3dvcmRcIikudmFsKFwiXCIpO1xyXG4gICAgICAgICAgICAkKFwiI3Bhc3N3b3JkX2NvbmZpcm1hdGlvblwiKS52YWwoXCJcIik7XHJcbiAgICAgICAgICAgIGlmKHJlc3BvbnNlLnN0YXR1cyA9PT0gNDA2KXtcclxuICAgICAgICAgICAgICAgIGlmKE9iamVjdC5rZXlzKHJlc3BvbnNlLnJlc3BvbnNlSlNPTikubGVuZ3RoID4gMCl7XHJcbiAgICAgICAgICAgICAgICAgICAgZm9yKHZhciBrZXkgaW4gcmVzcG9uc2UucmVzcG9uc2VKU09OKXtcclxuICAgICAgICAgICAgICAgICAgICAgICAgdG9vbHRpcE9wdGlvbnMudGl0bGUgPSByZXNwb25zZS5yZXNwb25zZUpTT05ba2V5XVswXTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgJChcIiNcIitrZXkpLnRvb2x0aXAodG9vbHRpcE9wdGlvbnMpLnRvb2x0aXAoJ3Nob3cnKTtcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9LFxyXG4gICAgICAgIG9uU3VjY2VzcyA9IGZ1bmN0aW9uKHJlc3BvbnNlKXtcclxuICAgICAgICAgICAgYnV0dG9uLmFkZENsYXNzKFwibG9naW4tc3VjY2Vzc1wiKTtcclxuICAgICAgICAgICAgYWxlcnQocmVzcG9uc2UubXNnKTtcclxuICAgICAgICB9O1xyXG5cclxuICAgIHZhciB1cmwgPSAncmVnaXN0ZXInLFxyXG4gICAgICAgIGJ1dHRvbiA9IGZvcm0uZmluZCgnYnV0dG9uOnN1Ym1pdCcpLFxyXG4gICAgICAgIHJlcXVlc3RPcHRpb25zID0ge1xyXG4gICAgICAgICAgICB0eXBlOiBcIlBPU1RcIixcclxuICAgICAgICAgICAgY2FjaGU6IGZhbHNlLFxyXG4gICAgICAgICAgICBzdWNjZXNzOiBvblN1Y2Nlc3MsXHJcbiAgICAgICAgICAgIGVycm9yOiBvbkVycm9yXHJcbiAgICAgICAgfTtcclxuXHJcblxyXG4gICAgJChcIiNsb2dpbiwgI3Bhc3N3b3JkLCAudGl0bGVcIikub24oXCJzaG93bi5icy50b29sdGlwXCIsIGZ1bmN0aW9uKCl7XHJcbiAgICAgICAgdmFyICR0aGF0ID0gJCh0aGlzKTtcclxuICAgICAgICBzZXRUaW1lb3V0KGZ1bmN0aW9uKCl7XHJcbiAgICAgICAgICAgIGJ1dHRvbi5yZW1vdmVDbGFzcyhcImxvZ2luLWVycm9yXCIpO1xyXG4gICAgICAgICAgICBidXR0b24uYmx1cigpO1xyXG4gICAgICAgICAgICAkdGhhdC50b29sdGlwKCdkZXN0cm95Jyk7XHJcbiAgICAgICAgfSwgNTAwMClcclxuICAgIH0pO1xyXG5cclxuXHJcbiAgICBidXR0b24uY2xpY2soZnVuY3Rpb24oZSl7XHJcbiAgICAgICAgZS5wcmV2ZW50RGVmYXVsdCgpO1xyXG4gICAgICAgIHJlcXVlc3RPcHRpb25zLmRhdGEgPSBmb3JtLnNlcmlhbGl6ZSgpO1xyXG4gICAgICAgIGNvbnNvbGUubG9nKHJlcXVlc3RPcHRpb25zKTtcclxuICAgICAgICAkLmFqYXgodXJsLCByZXF1ZXN0T3B0aW9ucyk7XHJcbiAgICB9KTtcclxufSk7Il0sImZpbGUiOiJ1c2VyYWRkLmpzIiwic291cmNlUm9vdCI6Ii9zb3VyY2UvIn0=
