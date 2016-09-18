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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiIiwic291cmNlcyI6WyJyYWRpby91cGxvYWQuanMiXSwic291cmNlc0NvbnRlbnQiOlsiJChmdW5jdGlvbigpe1xyXG4gICAgXCJ1c2Ugc3RyaWN0XCI7XHJcbiAgICBEcm9wem9uZS5vcHRpb25zLmRyb3B6b25lID0ge1xyXG4gICAgICAgIHBhcmFtTmFtZTogXCJmaWxlXCIsIC8vIFRoZSBuYW1lIHRoYXQgd2lsbCBiZSB1c2VkIHRvIHRyYW5zZmVyIHRoZSBmaWxlXHJcbiAgICAgICAgbWF4RmlsZXNpemU6IDMwMCwgLy8gTUJcclxuICAgICAgICBoZWFkZXJzOiB7XHJcbiAgICAgICAgICAgICdYLUNTUkYtVE9LRU4nOiAkKCdtZXRhW25hbWU9XCJjc3JmLXRva2VuXCJdJykuYXR0cignY29udGVudCcpXHJcbiAgICAgICAgfVxyXG4gICAgfTtcclxufSk7Il0sImZpbGUiOiJyYWRpby91cGxvYWQuanMiLCJzb3VyY2VSb290IjoiL3NvdXJjZS8ifQ==
