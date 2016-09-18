$(function(){
    "use strict";
    var forDelete = [];
    var btnDelete = $(".delete");
    console.log(111);
    $( ".selectable" ).selectable({
        unselected: function( event, ui ) {
            var deletetable = $(ui.unselected).find('span').text();
            forDelete = forDelete.filter(function(el){
                return el != deletetable;
            })
            console.log(2);
        },
        selected: function( event, ui ) {
            var selected = $(ui.selected).find('span').text();
            forDelete.push(selected);
            console.log(1);
        },
        stop: function(){
            if(forDelete.length)
                btnDelete.show();
            else{
                btnDelete.hide();
            }
            console.log(forDelete);
        }
    });

    btnDelete.on("click", function(){
        $.ajax($(this).attr("data-url"), {
            type: "POST",
            headers: {
                'X-CSRF-TOKEN': $('meta[name="csrf-token"]').attr('content')
            },
            data: {delete: forDelete},
            error: function(response){
                var w = window.open('', ':Error Message', 'menubar=no, location=no');
                w.document.write(response.responseText);
            },
            success: function(response){
                $.notify(response, "success");
                $(".selectable .item span").each(function(i, obj){
                    if(forDelete.indexOf($(obj).text()) !== -1)
                        $(obj).parent().parent().remove();
                });
                forDelete = [];
            }
        })
    })
});