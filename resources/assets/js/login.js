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