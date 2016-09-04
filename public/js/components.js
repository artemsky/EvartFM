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

});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiIiwic291cmNlcyI6WyJjb21wb25lbnRzLmpzIl0sInNvdXJjZXNDb250ZW50IjpbIiQoZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgXCJ1c2Ugc3RyaWN0XCI7XHJcbiAgICAgICAgLy9TbGlkZXJcclxuICAgICAgICAoZnVuY3Rpb24oKXtcclxuICAgICAgICAgICAgICAgIHZhciBmb3JEZWxldGUgPSBbXTtcclxuICAgICAgICAgICAgICAgIHZhciBzbGlkZXJJdGVtcyA9ICQoXCIuc29ydGFibGVTbGlkZXJcIik7XHJcbiAgICAgICAgICAgICAgICB2YXIgcmVtb3ZlSW50ZW50ID0gZmFsc2U7XHJcbiAgICAgICAgICAgICAgICBzbGlkZXJJdGVtcy5zb3J0YWJsZSh7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGl0ZW1zOiBcIi5pdGVtXCIsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIG9wYWNpdHk6IDAuOCxcclxuICAgICAgICAgICAgICAgICAgICAgICAgc3RvcDogZnVuY3Rpb24oIGV2ZW50LCB1aSApIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAkKGV2ZW50LnRhcmdldCkuZmluZChcIi5pdGVtXCIpLmVhY2goZnVuY3Rpb24oaSwgb2JqKXtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICQob2JqKS5hdHRyKFwiZGF0YS1vcmRlclwiLCBpKzEpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBvdmVyOiBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcmVtb3ZlSW50ZW50ID0gZmFsc2U7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIG91dDogZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJlbW92ZUludGVudCA9IHRydWU7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGJlZm9yZVN0b3A6IGZ1bmN0aW9uIChldmVudCwgdWkpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZihyZW1vdmVJbnRlbnQgPT0gdHJ1ZSl7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB1aS5pdGVtLnJlbW92ZSgpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdmFyIGlkID0gdWkuaXRlbS5hdHRyKFwiZGF0YS1pZFwiKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmKGlkID4gMSAmJiBpZCA8IDk5OTk5KVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBmb3JEZWxldGUucHVzaCh1aS5pdGVtLmF0dHIoXCJkYXRhLWlkXCIpKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIH0pO1xyXG5cclxuICAgICAgICAgICAgICAgIGZ1bmN0aW9uIHJlYWRVUkwoaW5wdXQpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGlucHV0LmZpbGVzICYmIGlucHV0LmZpbGVzWzBdKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdmFyIHJlYWRlciA9IG5ldyBGaWxlUmVhZGVyKCk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcmVhZGVyLm9ubG9hZCA9IGZ1bmN0aW9uIChlKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAkKCcjcHJldmlldycpLmF0dHIoJ3NyYycsIGUudGFyZ2V0LnJlc3VsdCk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICByZWFkZXIucmVhZEFzRGF0YVVSTChpbnB1dC5maWxlc1swXSk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgICAgICAkKFwiI2ltYWdlXCIpLmNoYW5nZShmdW5jdGlvbigpe1xyXG4gICAgICAgICAgICAgICAgICAgICAgICByZWFkVVJMKHRoaXMpO1xyXG4gICAgICAgICAgICAgICAgfSk7XHJcblxyXG4gICAgICAgICAgICAgICAgdmFyIFVSTFVwZGF0ZUl0ZW1zID0gXCJjb250ZW50L2NvbXBvbmVudC91cGRhdGUvU2xpZGVyXCI7XHJcbiAgICAgICAgICAgICAgICB2YXIgb25FZGl0RXJyb3IgPSBmdW5jdGlvbihyZXNwb25zZSl7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhyZXNwb25zZSk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAkKFwiYm9keVwiKS5hcHBlbmQocmVzcG9uc2UucmVzcG9uc2VUZXh0KVxyXG4gICAgICAgICAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgICAgICAgICAgb25FZGl0U3VjY2VzcyA9IGZ1bmN0aW9uKHJlc3BvbnNlKXtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKHJlc3BvbnNlKTtcclxuICAgICAgICAgICAgICAgICAgICB9O1xyXG4gICAgICAgICAgICAgICAgdmFyIG1vZGFsID0gJChcIiNtb2RhbF9zbGlkZXJcIik7XHJcbiAgICAgICAgICAgICAgICB2YXIgZm9ybSA9IG1vZGFsLmZpbmQoJ2Zvcm0nKTtcclxuICAgICAgICAgICAgICAgIHZhciByZXF1ZXN0T3B0aW9ucyA9IHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgdHlwZTogXCJQT1NUXCIsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGhlYWRlcnM6IHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAnWC1DU1JGLVRPS0VOJzogJCgnbWV0YVtuYW1lPVwiY3NyZi10b2tlblwiXScpLmF0dHIoJ2NvbnRlbnQnKVxyXG4gICAgICAgICAgICAgICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBzdWNjZXNzOiBvbkVkaXRTdWNjZXNzLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBlcnJvcjogb25FZGl0RXJyb3JcclxuICAgICAgICAgICAgICAgIH07XHJcbiAgICAgICAgICAgICAgICBzbGlkZXJJdGVtcy5maW5kKFwiLnNhdmUtYWxsXCIpLm9uKFwiY2xpY2tcIiwgZnVuY3Rpb24oKXtcclxuICAgICAgICAgICAgICAgICAgICAgICAgdmFyIGRhdGEgPSBbXTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgc2xpZGVySXRlbXMuZmluZCgnLml0ZW0nKS5lYWNoKGZ1bmN0aW9uKGksIG9iail7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZGF0YS5wdXNoKHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlkOiAgJChvYmopLmF0dHIoXCJkYXRhLWlkXCIpLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgb3JkZXI6ICAkKG9iaikuYXR0cihcImRhdGEtb3JkZXJcIiksXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aXRsZTogICQob2JqKS5maW5kKFwiaDFcIikudGV4dCgpLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZGVzY3JpcHRpb246ICQob2JqKS5maW5kKFwicFwiKS50ZXh0KCksXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpbWFnZTogJChvYmopLmZpbmQoXCJpbWdcIikuYXR0cihcInNyY1wiKVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgcmVxdWVzdE9wdGlvbnMuZGF0YSA9IHtkYXRhOmRhdGF9O1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAkLmFqYXgoVVJMVXBkYXRlSXRlbXMsIHJlcXVlc3RPcHRpb25zKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgaWYoZm9yRGVsZXRlLmxlbmd0aCA+IDApe1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJlcXVlc3RPcHRpb25zLmRhdGEgPSB7aWQ6IGZvckRlbGV0ZX07XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgJC5hamF4KFwiY29udGVudC9jb21wb25lbnQvZGVsZXRlL1NsaWRlclwiLCByZXF1ZXN0T3B0aW9ucyk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZm9yRGVsZXRlID0gW107XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICAgICAgdmFyIGN1cnJlbnRJdGVtID0gbnVsbDtcclxuICAgICAgICAgICAgICAgIHZhciBpc05ldyA9IGZhbHNlO1xyXG4gICAgICAgICAgICAgICAgdmFyIHRpdGxlID0gZm9ybS5maW5kKFwiI3RpdGxlXCIpO1xyXG4gICAgICAgICAgICAgICAgdmFyIGRlc2NyaXB0aW9uID0gZm9ybS5maW5kKFwiI2Rlc2NyaXB0aW9uXCIpO1xyXG4gICAgICAgICAgICAgICAgdmFyIGltYWdlID0gZm9ybS5maW5kKFwiaW1nXCIpO1xyXG4gICAgICAgICAgICAgICAgc2xpZGVySXRlbXMub24oJ2NsaWNrJywgXCIuaXRlbVwiLCBmdW5jdGlvbigpe1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBpc05ldyA9IGZhbHNlO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBjdXJyZW50SXRlbSA9ICQodGhpcyk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHRpdGxlLnZhbChjdXJyZW50SXRlbS5maW5kKFwiaDFcIikudGV4dCgpKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgZGVzY3JpcHRpb24udmFsKGN1cnJlbnRJdGVtLmZpbmQoXCJwXCIpLnRleHQoKSk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGltYWdlLmF0dHIoXCJzcmNcIiwgY3VycmVudEl0ZW0uZmluZChcImltZ1wiKS5hdHRyKFwic3JjXCIpKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgbW9kYWwuZmluZChcIi5tb2RhbC10aXRsZSBzcGFuXCIpLnRleHQoY3VycmVudEl0ZW0uYXR0cihcImRhdGEtb3JkZXJcIikpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBtb2RhbC5tb2RhbCgpO1xyXG4gICAgICAgICAgICAgICAgfSk7XHJcblxyXG4gICAgICAgICAgICAgICAgbW9kYWwuZmluZChcIi5zYXZlLWNoYW5nZXNcIikub24oXCJjbGlja1wiLCBmdW5jdGlvbigpe1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBjdXJyZW50SXRlbS5maW5kKFwiaDFcIikudGV4dCh0aXRsZS52YWwoKSk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGN1cnJlbnRJdGVtLmZpbmQoXCJwXCIpLnRleHQoZGVzY3JpcHRpb24udmFsKCkpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBjdXJyZW50SXRlbS5maW5kKFwiaW1nXCIpLmF0dHIoXCJzcmNcIiwgJCgnI3ByZXZpZXcnKS5hdHRyKFwic3JjXCIpKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgaWYoaXNOZXcpXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgc2xpZGVySXRlbXMuZmluZChcIi5tb3JlXCIpLmJlZm9yZShjdXJyZW50SXRlbSk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIG1vZGFsLm1vZGFsKCdoaWRlJyk7XHJcbiAgICAgICAgICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgICAgICAgICBtb2RhbC5maW5kKFwiLmRlbGV0ZS1pdGVtXCIpLm9uKFwiY2xpY2tcIiwgZnVuY3Rpb24oKXtcclxuICAgICAgICAgICAgICAgICAgICAgICAgY3VycmVudEl0ZW0ucmVtb3ZlKCk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHZhciBpZCA9IGN1cnJlbnRJdGVtLmF0dHIoXCJkYXRhLWlkXCIpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBpZihpZCA+IDEgJiYgaWQgPCA5OTk5OSlcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBmb3JEZWxldGUucHVzaCh1aS5pdGVtLmF0dHIoXCJkYXRhLWlkXCIpKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgbW9kYWwubW9kYWwoJ2hpZGUnKTtcclxuICAgICAgICAgICAgICAgIH0pO1xyXG5cclxuICAgICAgICAgICAgICAgIHNsaWRlckl0ZW1zLmZpbmQoXCIubmV3LWl0ZW1cIikub24oXCJjbGlja1wiLCBmdW5jdGlvbigpe1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBpc05ldyA9IHRydWU7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGN1cnJlbnRJdGVtID0gc2xpZGVySXRlbXMuZmluZChcIi5jbG9uZWFibGVcIikuY2xvbmUodHJ1ZSk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGN1cnJlbnRJdGVtLnJlbW92ZUNsYXNzKFwiY2xvbmVhYmxlIGhpZGRlblwiKS5hZGRDbGFzcygnaXRlbScpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBjdXJyZW50SXRlbS5hdHRyKFwiZGF0YS1vcmRlclwiLCAocGFyc2VJbnQoc2xpZGVySXRlbXMuZmluZChcIi5pdGVtOmxhc3RcIikuYXR0cihcImRhdGEtb3JkZXJcIikpIHx8IDApKzEpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBjdXJyZW50SXRlbS5hdHRyKFwiZGF0YS1pZFwiLCBcIi0xXCIpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBmb3JtLmdldCgwKS5yZXNldCgpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBpbWFnZS5hdHRyKFwic3JjXCIsICcnKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgbW9kYWwuZmluZChcIi5tb2RhbC10aXRsZSBzcGFuXCIpLnRleHQoJycpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBtb2RhbC5tb2RhbCgpO1xyXG4gICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgfSkoKTtcclxuICAgICAgICAvL0Jsb2NrcXVvdGVcclxuICAgICAgICAoZnVuY3Rpb24oKXtcclxuICAgICAgICAgICAgICAgIHZhciBmb3JEZWxldGUgPSBbXTtcclxuICAgICAgICAgICAgICAgIHZhciBzbGlkZXJJdGVtcyA9ICQoXCIuc29ydGFibGVCbG9ja3F1b3RlXCIpO1xyXG4gICAgICAgICAgICAgICAgdmFyIHJlbW92ZUludGVudCA9IGZhbHNlO1xyXG4gICAgICAgICAgICAgICAgc2xpZGVySXRlbXMuc29ydGFibGUoe1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBpdGVtczogXCIucGFuZWxcIixcclxuICAgICAgICAgICAgICAgICAgICAgICAgaGFuZGxlOiBcIi5wYW5lbC1oZWFkaW5nXCIsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIG9wYWNpdHk6IDAuOCxcclxuICAgICAgICAgICAgICAgICAgICAgICAgc3RvcDogZnVuY3Rpb24oIGV2ZW50LCB1aSApIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAkKGV2ZW50LnRhcmdldCkuZmluZChcIi5wYW5lbFwiKS5lYWNoKGZ1bmN0aW9uKGksIG9iail7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAkKG9iaikuYXR0cihcImRhdGEtb3JkZXJcIiwgaSsxKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgb3ZlcjogZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJlbW92ZUludGVudCA9IGZhbHNlO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBvdXQ6IGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICByZW1vdmVJbnRlbnQgPSB0cnVlO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBiZWZvcmVTdG9wOiBmdW5jdGlvbiAoZXZlbnQsIHVpKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYocmVtb3ZlSW50ZW50ID09IHRydWUpe1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdWkuaXRlbS5yZW1vdmUoKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHZhciBpZCA9IHVpLml0ZW0uYXR0cihcImRhdGEtaWRcIik7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZihpZCA+IDEgJiYgaWQgPCA5OTk5OSlcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZm9yRGVsZXRlLnB1c2godWkuaXRlbS5hdHRyKFwiZGF0YS1pZFwiKSk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgICAgICAgICBmdW5jdGlvbiByZWFkVVJMKGlucHV0LCB0YXJnZXQpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGlucHV0LmZpbGVzICYmIGlucHV0LmZpbGVzWzBdKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdmFyIHJlYWRlciA9IG5ldyBGaWxlUmVhZGVyKCk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcmVhZGVyLm9ubG9hZCA9IGZ1bmN0aW9uIChlKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB0YXJnZXQucHJldigpLmF0dHIoJ3NyYycsIGUudGFyZ2V0LnJlc3VsdCk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICByZWFkZXIucmVhZEFzRGF0YVVSTChpbnB1dC5maWxlc1swXSk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgICAgICBzbGlkZXJJdGVtcy5maW5kKFwiaW5wdXQuaW1hZ2VcIikuY2hhbmdlKGZ1bmN0aW9uKGUpe1xyXG4gICAgICAgICAgICAgICAgICAgICAgICByZWFkVVJMKHRoaXMsICQoZS50YXJnZXQpKTtcclxuICAgICAgICAgICAgICAgIH0pO1xyXG5cclxuICAgICAgICAgICAgICAgIHZhciBzdGFyQ2xvbmUgPSBudWxsO1xyXG4gICAgICAgICAgICAgICAgc2xpZGVySXRlbXMuZmluZChcIi5zdGFyc1wiKS5vbignbW91c2VlbnRlcicsIGZ1bmN0aW9uKCl7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHN0YXJDbG9uZSA9ICQodGhpcykuY2xvbmUoKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgJCh0aGlzKS5vbihcIm1vdXNlb3ZlclwiLCBmdW5jdGlvbihlKXtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZihlLnRhcmdldCA9PSB0aGlzKSByZXR1cm4gZmFsc2U7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgJChlLnRhcmdldCkucHJldkFsbCgpLmFkZENsYXNzKCdhY3RpdmUnKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAkKGUudGFyZ2V0KS5hZGRDbGFzcygnYWN0aXZlJyk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgJChlLnRhcmdldCkubmV4dEFsbCgpLnJlbW92ZUNsYXNzKCdhY3RpdmUnKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgICAgICB9KS5vbignbW91c2VsZWF2ZScsIGZ1bmN0aW9uKCl7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICQodGhpcykub2ZmKFwibW91c2VvdmVyXCIpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAkKHRoaXMpLmh0bWwoc3RhckNsb25lLmh0bWwoKSk7XHJcbiAgICAgICAgICAgICAgICB9KS5vbignY2xpY2snLCBmdW5jdGlvbihlKXtcclxuICAgICAgICAgICAgICAgICAgICAgICAgaWYoZS50YXJnZXQgPT0gdGhpcykgcmV0dXJuO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBzdGFyQ2xvbmUgPSAkKHRoaXMpLmNsb25lKCk7XHJcbiAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgICAgIHNsaWRlckl0ZW1zLmZpbmQoXCIucGFuZWwtYm9keVwiKS5vbihcImlucHV0XCIsICcubmFtZScsIGZ1bmN0aW9uKGUpe1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAkKGUuZGVsZWdhdGVUYXJnZXQpLnBhcmVudCgpLnByZXYoKS5maW5kKFwiLm5hbWVcIikudGV4dCgkKHRoaXMpLnRleHQoKSk7XHJcbiAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgICAgIHNsaWRlckl0ZW1zLmZpbmQoXCIucGFuZWwtYm9keSBidXR0b25cIikub24oXCJjbGlja1wiLCBmdW5jdGlvbigpe1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB2YXIgaXRlbSA9ICQodGhpcykucGFyZW50KCkucGFyZW50KCkucGFyZW50KCk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHZhciBpZCA9IGl0ZW0uYXR0cihcImRhdGEtaWRcIik7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGl0ZW0ucmVtb3ZlKCk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmKGlkID4gMSAmJiBpZCA8IDk5OTk5KVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGZvckRlbGV0ZS5wdXNoKHVpLml0ZW0uYXR0cihcImRhdGEtaWRcIikpO1xyXG4gICAgICAgICAgICAgICAgfSk7XHJcblxyXG4gICAgICAgICAgICAgICAgc2xpZGVySXRlbXMuZmluZChcIi5uZXctaXRlbVwiKS5vbihcImNsaWNrXCIsIGZ1bmN0aW9uKCl7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHZhciBpdGVtID0gc2xpZGVySXRlbXMuZmluZCgnLmNsb25lYWJsZScpLmNsb25lKHRydWUpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB2YXIgcmFuZG9tSWQgPSBEYXRlLm5vdygpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBpdGVtLnJlbW92ZUNsYXNzKCdjbG9uZWFibGUgaGlkZGVuJylcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIC5hZGRDbGFzcyhcIml0ZW1cIilcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIC5hdHRyKFwiZGF0YS1pZFwiLCBcIi0xXCIpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBpdGVtLmF0dHIoXCJkYXRhLW9yZGVyXCIsIChwYXJzZUludChzbGlkZXJJdGVtcy5maW5kKFwiLnBhbmVsOmxhc3RcIilcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAucHJldigpLmF0dHIoXCJkYXRhLW9yZGVyXCIpKSB8fCAwKSArIDEpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBpdGVtLmZpbmQoJy5wYW5lbC1oZWFkaW5nJykuYXR0cihcImlkXCIsIFwiaGVhZGluZ19cIiArIHJhbmRvbUlkKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgaXRlbS5maW5kKCcucGFuZWwtdGl0bGUgYScpXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAuYXR0cihcImhyZWZcIiwgXCIjY29sbGFwc2VfXCIgICsgcmFuZG9tSWQpXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAuYXR0cihcImFyaWEtY29udHJvbHNcIiwgXCJjb2xsYXBzZV9cIiArIHJhbmRvbUlkKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgaXRlbS5maW5kKCcucGFuZWwtY29sbGFwc2UnKVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgLmF0dHIoJ2lkJywgJ2NvbGxhcHNlXycgKyByYW5kb21JZClcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIC5hdHRyKCdhcmlhLWxhYmVsbGVkYnknLCAnaGVhZGluZ18nICsgcmFuZG9tSWQpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBpdGVtLmZpbmQoJ2xhYmVsJykuYXR0cihcImZvclwiLCAnaW1nXycgKyByYW5kb21JZClcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIC5maW5kKFwiaW5wdXRcIikuYXR0cihcImlkXCIsICdpbWdfJyArIHJhbmRvbUlkKTtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHNsaWRlckl0ZW1zLmZpbmQoJy5jbG9uZWFibGUnKS5iZWZvcmUoaXRlbSk7XHJcblxyXG4gICAgICAgICAgICAgICAgfSk7XHJcblxyXG4gICAgICAgICAgICAgICAgdmFyIFVSTFVwZGF0ZUl0ZW1zID0gXCJjb250ZW50L2NvbXBvbmVudC91cGRhdGUvQmxvY2txdW90ZVwiO1xyXG4gICAgICAgICAgICAgICAgdmFyIG9uRWRpdEVycm9yID0gZnVuY3Rpb24ocmVzcG9uc2Upe1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY29uc29sZS5sb2cocmVzcG9uc2UpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgJChcImJvZHlcIikuYXBwZW5kKHJlc3BvbnNlLnJlc3BvbnNlVGV4dClcclxuICAgICAgICAgICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICAgICAgICAgIG9uRWRpdFN1Y2Nlc3MgPSBmdW5jdGlvbihyZXNwb25zZSl7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhyZXNwb25zZSk7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgIH07XHJcblxyXG4gICAgICAgICAgICAgICAgdmFyIHJlcXVlc3RPcHRpb25zID0ge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB0eXBlOiBcIlBPU1RcIixcclxuICAgICAgICAgICAgICAgICAgICAgICAgaGVhZGVyczoge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICdYLUNTUkYtVE9LRU4nOiAkKCdtZXRhW25hbWU9XCJjc3JmLXRva2VuXCJdJykuYXR0cignY29udGVudCcpXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHN1Y2Nlc3M6IG9uRWRpdFN1Y2Nlc3MsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGVycm9yOiBvbkVkaXRFcnJvclxyXG4gICAgICAgICAgICAgICAgfTtcclxuICAgICAgICAgICAgICAgIHNsaWRlckl0ZW1zLmZpbmQoXCIuc2F2ZS1hbGxcIikub24oXCJjbGlja1wiLCBmdW5jdGlvbigpe1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB2YXIgZGF0YSA9IFtdO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBzbGlkZXJJdGVtcy5maW5kKCcuaXRlbScpLmVhY2goZnVuY3Rpb24oaSwgb2JqKXtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBkYXRhLnB1c2goe1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaWQ6ICAkKG9iaikuYXR0cihcImRhdGEtaWRcIiksXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBvcmRlcjogICQob2JqKS5hdHRyKFwiZGF0YS1vcmRlclwiKSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG5hbWU6ICAkKG9iaikuZmluZChcIi5wYW5lbC1ib2R5IC5uYW1lXCIpLnRleHQoKSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRlc2NyaXB0aW9uOiAkKG9iaikuZmluZChcIi5wYW5lbC1ib2R5IGg2XCIpLnRleHQoKSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRleHQ6ICQob2JqKS5maW5kKFwiLnBhbmVsLWJvZHkgaDZcIikudGV4dCgpLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgc3RhcnM6ICQob2JqKS5maW5kKCcucGFuZWwtYm9keSBoNScpLmxlbmd0aCxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGltYWdlOiAkKG9iaikuZmluZChcImltZ1wiKS5hdHRyKFwic3JjXCIpXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICByZXF1ZXN0T3B0aW9ucy5kYXRhID0ge2RhdGE6ZGF0YX07XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICQuYWpheChVUkxVcGRhdGVJdGVtcywgcmVxdWVzdE9wdGlvbnMpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBpZihmb3JEZWxldGUubGVuZ3RoID4gMCl7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcmVxdWVzdE9wdGlvbnMuZGF0YSA9IHtpZDogZm9yRGVsZXRlfTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAkLmFqYXgoXCJjb250ZW50L2NvbXBvbmVudC9kZWxldGUvQmxvY2txdW90ZVwiLCByZXF1ZXN0T3B0aW9ucyk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZm9yRGVsZXRlID0gW107XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIH0pO1xyXG5cclxuICAgICAgICB9KSgpO1xyXG5cclxufSk7Il0sImZpbGUiOiJjb21wb25lbnRzLmpzIiwic291cmNlUm9vdCI6Ii9zb3VyY2UvIn0=
