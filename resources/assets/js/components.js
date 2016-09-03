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