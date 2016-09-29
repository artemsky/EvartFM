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