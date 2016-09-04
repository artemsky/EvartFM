$(function() {
        "use strict";
        //Slider
        (function(){
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
                        $(this).parent().parent().parent().remove();
                });

                sliderItems.find(".new-item").on("click", function(){
                        var item = sliderItems.find('.cloneable').clone(true);
                        item.removeClass('cloneable hidden')
                            .addClass("item")
                            .attr("data-id", "-1")
                        item.attr("data-order", (parseInt(sliderItems.find(".panel:last")
                                .prev().attr("data-order")) || 0) + 1);
                        item.find('.panel-heading').attr("id", "heading_-1");
                        item.find('.panel-title a')
                            .attr("href", "#collapse_-1")
                            .attr("aria-controls", "collapse_-1");
                        item.find('.panel-collapse')
                            .attr('id', 'collapse_-1')
                            .attr('aria-labelledby', 'heading_-1');
                        item.find('label').attr("for", 'img_-1')
                            .find("input").attr("id", 'img_-1');

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
                });

        })();

});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiIiwic291cmNlcyI6WyJjb21wb25lbnRzLmpzIl0sInNvdXJjZXNDb250ZW50IjpbIiQoZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgXCJ1c2Ugc3RyaWN0XCI7XHJcbiAgICAgICAgLy9TbGlkZXJcclxuICAgICAgICAoZnVuY3Rpb24oKXtcclxuICAgICAgICAgICAgICAgIHZhciBzbGlkZXJJdGVtcyA9ICQoXCIuc29ydGFibGVTbGlkZXJcIik7XHJcbiAgICAgICAgICAgICAgICB2YXIgcmVtb3ZlSW50ZW50ID0gZmFsc2U7XHJcbiAgICAgICAgICAgICAgICBzbGlkZXJJdGVtcy5zb3J0YWJsZSh7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGl0ZW1zOiBcIi5pdGVtXCIsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIG9wYWNpdHk6IDAuOCxcclxuICAgICAgICAgICAgICAgICAgICAgICAgc3RvcDogZnVuY3Rpb24oIGV2ZW50LCB1aSApIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAkKGV2ZW50LnRhcmdldCkuZmluZChcIi5pdGVtXCIpLmVhY2goZnVuY3Rpb24oaSwgb2JqKXtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICQob2JqKS5hdHRyKFwiZGF0YS1vcmRlclwiLCBpKzEpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBvdmVyOiBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcmVtb3ZlSW50ZW50ID0gZmFsc2U7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIG91dDogZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJlbW92ZUludGVudCA9IHRydWU7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGJlZm9yZVN0b3A6IGZ1bmN0aW9uIChldmVudCwgdWkpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZihyZW1vdmVJbnRlbnQgPT0gdHJ1ZSl7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB1aS5pdGVtLnJlbW92ZSgpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgfSk7XHJcblxyXG4gICAgICAgICAgICAgICAgZnVuY3Rpb24gcmVhZFVSTChpbnB1dCkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoaW5wdXQuZmlsZXMgJiYgaW5wdXQuZmlsZXNbMF0pIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB2YXIgcmVhZGVyID0gbmV3IEZpbGVSZWFkZXIoKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICByZWFkZXIub25sb2FkID0gZnVuY3Rpb24gKGUpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICQoJyNwcmV2aWV3JykuYXR0cignc3JjJywgZS50YXJnZXQucmVzdWx0KTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9O1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJlYWRlci5yZWFkQXNEYXRhVVJMKGlucHV0LmZpbGVzWzBdKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgICAgICQoXCIjaW1hZ2VcIikuY2hhbmdlKGZ1bmN0aW9uKCl7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHJlYWRVUkwodGhpcyk7XHJcbiAgICAgICAgICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgICAgICAgICB2YXIgVVJMVXBkYXRlSXRlbXMgPSBcImNvbnRlbnQvY29tcG9uZW50L3VwZGF0ZS9TbGlkZXJcIjtcclxuICAgICAgICAgICAgICAgIHZhciBvbkVkaXRFcnJvciA9IGZ1bmN0aW9uKHJlc3BvbnNlKXtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKHJlc3BvbnNlKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICQoXCJib2R5XCIpLmFwcGVuZChyZXNwb25zZS5yZXNwb25zZVRleHQpXHJcbiAgICAgICAgICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgICAgICAgICBvbkVkaXRTdWNjZXNzID0gZnVuY3Rpb24ocmVzcG9uc2Upe1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY29uc29sZS5sb2cocmVzcG9uc2UpO1xyXG4gICAgICAgICAgICAgICAgICAgIH07XHJcbiAgICAgICAgICAgICAgICB2YXIgbW9kYWwgPSAkKFwiI21vZGFsX3NsaWRlclwiKTtcclxuICAgICAgICAgICAgICAgIHZhciBmb3JtID0gbW9kYWwuZmluZCgnZm9ybScpO1xyXG4gICAgICAgICAgICAgICAgdmFyIHJlcXVlc3RPcHRpb25zID0ge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB0eXBlOiBcIlBPU1RcIixcclxuICAgICAgICAgICAgICAgICAgICAgICAgaGVhZGVyczoge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICdYLUNTUkYtVE9LRU4nOiAkKCdtZXRhW25hbWU9XCJjc3JmLXRva2VuXCJdJykuYXR0cignY29udGVudCcpXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHN1Y2Nlc3M6IG9uRWRpdFN1Y2Nlc3MsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGVycm9yOiBvbkVkaXRFcnJvclxyXG4gICAgICAgICAgICAgICAgfTtcclxuICAgICAgICAgICAgICAgIHNsaWRlckl0ZW1zLmZpbmQoXCIuc2F2ZS1hbGxcIikub24oXCJjbGlja1wiLCBmdW5jdGlvbigpe1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB2YXIgZGF0YSA9IFtdO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBzbGlkZXJJdGVtcy5maW5kKCcuaXRlbScpLmVhY2goZnVuY3Rpb24oaSwgb2JqKXtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBkYXRhLnB1c2goe1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaWQ6ICAkKG9iaikuYXR0cihcImRhdGEtaWRcIiksXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBvcmRlcjogICQob2JqKS5hdHRyKFwiZGF0YS1vcmRlclwiKSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRpdGxlOiAgJChvYmopLmZpbmQoXCJoMVwiKS50ZXh0KCksXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBkZXNjcmlwdGlvbjogJChvYmopLmZpbmQoXCJwXCIpLnRleHQoKSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGltYWdlOiAkKG9iaikuZmluZChcImltZ1wiKS5hdHRyKFwic3JjXCIpXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICByZXF1ZXN0T3B0aW9ucy5kYXRhID0ge2RhdGE6ZGF0YX07XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICQuYWpheChVUkxVcGRhdGVJdGVtcywgcmVxdWVzdE9wdGlvbnMpO1xyXG4gICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgICAgICB2YXIgY3VycmVudEl0ZW0gPSBudWxsO1xyXG4gICAgICAgICAgICAgICAgdmFyIGlzTmV3ID0gZmFsc2U7XHJcbiAgICAgICAgICAgICAgICB2YXIgdGl0bGUgPSBmb3JtLmZpbmQoXCIjdGl0bGVcIik7XHJcbiAgICAgICAgICAgICAgICB2YXIgZGVzY3JpcHRpb24gPSBmb3JtLmZpbmQoXCIjZGVzY3JpcHRpb25cIik7XHJcbiAgICAgICAgICAgICAgICB2YXIgaW1hZ2UgPSBmb3JtLmZpbmQoXCJpbWdcIik7XHJcbiAgICAgICAgICAgICAgICBzbGlkZXJJdGVtcy5vbignY2xpY2snLCBcIi5pdGVtXCIsIGZ1bmN0aW9uKCl7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGlzTmV3ID0gZmFsc2U7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGN1cnJlbnRJdGVtID0gJCh0aGlzKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgdGl0bGUudmFsKGN1cnJlbnRJdGVtLmZpbmQoXCJoMVwiKS50ZXh0KCkpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBkZXNjcmlwdGlvbi52YWwoY3VycmVudEl0ZW0uZmluZChcInBcIikudGV4dCgpKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgaW1hZ2UuYXR0cihcInNyY1wiLCBjdXJyZW50SXRlbS5maW5kKFwiaW1nXCIpLmF0dHIoXCJzcmNcIikpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBtb2RhbC5maW5kKFwiLm1vZGFsLXRpdGxlIHNwYW5cIikudGV4dChjdXJyZW50SXRlbS5hdHRyKFwiZGF0YS1vcmRlclwiKSk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIG1vZGFsLm1vZGFsKCk7XHJcbiAgICAgICAgICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgICAgICAgICBtb2RhbC5maW5kKFwiLnNhdmUtY2hhbmdlc1wiKS5vbihcImNsaWNrXCIsIGZ1bmN0aW9uKCl7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGN1cnJlbnRJdGVtLmZpbmQoXCJoMVwiKS50ZXh0KHRpdGxlLnZhbCgpKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgY3VycmVudEl0ZW0uZmluZChcInBcIikudGV4dChkZXNjcmlwdGlvbi52YWwoKSk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGN1cnJlbnRJdGVtLmZpbmQoXCJpbWdcIikuYXR0cihcInNyY1wiLCAkKCcjcHJldmlldycpLmF0dHIoXCJzcmNcIikpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBpZihpc05ldylcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBzbGlkZXJJdGVtcy5maW5kKFwiLm1vcmVcIikuYmVmb3JlKGN1cnJlbnRJdGVtKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgbW9kYWwubW9kYWwoJ2hpZGUnKTtcclxuICAgICAgICAgICAgICAgIH0pO1xyXG5cclxuICAgICAgICAgICAgICAgIG1vZGFsLmZpbmQoXCIuZGVsZXRlLWl0ZW1cIikub24oXCJjbGlja1wiLCBmdW5jdGlvbigpe1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBjdXJyZW50SXRlbS5yZW1vdmUoKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgbW9kYWwubW9kYWwoJ2hpZGUnKTtcclxuICAgICAgICAgICAgICAgIH0pO1xyXG5cclxuICAgICAgICAgICAgICAgIHNsaWRlckl0ZW1zLmZpbmQoXCIubmV3LWl0ZW1cIikub24oXCJjbGlja1wiLCBmdW5jdGlvbigpe1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBpc05ldyA9IHRydWU7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGN1cnJlbnRJdGVtID0gc2xpZGVySXRlbXMuZmluZChcIi5jbG9uZWFibGVcIikuY2xvbmUodHJ1ZSk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGN1cnJlbnRJdGVtLnJlbW92ZUNsYXNzKFwiY2xvbmVhYmxlIGhpZGRlblwiKS5hZGRDbGFzcygnaXRlbScpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBjdXJyZW50SXRlbS5hdHRyKFwiZGF0YS1vcmRlclwiLCAocGFyc2VJbnQoc2xpZGVySXRlbXMuZmluZChcIi5pdGVtOmxhc3RcIikuYXR0cihcImRhdGEtb3JkZXJcIikpIHx8IDApKzEpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBjdXJyZW50SXRlbS5hdHRyKFwiZGF0YS1pZFwiLCBcIi0xXCIpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBmb3JtLmdldCgwKS5yZXNldCgpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBpbWFnZS5hdHRyKFwic3JjXCIsICcnKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgbW9kYWwuZmluZChcIi5tb2RhbC10aXRsZSBzcGFuXCIpLnRleHQoJycpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBtb2RhbC5tb2RhbCgpO1xyXG4gICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgfSkoKTtcclxuICAgICAgICAvL0Jsb2NrcXVvdGVcclxuICAgICAgICAoZnVuY3Rpb24oKXtcclxuICAgICAgICAgICAgICAgIHZhciBzbGlkZXJJdGVtcyA9ICQoXCIuc29ydGFibGVCbG9ja3F1b3RlXCIpO1xyXG4gICAgICAgICAgICAgICAgdmFyIHJlbW92ZUludGVudCA9IGZhbHNlO1xyXG4gICAgICAgICAgICAgICAgc2xpZGVySXRlbXMuc29ydGFibGUoe1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBpdGVtczogXCIucGFuZWxcIixcclxuICAgICAgICAgICAgICAgICAgICAgICAgaGFuZGxlOiBcIi5wYW5lbC1oZWFkaW5nXCIsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIG9wYWNpdHk6IDAuOCxcclxuICAgICAgICAgICAgICAgICAgICAgICAgc3RvcDogZnVuY3Rpb24oIGV2ZW50LCB1aSApIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAkKGV2ZW50LnRhcmdldCkuZmluZChcIi5wYW5lbFwiKS5lYWNoKGZ1bmN0aW9uKGksIG9iail7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAkKG9iaikuYXR0cihcImRhdGEtb3JkZXJcIiwgaSsxKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgb3ZlcjogZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJlbW92ZUludGVudCA9IGZhbHNlO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBvdXQ6IGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICByZW1vdmVJbnRlbnQgPSB0cnVlO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBiZWZvcmVTdG9wOiBmdW5jdGlvbiAoZXZlbnQsIHVpKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYocmVtb3ZlSW50ZW50ID09IHRydWUpe1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdWkuaXRlbS5yZW1vdmUoKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIH0pO1xyXG5cclxuICAgICAgICAgICAgICAgIGZ1bmN0aW9uIHJlYWRVUkwoaW5wdXQsIHRhcmdldCkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoaW5wdXQuZmlsZXMgJiYgaW5wdXQuZmlsZXNbMF0pIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB2YXIgcmVhZGVyID0gbmV3IEZpbGVSZWFkZXIoKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICByZWFkZXIub25sb2FkID0gZnVuY3Rpb24gKGUpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRhcmdldC5wcmV2KCkuYXR0cignc3JjJywgZS50YXJnZXQucmVzdWx0KTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9O1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJlYWRlci5yZWFkQXNEYXRhVVJMKGlucHV0LmZpbGVzWzBdKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgICAgIHNsaWRlckl0ZW1zLmZpbmQoXCJpbnB1dC5pbWFnZVwiKS5jaGFuZ2UoZnVuY3Rpb24oZSl7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHJlYWRVUkwodGhpcywgJChlLnRhcmdldCkpO1xyXG4gICAgICAgICAgICAgICAgfSk7XHJcblxyXG4gICAgICAgICAgICAgICAgdmFyIHN0YXJDbG9uZSA9IG51bGw7XHJcbiAgICAgICAgICAgICAgICBzbGlkZXJJdGVtcy5maW5kKFwiLnN0YXJzXCIpLm9uKCdtb3VzZWVudGVyJywgZnVuY3Rpb24oKXtcclxuICAgICAgICAgICAgICAgICAgICAgICAgc3RhckNsb25lID0gJCh0aGlzKS5jbG9uZSgpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAkKHRoaXMpLm9uKFwibW91c2VvdmVyXCIsIGZ1bmN0aW9uKGUpe1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmKGUudGFyZ2V0ID09IHRoaXMpIHJldHVybiBmYWxzZTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAkKGUudGFyZ2V0KS5wcmV2QWxsKCkuYWRkQ2xhc3MoJ2FjdGl2ZScpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICQoZS50YXJnZXQpLmFkZENsYXNzKCdhY3RpdmUnKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAkKGUudGFyZ2V0KS5uZXh0QWxsKCkucmVtb3ZlQ2xhc3MoJ2FjdGl2ZScpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgICAgIH0pLm9uKCdtb3VzZWxlYXZlJywgZnVuY3Rpb24oKXtcclxuICAgICAgICAgICAgICAgICAgICAgICAgJCh0aGlzKS5vZmYoXCJtb3VzZW92ZXJcIik7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICQodGhpcykuaHRtbChzdGFyQ2xvbmUuaHRtbCgpKTtcclxuICAgICAgICAgICAgICAgIH0pLm9uKCdjbGljaycsIGZ1bmN0aW9uKGUpe1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBpZihlLnRhcmdldCA9PSB0aGlzKSByZXR1cm47XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHN0YXJDbG9uZSA9ICQodGhpcykuY2xvbmUoKTtcclxuICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICAgICAgc2xpZGVySXRlbXMuZmluZChcIi5wYW5lbC1ib2R5XCIpLm9uKFwiaW5wdXRcIiwgJy5uYW1lJywgZnVuY3Rpb24oZSl7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICQoZS5kZWxlZ2F0ZVRhcmdldCkucGFyZW50KCkucHJldigpLmZpbmQoXCIubmFtZVwiKS50ZXh0KCQodGhpcykudGV4dCgpKTtcclxuICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICAgICAgc2xpZGVySXRlbXMuZmluZChcIi5wYW5lbC1ib2R5IGJ1dHRvblwiKS5vbihcImNsaWNrXCIsIGZ1bmN0aW9uKCl7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICQodGhpcykucGFyZW50KCkucGFyZW50KCkucGFyZW50KCkucmVtb3ZlKCk7XHJcbiAgICAgICAgICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgICAgICAgICBzbGlkZXJJdGVtcy5maW5kKFwiLm5ldy1pdGVtXCIpLm9uKFwiY2xpY2tcIiwgZnVuY3Rpb24oKXtcclxuICAgICAgICAgICAgICAgICAgICAgICAgdmFyIGl0ZW0gPSBzbGlkZXJJdGVtcy5maW5kKCcuY2xvbmVhYmxlJykuY2xvbmUodHJ1ZSk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGl0ZW0ucmVtb3ZlQ2xhc3MoJ2Nsb25lYWJsZSBoaWRkZW4nKVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgLmFkZENsYXNzKFwiaXRlbVwiKVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgLmF0dHIoXCJkYXRhLWlkXCIsIFwiLTFcIilcclxuICAgICAgICAgICAgICAgICAgICAgICAgaXRlbS5hdHRyKFwiZGF0YS1vcmRlclwiLCAocGFyc2VJbnQoc2xpZGVySXRlbXMuZmluZChcIi5wYW5lbDpsYXN0XCIpXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLnByZXYoKS5hdHRyKFwiZGF0YS1vcmRlclwiKSkgfHwgMCkgKyAxKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgaXRlbS5maW5kKCcucGFuZWwtaGVhZGluZycpLmF0dHIoXCJpZFwiLCBcImhlYWRpbmdfLTFcIik7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGl0ZW0uZmluZCgnLnBhbmVsLXRpdGxlIGEnKVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgLmF0dHIoXCJocmVmXCIsIFwiI2NvbGxhcHNlXy0xXCIpXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAuYXR0cihcImFyaWEtY29udHJvbHNcIiwgXCJjb2xsYXBzZV8tMVwiKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgaXRlbS5maW5kKCcucGFuZWwtY29sbGFwc2UnKVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgLmF0dHIoJ2lkJywgJ2NvbGxhcHNlXy0xJylcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIC5hdHRyKCdhcmlhLWxhYmVsbGVkYnknLCAnaGVhZGluZ18tMScpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBpdGVtLmZpbmQoJ2xhYmVsJykuYXR0cihcImZvclwiLCAnaW1nXy0xJylcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIC5maW5kKFwiaW5wdXRcIikuYXR0cihcImlkXCIsICdpbWdfLTEnKTtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHNsaWRlckl0ZW1zLmZpbmQoJy5jbG9uZWFibGUnKS5iZWZvcmUoaXRlbSk7XHJcblxyXG4gICAgICAgICAgICAgICAgfSk7XHJcblxyXG4gICAgICAgICAgICAgICAgdmFyIFVSTFVwZGF0ZUl0ZW1zID0gXCJjb250ZW50L2NvbXBvbmVudC91cGRhdGUvQmxvY2txdW90ZVwiO1xyXG4gICAgICAgICAgICAgICAgdmFyIG9uRWRpdEVycm9yID0gZnVuY3Rpb24ocmVzcG9uc2Upe1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY29uc29sZS5sb2cocmVzcG9uc2UpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgJChcImJvZHlcIikuYXBwZW5kKHJlc3BvbnNlLnJlc3BvbnNlVGV4dClcclxuICAgICAgICAgICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICAgICAgICAgIG9uRWRpdFN1Y2Nlc3MgPSBmdW5jdGlvbihyZXNwb25zZSl7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhyZXNwb25zZSk7XHJcbiAgICAgICAgICAgICAgICAgICAgfTtcclxuXHJcbiAgICAgICAgICAgICAgICB2YXIgcmVxdWVzdE9wdGlvbnMgPSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHR5cGU6IFwiUE9TVFwiLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBoZWFkZXJzOiB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgJ1gtQ1NSRi1UT0tFTic6ICQoJ21ldGFbbmFtZT1cImNzcmYtdG9rZW5cIl0nKS5hdHRyKCdjb250ZW50JylcclxuICAgICAgICAgICAgICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgc3VjY2Vzczogb25FZGl0U3VjY2VzcyxcclxuICAgICAgICAgICAgICAgICAgICAgICAgZXJyb3I6IG9uRWRpdEVycm9yXHJcbiAgICAgICAgICAgICAgICB9O1xyXG4gICAgICAgICAgICAgICAgc2xpZGVySXRlbXMuZmluZChcIi5zYXZlLWFsbFwiKS5vbihcImNsaWNrXCIsIGZ1bmN0aW9uKCl7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHZhciBkYXRhID0gW107XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHNsaWRlckl0ZW1zLmZpbmQoJy5pdGVtJykuZWFjaChmdW5jdGlvbihpLCBvYmope1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRhdGEucHVzaCh7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZDogICQob2JqKS5hdHRyKFwiZGF0YS1pZFwiKSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG9yZGVyOiAgJChvYmopLmF0dHIoXCJkYXRhLW9yZGVyXCIpLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbmFtZTogICQob2JqKS5maW5kKFwiLnBhbmVsLWJvZHkgLm5hbWVcIikudGV4dCgpLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZGVzY3JpcHRpb246ICQob2JqKS5maW5kKFwiLnBhbmVsLWJvZHkgaDZcIikudGV4dCgpLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdGV4dDogJChvYmopLmZpbmQoXCIucGFuZWwtYm9keSBoNlwiKS50ZXh0KCksXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBzdGFyczogJChvYmopLmZpbmQoJy5wYW5lbC1ib2R5IGg1JykubGVuZ3RoLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaW1hZ2U6ICQob2JqKS5maW5kKFwiaW1nXCIpLmF0dHIoXCJzcmNcIilcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHJlcXVlc3RPcHRpb25zLmRhdGEgPSB7ZGF0YTpkYXRhfTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgJC5hamF4KFVSTFVwZGF0ZUl0ZW1zLCByZXF1ZXN0T3B0aW9ucyk7XHJcbiAgICAgICAgICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgfSkoKTtcclxuXHJcbn0pOyJdLCJmaWxlIjoiY29tcG9uZW50cy5qcyIsInNvdXJjZVJvb3QiOiIvc291cmNlLyJ9
