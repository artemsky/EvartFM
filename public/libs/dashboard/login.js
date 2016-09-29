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
                tooltipOptions.placement = 'top';
                tooltipOptions.title = response.responseText;
                $('.title').tooltip(tooltipOptions).tooltip('show');
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiIiwic291cmNlcyI6WyJkYXNoYm9hcmQvbG9naW4uanMiXSwic291cmNlc0NvbnRlbnQiOlsiJChmdW5jdGlvbigpe1xyXG4gICAgXCJ1c2Ugc3RyaWN0XCI7XHJcblxyXG4gICAgdmFyIGZvcm0gPSAkKFwiZm9ybVwiKSxcclxuICAgICAgICB0b29sdGlwT3B0aW9ucyA9IHtcclxuICAgICAgICAgICAgcGxhY2VtZW50OiBcImJvdHRvbVwiLFxyXG4gICAgICAgICAgICB0cmlnZ2VyOiBcIm1hbnVhbFwiXHJcbiAgICAgICAgfSxcclxuICAgICAgICBvbkVycm9yID0gZnVuY3Rpb24ocmVzcG9uc2Upe1xyXG4gICAgICAgICAgICBidXR0b24uYWRkQ2xhc3MoXCJsb2dpbi1lcnJvclwiKTtcclxuICAgICAgICAgICAgJChcIiNwYXNzd29yZFwiKS52YWwoXCJcIik7XHJcbiAgICAgICAgICAgIGlmKHJlc3BvbnNlLnN0YXR1cyA9PT0gNDA2KXtcclxuICAgICAgICAgICAgICAgIGlmKE9iamVjdC5rZXlzKHJlc3BvbnNlLnJlc3BvbnNlSlNPTikubGVuZ3RoID4gMCl7XHJcbiAgICAgICAgICAgICAgICAgICAgZm9yKHZhciBrZXkgaW4gcmVzcG9uc2UucmVzcG9uc2VKU09OKXtcclxuICAgICAgICAgICAgICAgICAgICAgICAgdG9vbHRpcE9wdGlvbnMudGl0bGUgPSByZXNwb25zZS5yZXNwb25zZUpTT05ba2V5XVswXTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgJChcIiNcIitrZXkpLnRvb2x0aXAodG9vbHRpcE9wdGlvbnMpLnRvb2x0aXAoJ3Nob3cnKTtcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgaWYocmVzcG9uc2Uuc3RhdHVzID09PSA0MjIpe1xyXG4gICAgICAgICAgICAgICAgaWYoT2JqZWN0LmtleXMocmVzcG9uc2UucmVzcG9uc2VKU09OKS5sZW5ndGggPiAwKXtcclxuICAgICAgICAgICAgICAgICAgICB0b29sdGlwT3B0aW9ucy5wbGFjZW1lbnQgPSAndG9wJztcclxuICAgICAgICAgICAgICAgICAgICB0b29sdGlwT3B0aW9ucy50aXRsZSA9IHJlc3BvbnNlLnJlc3BvbnNlSlNPTi5tc2c7XHJcbiAgICAgICAgICAgICAgICAgICAgJCgnLnRpdGxlJykudG9vbHRpcCh0b29sdGlwT3B0aW9ucykudG9vbHRpcCgnc2hvdycpO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGlmKHJlc3BvbnNlLnN0YXR1cyA9PT0gNDI5KXtcclxuICAgICAgICAgICAgICAgIHRvb2x0aXBPcHRpb25zLnBsYWNlbWVudCA9ICd0b3AnO1xyXG4gICAgICAgICAgICAgICAgdG9vbHRpcE9wdGlvbnMudGl0bGUgPSByZXNwb25zZS5yZXNwb25zZVRleHQ7XHJcbiAgICAgICAgICAgICAgICAkKCcudGl0bGUnKS50b29sdGlwKHRvb2x0aXBPcHRpb25zKS50b29sdGlwKCdzaG93Jyk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9LFxyXG4gICAgICAgIG9uU3VjY2VzcyA9IGZ1bmN0aW9uKHJlc3BvbnNlKXtcclxuICAgICAgICAgICAgYnV0dG9uLmFkZENsYXNzKFwibG9naW4tc3VjY2Vzc1wiKTtcclxuICAgICAgICAgICAgbG9jYXRpb24uaHJlZiA9IHJlc3BvbnNlLnJlZGlyZWN0O1xyXG4gICAgICAgIH07XHJcblxyXG4gICAgdmFyIHVybCA9ICcvbG9naW4nLFxyXG4gICAgICAgIGJ1dHRvbiA9IGZvcm0uZmluZCgnYnV0dG9uOnN1Ym1pdCcpLFxyXG4gICAgICAgIHJlcXVlc3RPcHRpb25zID0ge1xyXG4gICAgICAgICAgICB0eXBlOiBcIlBPU1RcIixcclxuICAgICAgICAgICAgY2FjaGU6IGZhbHNlLFxyXG4gICAgICAgICAgICBzdWNjZXNzOiBvblN1Y2Nlc3MsXHJcbiAgICAgICAgICAgIGVycm9yOiBvbkVycm9yXHJcbiAgICAgICAgfTtcclxuXHJcblxyXG4gICAgJChcIiNsb2dpbiwgI3Bhc3N3b3JkLCAudGl0bGVcIikub24oXCJzaG93bi5icy50b29sdGlwXCIsIGZ1bmN0aW9uKCl7XHJcbiAgICAgICAgdmFyICR0aGF0ID0gJCh0aGlzKTtcclxuICAgICAgICBzZXRUaW1lb3V0KGZ1bmN0aW9uKCl7XHJcbiAgICAgICAgICAgIGJ1dHRvbi5yZW1vdmVDbGFzcyhcImxvZ2luLWVycm9yXCIpO1xyXG4gICAgICAgICAgICBidXR0b24uYmx1cigpO1xyXG4gICAgICAgICAgICAkdGhhdC50b29sdGlwKCdoaWRlJyk7XHJcbiAgICAgICAgfSwgNTAwMClcclxuICAgIH0pO1xyXG5cclxuXHJcbiAgICBidXR0b24uY2xpY2soZnVuY3Rpb24oZSl7XHJcbiAgICAgICAgZS5wcmV2ZW50RGVmYXVsdCgpO1xyXG4gICAgICAgIHJlcXVlc3RPcHRpb25zLmRhdGEgPSBmb3JtLnNlcmlhbGl6ZSgpO1xyXG4gICAgICAgICQuYWpheCh1cmwsIHJlcXVlc3RPcHRpb25zKTtcclxuICAgIH0pO1xyXG5cclxufSk7Il0sImZpbGUiOiJkYXNoYm9hcmQvbG9naW4uanMiLCJzb3VyY2VSb290IjoiL3NvdXJjZS8ifQ==
