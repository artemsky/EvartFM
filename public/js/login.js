$(function(){
    "use strict";

    var onError = function(response){
        console.log("error", response);
    };
    var onSuccess = function(response){
        console.log("success", response);
    };

    var form = $("form");
    var url = '/login',
        options = {
            type: "POST",
            cache: false,
            success: onSuccess,
            error: onError
    };

    form.find('button:submit').click(function(e){
        e.preventDefault();
        options.data = form.serialize();
        $.ajax(url, options);
    });

});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiIiwic291cmNlcyI6WyJsb2dpbi5qcyJdLCJzb3VyY2VzQ29udGVudCI6WyIkKGZ1bmN0aW9uKCl7XHJcbiAgICBcInVzZSBzdHJpY3RcIjtcclxuXHJcbiAgICB2YXIgb25FcnJvciA9IGZ1bmN0aW9uKHJlc3BvbnNlKXtcclxuICAgICAgICBjb25zb2xlLmxvZyhcImVycm9yXCIsIHJlc3BvbnNlKTtcclxuICAgIH07XHJcbiAgICB2YXIgb25TdWNjZXNzID0gZnVuY3Rpb24ocmVzcG9uc2Upe1xyXG4gICAgICAgIGNvbnNvbGUubG9nKFwic3VjY2Vzc1wiLCByZXNwb25zZSk7XHJcbiAgICB9O1xyXG5cclxuICAgIHZhciBmb3JtID0gJChcImZvcm1cIik7XHJcbiAgICB2YXIgdXJsID0gJy9sb2dpbicsXHJcbiAgICAgICAgb3B0aW9ucyA9IHtcclxuICAgICAgICAgICAgdHlwZTogXCJQT1NUXCIsXHJcbiAgICAgICAgICAgIGNhY2hlOiBmYWxzZSxcclxuICAgICAgICAgICAgc3VjY2Vzczogb25TdWNjZXNzLFxyXG4gICAgICAgICAgICBlcnJvcjogb25FcnJvclxyXG4gICAgfTtcclxuXHJcbiAgICBmb3JtLmZpbmQoJ2J1dHRvbjpzdWJtaXQnKS5jbGljayhmdW5jdGlvbihlKXtcclxuICAgICAgICBlLnByZXZlbnREZWZhdWx0KCk7XHJcbiAgICAgICAgb3B0aW9ucy5kYXRhID0gZm9ybS5zZXJpYWxpemUoKTtcclxuICAgICAgICAkLmFqYXgodXJsLCBvcHRpb25zKTtcclxuICAgIH0pO1xyXG5cclxufSk7Il0sImZpbGUiOiJsb2dpbi5qcyIsInNvdXJjZVJvb3QiOiIvc291cmNlLyJ9
