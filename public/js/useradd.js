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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiIiwic291cmNlcyI6WyJ1c2VyYWRkLmpzIl0sInNvdXJjZXNDb250ZW50IjpbIiQoZnVuY3Rpb24oKXtcbiAgICBcInVzZSBzdHJpY3RcIjtcblxuICAgIHZhciBmb3JtID0gJChcImZvcm1cIiksXG4gICAgICAgIHRvb2x0aXBPcHRpb25zID0ge1xuICAgICAgICAgICAgcGxhY2VtZW50OiBcInRvcFwiLFxuICAgICAgICAgICAgdHJpZ2dlcjogXCJtYW51YWxcIlxuICAgICAgICB9LFxuICAgICAgICBvbkVycm9yID0gZnVuY3Rpb24ocmVzcG9uc2Upe1xuICAgICAgICAgICAgYnV0dG9uLmFkZENsYXNzKFwibG9naW4tZXJyb3JcIik7XG4gICAgICAgICAgICAkKFwiI3Bhc3N3b3JkXCIpLnZhbChcIlwiKTtcbiAgICAgICAgICAgICQoXCIjcGFzc3dvcmRfY29uZmlybWF0aW9uXCIpLnZhbChcIlwiKTtcbiAgICAgICAgICAgIGlmKHJlc3BvbnNlLnN0YXR1cyA9PT0gNDA2KXtcbiAgICAgICAgICAgICAgICBpZihPYmplY3Qua2V5cyhyZXNwb25zZS5yZXNwb25zZUpTT04pLmxlbmd0aCA+IDApe1xuICAgICAgICAgICAgICAgICAgICBmb3IodmFyIGtleSBpbiByZXNwb25zZS5yZXNwb25zZUpTT04pe1xuICAgICAgICAgICAgICAgICAgICAgICAgdG9vbHRpcE9wdGlvbnMudGl0bGUgPSByZXNwb25zZS5yZXNwb25zZUpTT05ba2V5XVswXTtcbiAgICAgICAgICAgICAgICAgICAgICAgICQoXCIjXCIra2V5KS50b29sdGlwKHRvb2x0aXBPcHRpb25zKS50b29sdGlwKCdzaG93Jyk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH0sXG4gICAgICAgIG9uU3VjY2VzcyA9IGZ1bmN0aW9uKHJlc3BvbnNlKXtcbiAgICAgICAgICAgIGJ1dHRvbi5hZGRDbGFzcyhcImxvZ2luLXN1Y2Nlc3NcIik7XG4gICAgICAgICAgICBhbGVydChyZXNwb25zZS5tc2cpO1xuICAgICAgICB9O1xuXG4gICAgdmFyIHVybCA9ICdyZWdpc3RlcicsXG4gICAgICAgIGJ1dHRvbiA9IGZvcm0uZmluZCgnYnV0dG9uOnN1Ym1pdCcpLFxuICAgICAgICByZXF1ZXN0T3B0aW9ucyA9IHtcbiAgICAgICAgICAgIHR5cGU6IFwiUE9TVFwiLFxuICAgICAgICAgICAgY2FjaGU6IGZhbHNlLFxuICAgICAgICAgICAgc3VjY2Vzczogb25TdWNjZXNzLFxuICAgICAgICAgICAgZXJyb3I6IG9uRXJyb3JcbiAgICAgICAgfTtcblxuXG4gICAgJChcIiNsb2dpbiwgI3Bhc3N3b3JkLCAudGl0bGVcIikub24oXCJzaG93bi5icy50b29sdGlwXCIsIGZ1bmN0aW9uKCl7XG4gICAgICAgIHZhciAkdGhhdCA9ICQodGhpcyk7XG4gICAgICAgIHNldFRpbWVvdXQoZnVuY3Rpb24oKXtcbiAgICAgICAgICAgIGJ1dHRvbi5yZW1vdmVDbGFzcyhcImxvZ2luLWVycm9yXCIpO1xuICAgICAgICAgICAgYnV0dG9uLmJsdXIoKTtcbiAgICAgICAgICAgICR0aGF0LnRvb2x0aXAoJ2Rlc3Ryb3knKTtcbiAgICAgICAgfSwgNTAwMClcbiAgICB9KTtcblxuXG4gICAgYnV0dG9uLmNsaWNrKGZ1bmN0aW9uKGUpe1xuICAgICAgICBlLnByZXZlbnREZWZhdWx0KCk7XG4gICAgICAgIHJlcXVlc3RPcHRpb25zLmRhdGEgPSBmb3JtLnNlcmlhbGl6ZSgpO1xuICAgICAgICAkLmFqYXgodXJsLCByZXF1ZXN0T3B0aW9ucyk7XG4gICAgfSk7XG59KTsiXSwiZmlsZSI6InVzZXJhZGQuanMiLCJzb3VyY2VSb290IjoiL3NvdXJjZS8ifQ==
