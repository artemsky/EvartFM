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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiIiwic291cmNlcyI6WyJkYXNoYm9hcmQvY29udGFjdHMuanMiXSwic291cmNlc0NvbnRlbnQiOlsiJChmdW5jdGlvbigpe1xuICAgIFwidXNlIHN0cmljdFwiO1xuICAgJChcImZvcm1cIikuc3VibWl0KGZ1bmN0aW9uKGUpe1xuICAgICAgIGUucHJldmVudERlZmF1bHQoKTtcbiAgICAgICB2YXIgZGF0YSA9IHt9O1xuICAgICAgICQoJ2lucHV0JykuZWFjaChmdW5jdGlvbihpLCBvYmope1xuICAgICAgICAgICBkYXRhWyQob2JqKS5hdHRyKFwiaWRcIildID0gJC50cmltKCQob2JqKS52YWwoKSk7XG4gICAgICAgfSk7XG4gICAgICAgJC5hamF4KCQodGhpcykuYXR0cihcImFjdGlvblwiKSwge1xuICAgICAgICAgICB0eXBlOiBcIlBPU1RcIixcbiAgICAgICAgICAgaGVhZGVyczoge1xuICAgICAgICAgICAgICAgJ1gtQ1NSRi1UT0tFTic6ICQoJ21ldGFbbmFtZT1cImNzcmYtdG9rZW5cIl0nKS5hdHRyKCdjb250ZW50JylcbiAgICAgICAgICAgfSxcbiAgICAgICAgICAgZXJyb3I6IGZ1bmN0aW9uKHJlc3BvbnNlKXtcbiAgICAgICAgICAgICAgIHZhciB3ID0gd2luZG93Lm9wZW4oJycsICc6RXJyb3IgTWVzc2FnZScsICdtZW51YmFyPW5vLCBsb2NhdGlvbj1ubycpO1xuICAgICAgICAgICAgICAgdy5kb2N1bWVudC53cml0ZShyZXNwb25zZS5yZXNwb25zZVRleHQpO1xuICAgICAgICAgICB9LFxuICAgICAgICAgICBzdWNjZXNzOiBmdW5jdGlvbiAoYSkge1xuICAgICAgICAgICAgICAgY29uc29sZS5sb2coYSk7XG4gICAgICAgICAgICAgICAkLm5vdGlmeSgnU3VjY2Vzc2Z1bGx5IHNhdmVkJywgXCJzdWNjZXNzXCIpO1xuICAgICAgICAgICB9LFxuICAgICAgICAgICBkYXRhOiB7ZGF0YSA6IGRhdGF9XG4gICAgICAgfSlcbiAgIH0pO1xufSk7Il0sImZpbGUiOiJkYXNoYm9hcmQvY29udGFjdHMuanMiLCJzb3VyY2VSb290IjoiL3NvdXJjZS8ifQ==
