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