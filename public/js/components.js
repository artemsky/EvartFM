$(function() {
        "use strict";
        //Slider
        (function(){
                var sliderItems = $(".sortable");
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
        })()

});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiIiwic291cmNlcyI6WyJjb21wb25lbnRzLmpzIl0sInNvdXJjZXNDb250ZW50IjpbIiQoZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgXCJ1c2Ugc3RyaWN0XCI7XHJcbiAgICAgICAgLy9TbGlkZXJcclxuICAgICAgICAoZnVuY3Rpb24oKXtcclxuICAgICAgICAgICAgICAgIHZhciBzbGlkZXJJdGVtcyA9ICQoXCIuc29ydGFibGVcIik7XHJcbiAgICAgICAgICAgICAgICB2YXIgcmVtb3ZlSW50ZW50ID0gZmFsc2U7XHJcbiAgICAgICAgICAgICAgICBzbGlkZXJJdGVtcy5zb3J0YWJsZSh7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGl0ZW1zOiBcIi5pdGVtXCIsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIG9wYWNpdHk6IDAuOCxcclxuICAgICAgICAgICAgICAgICAgICAgICAgc3RvcDogZnVuY3Rpb24oIGV2ZW50LCB1aSApIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAkKGV2ZW50LnRhcmdldCkuZmluZChcIi5pdGVtXCIpLmVhY2goZnVuY3Rpb24oaSwgb2JqKXtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICQob2JqKS5hdHRyKFwiZGF0YS1vcmRlclwiLCBpKzEpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBvdmVyOiBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcmVtb3ZlSW50ZW50ID0gZmFsc2U7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIG91dDogZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJlbW92ZUludGVudCA9IHRydWU7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGJlZm9yZVN0b3A6IGZ1bmN0aW9uIChldmVudCwgdWkpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZihyZW1vdmVJbnRlbnQgPT0gdHJ1ZSl7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB1aS5pdGVtLnJlbW92ZSgpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgfSk7XHJcblxyXG4gICAgICAgICAgICAgICAgZnVuY3Rpb24gcmVhZFVSTChpbnB1dCkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoaW5wdXQuZmlsZXMgJiYgaW5wdXQuZmlsZXNbMF0pIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB2YXIgcmVhZGVyID0gbmV3IEZpbGVSZWFkZXIoKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICByZWFkZXIub25sb2FkID0gZnVuY3Rpb24gKGUpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICQoJyNwcmV2aWV3JykuYXR0cignc3JjJywgZS50YXJnZXQucmVzdWx0KTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9O1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJlYWRlci5yZWFkQXNEYXRhVVJMKGlucHV0LmZpbGVzWzBdKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgICAgICQoXCIjaW1hZ2VcIikuY2hhbmdlKGZ1bmN0aW9uKCl7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHJlYWRVUkwodGhpcyk7XHJcbiAgICAgICAgICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgICAgICAgICB2YXIgVVJMVXBkYXRlSXRlbXMgPSBcImNvbnRlbnQvY29tcG9uZW50L3VwZGF0ZS9TbGlkZXJcIjtcclxuICAgICAgICAgICAgICAgIHZhciBvbkVkaXRFcnJvciA9IGZ1bmN0aW9uKHJlc3BvbnNlKXtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKHJlc3BvbnNlKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICQoXCJib2R5XCIpLmFwcGVuZChyZXNwb25zZS5yZXNwb25zZVRleHQpXHJcbiAgICAgICAgICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgICAgICAgICBvbkVkaXRTdWNjZXNzID0gZnVuY3Rpb24ocmVzcG9uc2Upe1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY29uc29sZS5sb2cocmVzcG9uc2UpO1xyXG4gICAgICAgICAgICAgICAgICAgIH07XHJcbiAgICAgICAgICAgICAgICB2YXIgbW9kYWwgPSAkKFwiI21vZGFsX3NsaWRlclwiKTtcclxuICAgICAgICAgICAgICAgIHZhciBmb3JtID0gbW9kYWwuZmluZCgnZm9ybScpO1xyXG4gICAgICAgICAgICAgICAgdmFyIHJlcXVlc3RPcHRpb25zID0ge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB0eXBlOiBcIlBPU1RcIixcclxuICAgICAgICAgICAgICAgICAgICAgICAgaGVhZGVyczoge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICdYLUNTUkYtVE9LRU4nOiAkKCdtZXRhW25hbWU9XCJjc3JmLXRva2VuXCJdJykuYXR0cignY29udGVudCcpXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHN1Y2Nlc3M6IG9uRWRpdFN1Y2Nlc3MsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGVycm9yOiBvbkVkaXRFcnJvclxyXG4gICAgICAgICAgICAgICAgfTtcclxuICAgICAgICAgICAgICAgIHNsaWRlckl0ZW1zLmZpbmQoXCIuc2F2ZS1hbGxcIikub24oXCJjbGlja1wiLCBmdW5jdGlvbigpe1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB2YXIgZGF0YSA9IFtdO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBzbGlkZXJJdGVtcy5maW5kKCcuaXRlbScpLmVhY2goZnVuY3Rpb24oaSwgb2JqKXtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBkYXRhLnB1c2goe1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaWQ6ICAkKG9iaikuYXR0cihcImRhdGEtaWRcIiksXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBvcmRlcjogICQob2JqKS5hdHRyKFwiZGF0YS1vcmRlclwiKSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRpdGxlOiAgJChvYmopLmZpbmQoXCJoMVwiKS50ZXh0KCksXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBkZXNjcmlwdGlvbjogJChvYmopLmZpbmQoXCJwXCIpLnRleHQoKSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGltYWdlOiAkKG9iaikuZmluZChcImltZ1wiKS5hdHRyKFwic3JjXCIpXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICByZXF1ZXN0T3B0aW9ucy5kYXRhID0ge2RhdGE6ZGF0YX07XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICQuYWpheChVUkxVcGRhdGVJdGVtcywgcmVxdWVzdE9wdGlvbnMpO1xyXG4gICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgICAgICB2YXIgY3VycmVudEl0ZW0gPSBudWxsO1xyXG4gICAgICAgICAgICAgICAgdmFyIGlzTmV3ID0gZmFsc2U7XHJcbiAgICAgICAgICAgICAgICB2YXIgdGl0bGUgPSBmb3JtLmZpbmQoXCIjdGl0bGVcIik7XHJcbiAgICAgICAgICAgICAgICB2YXIgZGVzY3JpcHRpb24gPSBmb3JtLmZpbmQoXCIjZGVzY3JpcHRpb25cIik7XHJcbiAgICAgICAgICAgICAgICB2YXIgaW1hZ2UgPSBmb3JtLmZpbmQoXCJpbWdcIik7XHJcbiAgICAgICAgICAgICAgICBzbGlkZXJJdGVtcy5vbignY2xpY2snLCBcIi5pdGVtXCIsIGZ1bmN0aW9uKCl7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGlzTmV3ID0gZmFsc2U7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGN1cnJlbnRJdGVtID0gJCh0aGlzKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgdGl0bGUudmFsKGN1cnJlbnRJdGVtLmZpbmQoXCJoMVwiKS50ZXh0KCkpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBkZXNjcmlwdGlvbi52YWwoY3VycmVudEl0ZW0uZmluZChcInBcIikudGV4dCgpKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgaW1hZ2UuYXR0cihcInNyY1wiLCBjdXJyZW50SXRlbS5maW5kKFwiaW1nXCIpLmF0dHIoXCJzcmNcIikpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBtb2RhbC5maW5kKFwiLm1vZGFsLXRpdGxlIHNwYW5cIikudGV4dChjdXJyZW50SXRlbS5hdHRyKFwiZGF0YS1vcmRlclwiKSk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIG1vZGFsLm1vZGFsKCk7XHJcbiAgICAgICAgICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgICAgICAgICBtb2RhbC5maW5kKFwiLnNhdmUtY2hhbmdlc1wiKS5vbihcImNsaWNrXCIsIGZ1bmN0aW9uKCl7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGN1cnJlbnRJdGVtLmZpbmQoXCJoMVwiKS50ZXh0KHRpdGxlLnZhbCgpKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgY3VycmVudEl0ZW0uZmluZChcInBcIikudGV4dChkZXNjcmlwdGlvbi52YWwoKSk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGN1cnJlbnRJdGVtLmZpbmQoXCJpbWdcIikuYXR0cihcInNyY1wiLCAkKCcjcHJldmlldycpLmF0dHIoXCJzcmNcIikpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBpZihpc05ldylcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBzbGlkZXJJdGVtcy5maW5kKFwiLm1vcmVcIikuYmVmb3JlKGN1cnJlbnRJdGVtKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgbW9kYWwubW9kYWwoJ2hpZGUnKTtcclxuICAgICAgICAgICAgICAgIH0pO1xyXG5cclxuICAgICAgICAgICAgICAgIG1vZGFsLmZpbmQoXCIuZGVsZXRlLWl0ZW1cIikub24oXCJjbGlja1wiLCBmdW5jdGlvbigpe1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBjdXJyZW50SXRlbS5yZW1vdmUoKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgbW9kYWwubW9kYWwoJ2hpZGUnKTtcclxuICAgICAgICAgICAgICAgIH0pO1xyXG5cclxuICAgICAgICAgICAgICAgIHNsaWRlckl0ZW1zLmZpbmQoXCIubmV3LWl0ZW1cIikub24oXCJjbGlja1wiLCBmdW5jdGlvbigpe1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBpc05ldyA9IHRydWU7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGN1cnJlbnRJdGVtID0gc2xpZGVySXRlbXMuZmluZChcIi5jbG9uZWFibGVcIikuY2xvbmUodHJ1ZSk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGN1cnJlbnRJdGVtLnJlbW92ZUNsYXNzKFwiY2xvbmVhYmxlIGhpZGRlblwiKS5hZGRDbGFzcygnaXRlbScpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBjdXJyZW50SXRlbS5hdHRyKFwiZGF0YS1vcmRlclwiLCAocGFyc2VJbnQoc2xpZGVySXRlbXMuZmluZChcIi5pdGVtOmxhc3RcIikuYXR0cihcImRhdGEtb3JkZXJcIikpIHx8IDApKzEpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBjdXJyZW50SXRlbS5hdHRyKFwiZGF0YS1pZFwiLCBcIi0xXCIpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBmb3JtLmdldCgwKS5yZXNldCgpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBpbWFnZS5hdHRyKFwic3JjXCIsICcnKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgbW9kYWwuZmluZChcIi5tb2RhbC10aXRsZSBzcGFuXCIpLnRleHQoJycpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBtb2RhbC5tb2RhbCgpO1xyXG4gICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgfSkoKVxyXG5cclxufSk7Il0sImZpbGUiOiJjb21wb25lbnRzLmpzIiwic291cmNlUm9vdCI6Ii9zb3VyY2UvIn0=
