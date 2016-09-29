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

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiIiwic291cmNlcyI6WyJkYXNoYm9hcmQvdXNlcnNhbGwuanMiXSwic291cmNlc0NvbnRlbnQiOlsiJChmdW5jdGlvbiAoKSB7XG5cbiAgICB2YXIgbWFpblRhYmxlID0gJChcIi50YWJsZS1zdHJpcGVkIHRib2R5XCIpLFxuICAgICAgICBzdWJUYWJsZSA9ICQoXCIubW9kYWwgdGFibGUgdHJcIiksXG4gICAgICAgIG1vZGFsID0gJChcIiNlZGl0XCIpO1xuXG5cbiAgICBtb2RhbC5vbignaGlkZS5icy5tb2RhbCcsIGZ1bmN0aW9uKCl7XG4gICAgICAgIG1vZGFsLmZpbmQoXCJ0YWJsZSBwXCIpLnNob3coKTtcbiAgICAgICAgbW9kYWwuZmluZChcInRhYmxlIC5mb3JtLWdyb3VwXCIpLmhpZGUoKTtcbiAgICB9KTtcblxuICAgIHZhciBvbkVycm9yID0gZnVuY3Rpb24ocmVzcG9uc2Upe1xuICAgICAgICBpZihyZXNwb25zZS5zdGF0dXMgPT09IDQwNilcbiAgICAgICAgICAgY29uc29sZS5sb2cocmVzcG9uc2UucmVzcG9uc2VKU09OLlVpZCk7XG4gICAgICAgIH0sXG4gICAgICAgIG9uU3VjY2VzcyA9IGZ1bmN0aW9uKHJlc3BvbnNlKXtcbiAgICAgICAgICAgIGZvcih2YXIgaSBpbiByZXNwb25zZSlcbiAgICAgICAgICAgICAgICBzdWJUYWJsZS5maW5kKFwiLnVzZXJfXCIraStcIiBwXCIpLnRleHQocmVzcG9uc2VbaV0pO1xuICAgICAgICAgICAgbW9kYWwubW9kYWwoJ3Nob3cnKTtcbiAgICAgICAgICAgICQoXCIuc2F2ZS1jaGFuZ2VzXCIpLnByb3AoXCJkaXNhYmxlZFwiLCB0cnVlKTtcbiAgICAgICAgICAgIG1vZGFsLmZpbmQoXCIuZm9ybS1ncm91cCBpbnB1dCwgc2VsZWN0XCIpLm9uZShcImNoYW5nZSBrZXlwcmVzc1wiLCBmdW5jdGlvbigpe1xuICAgICAgICAgICAgICAgICQoXCIuc2F2ZS1jaGFuZ2VzXCIpLnByb3AoXCJkaXNhYmxlZFwiLCBmYWxzZSlcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9O1xuICAgIFxuICAgIHZhciBVUkxHZXRBbGxVc2VycyA9ICd1c2VyL2VkaXQnLFxuICAgICAgICByZXF1ZXN0T3B0aW9ucyA9IHtcbiAgICAgICAgICAgIHR5cGU6IFwiUE9TVFwiLFxuICAgICAgICAgICAgY2FjaGU6IGZhbHNlLFxuICAgICAgICAgICAgc3VjY2Vzczogb25TdWNjZXNzLFxuICAgICAgICAgICAgZXJyb3I6IG9uRXJyb3IsXG4gICAgICAgICAgICBoZWFkZXJzOiB7XG4gICAgICAgICAgICAgICAgJ1gtQ1NSRi1UT0tFTic6ICQoJ21ldGFbbmFtZT1cImNzcmYtdG9rZW5cIl0nKS5hdHRyKCdjb250ZW50JylcbiAgICAgICAgICAgIH1cbiAgICAgICAgfTtcbiAgICB2YXIgY3VycmVudCA9IG51bGw7XG4gICAgbWFpblRhYmxlLm9uKFwiY2xpY2tcIiwgXCJ0clwiLCBmdW5jdGlvbigpe1xuICAgICAgICBjdXJyZW50ID0gJCh0aGlzKTtcbiAgICAgICAgdmFyIGlkID0gcGFyc2VJbnQoJCh0aGlzKS5maW5kKFwidGQ6Zmlyc3RcIikudGV4dCgpKTtcbiAgICAgICAgcmVxdWVzdE9wdGlvbnMuc3VjY2VzcyA9IG9uU3VjY2VzcztcbiAgICAgICAgcmVxdWVzdE9wdGlvbnMuZXJyb3IgPSBvbkVycm9yO1xuICAgICAgICByZXF1ZXN0T3B0aW9ucy5kYXRhID0ge1xuICAgICAgICAgICAgVWlkOiBpZFxuICAgICAgICB9O1xuICAgICAgICAkLmFqYXgoVVJMR2V0QWxsVXNlcnMsIHJlcXVlc3RPcHRpb25zKVxuICAgIH0pO1xuXG4gICAgc3ViVGFibGUuZmluZChcInRkOm9kZFwiKS5lYWNoKGZ1bmN0aW9uKGksb2JqKXtcbiAgICAgICAgdmFyIHBhc3N3b3JkID0gZmFsc2U7XG4gICAgICAgIGlmKCQob2JqKS5oYXNDbGFzcyhcInVzZXJfaWRcIikpIHJldHVybjtcbiAgICAgICAgZWxzZSBpZigkKG9iaikuaGFzQ2xhc3MoXCJ1c2VyX3Bhc3N3b3JkXCIpKXtcbiAgICAgICAgICAgIHZhciBpbnB1dCA9ICQob2JqKS5maW5kKFwiaW5wdXRcIik7XG4gICAgICAgICAgICBpbnB1dC5maXJzdCgpLm9uKFwia2V5cHJlc3NcIiwgZnVuY3Rpb24oKXtcbiAgICAgICAgICAgICAgICBpbnB1dC5sYXN0KCkudmFsKFwiXCIpO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICBwYXNzd29yZCA9IHRydWU7XG4gICAgICAgIH1cbiAgICAgICAgICAgIFxuICAgICAgICAkKG9iaikub24oXCJjbGlja1wiLCBcInBcIiwgZnVuY3Rpb24oKXtcbiAgICAgICAgICAgIHZhciBwID0gJCh0aGlzKTtcbiAgICAgICAgICAgIHZhciBmZyA9ICQodGhpcykucGFyZW50KCkuZmluZChcIi5mb3JtLWdyb3VwXCIpO1xuICAgICAgICAgICAgaWYoIXBhc3N3b3JkKSBmZy5maW5kKFwiaW5wdXRcIikudmFsKHAudGV4dCgpKTtcbiAgICAgICAgICAgIHAuc2xpZGVVcCgpO1xuICAgICAgICAgICAgZmcuc2xpZGVEb3duKClcbiAgICAgICAgICAgICAgICAuZm9jdXMoKTtcbiAgICAgICAgfSlcblxuICAgIH0pO1xuXG5cbiAgICB2YXIgb25FZGl0RXJyb3IgPSBmdW5jdGlvbihyZXNwb25zZSl7XG4gICAgICAgICAgICBpZihyZXNwb25zZS5zdGF0dXMgPT09IDQwNilcbiAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhyZXNwb25zZSk7XG4gICAgICAgICAgICB2YXIgbW9kYWxIZWFkID0gbW9kYWwuZmluZChcIi5tb2RhbC1oZWFkZXJcIik7XG4gICAgICAgICAgICBjdXJyZW50LmFkZENsYXNzKFwiZGFuZ2VyXCIpO1xuICAgICAgICAgICAgbW9kYWxIZWFkLmFkZENsYXNzKFwiYnRuLWRhbmdlclwiKTtcbiAgICAgICAgICAgIHNldFRpbWVvdXQoZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgIG1vZGFsSGVhZC5yZW1vdmVDbGFzcyhcImJ0bi1kYW5nZXJcIik7XG4gICAgICAgICAgICAgICAgY3VycmVudC5yZW1vdmVDbGFzcyhcImRhbmdlciBzdWNjZXNzXCIpO1xuICAgICAgICAgICAgfSwgMzAwMClcbiAgICAgICAgfSxcbiAgICAgICAgb25FZGl0U3VjY2VzcyA9IGZ1bmN0aW9uKHJlc3BvbnNlKXtcbiAgICAgICAgICAgIG1vZGFsLm1vZGFsKFwiaGlkZVwiKTtcbiAgICAgICAgICAgIGlmKGN1cnJlbnQpe1xuICAgICAgICAgICAgICAgIGN1cnJlbnQuYWRkQ2xhc3MoXCJzdWNjZXNzXCIpO1xuICAgICAgICAgICAgICAgIHZhciB0ZCA9IGN1cnJlbnQuZmluZChcInRkXCIpO1xuICAgICAgICAgICAgICAgIHRkLmVxKDApLnRleHQocmVzcG9uc2UuaWQpO1xuICAgICAgICAgICAgICAgIHRkLmVxKDEpLnRleHQocmVzcG9uc2UubG9naW4pO1xuICAgICAgICAgICAgICAgIHRkLmVxKDIpLnRleHQocmVzcG9uc2Uucm9sZSk7XG4gICAgICAgICAgICAgICAgdGQuZXEoMykudGV4dChyZXNwb25zZS5uYW1lKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfTtcblxuICAgIHZhciBVUkxVcGRhdGVVc2VyID0gXCJ1c2VyL3VwZGF0ZVwiO1xuICAgIG1vZGFsLmZpbmQoXCIuc2F2ZS1jaGFuZ2VzXCIpLmNsaWNrKGZ1bmN0aW9uKGUpe1xuICAgICAgICBlLnByZXZlbnREZWZhdWx0KCk7XG4gICAgICAgIHZhciBpZCA9IFwiaWQ9XCIrIG1vZGFsLmZpbmQoXCIudXNlcl9pZCBwXCIpLnRleHQoKSArIFwiJlwiO1xuICAgICAgICByZXF1ZXN0T3B0aW9ucy5zdWNjZXNzID0gb25FZGl0U3VjY2VzcztcbiAgICAgICAgcmVxdWVzdE9wdGlvbnMuZXJyb3IgPSBvbkVkaXRFcnJvcjtcbiAgICAgICAgcmVxdWVzdE9wdGlvbnMuZGF0YSA9IGlkICsgbW9kYWwuZmluZChcImZvcm0gOmlucHV0XCIpLmZpbHRlcihmdW5jdGlvbihpbmRleCwgZWxlbWVudCkge1xuICAgICAgICAgICAgcmV0dXJuICQudHJpbSgkKGVsZW1lbnQpLnZhbCgpKS5sZW5ndGggPiAwO1xuICAgICAgICB9KS5zZXJpYWxpemUoKTtcbiAgICAgICAgY29uc29sZS5sb2cocmVxdWVzdE9wdGlvbnMuZGF0YSk7XG4gICAgICAgIC8vIGlmKHJlcXVlc3RPcHRpb25zLmRhdGEubGVuZ3RoID4gMClcbiAgICAgICAgLy8gICAgICQuYWpheChVUkxVcGRhdGVVc2VyLCByZXF1ZXN0T3B0aW9ucyk7XG4gICAgfSk7XG5cbiAgICB2YXIgVVJMRGVsZXRlVXNlciA9IFwidXNlci9kZWxldGVcIixcbiAgICAgICAgb25EZWxldGVTdWNjZXNzID0gZnVuY3Rpb24oKXtcbiAgICAgICAgICAgIGN1cnJlbnQucmVtb3ZlKCk7XG4gICAgICAgICAgICBtb2RhbC5tb2RhbCgnaGlkZScpO1xuICAgICAgICB9O1xuICAgIG1vZGFsLmZpbmQoXCIuZGVsZXRlLXVzZXJcIikub24oXCJjbGlja1wiLCBmdW5jdGlvbihlKXtcbiAgICAgICAgZS5wcmV2ZW50RGVmYXVsdCgpO1xuICAgICAgICB2YXIgaWQgPSBtb2RhbC5maW5kKFwiLnVzZXJfaWQgcFwiKS50ZXh0KCk7XG5cbiAgICAgICAgcmVxdWVzdE9wdGlvbnMuc3VjY2VzcyA9IG9uRGVsZXRlU3VjY2VzcztcbiAgICAgICAgcmVxdWVzdE9wdGlvbnMuZXJyb3IgPSBvbkVkaXRFcnJvcjtcbiAgICAgICAgcmVxdWVzdE9wdGlvbnMuZGF0YSA9IHtcbiAgICAgICAgICAgIFwiVWlkXCI6IGlkXG4gICAgICAgIH07XG4gICAgICAgICQuYWpheChVUkxEZWxldGVVc2VyLCByZXF1ZXN0T3B0aW9ucyk7XG4gICAgfSlcbiAgICBcbn0pO1xuIl0sImZpbGUiOiJkYXNoYm9hcmQvdXNlcnNhbGwuanMiLCJzb3VyY2VSb290IjoiL3NvdXJjZS8ifQ==
