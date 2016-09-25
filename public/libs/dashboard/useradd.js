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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiIiwic291cmNlcyI6WyJkYXNoYm9hcmQvdXNlcmFkZC5qcyJdLCJzb3VyY2VzQ29udGVudCI6WyIkKGZ1bmN0aW9uKCl7XHJcbiAgICBcInVzZSBzdHJpY3RcIjtcclxuXHJcbiAgICB2YXIgZm9ybSA9ICQoXCJmb3JtXCIpLFxyXG4gICAgICAgIHRvb2x0aXBPcHRpb25zID0ge1xyXG4gICAgICAgICAgICBwbGFjZW1lbnQ6IFwidG9wXCIsXHJcbiAgICAgICAgICAgIHRyaWdnZXI6IFwibWFudWFsXCJcclxuICAgICAgICB9LFxyXG4gICAgICAgIG9uRXJyb3IgPSBmdW5jdGlvbihyZXNwb25zZSl7XHJcbiAgICAgICAgICAgIGJ1dHRvbi5hZGRDbGFzcyhcImxvZ2luLWVycm9yXCIpO1xyXG4gICAgICAgICAgICAkKFwiI3Bhc3N3b3JkXCIpLnZhbChcIlwiKTtcclxuICAgICAgICAgICAgJChcIiNwYXNzd29yZF9jb25maXJtYXRpb25cIikudmFsKFwiXCIpO1xyXG4gICAgICAgICAgICBpZihyZXNwb25zZS5zdGF0dXMgPT09IDQwNil7XHJcbiAgICAgICAgICAgICAgICBpZihPYmplY3Qua2V5cyhyZXNwb25zZS5yZXNwb25zZUpTT04pLmxlbmd0aCA+IDApe1xyXG4gICAgICAgICAgICAgICAgICAgIGZvcih2YXIga2V5IGluIHJlc3BvbnNlLnJlc3BvbnNlSlNPTil7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHRvb2x0aXBPcHRpb25zLnRpdGxlID0gcmVzcG9uc2UucmVzcG9uc2VKU09OW2tleV1bMF07XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICQoXCIjXCIra2V5KS50b29sdGlwKHRvb2x0aXBPcHRpb25zKS50b29sdGlwKCdzaG93Jyk7XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfSxcclxuICAgICAgICBvblN1Y2Nlc3MgPSBmdW5jdGlvbihyZXNwb25zZSl7XHJcbiAgICAgICAgICAgIGJ1dHRvbi5hZGRDbGFzcyhcImxvZ2luLXN1Y2Nlc3NcIik7XHJcbiAgICAgICAgICAgIGFsZXJ0KHJlc3BvbnNlLm1zZyk7XHJcbiAgICAgICAgfTtcclxuXHJcbiAgICB2YXIgdXJsID0gJ3JlZ2lzdGVyJyxcclxuICAgICAgICBidXR0b24gPSBmb3JtLmZpbmQoJ2J1dHRvbjpzdWJtaXQnKSxcclxuICAgICAgICByZXF1ZXN0T3B0aW9ucyA9IHtcclxuICAgICAgICAgICAgdHlwZTogXCJQT1NUXCIsXHJcbiAgICAgICAgICAgIGNhY2hlOiBmYWxzZSxcclxuICAgICAgICAgICAgc3VjY2Vzczogb25TdWNjZXNzLFxyXG4gICAgICAgICAgICBlcnJvcjogb25FcnJvclxyXG4gICAgICAgIH07XHJcblxyXG5cclxuICAgICQoXCIjbG9naW4sICNwYXNzd29yZCwgLnRpdGxlXCIpLm9uKFwic2hvd24uYnMudG9vbHRpcFwiLCBmdW5jdGlvbigpe1xyXG4gICAgICAgIHZhciAkdGhhdCA9ICQodGhpcyk7XHJcbiAgICAgICAgc2V0VGltZW91dChmdW5jdGlvbigpe1xyXG4gICAgICAgICAgICBidXR0b24ucmVtb3ZlQ2xhc3MoXCJsb2dpbi1lcnJvclwiKTtcclxuICAgICAgICAgICAgYnV0dG9uLmJsdXIoKTtcclxuICAgICAgICAgICAgJHRoYXQudG9vbHRpcCgnZGVzdHJveScpO1xyXG4gICAgICAgIH0sIDUwMDApXHJcbiAgICB9KTtcclxuXHJcblxyXG4gICAgYnV0dG9uLmNsaWNrKGZ1bmN0aW9uKGUpe1xyXG4gICAgICAgIGUucHJldmVudERlZmF1bHQoKTtcclxuICAgICAgICByZXF1ZXN0T3B0aW9ucy5kYXRhID0gZm9ybS5zZXJpYWxpemUoKTtcclxuICAgICAgICAkLmFqYXgodXJsLCByZXF1ZXN0T3B0aW9ucyk7XHJcbiAgICB9KTtcclxufSk7Il0sImZpbGUiOiJkYXNoYm9hcmQvdXNlcmFkZC5qcyIsInNvdXJjZVJvb3QiOiIvc291cmNlLyJ9
