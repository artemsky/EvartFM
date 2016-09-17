$(function(){
    "use strict";

    Dropzone.options.dropzone = {
        paramName: "file", // The name that will be used to transfer the file
        maxFilesize: 300, // MB
        headers: {
            'X-CSRF-TOKEN': $('meta[name="csrf-token"]').attr('content')
        }
    };
});