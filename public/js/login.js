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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiIiwic291cmNlcyI6WyJsb2dpbi5qcyJdLCJzb3VyY2VzQ29udGVudCI6WyIkKGZ1bmN0aW9uKCl7XG4gICAgXCJ1c2Ugc3RyaWN0XCI7XG5cbiAgICB2YXIgZm9ybSA9ICQoXCJmb3JtXCIpLFxuICAgICAgICB0b29sdGlwT3B0aW9ucyA9IHtcbiAgICAgICAgICAgIHBsYWNlbWVudDogXCJib3R0b21cIixcbiAgICAgICAgICAgIHRyaWdnZXI6IFwibWFudWFsXCJcbiAgICAgICAgfSxcbiAgICAgICAgb25FcnJvciA9IGZ1bmN0aW9uKHJlc3BvbnNlKXtcbiAgICAgICAgICAgIGJ1dHRvbi5hZGRDbGFzcyhcImxvZ2luLWVycm9yXCIpO1xuICAgICAgICAgICAgJChcIiNwYXNzd29yZFwiKS52YWwoXCJcIik7XG4gICAgICAgICAgICBpZihyZXNwb25zZS5zdGF0dXMgPT09IDQwNil7XG4gICAgICAgICAgICAgICAgaWYoT2JqZWN0LmtleXMocmVzcG9uc2UucmVzcG9uc2VKU09OKS5sZW5ndGggPiAwKXtcbiAgICAgICAgICAgICAgICAgICAgZm9yKHZhciBrZXkgaW4gcmVzcG9uc2UucmVzcG9uc2VKU09OKXtcbiAgICAgICAgICAgICAgICAgICAgICAgIHRvb2x0aXBPcHRpb25zLnRpdGxlID0gcmVzcG9uc2UucmVzcG9uc2VKU09OW2tleV1bMF07XG4gICAgICAgICAgICAgICAgICAgICAgICAkKFwiI1wiK2tleSkudG9vbHRpcCh0b29sdGlwT3B0aW9ucykudG9vbHRpcCgnc2hvdycpO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaWYocmVzcG9uc2Uuc3RhdHVzID09PSA0MjIpe1xuICAgICAgICAgICAgICAgIGlmKE9iamVjdC5rZXlzKHJlc3BvbnNlLnJlc3BvbnNlSlNPTikubGVuZ3RoID4gMCl7XG4gICAgICAgICAgICAgICAgICAgIHRvb2x0aXBPcHRpb25zLnBsYWNlbWVudCA9ICd0b3AnO1xuICAgICAgICAgICAgICAgICAgICB0b29sdGlwT3B0aW9ucy50aXRsZSA9IHJlc3BvbnNlLnJlc3BvbnNlSlNPTi5tc2c7XG4gICAgICAgICAgICAgICAgICAgICQoJy50aXRsZScpLnRvb2x0aXAodG9vbHRpcE9wdGlvbnMpLnRvb2x0aXAoJ3Nob3cnKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpZihyZXNwb25zZS5zdGF0dXMgPT09IDQyOSl7XG4gICAgICAgICAgICAgICAgdG9vbHRpcE9wdGlvbnMucGxhY2VtZW50ID0gJ3RvcCc7XG4gICAgICAgICAgICAgICAgdG9vbHRpcE9wdGlvbnMudGl0bGUgPSByZXNwb25zZS5yZXNwb25zZVRleHQ7XG4gICAgICAgICAgICAgICAgJCgnLnRpdGxlJykudG9vbHRpcCh0b29sdGlwT3B0aW9ucykudG9vbHRpcCgnc2hvdycpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9LFxuICAgICAgICBvblN1Y2Nlc3MgPSBmdW5jdGlvbihyZXNwb25zZSl7XG4gICAgICAgICAgICBidXR0b24uYWRkQ2xhc3MoXCJsb2dpbi1zdWNjZXNzXCIpO1xuICAgICAgICAgICAgbG9jYXRpb24uaHJlZiA9IHJlc3BvbnNlLnJlZGlyZWN0O1xuICAgICAgICB9O1xuXG4gICAgdmFyIHVybCA9ICcvbG9naW4nLFxuICAgICAgICBidXR0b24gPSBmb3JtLmZpbmQoJ2J1dHRvbjpzdWJtaXQnKSxcbiAgICAgICAgcmVxdWVzdE9wdGlvbnMgPSB7XG4gICAgICAgICAgICB0eXBlOiBcIlBPU1RcIixcbiAgICAgICAgICAgIGNhY2hlOiBmYWxzZSxcbiAgICAgICAgICAgIHN1Y2Nlc3M6IG9uU3VjY2VzcyxcbiAgICAgICAgICAgIGVycm9yOiBvbkVycm9yXG4gICAgICAgIH07XG5cblxuICAgICQoXCIjbG9naW4sICNwYXNzd29yZCwgLnRpdGxlXCIpLm9uKFwic2hvd24uYnMudG9vbHRpcFwiLCBmdW5jdGlvbigpe1xuICAgICAgICB2YXIgJHRoYXQgPSAkKHRoaXMpO1xuICAgICAgICBzZXRUaW1lb3V0KGZ1bmN0aW9uKCl7XG4gICAgICAgICAgICBidXR0b24ucmVtb3ZlQ2xhc3MoXCJsb2dpbi1lcnJvclwiKTtcbiAgICAgICAgICAgIGJ1dHRvbi5ibHVyKCk7XG4gICAgICAgICAgICAkdGhhdC50b29sdGlwKCdoaWRlJyk7XG4gICAgICAgIH0sIDUwMDApXG4gICAgfSk7XG5cblxuICAgIGJ1dHRvbi5jbGljayhmdW5jdGlvbihlKXtcbiAgICAgICAgZS5wcmV2ZW50RGVmYXVsdCgpO1xuICAgICAgICByZXF1ZXN0T3B0aW9ucy5kYXRhID0gZm9ybS5zZXJpYWxpemUoKTtcbiAgICAgICAgJC5hamF4KHVybCwgcmVxdWVzdE9wdGlvbnMpO1xuICAgIH0pO1xuXG59KTsiXSwiZmlsZSI6ImxvZ2luLmpzIiwic291cmNlUm9vdCI6Ii9zb3VyY2UvIn0=
