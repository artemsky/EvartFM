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

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiIiwic291cmNlcyI6WyJkYXNoYm9hcmQvdXNlcnNhbGwuanMiXSwic291cmNlc0NvbnRlbnQiOlsiJChmdW5jdGlvbiAoKSB7XHJcblxyXG4gICAgdmFyIG1haW5UYWJsZSA9ICQoXCIudGFibGUtc3RyaXBlZCB0Ym9keVwiKSxcclxuICAgICAgICBzdWJUYWJsZSA9ICQoXCIubW9kYWwgdGFibGUgdHJcIiksXHJcbiAgICAgICAgbW9kYWwgPSAkKFwiI2VkaXRcIik7XHJcblxyXG5cclxuICAgIG1vZGFsLm9uKCdoaWRlLmJzLm1vZGFsJywgZnVuY3Rpb24oKXtcclxuICAgICAgICBtb2RhbC5maW5kKFwidGFibGUgcFwiKS5zaG93KCk7XHJcbiAgICAgICAgbW9kYWwuZmluZChcInRhYmxlIC5mb3JtLWdyb3VwXCIpLmhpZGUoKTtcclxuICAgIH0pO1xyXG5cclxuICAgIHZhciBvbkVycm9yID0gZnVuY3Rpb24ocmVzcG9uc2Upe1xyXG4gICAgICAgIGlmKHJlc3BvbnNlLnN0YXR1cyA9PT0gNDA2KVxyXG4gICAgICAgICAgIGNvbnNvbGUubG9nKHJlc3BvbnNlLnJlc3BvbnNlSlNPTi5VaWQpO1xyXG4gICAgICAgIH0sXHJcbiAgICAgICAgb25TdWNjZXNzID0gZnVuY3Rpb24ocmVzcG9uc2Upe1xyXG4gICAgICAgICAgICBmb3IodmFyIGkgaW4gcmVzcG9uc2UpXHJcbiAgICAgICAgICAgICAgICBzdWJUYWJsZS5maW5kKFwiLnVzZXJfXCIraStcIiBwXCIpLnRleHQocmVzcG9uc2VbaV0pO1xyXG4gICAgICAgICAgICBtb2RhbC5tb2RhbCgnc2hvdycpO1xyXG4gICAgICAgICAgICAkKFwiLnNhdmUtY2hhbmdlc1wiKS5wcm9wKFwiZGlzYWJsZWRcIiwgdHJ1ZSk7XHJcbiAgICAgICAgICAgIG1vZGFsLmZpbmQoXCIuZm9ybS1ncm91cCBpbnB1dCwgc2VsZWN0XCIpLm9uZShcImNoYW5nZSBrZXlwcmVzc1wiLCBmdW5jdGlvbigpe1xyXG4gICAgICAgICAgICAgICAgJChcIi5zYXZlLWNoYW5nZXNcIikucHJvcChcImRpc2FibGVkXCIsIGZhbHNlKVxyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICB9O1xyXG4gICAgXHJcbiAgICB2YXIgVVJMR2V0QWxsVXNlcnMgPSAndXNlci9lZGl0JyxcclxuICAgICAgICByZXF1ZXN0T3B0aW9ucyA9IHtcclxuICAgICAgICAgICAgdHlwZTogXCJQT1NUXCIsXHJcbiAgICAgICAgICAgIGNhY2hlOiBmYWxzZSxcclxuICAgICAgICAgICAgc3VjY2Vzczogb25TdWNjZXNzLFxyXG4gICAgICAgICAgICBlcnJvcjogb25FcnJvcixcclxuICAgICAgICAgICAgaGVhZGVyczoge1xyXG4gICAgICAgICAgICAgICAgJ1gtQ1NSRi1UT0tFTic6ICQoJ21ldGFbbmFtZT1cImNzcmYtdG9rZW5cIl0nKS5hdHRyKCdjb250ZW50JylcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH07XHJcbiAgICB2YXIgY3VycmVudCA9IG51bGw7XHJcbiAgICBtYWluVGFibGUub24oXCJjbGlja1wiLCBcInRyXCIsIGZ1bmN0aW9uKCl7XHJcbiAgICAgICAgY3VycmVudCA9ICQodGhpcyk7XHJcbiAgICAgICAgdmFyIGlkID0gcGFyc2VJbnQoJCh0aGlzKS5maW5kKFwidGQ6Zmlyc3RcIikudGV4dCgpKTtcclxuICAgICAgICByZXF1ZXN0T3B0aW9ucy5zdWNjZXNzID0gb25TdWNjZXNzO1xyXG4gICAgICAgIHJlcXVlc3RPcHRpb25zLmVycm9yID0gb25FcnJvcjtcclxuICAgICAgICByZXF1ZXN0T3B0aW9ucy5kYXRhID0ge1xyXG4gICAgICAgICAgICBVaWQ6IGlkXHJcbiAgICAgICAgfTtcclxuICAgICAgICAkLmFqYXgoVVJMR2V0QWxsVXNlcnMsIHJlcXVlc3RPcHRpb25zKVxyXG4gICAgfSk7XHJcblxyXG4gICAgc3ViVGFibGUuZmluZChcInRkOm9kZFwiKS5lYWNoKGZ1bmN0aW9uKGksb2JqKXtcclxuICAgICAgICB2YXIgcGFzc3dvcmQgPSBmYWxzZTtcclxuICAgICAgICBpZigkKG9iaikuaGFzQ2xhc3MoXCJ1c2VyX2lkXCIpKSByZXR1cm47XHJcbiAgICAgICAgZWxzZSBpZigkKG9iaikuaGFzQ2xhc3MoXCJ1c2VyX3Bhc3N3b3JkXCIpKXtcclxuICAgICAgICAgICAgdmFyIGlucHV0ID0gJChvYmopLmZpbmQoXCJpbnB1dFwiKTtcclxuICAgICAgICAgICAgaW5wdXQuZmlyc3QoKS5vbihcImtleXByZXNzXCIsIGZ1bmN0aW9uKCl7XHJcbiAgICAgICAgICAgICAgICBpbnB1dC5sYXN0KCkudmFsKFwiXCIpO1xyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgcGFzc3dvcmQgPSB0cnVlO1xyXG4gICAgICAgIH1cclxuICAgICAgICAgICAgXHJcbiAgICAgICAgJChvYmopLm9uKFwiY2xpY2tcIiwgXCJwXCIsIGZ1bmN0aW9uKCl7XHJcbiAgICAgICAgICAgIHZhciBwID0gJCh0aGlzKTtcclxuICAgICAgICAgICAgdmFyIGZnID0gJCh0aGlzKS5wYXJlbnQoKS5maW5kKFwiLmZvcm0tZ3JvdXBcIik7XHJcbiAgICAgICAgICAgIGlmKCFwYXNzd29yZCkgZmcuZmluZChcImlucHV0XCIpLnZhbChwLnRleHQoKSk7XHJcbiAgICAgICAgICAgIHAuc2xpZGVVcCgpO1xyXG4gICAgICAgICAgICBmZy5zbGlkZURvd24oKVxyXG4gICAgICAgICAgICAgICAgLmZvY3VzKCk7XHJcbiAgICAgICAgfSlcclxuXHJcbiAgICB9KTtcclxuXHJcblxyXG4gICAgdmFyIG9uRWRpdEVycm9yID0gZnVuY3Rpb24ocmVzcG9uc2Upe1xyXG4gICAgICAgICAgICBpZihyZXNwb25zZS5zdGF0dXMgPT09IDQwNilcclxuICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKHJlc3BvbnNlKTtcclxuICAgICAgICAgICAgdmFyIG1vZGFsSGVhZCA9IG1vZGFsLmZpbmQoXCIubW9kYWwtaGVhZGVyXCIpO1xyXG4gICAgICAgICAgICBjdXJyZW50LmFkZENsYXNzKFwiZGFuZ2VyXCIpO1xyXG4gICAgICAgICAgICBtb2RhbEhlYWQuYWRkQ2xhc3MoXCJidG4tZGFuZ2VyXCIpO1xyXG4gICAgICAgICAgICBzZXRUaW1lb3V0KGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgICAgIG1vZGFsSGVhZC5yZW1vdmVDbGFzcyhcImJ0bi1kYW5nZXJcIik7XHJcbiAgICAgICAgICAgICAgICBjdXJyZW50LnJlbW92ZUNsYXNzKFwiZGFuZ2VyIHN1Y2Nlc3NcIik7XHJcbiAgICAgICAgICAgIH0sIDMwMDApXHJcbiAgICAgICAgfSxcclxuICAgICAgICBvbkVkaXRTdWNjZXNzID0gZnVuY3Rpb24ocmVzcG9uc2Upe1xyXG4gICAgICAgICAgICBtb2RhbC5tb2RhbChcImhpZGVcIik7XHJcbiAgICAgICAgICAgIGlmKGN1cnJlbnQpe1xyXG4gICAgICAgICAgICAgICAgY3VycmVudC5hZGRDbGFzcyhcInN1Y2Nlc3NcIik7XHJcbiAgICAgICAgICAgICAgICB2YXIgdGQgPSBjdXJyZW50LmZpbmQoXCJ0ZFwiKTtcclxuICAgICAgICAgICAgICAgIHRkLmVxKDApLnRleHQocmVzcG9uc2UuaWQpO1xyXG4gICAgICAgICAgICAgICAgdGQuZXEoMSkudGV4dChyZXNwb25zZS5sb2dpbik7XHJcbiAgICAgICAgICAgICAgICB0ZC5lcSgyKS50ZXh0KHJlc3BvbnNlLnJvbGUpO1xyXG4gICAgICAgICAgICAgICAgdGQuZXEoMykudGV4dChyZXNwb25zZS5uYW1lKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH07XHJcblxyXG4gICAgdmFyIFVSTFVwZGF0ZVVzZXIgPSBcInVzZXIvdXBkYXRlXCI7XHJcbiAgICBtb2RhbC5maW5kKFwiLnNhdmUtY2hhbmdlc1wiKS5jbGljayhmdW5jdGlvbihlKXtcclxuICAgICAgICBlLnByZXZlbnREZWZhdWx0KCk7XHJcbiAgICAgICAgdmFyIGlkID0gXCJpZD1cIisgbW9kYWwuZmluZChcIi51c2VyX2lkIHBcIikudGV4dCgpICsgXCImXCI7XHJcbiAgICAgICAgcmVxdWVzdE9wdGlvbnMuc3VjY2VzcyA9IG9uRWRpdFN1Y2Nlc3M7XHJcbiAgICAgICAgcmVxdWVzdE9wdGlvbnMuZXJyb3IgPSBvbkVkaXRFcnJvcjtcclxuICAgICAgICByZXF1ZXN0T3B0aW9ucy5kYXRhID0gaWQgKyBtb2RhbC5maW5kKFwiZm9ybSA6aW5wdXRcIikuZmlsdGVyKGZ1bmN0aW9uKGluZGV4LCBlbGVtZW50KSB7XHJcbiAgICAgICAgICAgIHJldHVybiAkLnRyaW0oJChlbGVtZW50KS52YWwoKSkubGVuZ3RoID4gMDtcclxuICAgICAgICB9KS5zZXJpYWxpemUoKTtcclxuICAgICAgICBjb25zb2xlLmxvZyhyZXF1ZXN0T3B0aW9ucy5kYXRhKTtcclxuICAgICAgICAvLyBpZihyZXF1ZXN0T3B0aW9ucy5kYXRhLmxlbmd0aCA+IDApXHJcbiAgICAgICAgLy8gICAgICQuYWpheChVUkxVcGRhdGVVc2VyLCByZXF1ZXN0T3B0aW9ucyk7XHJcbiAgICB9KTtcclxuXHJcbiAgICB2YXIgVVJMRGVsZXRlVXNlciA9IFwidXNlci9kZWxldGVcIixcclxuICAgICAgICBvbkRlbGV0ZVN1Y2Nlc3MgPSBmdW5jdGlvbigpe1xyXG4gICAgICAgICAgICBjdXJyZW50LnJlbW92ZSgpO1xyXG4gICAgICAgICAgICBtb2RhbC5tb2RhbCgnaGlkZScpO1xyXG4gICAgICAgIH07XHJcbiAgICBtb2RhbC5maW5kKFwiLmRlbGV0ZS11c2VyXCIpLm9uKFwiY2xpY2tcIiwgZnVuY3Rpb24oZSl7XHJcbiAgICAgICAgZS5wcmV2ZW50RGVmYXVsdCgpO1xyXG4gICAgICAgIHZhciBpZCA9IG1vZGFsLmZpbmQoXCIudXNlcl9pZCBwXCIpLnRleHQoKTtcclxuXHJcbiAgICAgICAgcmVxdWVzdE9wdGlvbnMuc3VjY2VzcyA9IG9uRGVsZXRlU3VjY2VzcztcclxuICAgICAgICByZXF1ZXN0T3B0aW9ucy5lcnJvciA9IG9uRWRpdEVycm9yO1xyXG4gICAgICAgIHJlcXVlc3RPcHRpb25zLmRhdGEgPSB7XHJcbiAgICAgICAgICAgIFwiVWlkXCI6IGlkXHJcbiAgICAgICAgfTtcclxuICAgICAgICAkLmFqYXgoVVJMRGVsZXRlVXNlciwgcmVxdWVzdE9wdGlvbnMpO1xyXG4gICAgfSlcclxuICAgIFxyXG59KTtcclxuIl0sImZpbGUiOiJkYXNoYm9hcmQvdXNlcnNhbGwuanMiLCJzb3VyY2VSb290IjoiL3NvdXJjZS8ifQ==
