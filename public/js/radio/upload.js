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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiIiwic291cmNlcyI6WyJyYWRpby91cGxvYWQuanMiXSwic291cmNlc0NvbnRlbnQiOlsiJChmdW5jdGlvbigpe1xyXG4gICAgXCJ1c2Ugc3RyaWN0XCI7XHJcblxyXG4gICAgRHJvcHpvbmUub3B0aW9ucy5kcm9wem9uZSA9IHtcclxuICAgICAgICBwYXJhbU5hbWU6IFwiZmlsZVwiLCAvLyBUaGUgbmFtZSB0aGF0IHdpbGwgYmUgdXNlZCB0byB0cmFuc2ZlciB0aGUgZmlsZVxyXG4gICAgICAgIG1heEZpbGVzaXplOiAzMDAsIC8vIE1CXHJcbiAgICAgICAgaGVhZGVyczoge1xyXG4gICAgICAgICAgICAnWC1DU1JGLVRPS0VOJzogJCgnbWV0YVtuYW1lPVwiY3NyZi10b2tlblwiXScpLmF0dHIoJ2NvbnRlbnQnKVxyXG4gICAgICAgIH1cclxuICAgIH07XHJcbn0pOyJdLCJmaWxlIjoicmFkaW8vdXBsb2FkLmpzIiwic291cmNlUm9vdCI6Ii9zb3VyY2UvIn0=
