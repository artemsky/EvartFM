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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiIiwic291cmNlcyI6WyJsb2dpbi5qcyJdLCJzb3VyY2VzQ29udGVudCI6WyIkKGZ1bmN0aW9uKCl7XHJcbiAgICBcInVzZSBzdHJpY3RcIjtcclxuXHJcbiAgICB2YXIgZm9ybSA9ICQoXCJmb3JtXCIpLFxyXG4gICAgICAgIHRvb2x0aXBPcHRpb25zID0ge1xyXG4gICAgICAgICAgICBwbGFjZW1lbnQ6IFwiYm90dG9tXCIsXHJcbiAgICAgICAgICAgIHRyaWdnZXI6IFwibWFudWFsXCJcclxuICAgICAgICB9LFxyXG4gICAgICAgIG9uRXJyb3IgPSBmdW5jdGlvbihyZXNwb25zZSl7XHJcbiAgICAgICAgICAgIGJ1dHRvbi5hZGRDbGFzcyhcImxvZ2luLWVycm9yXCIpO1xyXG4gICAgICAgICAgICAkKFwiI3Bhc3N3b3JkXCIpLnZhbChcIlwiKTtcclxuICAgICAgICAgICAgaWYocmVzcG9uc2Uuc3RhdHVzID09PSA0MDYpe1xyXG4gICAgICAgICAgICAgICAgaWYoT2JqZWN0LmtleXMocmVzcG9uc2UucmVzcG9uc2VKU09OKS5sZW5ndGggPiAwKXtcclxuICAgICAgICAgICAgICAgICAgICBmb3IodmFyIGtleSBpbiByZXNwb25zZS5yZXNwb25zZUpTT04pe1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB0b29sdGlwT3B0aW9ucy50aXRsZSA9IHJlc3BvbnNlLnJlc3BvbnNlSlNPTltrZXldWzBdO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAkKFwiI1wiK2tleSkudG9vbHRpcCh0b29sdGlwT3B0aW9ucykudG9vbHRpcCgnc2hvdycpO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBpZihyZXNwb25zZS5zdGF0dXMgPT09IDQyMil7XHJcbiAgICAgICAgICAgICAgICBpZihPYmplY3Qua2V5cyhyZXNwb25zZS5yZXNwb25zZUpTT04pLmxlbmd0aCA+IDApe1xyXG4gICAgICAgICAgICAgICAgICAgIHRvb2x0aXBPcHRpb25zLnBsYWNlbWVudCA9ICd0b3AnO1xyXG4gICAgICAgICAgICAgICAgICAgIHRvb2x0aXBPcHRpb25zLnRpdGxlID0gcmVzcG9uc2UucmVzcG9uc2VKU09OLm1zZztcclxuICAgICAgICAgICAgICAgICAgICAkKCcudGl0bGUnKS50b29sdGlwKHRvb2x0aXBPcHRpb25zKS50b29sdGlwKCdzaG93Jyk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgaWYocmVzcG9uc2Uuc3RhdHVzID09PSA0Mjkpe1xyXG4gICAgICAgICAgICAgICAgdG9vbHRpcE9wdGlvbnMucGxhY2VtZW50ID0gJ3RvcCc7XHJcbiAgICAgICAgICAgICAgICB0b29sdGlwT3B0aW9ucy50aXRsZSA9IHJlc3BvbnNlLnJlc3BvbnNlVGV4dDtcclxuICAgICAgICAgICAgICAgICQoJy50aXRsZScpLnRvb2x0aXAodG9vbHRpcE9wdGlvbnMpLnRvb2x0aXAoJ3Nob3cnKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH0sXHJcbiAgICAgICAgb25TdWNjZXNzID0gZnVuY3Rpb24ocmVzcG9uc2Upe1xyXG4gICAgICAgICAgICBidXR0b24uYWRkQ2xhc3MoXCJsb2dpbi1zdWNjZXNzXCIpO1xyXG4gICAgICAgICAgICBsb2NhdGlvbi5ocmVmID0gcmVzcG9uc2UucmVkaXJlY3Q7XHJcbiAgICAgICAgfTtcclxuXHJcbiAgICB2YXIgdXJsID0gJy9sb2dpbicsXHJcbiAgICAgICAgYnV0dG9uID0gZm9ybS5maW5kKCdidXR0b246c3VibWl0JyksXHJcbiAgICAgICAgcmVxdWVzdE9wdGlvbnMgPSB7XHJcbiAgICAgICAgICAgIHR5cGU6IFwiUE9TVFwiLFxyXG4gICAgICAgICAgICBjYWNoZTogZmFsc2UsXHJcbiAgICAgICAgICAgIHN1Y2Nlc3M6IG9uU3VjY2VzcyxcclxuICAgICAgICAgICAgZXJyb3I6IG9uRXJyb3JcclxuICAgICAgICB9O1xyXG5cclxuXHJcbiAgICAkKFwiI2xvZ2luLCAjcGFzc3dvcmQsIC50aXRsZVwiKS5vbihcInNob3duLmJzLnRvb2x0aXBcIiwgZnVuY3Rpb24oKXtcclxuICAgICAgICB2YXIgJHRoYXQgPSAkKHRoaXMpO1xyXG4gICAgICAgIHNldFRpbWVvdXQoZnVuY3Rpb24oKXtcclxuICAgICAgICAgICAgYnV0dG9uLnJlbW92ZUNsYXNzKFwibG9naW4tZXJyb3JcIik7XHJcbiAgICAgICAgICAgIGJ1dHRvbi5ibHVyKCk7XHJcbiAgICAgICAgICAgICR0aGF0LnRvb2x0aXAoJ2hpZGUnKTtcclxuICAgICAgICB9LCA1MDAwKVxyXG4gICAgfSk7XHJcblxyXG5cclxuICAgIGJ1dHRvbi5jbGljayhmdW5jdGlvbihlKXtcclxuICAgICAgICBlLnByZXZlbnREZWZhdWx0KCk7XHJcbiAgICAgICAgcmVxdWVzdE9wdGlvbnMuZGF0YSA9IGZvcm0uc2VyaWFsaXplKCk7XHJcbiAgICAgICAgJC5hamF4KHVybCwgcmVxdWVzdE9wdGlvbnMpO1xyXG4gICAgfSk7XHJcblxyXG59KTsiXSwiZmlsZSI6ImxvZ2luLmpzIiwic291cmNlUm9vdCI6Ii9zb3VyY2UvIn0=
