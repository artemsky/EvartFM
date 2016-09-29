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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiIiwic291cmNlcyI6WyJkYXNoYm9hcmQvbG9naW4uanMiXSwic291cmNlc0NvbnRlbnQiOlsiJChmdW5jdGlvbigpe1xuICAgIFwidXNlIHN0cmljdFwiO1xuXG4gICAgdmFyIGZvcm0gPSAkKFwiZm9ybVwiKSxcbiAgICAgICAgdG9vbHRpcE9wdGlvbnMgPSB7XG4gICAgICAgICAgICBwbGFjZW1lbnQ6IFwiYm90dG9tXCIsXG4gICAgICAgICAgICB0cmlnZ2VyOiBcIm1hbnVhbFwiXG4gICAgICAgIH0sXG4gICAgICAgIG9uRXJyb3IgPSBmdW5jdGlvbihyZXNwb25zZSl7XG4gICAgICAgICAgICBidXR0b24uYWRkQ2xhc3MoXCJsb2dpbi1lcnJvclwiKTtcbiAgICAgICAgICAgICQoXCIjcGFzc3dvcmRcIikudmFsKFwiXCIpO1xuICAgICAgICAgICAgaWYocmVzcG9uc2Uuc3RhdHVzID09PSA0MDYpe1xuICAgICAgICAgICAgICAgIGlmKE9iamVjdC5rZXlzKHJlc3BvbnNlLnJlc3BvbnNlSlNPTikubGVuZ3RoID4gMCl7XG4gICAgICAgICAgICAgICAgICAgIGZvcih2YXIga2V5IGluIHJlc3BvbnNlLnJlc3BvbnNlSlNPTil7XG4gICAgICAgICAgICAgICAgICAgICAgICB0b29sdGlwT3B0aW9ucy50aXRsZSA9IHJlc3BvbnNlLnJlc3BvbnNlSlNPTltrZXldWzBdO1xuICAgICAgICAgICAgICAgICAgICAgICAgJChcIiNcIitrZXkpLnRvb2x0aXAodG9vbHRpcE9wdGlvbnMpLnRvb2x0aXAoJ3Nob3cnKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGlmKHJlc3BvbnNlLnN0YXR1cyA9PT0gNDIyKXtcbiAgICAgICAgICAgICAgICBpZihPYmplY3Qua2V5cyhyZXNwb25zZS5yZXNwb25zZUpTT04pLmxlbmd0aCA+IDApe1xuICAgICAgICAgICAgICAgICAgICB0b29sdGlwT3B0aW9ucy5wbGFjZW1lbnQgPSAndG9wJztcbiAgICAgICAgICAgICAgICAgICAgdG9vbHRpcE9wdGlvbnMudGl0bGUgPSByZXNwb25zZS5yZXNwb25zZUpTT04ubXNnO1xuICAgICAgICAgICAgICAgICAgICAkKCcudGl0bGUnKS50b29sdGlwKHRvb2x0aXBPcHRpb25zKS50b29sdGlwKCdzaG93Jyk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaWYocmVzcG9uc2Uuc3RhdHVzID09PSA0Mjkpe1xuICAgICAgICAgICAgICAgIHRvb2x0aXBPcHRpb25zLnBsYWNlbWVudCA9ICd0b3AnO1xuICAgICAgICAgICAgICAgIHRvb2x0aXBPcHRpb25zLnRpdGxlID0gcmVzcG9uc2UucmVzcG9uc2VUZXh0O1xuICAgICAgICAgICAgICAgICQoJy50aXRsZScpLnRvb2x0aXAodG9vbHRpcE9wdGlvbnMpLnRvb2x0aXAoJ3Nob3cnKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSxcbiAgICAgICAgb25TdWNjZXNzID0gZnVuY3Rpb24ocmVzcG9uc2Upe1xuICAgICAgICAgICAgYnV0dG9uLmFkZENsYXNzKFwibG9naW4tc3VjY2Vzc1wiKTtcbiAgICAgICAgICAgIGxvY2F0aW9uLmhyZWYgPSByZXNwb25zZS5yZWRpcmVjdDtcbiAgICAgICAgfTtcblxuICAgIHZhciB1cmwgPSAnL2xvZ2luJyxcbiAgICAgICAgYnV0dG9uID0gZm9ybS5maW5kKCdidXR0b246c3VibWl0JyksXG4gICAgICAgIHJlcXVlc3RPcHRpb25zID0ge1xuICAgICAgICAgICAgdHlwZTogXCJQT1NUXCIsXG4gICAgICAgICAgICBjYWNoZTogZmFsc2UsXG4gICAgICAgICAgICBzdWNjZXNzOiBvblN1Y2Nlc3MsXG4gICAgICAgICAgICBlcnJvcjogb25FcnJvclxuICAgICAgICB9O1xuXG5cbiAgICAkKFwiI2xvZ2luLCAjcGFzc3dvcmQsIC50aXRsZVwiKS5vbihcInNob3duLmJzLnRvb2x0aXBcIiwgZnVuY3Rpb24oKXtcbiAgICAgICAgdmFyICR0aGF0ID0gJCh0aGlzKTtcbiAgICAgICAgc2V0VGltZW91dChmdW5jdGlvbigpe1xuICAgICAgICAgICAgYnV0dG9uLnJlbW92ZUNsYXNzKFwibG9naW4tZXJyb3JcIik7XG4gICAgICAgICAgICBidXR0b24uYmx1cigpO1xuICAgICAgICAgICAgJHRoYXQudG9vbHRpcCgnaGlkZScpO1xuICAgICAgICB9LCA1MDAwKVxuICAgIH0pO1xuXG5cbiAgICBidXR0b24uY2xpY2soZnVuY3Rpb24oZSl7XG4gICAgICAgIGUucHJldmVudERlZmF1bHQoKTtcbiAgICAgICAgcmVxdWVzdE9wdGlvbnMuZGF0YSA9IGZvcm0uc2VyaWFsaXplKCk7XG4gICAgICAgICQuYWpheCh1cmwsIHJlcXVlc3RPcHRpb25zKTtcbiAgICB9KTtcblxufSk7Il0sImZpbGUiOiJkYXNoYm9hcmQvbG9naW4uanMiLCJzb3VyY2VSb290IjoiL3NvdXJjZS8ifQ==
