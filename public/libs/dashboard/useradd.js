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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiIiwic291cmNlcyI6WyJkYXNoYm9hcmQvdXNlcmFkZC5qcyJdLCJzb3VyY2VzQ29udGVudCI6WyIkKGZ1bmN0aW9uKCl7XG4gICAgXCJ1c2Ugc3RyaWN0XCI7XG5cbiAgICB2YXIgZm9ybSA9ICQoXCJmb3JtXCIpLFxuICAgICAgICB0b29sdGlwT3B0aW9ucyA9IHtcbiAgICAgICAgICAgIHBsYWNlbWVudDogXCJ0b3BcIixcbiAgICAgICAgICAgIHRyaWdnZXI6IFwibWFudWFsXCJcbiAgICAgICAgfSxcbiAgICAgICAgb25FcnJvciA9IGZ1bmN0aW9uKHJlc3BvbnNlKXtcbiAgICAgICAgICAgIGJ1dHRvbi5hZGRDbGFzcyhcImxvZ2luLWVycm9yXCIpO1xuICAgICAgICAgICAgJChcIiNwYXNzd29yZFwiKS52YWwoXCJcIik7XG4gICAgICAgICAgICAkKFwiI3Bhc3N3b3JkX2NvbmZpcm1hdGlvblwiKS52YWwoXCJcIik7XG4gICAgICAgICAgICBpZihyZXNwb25zZS5zdGF0dXMgPT09IDQwNil7XG4gICAgICAgICAgICAgICAgaWYoT2JqZWN0LmtleXMocmVzcG9uc2UucmVzcG9uc2VKU09OKS5sZW5ndGggPiAwKXtcbiAgICAgICAgICAgICAgICAgICAgZm9yKHZhciBrZXkgaW4gcmVzcG9uc2UucmVzcG9uc2VKU09OKXtcbiAgICAgICAgICAgICAgICAgICAgICAgIHRvb2x0aXBPcHRpb25zLnRpdGxlID0gcmVzcG9uc2UucmVzcG9uc2VKU09OW2tleV1bMF07XG4gICAgICAgICAgICAgICAgICAgICAgICAkKFwiI1wiK2tleSkudG9vbHRpcCh0b29sdGlwT3B0aW9ucykudG9vbHRpcCgnc2hvdycpO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9LFxuICAgICAgICBvblN1Y2Nlc3MgPSBmdW5jdGlvbihyZXNwb25zZSl7XG4gICAgICAgICAgICBidXR0b24uYWRkQ2xhc3MoXCJsb2dpbi1zdWNjZXNzXCIpO1xuICAgICAgICAgICAgYWxlcnQocmVzcG9uc2UubXNnKTtcbiAgICAgICAgfTtcblxuICAgIHZhciB1cmwgPSAncmVnaXN0ZXInLFxuICAgICAgICBidXR0b24gPSBmb3JtLmZpbmQoJ2J1dHRvbjpzdWJtaXQnKSxcbiAgICAgICAgcmVxdWVzdE9wdGlvbnMgPSB7XG4gICAgICAgICAgICB0eXBlOiBcIlBPU1RcIixcbiAgICAgICAgICAgIGNhY2hlOiBmYWxzZSxcbiAgICAgICAgICAgIHN1Y2Nlc3M6IG9uU3VjY2VzcyxcbiAgICAgICAgICAgIGVycm9yOiBvbkVycm9yXG4gICAgICAgIH07XG5cblxuICAgICQoXCIjbG9naW4sICNwYXNzd29yZCwgLnRpdGxlXCIpLm9uKFwic2hvd24uYnMudG9vbHRpcFwiLCBmdW5jdGlvbigpe1xuICAgICAgICB2YXIgJHRoYXQgPSAkKHRoaXMpO1xuICAgICAgICBzZXRUaW1lb3V0KGZ1bmN0aW9uKCl7XG4gICAgICAgICAgICBidXR0b24ucmVtb3ZlQ2xhc3MoXCJsb2dpbi1lcnJvclwiKTtcbiAgICAgICAgICAgIGJ1dHRvbi5ibHVyKCk7XG4gICAgICAgICAgICAkdGhhdC50b29sdGlwKCdkZXN0cm95Jyk7XG4gICAgICAgIH0sIDUwMDApXG4gICAgfSk7XG5cblxuICAgIGJ1dHRvbi5jbGljayhmdW5jdGlvbihlKXtcbiAgICAgICAgZS5wcmV2ZW50RGVmYXVsdCgpO1xuICAgICAgICByZXF1ZXN0T3B0aW9ucy5kYXRhID0gZm9ybS5zZXJpYWxpemUoKTtcbiAgICAgICAgJC5hamF4KHVybCwgcmVxdWVzdE9wdGlvbnMpO1xuICAgIH0pO1xufSk7Il0sImZpbGUiOiJkYXNoYm9hcmQvdXNlcmFkZC5qcyIsInNvdXJjZVJvb3QiOiIvc291cmNlLyJ9
