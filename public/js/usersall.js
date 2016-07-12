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
        if(requestOptions.data.length > 0)
            $.ajax(URLUpdateUser, requestOptions);
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

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiIiwic291cmNlcyI6WyJ1c2Vyc2FsbC5qcyJdLCJzb3VyY2VzQ29udGVudCI6WyIkKGZ1bmN0aW9uICgpIHtcclxuXHJcbiAgICB2YXIgbWFpblRhYmxlID0gJChcIi50YWJsZS1zdHJpcGVkIHRib2R5XCIpLFxyXG4gICAgICAgIHN1YlRhYmxlID0gJChcIi5tb2RhbCB0YWJsZSB0clwiKSxcclxuICAgICAgICBtb2RhbCA9ICQoXCIjZWRpdFwiKTtcclxuXHJcblxyXG4gICAgbW9kYWwub24oJ2hpZGUuYnMubW9kYWwnLCBmdW5jdGlvbigpe1xyXG4gICAgICAgIG1vZGFsLmZpbmQoXCJ0YWJsZSBwXCIpLnNob3coKTtcclxuICAgICAgICBtb2RhbC5maW5kKFwidGFibGUgLmZvcm0tZ3JvdXBcIikuaGlkZSgpO1xyXG4gICAgfSk7XHJcblxyXG4gICAgdmFyIG9uRXJyb3IgPSBmdW5jdGlvbihyZXNwb25zZSl7XHJcbiAgICAgICAgaWYocmVzcG9uc2Uuc3RhdHVzID09PSA0MDYpXHJcbiAgICAgICAgICAgY29uc29sZS5sb2cocmVzcG9uc2UucmVzcG9uc2VKU09OLlVpZCk7XHJcbiAgICAgICAgfSxcclxuICAgICAgICBvblN1Y2Nlc3MgPSBmdW5jdGlvbihyZXNwb25zZSl7XHJcbiAgICAgICAgICAgIGZvcih2YXIgaSBpbiByZXNwb25zZSlcclxuICAgICAgICAgICAgICAgIHN1YlRhYmxlLmZpbmQoXCIudXNlcl9cIitpK1wiIHBcIikudGV4dChyZXNwb25zZVtpXSk7XHJcbiAgICAgICAgICAgIG1vZGFsLm1vZGFsKCdzaG93Jyk7XHJcbiAgICAgICAgICAgICQoXCIuc2F2ZS1jaGFuZ2VzXCIpLnByb3AoXCJkaXNhYmxlZFwiLCB0cnVlKTtcclxuICAgICAgICAgICAgbW9kYWwuZmluZChcIi5mb3JtLWdyb3VwIGlucHV0LCBzZWxlY3RcIikub25lKFwiY2hhbmdlIGtleXByZXNzXCIsIGZ1bmN0aW9uKCl7XHJcbiAgICAgICAgICAgICAgICAkKFwiLnNhdmUtY2hhbmdlc1wiKS5wcm9wKFwiZGlzYWJsZWRcIiwgZmFsc2UpXHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgIH07XHJcbiAgICBcclxuICAgIHZhciBVUkxHZXRBbGxVc2VycyA9ICd1c2VyL2VkaXQnLFxyXG4gICAgICAgIHJlcXVlc3RPcHRpb25zID0ge1xyXG4gICAgICAgICAgICB0eXBlOiBcIlBPU1RcIixcclxuICAgICAgICAgICAgY2FjaGU6IGZhbHNlLFxyXG4gICAgICAgICAgICBzdWNjZXNzOiBvblN1Y2Nlc3MsXHJcbiAgICAgICAgICAgIGVycm9yOiBvbkVycm9yLFxyXG4gICAgICAgICAgICBoZWFkZXJzOiB7XHJcbiAgICAgICAgICAgICAgICAnWC1DU1JGLVRPS0VOJzogJCgnbWV0YVtuYW1lPVwiY3NyZi10b2tlblwiXScpLmF0dHIoJ2NvbnRlbnQnKVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfTtcclxuICAgIHZhciBjdXJyZW50ID0gbnVsbDtcclxuICAgIG1haW5UYWJsZS5vbihcImNsaWNrXCIsIFwidHJcIiwgZnVuY3Rpb24oKXtcclxuICAgICAgICBjdXJyZW50ID0gJCh0aGlzKTtcclxuICAgICAgICB2YXIgaWQgPSBwYXJzZUludCgkKHRoaXMpLmZpbmQoXCJ0ZDpmaXJzdFwiKS50ZXh0KCkpO1xyXG4gICAgICAgIHJlcXVlc3RPcHRpb25zLnN1Y2Nlc3MgPSBvblN1Y2Nlc3M7XHJcbiAgICAgICAgcmVxdWVzdE9wdGlvbnMuZXJyb3IgPSBvbkVycm9yO1xyXG4gICAgICAgIHJlcXVlc3RPcHRpb25zLmRhdGEgPSB7XHJcbiAgICAgICAgICAgIFVpZDogaWRcclxuICAgICAgICB9O1xyXG4gICAgICAgICQuYWpheChVUkxHZXRBbGxVc2VycywgcmVxdWVzdE9wdGlvbnMpXHJcbiAgICB9KTtcclxuXHJcbiAgICBzdWJUYWJsZS5maW5kKFwidGQ6b2RkXCIpLmVhY2goZnVuY3Rpb24oaSxvYmope1xyXG4gICAgICAgIHZhciBwYXNzd29yZCA9IGZhbHNlO1xyXG4gICAgICAgIGlmKCQob2JqKS5oYXNDbGFzcyhcInVzZXJfaWRcIikpIHJldHVybjtcclxuICAgICAgICBlbHNlIGlmKCQob2JqKS5oYXNDbGFzcyhcInVzZXJfcGFzc3dvcmRcIikpe1xyXG4gICAgICAgICAgICB2YXIgaW5wdXQgPSAkKG9iaikuZmluZChcImlucHV0XCIpO1xyXG4gICAgICAgICAgICBpbnB1dC5maXJzdCgpLm9uKFwia2V5cHJlc3NcIiwgZnVuY3Rpb24oKXtcclxuICAgICAgICAgICAgICAgIGlucHV0Lmxhc3QoKS52YWwoXCJcIik7XHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICBwYXNzd29yZCA9IHRydWU7XHJcbiAgICAgICAgfVxyXG4gICAgICAgICAgICBcclxuICAgICAgICAkKG9iaikub24oXCJjbGlja1wiLCBcInBcIiwgZnVuY3Rpb24oKXtcclxuICAgICAgICAgICAgdmFyIHAgPSAkKHRoaXMpO1xyXG4gICAgICAgICAgICB2YXIgZmcgPSAkKHRoaXMpLnBhcmVudCgpLmZpbmQoXCIuZm9ybS1ncm91cFwiKTtcclxuICAgICAgICAgICAgaWYoIXBhc3N3b3JkKSBmZy5maW5kKFwiaW5wdXRcIikudmFsKHAudGV4dCgpKTtcclxuICAgICAgICAgICAgcC5zbGlkZVVwKCk7XHJcbiAgICAgICAgICAgIGZnLnNsaWRlRG93bigpXHJcbiAgICAgICAgICAgICAgICAuZm9jdXMoKTtcclxuICAgICAgICB9KVxyXG5cclxuICAgIH0pO1xyXG5cclxuXHJcbiAgICB2YXIgb25FZGl0RXJyb3IgPSBmdW5jdGlvbihyZXNwb25zZSl7XHJcbiAgICAgICAgICAgIGlmKHJlc3BvbnNlLnN0YXR1cyA9PT0gNDA2KVxyXG4gICAgICAgICAgICAgICAgY29uc29sZS5sb2cocmVzcG9uc2UpO1xyXG4gICAgICAgICAgICB2YXIgbW9kYWxIZWFkID0gbW9kYWwuZmluZChcIi5tb2RhbC1oZWFkZXJcIik7XHJcbiAgICAgICAgICAgIGN1cnJlbnQuYWRkQ2xhc3MoXCJkYW5nZXJcIik7XHJcbiAgICAgICAgICAgIG1vZGFsSGVhZC5hZGRDbGFzcyhcImJ0bi1kYW5nZXJcIik7XHJcbiAgICAgICAgICAgIHNldFRpbWVvdXQoZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICAgICAgbW9kYWxIZWFkLnJlbW92ZUNsYXNzKFwiYnRuLWRhbmdlclwiKTtcclxuICAgICAgICAgICAgICAgIGN1cnJlbnQucmVtb3ZlQ2xhc3MoXCJkYW5nZXIgc3VjY2Vzc1wiKTtcclxuICAgICAgICAgICAgfSwgMzAwMClcclxuICAgICAgICB9LFxyXG4gICAgICAgIG9uRWRpdFN1Y2Nlc3MgPSBmdW5jdGlvbihyZXNwb25zZSl7XHJcbiAgICAgICAgICAgIG1vZGFsLm1vZGFsKFwiaGlkZVwiKTtcclxuICAgICAgICAgICAgaWYoY3VycmVudCl7XHJcbiAgICAgICAgICAgICAgICBjdXJyZW50LmFkZENsYXNzKFwic3VjY2Vzc1wiKTtcclxuICAgICAgICAgICAgICAgIHZhciB0ZCA9IGN1cnJlbnQuZmluZChcInRkXCIpO1xyXG4gICAgICAgICAgICAgICAgdGQuZXEoMCkudGV4dChyZXNwb25zZS5pZCk7XHJcbiAgICAgICAgICAgICAgICB0ZC5lcSgxKS50ZXh0KHJlc3BvbnNlLmxvZ2luKTtcclxuICAgICAgICAgICAgICAgIHRkLmVxKDIpLnRleHQocmVzcG9uc2Uucm9sZSk7XHJcbiAgICAgICAgICAgICAgICB0ZC5lcSgzKS50ZXh0KHJlc3BvbnNlLm5hbWUpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfTtcclxuXHJcbiAgICB2YXIgVVJMVXBkYXRlVXNlciA9IFwidXNlci91cGRhdGVcIjtcclxuICAgIG1vZGFsLmZpbmQoXCIuc2F2ZS1jaGFuZ2VzXCIpLmNsaWNrKGZ1bmN0aW9uKGUpe1xyXG4gICAgICAgIGUucHJldmVudERlZmF1bHQoKTtcclxuICAgICAgICB2YXIgaWQgPSBcImlkPVwiKyBtb2RhbC5maW5kKFwiLnVzZXJfaWQgcFwiKS50ZXh0KCkgKyBcIiZcIjtcclxuICAgICAgICByZXF1ZXN0T3B0aW9ucy5zdWNjZXNzID0gb25FZGl0U3VjY2VzcztcclxuICAgICAgICByZXF1ZXN0T3B0aW9ucy5lcnJvciA9IG9uRWRpdEVycm9yO1xyXG4gICAgICAgIHJlcXVlc3RPcHRpb25zLmRhdGEgPSBpZCArIG1vZGFsLmZpbmQoXCJmb3JtIDppbnB1dFwiKS5maWx0ZXIoZnVuY3Rpb24oaW5kZXgsIGVsZW1lbnQpIHtcclxuICAgICAgICAgICAgcmV0dXJuICQudHJpbSgkKGVsZW1lbnQpLnZhbCgpKS5sZW5ndGggPiAwO1xyXG4gICAgICAgIH0pLnNlcmlhbGl6ZSgpO1xyXG4gICAgICAgIGlmKHJlcXVlc3RPcHRpb25zLmRhdGEubGVuZ3RoID4gMClcclxuICAgICAgICAgICAgJC5hamF4KFVSTFVwZGF0ZVVzZXIsIHJlcXVlc3RPcHRpb25zKTtcclxuICAgIH0pO1xyXG5cclxuICAgIHZhciBVUkxEZWxldGVVc2VyID0gXCJ1c2VyL2RlbGV0ZVwiLFxyXG4gICAgICAgIG9uRGVsZXRlU3VjY2VzcyA9IGZ1bmN0aW9uKCl7XHJcbiAgICAgICAgICAgIGN1cnJlbnQucmVtb3ZlKCk7XHJcbiAgICAgICAgICAgIG1vZGFsLm1vZGFsKCdoaWRlJyk7XHJcbiAgICAgICAgfTtcclxuICAgIG1vZGFsLmZpbmQoXCIuZGVsZXRlLXVzZXJcIikub24oXCJjbGlja1wiLCBmdW5jdGlvbihlKXtcclxuICAgICAgICBlLnByZXZlbnREZWZhdWx0KCk7XHJcbiAgICAgICAgdmFyIGlkID0gbW9kYWwuZmluZChcIi51c2VyX2lkIHBcIikudGV4dCgpO1xyXG5cclxuICAgICAgICByZXF1ZXN0T3B0aW9ucy5zdWNjZXNzID0gb25EZWxldGVTdWNjZXNzO1xyXG4gICAgICAgIHJlcXVlc3RPcHRpb25zLmVycm9yID0gb25FZGl0RXJyb3I7XHJcbiAgICAgICAgcmVxdWVzdE9wdGlvbnMuZGF0YSA9IHtcclxuICAgICAgICAgICAgXCJVaWRcIjogaWRcclxuICAgICAgICB9O1xyXG4gICAgICAgICQuYWpheChVUkxEZWxldGVVc2VyLCByZXF1ZXN0T3B0aW9ucyk7XHJcbiAgICB9KVxyXG4gICAgXHJcbn0pO1xyXG4iXSwiZmlsZSI6InVzZXJzYWxsLmpzIiwic291cmNlUm9vdCI6Ii9zb3VyY2UvIn0=
