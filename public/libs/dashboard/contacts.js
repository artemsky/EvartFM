$(function(){
    "use strict";
   $("form").submit(function(e){
       e.preventDefault();
       var data = {};
       $('input').each(function(i, obj){
           data[$(obj).attr("id")] = $.trim($(obj).val());
       });
       $.ajax($(this).attr("action"), {
           type: "POST",
           headers: {
               'X-CSRF-TOKEN': $('meta[name="csrf-token"]').attr('content')
           },
           error: function(response){
               var w = window.open('', ':Error Message', 'menubar=no, location=no');
               w.document.write(response.responseText);
           },
           success: function (a) {
               console.log(a);
               $.notify('Successfully saved', "success");
           },
           data: {data : data}
       })
   });
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiIiwic291cmNlcyI6WyJkYXNoYm9hcmQvY29udGFjdHMuanMiXSwic291cmNlc0NvbnRlbnQiOlsiJChmdW5jdGlvbigpe1xyXG4gICAgXCJ1c2Ugc3RyaWN0XCI7XHJcbiAgICQoXCJmb3JtXCIpLnN1Ym1pdChmdW5jdGlvbihlKXtcclxuICAgICAgIGUucHJldmVudERlZmF1bHQoKTtcclxuICAgICAgIHZhciBkYXRhID0ge307XHJcbiAgICAgICAkKCdpbnB1dCcpLmVhY2goZnVuY3Rpb24oaSwgb2JqKXtcclxuICAgICAgICAgICBkYXRhWyQob2JqKS5hdHRyKFwiaWRcIildID0gJC50cmltKCQob2JqKS52YWwoKSk7XHJcbiAgICAgICB9KTtcclxuICAgICAgICQuYWpheCgkKHRoaXMpLmF0dHIoXCJhY3Rpb25cIiksIHtcclxuICAgICAgICAgICB0eXBlOiBcIlBPU1RcIixcclxuICAgICAgICAgICBoZWFkZXJzOiB7XHJcbiAgICAgICAgICAgICAgICdYLUNTUkYtVE9LRU4nOiAkKCdtZXRhW25hbWU9XCJjc3JmLXRva2VuXCJdJykuYXR0cignY29udGVudCcpXHJcbiAgICAgICAgICAgfSxcclxuICAgICAgICAgICBlcnJvcjogZnVuY3Rpb24ocmVzcG9uc2Upe1xyXG4gICAgICAgICAgICAgICB2YXIgdyA9IHdpbmRvdy5vcGVuKCcnLCAnOkVycm9yIE1lc3NhZ2UnLCAnbWVudWJhcj1ubywgbG9jYXRpb249bm8nKTtcclxuICAgICAgICAgICAgICAgdy5kb2N1bWVudC53cml0ZShyZXNwb25zZS5yZXNwb25zZVRleHQpO1xyXG4gICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgc3VjY2VzczogZnVuY3Rpb24gKGEpIHtcclxuICAgICAgICAgICAgICAgY29uc29sZS5sb2coYSk7XHJcbiAgICAgICAgICAgICAgICQubm90aWZ5KCdTdWNjZXNzZnVsbHkgc2F2ZWQnLCBcInN1Y2Nlc3NcIik7XHJcbiAgICAgICAgICAgfSxcclxuICAgICAgICAgICBkYXRhOiB7ZGF0YSA6IGRhdGF9XHJcbiAgICAgICB9KVxyXG4gICB9KTtcclxufSk7Il0sImZpbGUiOiJkYXNoYm9hcmQvY29udGFjdHMuanMiLCJzb3VyY2VSb290IjoiL3NvdXJjZS8ifQ==
