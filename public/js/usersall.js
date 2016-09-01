$(function () {

    var mainTable = $(".table-striped tbody"),
        subTable = $(".modal table tr"),
        modal = $("#edit");


    modal.on('hide.bs.modal', function(){
        modal.find("table p").show();
        modal.find("table .form-group").hide();
    });

    var onError = function(response){
        if(response.status === 406)
           console.log(response.responseJSON.Uid);
        },
        onSuccess = function(response){
            for(var i in response)
                subTable.find(".user_"+i+" p").text(response[i]);
            modal.modal('show');
            $(".save-changes").prop("disabled", true);
            modal.find(".form-group input, select").one("change keypress", function(){
                $(".save-changes").prop("disabled", false)
            });
        };
    
    var URLGetAllUsers = 'user/edit',
        requestOptions = {
            type: "POST",
            cache: false,
            success: onSuccess,
            error: onError,
            headers: {
                'X-CSRF-TOKEN': $('meta[name="csrf-token"]').attr('content')
            }
        };
    var current = null;
    mainTable.on("click", "tr", function(){
        current = $(this);
        var id = parseInt($(this).find("td:first").text());
        requestOptions.success = onSuccess;
        requestOptions.error = onError;
        requestOptions.data = {
            Uid: id
        };
        $.ajax(URLGetAllUsers, requestOptions)
    });

    subTable.find("td:odd").each(function(i,obj){
        var password = false;
        if($(obj).hasClass("user_id")) return;
        else if($(obj).hasClass("user_password")){
            var input = $(obj).find("input");
            input.first().on("keypress", function(){
                input.last().val("");
            });
            password = true;
        }
            
        $(obj).on("click", "p", function(){
            var p = $(this);
            var fg = $(this).parent().find(".form-group");
            if(!password) fg.find("input").val(p.text());
            p.slideUp();
            fg.slideDown()
                .focus();
        })

    });


    var onEditError = function(response){
            if(response.status === 406)
                console.log(response);
            var modalHead = modal.find(".modal-header");
            current.addClass("danger");
            modalHead.addClass("btn-danger");
            setTimeout(function () {
                modalHead.removeClass("btn-danger");
                current.removeClass("danger success");
            }, 3000)
        },
        onEditSuccess = function(response){
            modal.modal("hide");
            if(current){
                current.addClass("success");
                var td = current.find("td");
                td.eq(0).text(response.id);
                td.eq(1).text(response.login);
                td.eq(2).text(response.role);
                td.eq(3).text(response.name);
            }
        };

    var URLUpdateUser = "user/update";
    modal.find(".save-changes").click(function(e){
        e.preventDefault();
        var id = "id="+ modal.find(".user_id p").text() + "&";
        requestOptions.success = onEditSuccess;
        requestOptions.error = onEditError;
        requestOptions.data = id + modal.find("form :input").filter(function(index, element) {
            return $.trim($(element).val()).length > 0;
        }).serialize();
        console.log(requestOptions.data);
        // if(requestOptions.data.length > 0)
        //     $.ajax(URLUpdateUser, requestOptions);
    });

    var URLDeleteUser = "user/delete",
        onDeleteSuccess = function(){
            current.remove();
            modal.modal('hide');
        };
    modal.find(".delete-user").on("click", function(e){
        e.preventDefault();
        var id = modal.find(".user_id p").text();

        requestOptions.success = onDeleteSuccess;
        requestOptions.error = onEditError;
        requestOptions.data = {
            "Uid": id
        };
        $.ajax(URLDeleteUser, requestOptions);
    })
    
});

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiIiwic291cmNlcyI6WyJ1c2Vyc2FsbC5qcyJdLCJzb3VyY2VzQ29udGVudCI6WyIkKGZ1bmN0aW9uICgpIHtcblxuICAgIHZhciBtYWluVGFibGUgPSAkKFwiLnRhYmxlLXN0cmlwZWQgdGJvZHlcIiksXG4gICAgICAgIHN1YlRhYmxlID0gJChcIi5tb2RhbCB0YWJsZSB0clwiKSxcbiAgICAgICAgbW9kYWwgPSAkKFwiI2VkaXRcIik7XG5cblxuICAgIG1vZGFsLm9uKCdoaWRlLmJzLm1vZGFsJywgZnVuY3Rpb24oKXtcbiAgICAgICAgbW9kYWwuZmluZChcInRhYmxlIHBcIikuc2hvdygpO1xuICAgICAgICBtb2RhbC5maW5kKFwidGFibGUgLmZvcm0tZ3JvdXBcIikuaGlkZSgpO1xuICAgIH0pO1xuXG4gICAgdmFyIG9uRXJyb3IgPSBmdW5jdGlvbihyZXNwb25zZSl7XG4gICAgICAgIGlmKHJlc3BvbnNlLnN0YXR1cyA9PT0gNDA2KVxuICAgICAgICAgICBjb25zb2xlLmxvZyhyZXNwb25zZS5yZXNwb25zZUpTT04uVWlkKTtcbiAgICAgICAgfSxcbiAgICAgICAgb25TdWNjZXNzID0gZnVuY3Rpb24ocmVzcG9uc2Upe1xuICAgICAgICAgICAgZm9yKHZhciBpIGluIHJlc3BvbnNlKVxuICAgICAgICAgICAgICAgIHN1YlRhYmxlLmZpbmQoXCIudXNlcl9cIitpK1wiIHBcIikudGV4dChyZXNwb25zZVtpXSk7XG4gICAgICAgICAgICBtb2RhbC5tb2RhbCgnc2hvdycpO1xuICAgICAgICAgICAgJChcIi5zYXZlLWNoYW5nZXNcIikucHJvcChcImRpc2FibGVkXCIsIHRydWUpO1xuICAgICAgICAgICAgbW9kYWwuZmluZChcIi5mb3JtLWdyb3VwIGlucHV0LCBzZWxlY3RcIikub25lKFwiY2hhbmdlIGtleXByZXNzXCIsIGZ1bmN0aW9uKCl7XG4gICAgICAgICAgICAgICAgJChcIi5zYXZlLWNoYW5nZXNcIikucHJvcChcImRpc2FibGVkXCIsIGZhbHNlKVxuICAgICAgICAgICAgfSk7XG4gICAgICAgIH07XG4gICAgXG4gICAgdmFyIFVSTEdldEFsbFVzZXJzID0gJ3VzZXIvZWRpdCcsXG4gICAgICAgIHJlcXVlc3RPcHRpb25zID0ge1xuICAgICAgICAgICAgdHlwZTogXCJQT1NUXCIsXG4gICAgICAgICAgICBjYWNoZTogZmFsc2UsXG4gICAgICAgICAgICBzdWNjZXNzOiBvblN1Y2Nlc3MsXG4gICAgICAgICAgICBlcnJvcjogb25FcnJvcixcbiAgICAgICAgICAgIGhlYWRlcnM6IHtcbiAgICAgICAgICAgICAgICAnWC1DU1JGLVRPS0VOJzogJCgnbWV0YVtuYW1lPVwiY3NyZi10b2tlblwiXScpLmF0dHIoJ2NvbnRlbnQnKVxuICAgICAgICAgICAgfVxuICAgICAgICB9O1xuICAgIHZhciBjdXJyZW50ID0gbnVsbDtcbiAgICBtYWluVGFibGUub24oXCJjbGlja1wiLCBcInRyXCIsIGZ1bmN0aW9uKCl7XG4gICAgICAgIGN1cnJlbnQgPSAkKHRoaXMpO1xuICAgICAgICB2YXIgaWQgPSBwYXJzZUludCgkKHRoaXMpLmZpbmQoXCJ0ZDpmaXJzdFwiKS50ZXh0KCkpO1xuICAgICAgICByZXF1ZXN0T3B0aW9ucy5zdWNjZXNzID0gb25TdWNjZXNzO1xuICAgICAgICByZXF1ZXN0T3B0aW9ucy5lcnJvciA9IG9uRXJyb3I7XG4gICAgICAgIHJlcXVlc3RPcHRpb25zLmRhdGEgPSB7XG4gICAgICAgICAgICBVaWQ6IGlkXG4gICAgICAgIH07XG4gICAgICAgICQuYWpheChVUkxHZXRBbGxVc2VycywgcmVxdWVzdE9wdGlvbnMpXG4gICAgfSk7XG5cbiAgICBzdWJUYWJsZS5maW5kKFwidGQ6b2RkXCIpLmVhY2goZnVuY3Rpb24oaSxvYmope1xuICAgICAgICB2YXIgcGFzc3dvcmQgPSBmYWxzZTtcbiAgICAgICAgaWYoJChvYmopLmhhc0NsYXNzKFwidXNlcl9pZFwiKSkgcmV0dXJuO1xuICAgICAgICBlbHNlIGlmKCQob2JqKS5oYXNDbGFzcyhcInVzZXJfcGFzc3dvcmRcIikpe1xuICAgICAgICAgICAgdmFyIGlucHV0ID0gJChvYmopLmZpbmQoXCJpbnB1dFwiKTtcbiAgICAgICAgICAgIGlucHV0LmZpcnN0KCkub24oXCJrZXlwcmVzc1wiLCBmdW5jdGlvbigpe1xuICAgICAgICAgICAgICAgIGlucHV0Lmxhc3QoKS52YWwoXCJcIik7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIHBhc3N3b3JkID0gdHJ1ZTtcbiAgICAgICAgfVxuICAgICAgICAgICAgXG4gICAgICAgICQob2JqKS5vbihcImNsaWNrXCIsIFwicFwiLCBmdW5jdGlvbigpe1xuICAgICAgICAgICAgdmFyIHAgPSAkKHRoaXMpO1xuICAgICAgICAgICAgdmFyIGZnID0gJCh0aGlzKS5wYXJlbnQoKS5maW5kKFwiLmZvcm0tZ3JvdXBcIik7XG4gICAgICAgICAgICBpZighcGFzc3dvcmQpIGZnLmZpbmQoXCJpbnB1dFwiKS52YWwocC50ZXh0KCkpO1xuICAgICAgICAgICAgcC5zbGlkZVVwKCk7XG4gICAgICAgICAgICBmZy5zbGlkZURvd24oKVxuICAgICAgICAgICAgICAgIC5mb2N1cygpO1xuICAgICAgICB9KVxuXG4gICAgfSk7XG5cblxuICAgIHZhciBvbkVkaXRFcnJvciA9IGZ1bmN0aW9uKHJlc3BvbnNlKXtcbiAgICAgICAgICAgIGlmKHJlc3BvbnNlLnN0YXR1cyA9PT0gNDA2KVxuICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKHJlc3BvbnNlKTtcbiAgICAgICAgICAgIHZhciBtb2RhbEhlYWQgPSBtb2RhbC5maW5kKFwiLm1vZGFsLWhlYWRlclwiKTtcbiAgICAgICAgICAgIGN1cnJlbnQuYWRkQ2xhc3MoXCJkYW5nZXJcIik7XG4gICAgICAgICAgICBtb2RhbEhlYWQuYWRkQ2xhc3MoXCJidG4tZGFuZ2VyXCIpO1xuICAgICAgICAgICAgc2V0VGltZW91dChmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgbW9kYWxIZWFkLnJlbW92ZUNsYXNzKFwiYnRuLWRhbmdlclwiKTtcbiAgICAgICAgICAgICAgICBjdXJyZW50LnJlbW92ZUNsYXNzKFwiZGFuZ2VyIHN1Y2Nlc3NcIik7XG4gICAgICAgICAgICB9LCAzMDAwKVxuICAgICAgICB9LFxuICAgICAgICBvbkVkaXRTdWNjZXNzID0gZnVuY3Rpb24ocmVzcG9uc2Upe1xuICAgICAgICAgICAgbW9kYWwubW9kYWwoXCJoaWRlXCIpO1xuICAgICAgICAgICAgaWYoY3VycmVudCl7XG4gICAgICAgICAgICAgICAgY3VycmVudC5hZGRDbGFzcyhcInN1Y2Nlc3NcIik7XG4gICAgICAgICAgICAgICAgdmFyIHRkID0gY3VycmVudC5maW5kKFwidGRcIik7XG4gICAgICAgICAgICAgICAgdGQuZXEoMCkudGV4dChyZXNwb25zZS5pZCk7XG4gICAgICAgICAgICAgICAgdGQuZXEoMSkudGV4dChyZXNwb25zZS5sb2dpbik7XG4gICAgICAgICAgICAgICAgdGQuZXEoMikudGV4dChyZXNwb25zZS5yb2xlKTtcbiAgICAgICAgICAgICAgICB0ZC5lcSgzKS50ZXh0KHJlc3BvbnNlLm5hbWUpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9O1xuXG4gICAgdmFyIFVSTFVwZGF0ZVVzZXIgPSBcInVzZXIvdXBkYXRlXCI7XG4gICAgbW9kYWwuZmluZChcIi5zYXZlLWNoYW5nZXNcIikuY2xpY2soZnVuY3Rpb24oZSl7XG4gICAgICAgIGUucHJldmVudERlZmF1bHQoKTtcbiAgICAgICAgdmFyIGlkID0gXCJpZD1cIisgbW9kYWwuZmluZChcIi51c2VyX2lkIHBcIikudGV4dCgpICsgXCImXCI7XG4gICAgICAgIHJlcXVlc3RPcHRpb25zLnN1Y2Nlc3MgPSBvbkVkaXRTdWNjZXNzO1xuICAgICAgICByZXF1ZXN0T3B0aW9ucy5lcnJvciA9IG9uRWRpdEVycm9yO1xuICAgICAgICByZXF1ZXN0T3B0aW9ucy5kYXRhID0gaWQgKyBtb2RhbC5maW5kKFwiZm9ybSA6aW5wdXRcIikuZmlsdGVyKGZ1bmN0aW9uKGluZGV4LCBlbGVtZW50KSB7XG4gICAgICAgICAgICByZXR1cm4gJC50cmltKCQoZWxlbWVudCkudmFsKCkpLmxlbmd0aCA+IDA7XG4gICAgICAgIH0pLnNlcmlhbGl6ZSgpO1xuICAgICAgICBjb25zb2xlLmxvZyhyZXF1ZXN0T3B0aW9ucy5kYXRhKTtcbiAgICAgICAgLy8gaWYocmVxdWVzdE9wdGlvbnMuZGF0YS5sZW5ndGggPiAwKVxuICAgICAgICAvLyAgICAgJC5hamF4KFVSTFVwZGF0ZVVzZXIsIHJlcXVlc3RPcHRpb25zKTtcbiAgICB9KTtcblxuICAgIHZhciBVUkxEZWxldGVVc2VyID0gXCJ1c2VyL2RlbGV0ZVwiLFxuICAgICAgICBvbkRlbGV0ZVN1Y2Nlc3MgPSBmdW5jdGlvbigpe1xuICAgICAgICAgICAgY3VycmVudC5yZW1vdmUoKTtcbiAgICAgICAgICAgIG1vZGFsLm1vZGFsKCdoaWRlJyk7XG4gICAgICAgIH07XG4gICAgbW9kYWwuZmluZChcIi5kZWxldGUtdXNlclwiKS5vbihcImNsaWNrXCIsIGZ1bmN0aW9uKGUpe1xuICAgICAgICBlLnByZXZlbnREZWZhdWx0KCk7XG4gICAgICAgIHZhciBpZCA9IG1vZGFsLmZpbmQoXCIudXNlcl9pZCBwXCIpLnRleHQoKTtcblxuICAgICAgICByZXF1ZXN0T3B0aW9ucy5zdWNjZXNzID0gb25EZWxldGVTdWNjZXNzO1xuICAgICAgICByZXF1ZXN0T3B0aW9ucy5lcnJvciA9IG9uRWRpdEVycm9yO1xuICAgICAgICByZXF1ZXN0T3B0aW9ucy5kYXRhID0ge1xuICAgICAgICAgICAgXCJVaWRcIjogaWRcbiAgICAgICAgfTtcbiAgICAgICAgJC5hamF4KFVSTERlbGV0ZVVzZXIsIHJlcXVlc3RPcHRpb25zKTtcbiAgICB9KVxuICAgIFxufSk7XG4iXSwiZmlsZSI6InVzZXJzYWxsLmpzIiwic291cmNlUm9vdCI6Ii9zb3VyY2UvIn0=
