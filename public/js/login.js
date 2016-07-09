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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiIiwic291cmNlcyI6WyJsb2dpbi5qcyJdLCJzb3VyY2VzQ29udGVudCI6WyIkKGZ1bmN0aW9uKCl7XHJcbiAgICBcInVzZSBzdHJpY3RcIjtcclxuXHJcbiAgICB2YXIgZm9ybSA9ICQoXCJmb3JtXCIpLFxyXG4gICAgICAgIHRvb2x0aXBPcHRpb25zID0ge1xyXG4gICAgICAgICAgICBwbGFjZW1lbnQ6IFwiYm90dG9tXCIsXHJcbiAgICAgICAgICAgIHRyaWdnZXI6IFwibWFudWFsXCJcclxuICAgICAgICB9LFxyXG4gICAgICAgIG9uRXJyb3IgPSBmdW5jdGlvbihyZXNwb25zZSl7XHJcbiAgICAgICAgICAgIGJ1dHRvbi5hZGRDbGFzcyhcImxvZ2luLWVycm9yXCIpO1xyXG4gICAgICAgICAgICAkKFwiI3Bhc3N3b3JkXCIpLnZhbChcIlwiKTtcclxuICAgICAgICAgICAgaWYocmVzcG9uc2Uuc3RhdHVzID09PSA0MDYpe1xyXG4gICAgICAgICAgICAgICAgaWYoT2JqZWN0LmtleXMocmVzcG9uc2UucmVzcG9uc2VKU09OKS5sZW5ndGggPiAwKXtcclxuICAgICAgICAgICAgICAgICAgICBmb3IodmFyIGtleSBpbiByZXNwb25zZS5yZXNwb25zZUpTT04pe1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB0b29sdGlwT3B0aW9ucy50aXRsZSA9IHJlc3BvbnNlLnJlc3BvbnNlSlNPTltrZXldWzBdO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAkKFwiI1wiK2tleSkudG9vbHRpcCh0b29sdGlwT3B0aW9ucykudG9vbHRpcCgnc2hvdycpO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBpZihyZXNwb25zZS5zdGF0dXMgPT09IDQyMil7XHJcbiAgICAgICAgICAgICAgICBpZihPYmplY3Qua2V5cyhyZXNwb25zZS5yZXNwb25zZUpTT04pLmxlbmd0aCA+IDApe1xyXG4gICAgICAgICAgICAgICAgICAgIHRvb2x0aXBPcHRpb25zLnBsYWNlbWVudCA9ICd0b3AnO1xyXG4gICAgICAgICAgICAgICAgICAgIHRvb2x0aXBPcHRpb25zLnRpdGxlID0gcmVzcG9uc2UucmVzcG9uc2VKU09OLm1zZztcclxuICAgICAgICAgICAgICAgICAgICAkKCcudGl0bGUnKS50b29sdGlwKHRvb2x0aXBPcHRpb25zKS50b29sdGlwKCdzaG93Jyk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9LFxyXG4gICAgICAgIG9uU3VjY2VzcyA9IGZ1bmN0aW9uKHJlc3BvbnNlKXtcclxuICAgICAgICAgICAgYnV0dG9uLmFkZENsYXNzKFwibG9naW4tc3VjY2Vzc1wiKTtcclxuICAgICAgICAgICAgbG9jYXRpb24uaHJlZiA9IHJlc3BvbnNlLnJlZGlyZWN0O1xyXG4gICAgICAgIH07XHJcblxyXG4gICAgdmFyIHVybCA9ICcvbG9naW4nLFxyXG4gICAgICAgIGJ1dHRvbiA9IGZvcm0uZmluZCgnYnV0dG9uOnN1Ym1pdCcpLFxyXG4gICAgICAgIHJlcXVlc3RPcHRpb25zID0ge1xyXG4gICAgICAgICAgICB0eXBlOiBcIlBPU1RcIixcclxuICAgICAgICAgICAgY2FjaGU6IGZhbHNlLFxyXG4gICAgICAgICAgICBzdWNjZXNzOiBvblN1Y2Nlc3MsXHJcbiAgICAgICAgICAgIGVycm9yOiBvbkVycm9yXHJcbiAgICAgICAgfTtcclxuXHJcblxyXG4gICAgJChcIiNsb2dpbiwgI3Bhc3N3b3JkLCAudGl0bGVcIikub24oXCJzaG93bi5icy50b29sdGlwXCIsIGZ1bmN0aW9uKCl7XHJcbiAgICAgICAgdmFyICR0aGF0ID0gJCh0aGlzKTtcclxuICAgICAgICBzZXRUaW1lb3V0KGZ1bmN0aW9uKCl7XHJcbiAgICAgICAgICAgIGJ1dHRvbi5yZW1vdmVDbGFzcyhcImxvZ2luLWVycm9yXCIpO1xyXG4gICAgICAgICAgICBidXR0b24uYmx1cigpO1xyXG4gICAgICAgICAgICAkdGhhdC50b29sdGlwKCdoaWRlJyk7XHJcbiAgICAgICAgfSwgNTAwMClcclxuICAgIH0pO1xyXG5cclxuXHJcbiAgICBidXR0b24uY2xpY2soZnVuY3Rpb24oZSl7XHJcbiAgICAgICAgZS5wcmV2ZW50RGVmYXVsdCgpO1xyXG4gICAgICAgIHJlcXVlc3RPcHRpb25zLmRhdGEgPSBmb3JtLnNlcmlhbGl6ZSgpO1xyXG4gICAgICAgICQuYWpheCh1cmwsIHJlcXVlc3RPcHRpb25zKTtcclxuICAgIH0pO1xyXG5cclxufSk7Il0sImZpbGUiOiJsb2dpbi5qcyIsInNvdXJjZVJvb3QiOiIvc291cmNlLyJ9
