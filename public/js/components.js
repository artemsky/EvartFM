$(function() {
    "use strict";
    //Slider
    (function(){
        var forDelete = [];
        var sliderItems = $(".sortableSlider");
        var removeIntent = false;
        sliderItems.sortable({
                items: ".item",
                opacity: 0.8,
                stop: function( event, ui ) {
                        $(event.target).find(".item").each(function(i, obj){
                                $(obj).attr("data-order", i+1);
                        });
                },
                over: function () {
                        removeIntent = false;
                },
                out: function () {
                        removeIntent = true;
                },
                beforeStop: function (event, ui) {
                        if(removeIntent == true){
                                ui.item.remove();
                                var id = ui.item.attr("data-id");
                                if(id > 1 && id < 99999)
                                        forDelete.push(ui.item.attr("data-id"));
                        }
                }
        });

        function readURL(input) {
                if (input.files && input.files[0]) {
                        var reader = new FileReader();
                        reader.onload = function (e) {
                                $('#preview').attr('src', e.target.result);
                        };
                        reader.readAsDataURL(input.files[0]);
                }
        }

        $("#image").change(function(){
                readURL(this);
        });

        var URLUpdateItems = "content/component/update/Slider";
        var onEditError = function(response){
                    console.log(response);
                    $("body").append(response.responseText)
            },
            onEditSuccess = function(response){
                    console.log(response);
            };
        var modal = $("#modal_slider");
        var form = modal.find('form');
        var requestOptions = {
                type: "POST",
                headers: {
                        'X-CSRF-TOKEN': $('meta[name="csrf-token"]').attr('content')
                },
                success: onEditSuccess,
                error: onEditError
        };
        sliderItems.find(".save-all").on("click", function(){
                var data = [];
                sliderItems.find('.item').each(function(i, obj){
                        data.push({
                                id:  $(obj).attr("data-id"),
                                order:  $(obj).attr("data-order"),
                                title:  $(obj).find("h1").text(),
                                description: $(obj).find("p").text(),
                                image: $(obj).find("img").attr("src")
                        });
                });
                requestOptions.data = {data:data};
                $.ajax(URLUpdateItems, requestOptions);
                if(forDelete.length > 0){
                        requestOptions.data = {id: forDelete};
                        $.ajax("content/component/delete/Slider", requestOptions);
                        forDelete = [];
                }
        });
        var currentItem = null;
        var isNew = false;
        var title = form.find("#title");
        var description = form.find("#description");
        var image = form.find("img");
        sliderItems.on('click', ".item", function(){
                isNew = false;
                currentItem = $(this);
                title.val(currentItem.find("h1").text());
                description.val(currentItem.find("p").text());
                image.attr("src", currentItem.find("img").attr("src"));
                modal.find(".modal-title span").text(currentItem.attr("data-order"));
                modal.modal();
        });

        modal.find(".save-changes").on("click", function(){
                currentItem.find("h1").text(title.val());
                currentItem.find("p").text(description.val());
                currentItem.find("img").attr("src", $('#preview').attr("src"));
                if(isNew)
                        sliderItems.find(".more").before(currentItem);
                modal.modal('hide');
        });

        modal.find(".delete-item").on("click", function(){
                currentItem.remove();
                var id = currentItem.attr("data-id");
                if(id > 1 && id < 99999)
                        forDelete.push(ui.item.attr("data-id"));
                modal.modal('hide');
        });

        sliderItems.find(".new-item").on("click", function(){
                isNew = true;
                currentItem = sliderItems.find(".cloneable").clone(true);
                currentItem.removeClass("cloneable hidden").addClass('item');
                currentItem.attr("data-order", (parseInt(sliderItems.find(".item:last").attr("data-order")) || 0)+1);
                currentItem.attr("data-id", "-1");
                form.get(0).reset();
                image.attr("src", '');
                modal.find(".modal-title span").text('');
                modal.modal();
        });
    })();
    //Blockquote
    (function(){
            var forDelete = [];
            var sliderItems = $(".sortableBlockquote");
            var removeIntent = false;
            sliderItems.sortable({
                    items: ".panel",
                    handle: ".panel-heading",
                    opacity: 0.8,
                    stop: function( event, ui ) {
                            $(event.target).find(".panel").each(function(i, obj){
                                    $(obj).attr("data-order", i+1);
                            });
                    },
                    over: function () {
                            removeIntent = false;
                    },
                    out: function () {
                            removeIntent = true;
                    },
                    beforeStop: function (event, ui) {
                            if(removeIntent == true){
                                    ui.item.remove();
                                    var id = ui.item.attr("data-id");
                                    if(id > 1 && id < 99999)
                                            forDelete.push(ui.item.attr("data-id"));
                            }
                    }
            });

            function readURL(input, target) {
                    if (input.files && input.files[0]) {
                            var reader = new FileReader();
                            reader.onload = function (e) {
                                    target.prev().attr('src', e.target.result);
                            };
                            reader.readAsDataURL(input.files[0]);
                    }
            }

            sliderItems.find("input.image").change(function(e){
                    readURL(this, $(e.target));
            });

            var starClone = null;
            sliderItems.find(".stars").on('mouseenter', function(){
                    starClone = $(this).clone();
                    $(this).on("mouseover", function(e){
                            if(e.target == this) return false;
                            $(e.target).prevAll().addClass('active');
                            $(e.target).addClass('active');
                            $(e.target).nextAll().removeClass('active');
                    });
            }).on('mouseleave', function(){
                    $(this).off("mouseover");
                    $(this).html(starClone.html());
            }).on('click', function(e){
                    if(e.target == this) return;
                    starClone = $(this).clone();
            });
            sliderItems.find(".panel-body").on("input", '.name', function(e){
                    $(e.delegateTarget).parent().prev().find(".name").text($(this).text());
            });
            sliderItems.find(".panel-body button").on("click", function(){
                    var item = $(this).parent().parent().parent();
                    var id = item.attr("data-id");
                    item.remove();
                    if(id > 1 && id < 99999)
                            forDelete.push(ui.item.attr("data-id"));
            });

            sliderItems.find(".new-item").on("click", function(){
                    var item = sliderItems.find('.cloneable').clone(true);
                    var randomId = Date.now();
                    item.removeClass('cloneable hidden')
                        .addClass("item")
                        .attr("data-id", "-1");
                    item.attr("data-order", (parseInt(sliderItems.find(".panel:last")
                            .prev().attr("data-order")) || 0) + 1);
                    item.find('.panel-heading').attr("id", "heading_" + randomId);
                    item.find('.panel-title a')
                        .attr("href", "#collapse_"  + randomId)
                        .attr("aria-controls", "collapse_" + randomId);
                    item.find('.panel-collapse')
                        .attr('id', 'collapse_' + randomId)
                        .attr('aria-labelledby', 'heading_' + randomId);
                    item.find('label').attr("for", 'img_' + randomId)
                        .find("input").attr("id", 'img_' + randomId);

                    sliderItems.find('.cloneable').before(item);

            });

            var URLUpdateItems = "content/component/update/Blockquote";
            var onEditError = function(response){
                        console.log(response);
                        $("body").append(response.responseText)
                },
                onEditSuccess = function(response){
                        console.log(response);

                };

            var requestOptions = {
                    type: "POST",
                    headers: {
                            'X-CSRF-TOKEN': $('meta[name="csrf-token"]').attr('content')
                    },
                    success: onEditSuccess,
                    error: onEditError
            };
            sliderItems.find(".save-all").on("click", function(){
                    var data = [];
                    sliderItems.find('.item').each(function(i, obj){
                            data.push({
                                    id:  $(obj).attr("data-id"),
                                    order:  $(obj).attr("data-order"),
                                    name:  $(obj).find(".panel-body .name").text(),
                                    description: $(obj).find(".panel-body h6").text(),
                                    text: $(obj).find(".panel-body h6").text(),
                                    stars: $(obj).find('.panel-body h5').length,
                                    image: $(obj).find("img").attr("src")
                            });
                    });
                    requestOptions.data = {data:data};
                    $.ajax(URLUpdateItems, requestOptions);
                    if(forDelete.length > 0){
                            requestOptions.data = {id: forDelete};
                            $.ajax("content/component/delete/Blockquote", requestOptions);
                            forDelete = [];
                    }
            });

    })();
    //Events
    (function(){
        var forDelete = [];
        var sliderItems = $(".sortableEvents");
        var removeIntent = false;
        $("#events_date").datetimepicker({
            format: 'Y-m-d',
            timepicker: false
        });
        sliderItems.sortable({
            items: ".item",
            opacity: 0.8,
            stop: function( event, ui ) {
                $(event.target).find(".item").each(function(i, obj){
                    $(obj).attr("data-order", i+1);
                });
            },
            over: function () {
                removeIntent = false;
            },
            out: function () {
                removeIntent = true;
            },
            beforeStop: function (event, ui) {
                if(removeIntent == true){
                    ui.item.remove();
                    var id = ui.item.attr("data-id");
                    if(id > 1 && id < 99999)
                        forDelete.push(ui.item.attr("data-id"));
                }
            }
        });

        function readURL(input) {
            if (input.files && input.files[0]) {
                var reader = new FileReader();
                reader.onload = function (e) {
                    $('#events_preview').attr('src', e.target.result);
                };
                reader.readAsDataURL(input.files[0]);
            }
        }

        $("#events_image").change(function(){
            readURL(this);
        });

        var URLUpdateItems = "content/component/update/Events";
        var onEditError = function(response){
                console.log(response);
                $("body").append(response.responseText)
            },
            onEditSuccess = function(response){
                console.log(response);
            };
        var modal = $("#modal_events");
        var form = modal.find('form');
        var requestOptions = {
            type: "POST",
            headers: {
                'X-CSRF-TOKEN': $('meta[name="csrf-token"]').attr('content')
            },
            success: onEditSuccess,
            error: onEditError
        };
        sliderItems.find(".save-all").on("click", function(){
            var data = [];
            sliderItems.find('.item').each(function(i, obj){
                data.push({
                    id:  $(obj).attr("data-id"),
                    order:  $(obj).attr("data-order"),
                    title:  $(obj).find("h1").text(),
                    description: $(obj).find("p:first").text(),
                    date: $(obj).find(".date").text(),
                    image: $(obj).find("img").attr("src")
                });
            });
            requestOptions.data = {data:data};
            $.ajax(URLUpdateItems, requestOptions);
            if(forDelete.length > 0){
                requestOptions.data = {id: forDelete};
                $.ajax("content/component/delete/Events", requestOptions);
                forDelete = [];
            }
        });
        var currentItem = null;
        var isNew = false;
        var title = form.find("#events_title");
        var description = form.find("#events_description");
        var image = form.find("img");
        var date = form.find("#events_date");
        sliderItems.on('click', ".item", function(){
            isNew = false;
            currentItem = $(this);
            title.val(currentItem.find("h1").text());
            description.val(currentItem.find("p").text());
            image.attr("src", currentItem.find("img").attr("src"));
            date.datepicker( "setDate", currentItem.find('.date').text());
            modal.find(".modal-title span").text(currentItem.attr("data-order"));
            modal.modal();
        });

        modal.find(".save-changes").on("click", function(){
            currentItem.find("h1").text(title.val());
            currentItem.find("p").text(description.val());
            currentItem.find("img").attr("src", $('#events_preview').attr("src"));
            currentItem.find(".date").text(moment($('#events_date').datetimepicker('getValue')).format('YYYY-MM-DD'));
            if(isNew)
                sliderItems.find(".more").before(currentItem);
            modal.modal('hide');
        });

        modal.find(".delete-item").on("click", function(){
            currentItem.remove();
            var id = currentItem.attr("data-id");
            if(id > 1 && id < 99999)
                forDelete.push(ui.item.attr("data-id"));
            modal.modal('hide');
        });

        sliderItems.find(".new-item").on("click", function(){
            isNew = true;
            currentItem = sliderItems.find(".cloneable").clone(true);
            currentItem.removeClass("cloneable hidden").addClass('item');
            currentItem.attr("data-order", (parseInt(sliderItems.find(".item:last").attr("data-order")) || 0)+1);
            currentItem.attr("data-id", "-1");
            form.get(0).reset();
            image.attr("src", '');
            modal.find(".modal-title span").text('');
            modal.modal();
        });
    })();

});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiIiwic291cmNlcyI6WyJjb21wb25lbnRzLmpzIl0sInNvdXJjZXNDb250ZW50IjpbIiQoZnVuY3Rpb24oKSB7XHJcbiAgICBcInVzZSBzdHJpY3RcIjtcclxuICAgIC8vU2xpZGVyXHJcbiAgICAoZnVuY3Rpb24oKXtcclxuICAgICAgICB2YXIgZm9yRGVsZXRlID0gW107XHJcbiAgICAgICAgdmFyIHNsaWRlckl0ZW1zID0gJChcIi5zb3J0YWJsZVNsaWRlclwiKTtcclxuICAgICAgICB2YXIgcmVtb3ZlSW50ZW50ID0gZmFsc2U7XHJcbiAgICAgICAgc2xpZGVySXRlbXMuc29ydGFibGUoe1xyXG4gICAgICAgICAgICAgICAgaXRlbXM6IFwiLml0ZW1cIixcclxuICAgICAgICAgICAgICAgIG9wYWNpdHk6IDAuOCxcclxuICAgICAgICAgICAgICAgIHN0b3A6IGZ1bmN0aW9uKCBldmVudCwgdWkgKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICQoZXZlbnQudGFyZ2V0KS5maW5kKFwiLml0ZW1cIikuZWFjaChmdW5jdGlvbihpLCBvYmope1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICQob2JqKS5hdHRyKFwiZGF0YS1vcmRlclwiLCBpKzEpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgICAgICBvdmVyOiBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHJlbW92ZUludGVudCA9IGZhbHNlO1xyXG4gICAgICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgICAgIG91dDogZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICByZW1vdmVJbnRlbnQgPSB0cnVlO1xyXG4gICAgICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgICAgIGJlZm9yZVN0b3A6IGZ1bmN0aW9uIChldmVudCwgdWkpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgaWYocmVtb3ZlSW50ZW50ID09IHRydWUpe1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHVpLml0ZW0ucmVtb3ZlKCk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdmFyIGlkID0gdWkuaXRlbS5hdHRyKFwiZGF0YS1pZFwiKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZihpZCA+IDEgJiYgaWQgPCA5OTk5OSlcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGZvckRlbGV0ZS5wdXNoKHVpLml0ZW0uYXR0cihcImRhdGEtaWRcIikpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgfSk7XHJcblxyXG4gICAgICAgIGZ1bmN0aW9uIHJlYWRVUkwoaW5wdXQpIHtcclxuICAgICAgICAgICAgICAgIGlmIChpbnB1dC5maWxlcyAmJiBpbnB1dC5maWxlc1swXSkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB2YXIgcmVhZGVyID0gbmV3IEZpbGVSZWFkZXIoKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgcmVhZGVyLm9ubG9hZCA9IGZ1bmN0aW9uIChlKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgJCgnI3ByZXZpZXcnKS5hdHRyKCdzcmMnLCBlLnRhcmdldC5yZXN1bHQpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB9O1xyXG4gICAgICAgICAgICAgICAgICAgICAgICByZWFkZXIucmVhZEFzRGF0YVVSTChpbnB1dC5maWxlc1swXSk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICAkKFwiI2ltYWdlXCIpLmNoYW5nZShmdW5jdGlvbigpe1xyXG4gICAgICAgICAgICAgICAgcmVhZFVSTCh0aGlzKTtcclxuICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgdmFyIFVSTFVwZGF0ZUl0ZW1zID0gXCJjb250ZW50L2NvbXBvbmVudC91cGRhdGUvU2xpZGVyXCI7XHJcbiAgICAgICAgdmFyIG9uRWRpdEVycm9yID0gZnVuY3Rpb24ocmVzcG9uc2Upe1xyXG4gICAgICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKHJlc3BvbnNlKTtcclxuICAgICAgICAgICAgICAgICAgICAkKFwiYm9keVwiKS5hcHBlbmQocmVzcG9uc2UucmVzcG9uc2VUZXh0KVxyXG4gICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICBvbkVkaXRTdWNjZXNzID0gZnVuY3Rpb24ocmVzcG9uc2Upe1xyXG4gICAgICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKHJlc3BvbnNlKTtcclxuICAgICAgICAgICAgfTtcclxuICAgICAgICB2YXIgbW9kYWwgPSAkKFwiI21vZGFsX3NsaWRlclwiKTtcclxuICAgICAgICB2YXIgZm9ybSA9IG1vZGFsLmZpbmQoJ2Zvcm0nKTtcclxuICAgICAgICB2YXIgcmVxdWVzdE9wdGlvbnMgPSB7XHJcbiAgICAgICAgICAgICAgICB0eXBlOiBcIlBPU1RcIixcclxuICAgICAgICAgICAgICAgIGhlYWRlcnM6IHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgJ1gtQ1NSRi1UT0tFTic6ICQoJ21ldGFbbmFtZT1cImNzcmYtdG9rZW5cIl0nKS5hdHRyKCdjb250ZW50JylcclxuICAgICAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgICAgICBzdWNjZXNzOiBvbkVkaXRTdWNjZXNzLFxyXG4gICAgICAgICAgICAgICAgZXJyb3I6IG9uRWRpdEVycm9yXHJcbiAgICAgICAgfTtcclxuICAgICAgICBzbGlkZXJJdGVtcy5maW5kKFwiLnNhdmUtYWxsXCIpLm9uKFwiY2xpY2tcIiwgZnVuY3Rpb24oKXtcclxuICAgICAgICAgICAgICAgIHZhciBkYXRhID0gW107XHJcbiAgICAgICAgICAgICAgICBzbGlkZXJJdGVtcy5maW5kKCcuaXRlbScpLmVhY2goZnVuY3Rpb24oaSwgb2JqKXtcclxuICAgICAgICAgICAgICAgICAgICAgICAgZGF0YS5wdXNoKHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZDogICQob2JqKS5hdHRyKFwiZGF0YS1pZFwiKSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBvcmRlcjogICQob2JqKS5hdHRyKFwiZGF0YS1vcmRlclwiKSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aXRsZTogICQob2JqKS5maW5kKFwiaDFcIikudGV4dCgpLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRlc2NyaXB0aW9uOiAkKG9iaikuZmluZChcInBcIikudGV4dCgpLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGltYWdlOiAkKG9iaikuZmluZChcImltZ1wiKS5hdHRyKFwic3JjXCIpXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgICAgICByZXF1ZXN0T3B0aW9ucy5kYXRhID0ge2RhdGE6ZGF0YX07XHJcbiAgICAgICAgICAgICAgICAkLmFqYXgoVVJMVXBkYXRlSXRlbXMsIHJlcXVlc3RPcHRpb25zKTtcclxuICAgICAgICAgICAgICAgIGlmKGZvckRlbGV0ZS5sZW5ndGggPiAwKXtcclxuICAgICAgICAgICAgICAgICAgICAgICAgcmVxdWVzdE9wdGlvbnMuZGF0YSA9IHtpZDogZm9yRGVsZXRlfTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgJC5hamF4KFwiY29udGVudC9jb21wb25lbnQvZGVsZXRlL1NsaWRlclwiLCByZXF1ZXN0T3B0aW9ucyk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGZvckRlbGV0ZSA9IFtdO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgIH0pO1xyXG4gICAgICAgIHZhciBjdXJyZW50SXRlbSA9IG51bGw7XHJcbiAgICAgICAgdmFyIGlzTmV3ID0gZmFsc2U7XHJcbiAgICAgICAgdmFyIHRpdGxlID0gZm9ybS5maW5kKFwiI3RpdGxlXCIpO1xyXG4gICAgICAgIHZhciBkZXNjcmlwdGlvbiA9IGZvcm0uZmluZChcIiNkZXNjcmlwdGlvblwiKTtcclxuICAgICAgICB2YXIgaW1hZ2UgPSBmb3JtLmZpbmQoXCJpbWdcIik7XHJcbiAgICAgICAgc2xpZGVySXRlbXMub24oJ2NsaWNrJywgXCIuaXRlbVwiLCBmdW5jdGlvbigpe1xyXG4gICAgICAgICAgICAgICAgaXNOZXcgPSBmYWxzZTtcclxuICAgICAgICAgICAgICAgIGN1cnJlbnRJdGVtID0gJCh0aGlzKTtcclxuICAgICAgICAgICAgICAgIHRpdGxlLnZhbChjdXJyZW50SXRlbS5maW5kKFwiaDFcIikudGV4dCgpKTtcclxuICAgICAgICAgICAgICAgIGRlc2NyaXB0aW9uLnZhbChjdXJyZW50SXRlbS5maW5kKFwicFwiKS50ZXh0KCkpO1xyXG4gICAgICAgICAgICAgICAgaW1hZ2UuYXR0cihcInNyY1wiLCBjdXJyZW50SXRlbS5maW5kKFwiaW1nXCIpLmF0dHIoXCJzcmNcIikpO1xyXG4gICAgICAgICAgICAgICAgbW9kYWwuZmluZChcIi5tb2RhbC10aXRsZSBzcGFuXCIpLnRleHQoY3VycmVudEl0ZW0uYXR0cihcImRhdGEtb3JkZXJcIikpO1xyXG4gICAgICAgICAgICAgICAgbW9kYWwubW9kYWwoKTtcclxuICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgbW9kYWwuZmluZChcIi5zYXZlLWNoYW5nZXNcIikub24oXCJjbGlja1wiLCBmdW5jdGlvbigpe1xyXG4gICAgICAgICAgICAgICAgY3VycmVudEl0ZW0uZmluZChcImgxXCIpLnRleHQodGl0bGUudmFsKCkpO1xyXG4gICAgICAgICAgICAgICAgY3VycmVudEl0ZW0uZmluZChcInBcIikudGV4dChkZXNjcmlwdGlvbi52YWwoKSk7XHJcbiAgICAgICAgICAgICAgICBjdXJyZW50SXRlbS5maW5kKFwiaW1nXCIpLmF0dHIoXCJzcmNcIiwgJCgnI3ByZXZpZXcnKS5hdHRyKFwic3JjXCIpKTtcclxuICAgICAgICAgICAgICAgIGlmKGlzTmV3KVxyXG4gICAgICAgICAgICAgICAgICAgICAgICBzbGlkZXJJdGVtcy5maW5kKFwiLm1vcmVcIikuYmVmb3JlKGN1cnJlbnRJdGVtKTtcclxuICAgICAgICAgICAgICAgIG1vZGFsLm1vZGFsKCdoaWRlJyk7XHJcbiAgICAgICAgfSk7XHJcblxyXG4gICAgICAgIG1vZGFsLmZpbmQoXCIuZGVsZXRlLWl0ZW1cIikub24oXCJjbGlja1wiLCBmdW5jdGlvbigpe1xyXG4gICAgICAgICAgICAgICAgY3VycmVudEl0ZW0ucmVtb3ZlKCk7XHJcbiAgICAgICAgICAgICAgICB2YXIgaWQgPSBjdXJyZW50SXRlbS5hdHRyKFwiZGF0YS1pZFwiKTtcclxuICAgICAgICAgICAgICAgIGlmKGlkID4gMSAmJiBpZCA8IDk5OTk5KVxyXG4gICAgICAgICAgICAgICAgICAgICAgICBmb3JEZWxldGUucHVzaCh1aS5pdGVtLmF0dHIoXCJkYXRhLWlkXCIpKTtcclxuICAgICAgICAgICAgICAgIG1vZGFsLm1vZGFsKCdoaWRlJyk7XHJcbiAgICAgICAgfSk7XHJcblxyXG4gICAgICAgIHNsaWRlckl0ZW1zLmZpbmQoXCIubmV3LWl0ZW1cIikub24oXCJjbGlja1wiLCBmdW5jdGlvbigpe1xyXG4gICAgICAgICAgICAgICAgaXNOZXcgPSB0cnVlO1xyXG4gICAgICAgICAgICAgICAgY3VycmVudEl0ZW0gPSBzbGlkZXJJdGVtcy5maW5kKFwiLmNsb25lYWJsZVwiKS5jbG9uZSh0cnVlKTtcclxuICAgICAgICAgICAgICAgIGN1cnJlbnRJdGVtLnJlbW92ZUNsYXNzKFwiY2xvbmVhYmxlIGhpZGRlblwiKS5hZGRDbGFzcygnaXRlbScpO1xyXG4gICAgICAgICAgICAgICAgY3VycmVudEl0ZW0uYXR0cihcImRhdGEtb3JkZXJcIiwgKHBhcnNlSW50KHNsaWRlckl0ZW1zLmZpbmQoXCIuaXRlbTpsYXN0XCIpLmF0dHIoXCJkYXRhLW9yZGVyXCIpKSB8fCAwKSsxKTtcclxuICAgICAgICAgICAgICAgIGN1cnJlbnRJdGVtLmF0dHIoXCJkYXRhLWlkXCIsIFwiLTFcIik7XHJcbiAgICAgICAgICAgICAgICBmb3JtLmdldCgwKS5yZXNldCgpO1xyXG4gICAgICAgICAgICAgICAgaW1hZ2UuYXR0cihcInNyY1wiLCAnJyk7XHJcbiAgICAgICAgICAgICAgICBtb2RhbC5maW5kKFwiLm1vZGFsLXRpdGxlIHNwYW5cIikudGV4dCgnJyk7XHJcbiAgICAgICAgICAgICAgICBtb2RhbC5tb2RhbCgpO1xyXG4gICAgICAgIH0pO1xyXG4gICAgfSkoKTtcclxuICAgIC8vQmxvY2txdW90ZVxyXG4gICAgKGZ1bmN0aW9uKCl7XHJcbiAgICAgICAgICAgIHZhciBmb3JEZWxldGUgPSBbXTtcclxuICAgICAgICAgICAgdmFyIHNsaWRlckl0ZW1zID0gJChcIi5zb3J0YWJsZUJsb2NrcXVvdGVcIik7XHJcbiAgICAgICAgICAgIHZhciByZW1vdmVJbnRlbnQgPSBmYWxzZTtcclxuICAgICAgICAgICAgc2xpZGVySXRlbXMuc29ydGFibGUoe1xyXG4gICAgICAgICAgICAgICAgICAgIGl0ZW1zOiBcIi5wYW5lbFwiLFxyXG4gICAgICAgICAgICAgICAgICAgIGhhbmRsZTogXCIucGFuZWwtaGVhZGluZ1wiLFxyXG4gICAgICAgICAgICAgICAgICAgIG9wYWNpdHk6IDAuOCxcclxuICAgICAgICAgICAgICAgICAgICBzdG9wOiBmdW5jdGlvbiggZXZlbnQsIHVpICkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgJChldmVudC50YXJnZXQpLmZpbmQoXCIucGFuZWxcIikuZWFjaChmdW5jdGlvbihpLCBvYmope1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAkKG9iaikuYXR0cihcImRhdGEtb3JkZXJcIiwgaSsxKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgICAgICAgICAgb3ZlcjogZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcmVtb3ZlSW50ZW50ID0gZmFsc2U7XHJcbiAgICAgICAgICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgICAgICAgICBvdXQ6IGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJlbW92ZUludGVudCA9IHRydWU7XHJcbiAgICAgICAgICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgICAgICAgICBiZWZvcmVTdG9wOiBmdW5jdGlvbiAoZXZlbnQsIHVpKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZihyZW1vdmVJbnRlbnQgPT0gdHJ1ZSl7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHVpLml0ZW0ucmVtb3ZlKCk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHZhciBpZCA9IHVpLml0ZW0uYXR0cihcImRhdGEtaWRcIik7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmKGlkID4gMSAmJiBpZCA8IDk5OTk5KVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGZvckRlbGV0ZS5wdXNoKHVpLml0ZW0uYXR0cihcImRhdGEtaWRcIikpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfSk7XHJcblxyXG4gICAgICAgICAgICBmdW5jdGlvbiByZWFkVVJMKGlucHV0LCB0YXJnZXQpIHtcclxuICAgICAgICAgICAgICAgICAgICBpZiAoaW5wdXQuZmlsZXMgJiYgaW5wdXQuZmlsZXNbMF0pIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHZhciByZWFkZXIgPSBuZXcgRmlsZVJlYWRlcigpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcmVhZGVyLm9ubG9hZCA9IGZ1bmN0aW9uIChlKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRhcmdldC5wcmV2KCkuYXR0cignc3JjJywgZS50YXJnZXQucmVzdWx0KTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH07XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICByZWFkZXIucmVhZEFzRGF0YVVSTChpbnB1dC5maWxlc1swXSk7XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICBzbGlkZXJJdGVtcy5maW5kKFwiaW5wdXQuaW1hZ2VcIikuY2hhbmdlKGZ1bmN0aW9uKGUpe1xyXG4gICAgICAgICAgICAgICAgICAgIHJlYWRVUkwodGhpcywgJChlLnRhcmdldCkpO1xyXG4gICAgICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgICAgIHZhciBzdGFyQ2xvbmUgPSBudWxsO1xyXG4gICAgICAgICAgICBzbGlkZXJJdGVtcy5maW5kKFwiLnN0YXJzXCIpLm9uKCdtb3VzZWVudGVyJywgZnVuY3Rpb24oKXtcclxuICAgICAgICAgICAgICAgICAgICBzdGFyQ2xvbmUgPSAkKHRoaXMpLmNsb25lKCk7XHJcbiAgICAgICAgICAgICAgICAgICAgJCh0aGlzKS5vbihcIm1vdXNlb3ZlclwiLCBmdW5jdGlvbihlKXtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmKGUudGFyZ2V0ID09IHRoaXMpIHJldHVybiBmYWxzZTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICQoZS50YXJnZXQpLnByZXZBbGwoKS5hZGRDbGFzcygnYWN0aXZlJyk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAkKGUudGFyZ2V0KS5hZGRDbGFzcygnYWN0aXZlJyk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAkKGUudGFyZ2V0KS5uZXh0QWxsKCkucmVtb3ZlQ2xhc3MoJ2FjdGl2ZScpO1xyXG4gICAgICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICB9KS5vbignbW91c2VsZWF2ZScsIGZ1bmN0aW9uKCl7XHJcbiAgICAgICAgICAgICAgICAgICAgJCh0aGlzKS5vZmYoXCJtb3VzZW92ZXJcIik7XHJcbiAgICAgICAgICAgICAgICAgICAgJCh0aGlzKS5odG1sKHN0YXJDbG9uZS5odG1sKCkpO1xyXG4gICAgICAgICAgICB9KS5vbignY2xpY2snLCBmdW5jdGlvbihlKXtcclxuICAgICAgICAgICAgICAgICAgICBpZihlLnRhcmdldCA9PSB0aGlzKSByZXR1cm47XHJcbiAgICAgICAgICAgICAgICAgICAgc3RhckNsb25lID0gJCh0aGlzKS5jbG9uZSgpO1xyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgc2xpZGVySXRlbXMuZmluZChcIi5wYW5lbC1ib2R5XCIpLm9uKFwiaW5wdXRcIiwgJy5uYW1lJywgZnVuY3Rpb24oZSl7XHJcbiAgICAgICAgICAgICAgICAgICAgJChlLmRlbGVnYXRlVGFyZ2V0KS5wYXJlbnQoKS5wcmV2KCkuZmluZChcIi5uYW1lXCIpLnRleHQoJCh0aGlzKS50ZXh0KCkpO1xyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgc2xpZGVySXRlbXMuZmluZChcIi5wYW5lbC1ib2R5IGJ1dHRvblwiKS5vbihcImNsaWNrXCIsIGZ1bmN0aW9uKCl7XHJcbiAgICAgICAgICAgICAgICAgICAgdmFyIGl0ZW0gPSAkKHRoaXMpLnBhcmVudCgpLnBhcmVudCgpLnBhcmVudCgpO1xyXG4gICAgICAgICAgICAgICAgICAgIHZhciBpZCA9IGl0ZW0uYXR0cihcImRhdGEtaWRcIik7XHJcbiAgICAgICAgICAgICAgICAgICAgaXRlbS5yZW1vdmUoKTtcclxuICAgICAgICAgICAgICAgICAgICBpZihpZCA+IDEgJiYgaWQgPCA5OTk5OSlcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGZvckRlbGV0ZS5wdXNoKHVpLml0ZW0uYXR0cihcImRhdGEtaWRcIikpO1xyXG4gICAgICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgICAgIHNsaWRlckl0ZW1zLmZpbmQoXCIubmV3LWl0ZW1cIikub24oXCJjbGlja1wiLCBmdW5jdGlvbigpe1xyXG4gICAgICAgICAgICAgICAgICAgIHZhciBpdGVtID0gc2xpZGVySXRlbXMuZmluZCgnLmNsb25lYWJsZScpLmNsb25lKHRydWUpO1xyXG4gICAgICAgICAgICAgICAgICAgIHZhciByYW5kb21JZCA9IERhdGUubm93KCk7XHJcbiAgICAgICAgICAgICAgICAgICAgaXRlbS5yZW1vdmVDbGFzcygnY2xvbmVhYmxlIGhpZGRlbicpXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIC5hZGRDbGFzcyhcIml0ZW1cIilcclxuICAgICAgICAgICAgICAgICAgICAgICAgLmF0dHIoXCJkYXRhLWlkXCIsIFwiLTFcIik7XHJcbiAgICAgICAgICAgICAgICAgICAgaXRlbS5hdHRyKFwiZGF0YS1vcmRlclwiLCAocGFyc2VJbnQoc2xpZGVySXRlbXMuZmluZChcIi5wYW5lbDpsYXN0XCIpXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAucHJldigpLmF0dHIoXCJkYXRhLW9yZGVyXCIpKSB8fCAwKSArIDEpO1xyXG4gICAgICAgICAgICAgICAgICAgIGl0ZW0uZmluZCgnLnBhbmVsLWhlYWRpbmcnKS5hdHRyKFwiaWRcIiwgXCJoZWFkaW5nX1wiICsgcmFuZG9tSWQpO1xyXG4gICAgICAgICAgICAgICAgICAgIGl0ZW0uZmluZCgnLnBhbmVsLXRpdGxlIGEnKVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAuYXR0cihcImhyZWZcIiwgXCIjY29sbGFwc2VfXCIgICsgcmFuZG9tSWQpXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIC5hdHRyKFwiYXJpYS1jb250cm9sc1wiLCBcImNvbGxhcHNlX1wiICsgcmFuZG9tSWQpO1xyXG4gICAgICAgICAgICAgICAgICAgIGl0ZW0uZmluZCgnLnBhbmVsLWNvbGxhcHNlJylcclxuICAgICAgICAgICAgICAgICAgICAgICAgLmF0dHIoJ2lkJywgJ2NvbGxhcHNlXycgKyByYW5kb21JZClcclxuICAgICAgICAgICAgICAgICAgICAgICAgLmF0dHIoJ2FyaWEtbGFiZWxsZWRieScsICdoZWFkaW5nXycgKyByYW5kb21JZCk7XHJcbiAgICAgICAgICAgICAgICAgICAgaXRlbS5maW5kKCdsYWJlbCcpLmF0dHIoXCJmb3JcIiwgJ2ltZ18nICsgcmFuZG9tSWQpXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIC5maW5kKFwiaW5wdXRcIikuYXR0cihcImlkXCIsICdpbWdfJyArIHJhbmRvbUlkKTtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgc2xpZGVySXRlbXMuZmluZCgnLmNsb25lYWJsZScpLmJlZm9yZShpdGVtKTtcclxuXHJcbiAgICAgICAgICAgIH0pO1xyXG5cclxuICAgICAgICAgICAgdmFyIFVSTFVwZGF0ZUl0ZW1zID0gXCJjb250ZW50L2NvbXBvbmVudC91cGRhdGUvQmxvY2txdW90ZVwiO1xyXG4gICAgICAgICAgICB2YXIgb25FZGl0RXJyb3IgPSBmdW5jdGlvbihyZXNwb25zZSl7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKHJlc3BvbnNlKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgJChcImJvZHlcIikuYXBwZW5kKHJlc3BvbnNlLnJlc3BvbnNlVGV4dClcclxuICAgICAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgICAgICBvbkVkaXRTdWNjZXNzID0gZnVuY3Rpb24ocmVzcG9uc2Upe1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhyZXNwb25zZSk7XHJcblxyXG4gICAgICAgICAgICAgICAgfTtcclxuXHJcbiAgICAgICAgICAgIHZhciByZXF1ZXN0T3B0aW9ucyA9IHtcclxuICAgICAgICAgICAgICAgICAgICB0eXBlOiBcIlBPU1RcIixcclxuICAgICAgICAgICAgICAgICAgICBoZWFkZXJzOiB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAnWC1DU1JGLVRPS0VOJzogJCgnbWV0YVtuYW1lPVwiY3NyZi10b2tlblwiXScpLmF0dHIoJ2NvbnRlbnQnKVxyXG4gICAgICAgICAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgICAgICAgICAgc3VjY2Vzczogb25FZGl0U3VjY2VzcyxcclxuICAgICAgICAgICAgICAgICAgICBlcnJvcjogb25FZGl0RXJyb3JcclxuICAgICAgICAgICAgfTtcclxuICAgICAgICAgICAgc2xpZGVySXRlbXMuZmluZChcIi5zYXZlLWFsbFwiKS5vbihcImNsaWNrXCIsIGZ1bmN0aW9uKCl7XHJcbiAgICAgICAgICAgICAgICAgICAgdmFyIGRhdGEgPSBbXTtcclxuICAgICAgICAgICAgICAgICAgICBzbGlkZXJJdGVtcy5maW5kKCcuaXRlbScpLmVhY2goZnVuY3Rpb24oaSwgb2JqKXtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRhdGEucHVzaCh7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlkOiAgJChvYmopLmF0dHIoXCJkYXRhLWlkXCIpLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBvcmRlcjogICQob2JqKS5hdHRyKFwiZGF0YS1vcmRlclwiKSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbmFtZTogICQob2JqKS5maW5kKFwiLnBhbmVsLWJvZHkgLm5hbWVcIikudGV4dCgpLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBkZXNjcmlwdGlvbjogJChvYmopLmZpbmQoXCIucGFuZWwtYm9keSBoNlwiKS50ZXh0KCksXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRleHQ6ICQob2JqKS5maW5kKFwiLnBhbmVsLWJvZHkgaDZcIikudGV4dCgpLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBzdGFyczogJChvYmopLmZpbmQoJy5wYW5lbC1ib2R5IGg1JykubGVuZ3RoLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpbWFnZTogJChvYmopLmZpbmQoXCJpbWdcIikuYXR0cihcInNyY1wiKVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgICAgICAgICAgcmVxdWVzdE9wdGlvbnMuZGF0YSA9IHtkYXRhOmRhdGF9O1xyXG4gICAgICAgICAgICAgICAgICAgICQuYWpheChVUkxVcGRhdGVJdGVtcywgcmVxdWVzdE9wdGlvbnMpO1xyXG4gICAgICAgICAgICAgICAgICAgIGlmKGZvckRlbGV0ZS5sZW5ndGggPiAwKXtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJlcXVlc3RPcHRpb25zLmRhdGEgPSB7aWQ6IGZvckRlbGV0ZX07XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAkLmFqYXgoXCJjb250ZW50L2NvbXBvbmVudC9kZWxldGUvQmxvY2txdW90ZVwiLCByZXF1ZXN0T3B0aW9ucyk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBmb3JEZWxldGUgPSBbXTtcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH0pO1xyXG5cclxuICAgIH0pKCk7XHJcbiAgICAvL0V2ZW50c1xyXG4gICAgKGZ1bmN0aW9uKCl7XHJcbiAgICAgICAgdmFyIGZvckRlbGV0ZSA9IFtdO1xyXG4gICAgICAgIHZhciBzbGlkZXJJdGVtcyA9ICQoXCIuc29ydGFibGVFdmVudHNcIik7XHJcbiAgICAgICAgdmFyIHJlbW92ZUludGVudCA9IGZhbHNlO1xyXG4gICAgICAgICQoXCIjZXZlbnRzX2RhdGVcIikuZGF0ZXRpbWVwaWNrZXIoe1xyXG4gICAgICAgICAgICBmb3JtYXQ6ICdZLW0tZCcsXHJcbiAgICAgICAgICAgIHRpbWVwaWNrZXI6IGZhbHNlXHJcbiAgICAgICAgfSk7XHJcbiAgICAgICAgc2xpZGVySXRlbXMuc29ydGFibGUoe1xyXG4gICAgICAgICAgICBpdGVtczogXCIuaXRlbVwiLFxyXG4gICAgICAgICAgICBvcGFjaXR5OiAwLjgsXHJcbiAgICAgICAgICAgIHN0b3A6IGZ1bmN0aW9uKCBldmVudCwgdWkgKSB7XHJcbiAgICAgICAgICAgICAgICAkKGV2ZW50LnRhcmdldCkuZmluZChcIi5pdGVtXCIpLmVhY2goZnVuY3Rpb24oaSwgb2JqKXtcclxuICAgICAgICAgICAgICAgICAgICAkKG9iaikuYXR0cihcImRhdGEtb3JkZXJcIiwgaSsxKTtcclxuICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICBvdmVyOiBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgICAgICByZW1vdmVJbnRlbnQgPSBmYWxzZTtcclxuICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgb3V0OiBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgICAgICByZW1vdmVJbnRlbnQgPSB0cnVlO1xyXG4gICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICBiZWZvcmVTdG9wOiBmdW5jdGlvbiAoZXZlbnQsIHVpKSB7XHJcbiAgICAgICAgICAgICAgICBpZihyZW1vdmVJbnRlbnQgPT0gdHJ1ZSl7XHJcbiAgICAgICAgICAgICAgICAgICAgdWkuaXRlbS5yZW1vdmUoKTtcclxuICAgICAgICAgICAgICAgICAgICB2YXIgaWQgPSB1aS5pdGVtLmF0dHIoXCJkYXRhLWlkXCIpO1xyXG4gICAgICAgICAgICAgICAgICAgIGlmKGlkID4gMSAmJiBpZCA8IDk5OTk5KVxyXG4gICAgICAgICAgICAgICAgICAgICAgICBmb3JEZWxldGUucHVzaCh1aS5pdGVtLmF0dHIoXCJkYXRhLWlkXCIpKTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH0pO1xyXG5cclxuICAgICAgICBmdW5jdGlvbiByZWFkVVJMKGlucHV0KSB7XHJcbiAgICAgICAgICAgIGlmIChpbnB1dC5maWxlcyAmJiBpbnB1dC5maWxlc1swXSkge1xyXG4gICAgICAgICAgICAgICAgdmFyIHJlYWRlciA9IG5ldyBGaWxlUmVhZGVyKCk7XHJcbiAgICAgICAgICAgICAgICByZWFkZXIub25sb2FkID0gZnVuY3Rpb24gKGUpIHtcclxuICAgICAgICAgICAgICAgICAgICAkKCcjZXZlbnRzX3ByZXZpZXcnKS5hdHRyKCdzcmMnLCBlLnRhcmdldC5yZXN1bHQpO1xyXG4gICAgICAgICAgICAgICAgfTtcclxuICAgICAgICAgICAgICAgIHJlYWRlci5yZWFkQXNEYXRhVVJMKGlucHV0LmZpbGVzWzBdKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgJChcIiNldmVudHNfaW1hZ2VcIikuY2hhbmdlKGZ1bmN0aW9uKCl7XHJcbiAgICAgICAgICAgIHJlYWRVUkwodGhpcyk7XHJcbiAgICAgICAgfSk7XHJcblxyXG4gICAgICAgIHZhciBVUkxVcGRhdGVJdGVtcyA9IFwiY29udGVudC9jb21wb25lbnQvdXBkYXRlL0V2ZW50c1wiO1xyXG4gICAgICAgIHZhciBvbkVkaXRFcnJvciA9IGZ1bmN0aW9uKHJlc3BvbnNlKXtcclxuICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKHJlc3BvbnNlKTtcclxuICAgICAgICAgICAgICAgICQoXCJib2R5XCIpLmFwcGVuZChyZXNwb25zZS5yZXNwb25zZVRleHQpXHJcbiAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgIG9uRWRpdFN1Y2Nlc3MgPSBmdW5jdGlvbihyZXNwb25zZSl7XHJcbiAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhyZXNwb25zZSk7XHJcbiAgICAgICAgICAgIH07XHJcbiAgICAgICAgdmFyIG1vZGFsID0gJChcIiNtb2RhbF9ldmVudHNcIik7XHJcbiAgICAgICAgdmFyIGZvcm0gPSBtb2RhbC5maW5kKCdmb3JtJyk7XHJcbiAgICAgICAgdmFyIHJlcXVlc3RPcHRpb25zID0ge1xyXG4gICAgICAgICAgICB0eXBlOiBcIlBPU1RcIixcclxuICAgICAgICAgICAgaGVhZGVyczoge1xyXG4gICAgICAgICAgICAgICAgJ1gtQ1NSRi1UT0tFTic6ICQoJ21ldGFbbmFtZT1cImNzcmYtdG9rZW5cIl0nKS5hdHRyKCdjb250ZW50JylcclxuICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgc3VjY2Vzczogb25FZGl0U3VjY2VzcyxcclxuICAgICAgICAgICAgZXJyb3I6IG9uRWRpdEVycm9yXHJcbiAgICAgICAgfTtcclxuICAgICAgICBzbGlkZXJJdGVtcy5maW5kKFwiLnNhdmUtYWxsXCIpLm9uKFwiY2xpY2tcIiwgZnVuY3Rpb24oKXtcclxuICAgICAgICAgICAgdmFyIGRhdGEgPSBbXTtcclxuICAgICAgICAgICAgc2xpZGVySXRlbXMuZmluZCgnLml0ZW0nKS5lYWNoKGZ1bmN0aW9uKGksIG9iail7XHJcbiAgICAgICAgICAgICAgICBkYXRhLnB1c2goe1xyXG4gICAgICAgICAgICAgICAgICAgIGlkOiAgJChvYmopLmF0dHIoXCJkYXRhLWlkXCIpLFxyXG4gICAgICAgICAgICAgICAgICAgIG9yZGVyOiAgJChvYmopLmF0dHIoXCJkYXRhLW9yZGVyXCIpLFxyXG4gICAgICAgICAgICAgICAgICAgIHRpdGxlOiAgJChvYmopLmZpbmQoXCJoMVwiKS50ZXh0KCksXHJcbiAgICAgICAgICAgICAgICAgICAgZGVzY3JpcHRpb246ICQob2JqKS5maW5kKFwicDpmaXJzdFwiKS50ZXh0KCksXHJcbiAgICAgICAgICAgICAgICAgICAgZGF0ZTogJChvYmopLmZpbmQoXCIuZGF0ZVwiKS50ZXh0KCksXHJcbiAgICAgICAgICAgICAgICAgICAgaW1hZ2U6ICQob2JqKS5maW5kKFwiaW1nXCIpLmF0dHIoXCJzcmNcIilcclxuICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgcmVxdWVzdE9wdGlvbnMuZGF0YSA9IHtkYXRhOmRhdGF9O1xyXG4gICAgICAgICAgICAkLmFqYXgoVVJMVXBkYXRlSXRlbXMsIHJlcXVlc3RPcHRpb25zKTtcclxuICAgICAgICAgICAgaWYoZm9yRGVsZXRlLmxlbmd0aCA+IDApe1xyXG4gICAgICAgICAgICAgICAgcmVxdWVzdE9wdGlvbnMuZGF0YSA9IHtpZDogZm9yRGVsZXRlfTtcclxuICAgICAgICAgICAgICAgICQuYWpheChcImNvbnRlbnQvY29tcG9uZW50L2RlbGV0ZS9FdmVudHNcIiwgcmVxdWVzdE9wdGlvbnMpO1xyXG4gICAgICAgICAgICAgICAgZm9yRGVsZXRlID0gW107XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9KTtcclxuICAgICAgICB2YXIgY3VycmVudEl0ZW0gPSBudWxsO1xyXG4gICAgICAgIHZhciBpc05ldyA9IGZhbHNlO1xyXG4gICAgICAgIHZhciB0aXRsZSA9IGZvcm0uZmluZChcIiNldmVudHNfdGl0bGVcIik7XHJcbiAgICAgICAgdmFyIGRlc2NyaXB0aW9uID0gZm9ybS5maW5kKFwiI2V2ZW50c19kZXNjcmlwdGlvblwiKTtcclxuICAgICAgICB2YXIgaW1hZ2UgPSBmb3JtLmZpbmQoXCJpbWdcIik7XHJcbiAgICAgICAgdmFyIGRhdGUgPSBmb3JtLmZpbmQoXCIjZXZlbnRzX2RhdGVcIik7XHJcbiAgICAgICAgc2xpZGVySXRlbXMub24oJ2NsaWNrJywgXCIuaXRlbVwiLCBmdW5jdGlvbigpe1xyXG4gICAgICAgICAgICBpc05ldyA9IGZhbHNlO1xyXG4gICAgICAgICAgICBjdXJyZW50SXRlbSA9ICQodGhpcyk7XHJcbiAgICAgICAgICAgIHRpdGxlLnZhbChjdXJyZW50SXRlbS5maW5kKFwiaDFcIikudGV4dCgpKTtcclxuICAgICAgICAgICAgZGVzY3JpcHRpb24udmFsKGN1cnJlbnRJdGVtLmZpbmQoXCJwXCIpLnRleHQoKSk7XHJcbiAgICAgICAgICAgIGltYWdlLmF0dHIoXCJzcmNcIiwgY3VycmVudEl0ZW0uZmluZChcImltZ1wiKS5hdHRyKFwic3JjXCIpKTtcclxuICAgICAgICAgICAgZGF0ZS5kYXRlcGlja2VyKCBcInNldERhdGVcIiwgY3VycmVudEl0ZW0uZmluZCgnLmRhdGUnKS50ZXh0KCkpO1xyXG4gICAgICAgICAgICBtb2RhbC5maW5kKFwiLm1vZGFsLXRpdGxlIHNwYW5cIikudGV4dChjdXJyZW50SXRlbS5hdHRyKFwiZGF0YS1vcmRlclwiKSk7XHJcbiAgICAgICAgICAgIG1vZGFsLm1vZGFsKCk7XHJcbiAgICAgICAgfSk7XHJcblxyXG4gICAgICAgIG1vZGFsLmZpbmQoXCIuc2F2ZS1jaGFuZ2VzXCIpLm9uKFwiY2xpY2tcIiwgZnVuY3Rpb24oKXtcclxuICAgICAgICAgICAgY3VycmVudEl0ZW0uZmluZChcImgxXCIpLnRleHQodGl0bGUudmFsKCkpO1xyXG4gICAgICAgICAgICBjdXJyZW50SXRlbS5maW5kKFwicFwiKS50ZXh0KGRlc2NyaXB0aW9uLnZhbCgpKTtcclxuICAgICAgICAgICAgY3VycmVudEl0ZW0uZmluZChcImltZ1wiKS5hdHRyKFwic3JjXCIsICQoJyNldmVudHNfcHJldmlldycpLmF0dHIoXCJzcmNcIikpO1xyXG4gICAgICAgICAgICBjdXJyZW50SXRlbS5maW5kKFwiLmRhdGVcIikudGV4dChtb21lbnQoJCgnI2V2ZW50c19kYXRlJykuZGF0ZXRpbWVwaWNrZXIoJ2dldFZhbHVlJykpLmZvcm1hdCgnWVlZWS1NTS1ERCcpKTtcclxuICAgICAgICAgICAgaWYoaXNOZXcpXHJcbiAgICAgICAgICAgICAgICBzbGlkZXJJdGVtcy5maW5kKFwiLm1vcmVcIikuYmVmb3JlKGN1cnJlbnRJdGVtKTtcclxuICAgICAgICAgICAgbW9kYWwubW9kYWwoJ2hpZGUnKTtcclxuICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgbW9kYWwuZmluZChcIi5kZWxldGUtaXRlbVwiKS5vbihcImNsaWNrXCIsIGZ1bmN0aW9uKCl7XHJcbiAgICAgICAgICAgIGN1cnJlbnRJdGVtLnJlbW92ZSgpO1xyXG4gICAgICAgICAgICB2YXIgaWQgPSBjdXJyZW50SXRlbS5hdHRyKFwiZGF0YS1pZFwiKTtcclxuICAgICAgICAgICAgaWYoaWQgPiAxICYmIGlkIDwgOTk5OTkpXHJcbiAgICAgICAgICAgICAgICBmb3JEZWxldGUucHVzaCh1aS5pdGVtLmF0dHIoXCJkYXRhLWlkXCIpKTtcclxuICAgICAgICAgICAgbW9kYWwubW9kYWwoJ2hpZGUnKTtcclxuICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgc2xpZGVySXRlbXMuZmluZChcIi5uZXctaXRlbVwiKS5vbihcImNsaWNrXCIsIGZ1bmN0aW9uKCl7XHJcbiAgICAgICAgICAgIGlzTmV3ID0gdHJ1ZTtcclxuICAgICAgICAgICAgY3VycmVudEl0ZW0gPSBzbGlkZXJJdGVtcy5maW5kKFwiLmNsb25lYWJsZVwiKS5jbG9uZSh0cnVlKTtcclxuICAgICAgICAgICAgY3VycmVudEl0ZW0ucmVtb3ZlQ2xhc3MoXCJjbG9uZWFibGUgaGlkZGVuXCIpLmFkZENsYXNzKCdpdGVtJyk7XHJcbiAgICAgICAgICAgIGN1cnJlbnRJdGVtLmF0dHIoXCJkYXRhLW9yZGVyXCIsIChwYXJzZUludChzbGlkZXJJdGVtcy5maW5kKFwiLml0ZW06bGFzdFwiKS5hdHRyKFwiZGF0YS1vcmRlclwiKSkgfHwgMCkrMSk7XHJcbiAgICAgICAgICAgIGN1cnJlbnRJdGVtLmF0dHIoXCJkYXRhLWlkXCIsIFwiLTFcIik7XHJcbiAgICAgICAgICAgIGZvcm0uZ2V0KDApLnJlc2V0KCk7XHJcbiAgICAgICAgICAgIGltYWdlLmF0dHIoXCJzcmNcIiwgJycpO1xyXG4gICAgICAgICAgICBtb2RhbC5maW5kKFwiLm1vZGFsLXRpdGxlIHNwYW5cIikudGV4dCgnJyk7XHJcbiAgICAgICAgICAgIG1vZGFsLm1vZGFsKCk7XHJcbiAgICAgICAgfSk7XHJcbiAgICB9KSgpO1xyXG5cclxufSk7Il0sImZpbGUiOiJjb21wb25lbnRzLmpzIiwic291cmNlUm9vdCI6Ii9zb3VyY2UvIn0=
