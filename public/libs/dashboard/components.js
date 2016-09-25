var APPLICATION = APPLICATION || {};
APPLICATION.Components = new function(){
    "use strict";
    var self = this;
    self.Global = new function(){
        "use strict";
        var $this = this;
        $this.forDelete = {};
        $this.forSave = {};
        $this.RootURL = "content/component/";
        $this.requestOptions = {
            headers: {
                'type': "POST",
                'X-CSRF-TOKEN': $('meta[name="csrf-token"]').attr('content')
            },
            error: function(response){
                var w = window.open('', ':Error Message', 'menubar=no, location=no');
                w.document.write(response.responseText);
            }
        };
    };
    self.Helper = new function(){
        "use strict";
        var $this = this;
        $this.initSortable = function(target, handle){
            var removeIntent = false;
            target.sortable({
                items: ".item",
                handle: handle,
                opacity: 0.8,
                stop: function( event ) {
                    $(event.target).find(".item").each(function(i, obj){
                        $(obj).attr("data-order", i+1).attr('changed', 'true');
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
                        self.Global.forDelete[target.selector.substring(11)].push(ui.item.attr("data-id"));
                    }
                }
            });
        };
        $this.initImagePreview = function(){
            var readURL =  function (input) {
                if (input.files && input.files[0]) {
                    var reader = new FileReader();
                    reader.onload = function (e) {
                        $('#modal_preview').attr('src', e.target.result);
                    };
                    reader.readAsDataURL(input.files[0]);
                }
            };

            $('#modal_image').change(function(){
                readURL(this);
            });
        };
        $this.getURL = function(){
            return {
                getComponentsData: self.Global.RootURL + "get/all",
                update: self.Global.RootURL + "update/all",
                delete: self.Global.RootURL + "delete/all"
            }
        };
        $this.modal = new function(){
            var that = this;
            var target = $("#modal");
            var item = null;
            var isNewItem = false;
            this.open = function(options){
                item = options;
                for(var i = options.properties.length; i--;){
                    if(options.properties[i] == "order"){
                        $("#modal_" + options.properties[i])
                            .text(options.item.attr('data-order'))
                            .parent()
                            .removeClass('hidden');
                    }
                    if(options.properties[i] == "image"){
                        $("#modal_preview")
                            .attr('src', options.item.find("img").attr('src'))
                            .parent()
                            .removeClass('hidden');
                    }
                    else {
                        $("#modal_" + options.properties[i])
                            .val(options.item.find("." + options.properties[i]).text())
                            .parent()
                            .removeClass('hidden');
                    }
                }
                target.modal();
            };
            this.save = function(options){
                options.item.attr('changed', 'true');
                for(var i = options.properties.length; i--;){
                    if(options.properties[i] == "order")
                        continue;
                    if(options.properties[i] == "image"){
                        options.item.find("img")
                            .attr('src', $("#modal_preview").attr('src'))
                    }
                    else {
                        options.item.find("." + options.properties[i])
                            .text($("#modal_" + options.properties[i]).val());
                    }
                }
                if(isNewItem){
                    options.target.append(
                        options.item
                            .removeClass('hidden cloneable')
                            .addClass('item')
                            .attr('data-id', Date.now())
                    );
                    options.target.parent()
                        .sortable('option', 'stop')({
                            target: options.target.get(0)
                        });
                }

            };
            this.init = function(options){
                options.target.on('click', '.item', function(){
                    that.open({
                        item: $(this),
                        properties: options.properties
                    });
                });
            };
            this.initNewItem = function(options){
                options.target.on('click', '.new-item', function(){
                    isNewItem = true;
                    that.open({
                        target: options.target.find(".innerContent"),
                        item: options.item.clone(),
                        properties: options.properties
                    });
                });
            };

            //Events
            $this.initImagePreview();

            target.find('.save-item').on('click', function(){
                target.modal('hide');
                that.save(item);
                item = null;
            });
            target.find('.delete-item').on('click', function(){
                item.item.remove();
                item = null;
                target.modal('hide');
            });
            target.on("hidden.bs.modal", function(){
                target.find("form").get(0).reset();
                target.find("img").attr("src", "");
                target.find(".form-group").addClass('hidden');
                isNewItem = false;
            });

            $("#modal_date").datetimepicker({
                format: 'Y-m-d',
                timepicker: false
            });

        };
        $this.initStarFive = function(target){
            var starClone = null;
            var starTarget = target.find(".stars");
            starTarget.each(function(i, obj){
                var count = (parseInt($(obj).parent().attr('data-stars')) || 1);
                for(var i = 0; i < 5; i++){
                    if(i < count){
                        $(obj).append('<span class="glyphicon glyphicon-star active"></span>');
                    }
                    else{
                        $(obj).append('<span class="glyphicon glyphicon-star"></span>');
                    }
                }
            });
            starTarget.on('mouseenter', function(){
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
                e.stopPropagation();
                if(e.target == this) return;
                starClone = $(this).clone();
                $(this).parent()
                    .attr('data-stars', $(this).find('.active').length)
                    .attr("changed", 'true');

            });
        }
    };
    self.loadComponents = new function(){
        self.Global.requestOptions.success = function(response){
            var componentNames = Object.keys(response);
            for(var i = componentNames.length; i--;){
                self.initComponent(componentNames[i], response[componentNames[i]].data, response[componentNames[i]].schema);

                self.Global.forDelete[componentNames[i]] = [];
                self.Global.forSave[componentNames[i]] = {};
                self.Global.forSave[componentNames[i]]['componentData'] = [];
                self.Global.forSave[componentNames[i]]['requestData'] = response[componentNames[i]].schema;
            }
        };
        self.Global.requestOptions.type = "GET";
        $.ajax(self.Helper.getURL().getComponentsData, self.Global.requestOptions);

        window.onload = function(){
            $("#save-changes").on("click", self.saveComponents);
        }
    };
    self.initComponent = function(componentName, componentData, componentSchema){
        "use strict";
        var target = $('.component_' + componentName);
        var cloneable = target.find(".cloneable");
        var innerContent = target.find('.innerContent');
        var sortableHandle = target.find(".sortableHandle");

        self.Helper.initSortable(target, sortableHandle.length > 0 ? ".sortableHandle" : false);
        if(target.get(0).hasAttribute('data-modal')){
            self.Helper.modal.init({
                target: innerContent,
                properties: componentSchema
            });
            self.Helper.modal.initNewItem({
                target: target,
                properties: componentSchema,
                item: cloneable
            })
        }
        for(var i = componentData.length; i--;){
            var item = cloneable.clone();
            var keys = Object.keys(componentData[i]);
            for(var k = keys.length; k--;){
                var key = keys[k];
                if(key == 'id' || key == 'order' || key == 'stars')
                    item.attr('data-'+key, componentData[i][key]);
                else if(key == 'image')
                    item.find("img").attr('src', componentData[i][key]);
                else
                    item.find("." + key).text(componentData[i][key]);
            }
            item.removeClass('hidden cloneable');
            item.addClass('item');
            innerContent.prepend(item);
        }
        if(componentName == "Blockquote"){
            self.Helper.initStarFive(target);
            target.find(".panel-body").on("input", '.name', function(e){
                $(e.delegateTarget).parent().prev().find(".name").text($(this).text());
            });
        }


    };
    self.saveComponents = function(){
        var components = Object.keys(self.Global.forSave);
        var newItems = false;
        for(var i = components.length; i--;){
            var item = $("#" + components[i] + " [changed='true']");
            var requestData = self.Global.forSave[components[i]].requestData;
            var componentData = self.Global.forSave[components[i]].componentData;
            item.each(function(i, obj){
                var data = {};
                for(var j = requestData.length; j--;){
                    var key = requestData[j];
                    if(key == 'id' || key == 'order' || key == 'stars')
                        data[key] = parseInt($(obj).attr('data-'+key));
                    else if(key == 'image')
                        data[key] = $(obj).find("img").attr('src');
                    else
                        data[key] = $(obj).find("." + key).text();
                }
                componentData.push(data);
                newItems = componentData.length > 0 ? true : false;
            });
        }
        self.Global.requestOptions.success = function(response){
            $.notify('Successfully saved', "success");
            for(var i = components.length; i--;){
                self.Global.forSave[components[i]].componentData = [];
            }

            $("[changed=true]").attr("changed", 'false');

            var componentNames = Object.keys(response);
            for(var i = componentNames.length; i--;){
                var component = componentNames[i];
                for(var c = response[component].length; c--;){
                    $("#" + component + " [data-id='"+ response[component][c]['request_id'] +"']")
                        .attr("data-id", response[component][c]['response_id']);

                }
            }
        };
        self.Global.requestOptions.error = function(response){
            for(var i = components.length; i--;){
                self.Global.forSave[components[i]].componentData = [];
            }

            var w = window.open('', ':Error Message', 'menubar=no, location=no');
            w.document.write(response.responseText);
        };
        self.Global.requestOptions.data = {
            forDelete: self.Global.forDelete,
            forSave: self.Global.forSave
        };
        self.Global.requestOptions.type = "POST";
        if(newItems)
            $.ajax(self.Helper.getURL().update, self.Global.requestOptions)
        else{
            $.notify('Nothing changed', "info");
        }
    }

};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiIiwic291cmNlcyI6WyJkYXNoYm9hcmQvY29tcG9uZW50cy5qcyJdLCJzb3VyY2VzQ29udGVudCI6WyJ2YXIgQVBQTElDQVRJT04gPSBBUFBMSUNBVElPTiB8fCB7fTtcclxuQVBQTElDQVRJT04uQ29tcG9uZW50cyA9IG5ldyBmdW5jdGlvbigpe1xyXG4gICAgXCJ1c2Ugc3RyaWN0XCI7XHJcbiAgICB2YXIgc2VsZiA9IHRoaXM7XHJcbiAgICBzZWxmLkdsb2JhbCA9IG5ldyBmdW5jdGlvbigpe1xyXG4gICAgICAgIFwidXNlIHN0cmljdFwiO1xyXG4gICAgICAgIHZhciAkdGhpcyA9IHRoaXM7XHJcbiAgICAgICAgJHRoaXMuZm9yRGVsZXRlID0ge307XHJcbiAgICAgICAgJHRoaXMuZm9yU2F2ZSA9IHt9O1xyXG4gICAgICAgICR0aGlzLlJvb3RVUkwgPSBcImNvbnRlbnQvY29tcG9uZW50L1wiO1xyXG4gICAgICAgICR0aGlzLnJlcXVlc3RPcHRpb25zID0ge1xyXG4gICAgICAgICAgICBoZWFkZXJzOiB7XHJcbiAgICAgICAgICAgICAgICAndHlwZSc6IFwiUE9TVFwiLFxyXG4gICAgICAgICAgICAgICAgJ1gtQ1NSRi1UT0tFTic6ICQoJ21ldGFbbmFtZT1cImNzcmYtdG9rZW5cIl0nKS5hdHRyKCdjb250ZW50JylcclxuICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgZXJyb3I6IGZ1bmN0aW9uKHJlc3BvbnNlKXtcclxuICAgICAgICAgICAgICAgIHZhciB3ID0gd2luZG93Lm9wZW4oJycsICc6RXJyb3IgTWVzc2FnZScsICdtZW51YmFyPW5vLCBsb2NhdGlvbj1ubycpO1xyXG4gICAgICAgICAgICAgICAgdy5kb2N1bWVudC53cml0ZShyZXNwb25zZS5yZXNwb25zZVRleHQpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfTtcclxuICAgIH07XHJcbiAgICBzZWxmLkhlbHBlciA9IG5ldyBmdW5jdGlvbigpe1xyXG4gICAgICAgIFwidXNlIHN0cmljdFwiO1xyXG4gICAgICAgIHZhciAkdGhpcyA9IHRoaXM7XHJcbiAgICAgICAgJHRoaXMuaW5pdFNvcnRhYmxlID0gZnVuY3Rpb24odGFyZ2V0LCBoYW5kbGUpe1xyXG4gICAgICAgICAgICB2YXIgcmVtb3ZlSW50ZW50ID0gZmFsc2U7XHJcbiAgICAgICAgICAgIHRhcmdldC5zb3J0YWJsZSh7XHJcbiAgICAgICAgICAgICAgICBpdGVtczogXCIuaXRlbVwiLFxyXG4gICAgICAgICAgICAgICAgaGFuZGxlOiBoYW5kbGUsXHJcbiAgICAgICAgICAgICAgICBvcGFjaXR5OiAwLjgsXHJcbiAgICAgICAgICAgICAgICBzdG9wOiBmdW5jdGlvbiggZXZlbnQgKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgJChldmVudC50YXJnZXQpLmZpbmQoXCIuaXRlbVwiKS5lYWNoKGZ1bmN0aW9uKGksIG9iail7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICQob2JqKS5hdHRyKFwiZGF0YS1vcmRlclwiLCBpKzEpLmF0dHIoJ2NoYW5nZWQnLCAndHJ1ZScpO1xyXG4gICAgICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICAgICAgfSxcclxuXHJcbiAgICAgICAgICAgICAgICBvdmVyOiBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgcmVtb3ZlSW50ZW50ID0gZmFsc2U7XHJcbiAgICAgICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICAgICAgb3V0OiBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgcmVtb3ZlSW50ZW50ID0gdHJ1ZTtcclxuICAgICAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgICAgICBiZWZvcmVTdG9wOiBmdW5jdGlvbiAoZXZlbnQsIHVpKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgaWYocmVtb3ZlSW50ZW50ID09IHRydWUpe1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB1aS5pdGVtLnJlbW92ZSgpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB2YXIgaWQgPSB1aS5pdGVtLmF0dHIoXCJkYXRhLWlkXCIpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBzZWxmLkdsb2JhbC5mb3JEZWxldGVbdGFyZ2V0LnNlbGVjdG9yLnN1YnN0cmluZygxMSldLnB1c2godWkuaXRlbS5hdHRyKFwiZGF0YS1pZFwiKSk7XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICB9O1xyXG4gICAgICAgICR0aGlzLmluaXRJbWFnZVByZXZpZXcgPSBmdW5jdGlvbigpe1xyXG4gICAgICAgICAgICB2YXIgcmVhZFVSTCA9ICBmdW5jdGlvbiAoaW5wdXQpIHtcclxuICAgICAgICAgICAgICAgIGlmIChpbnB1dC5maWxlcyAmJiBpbnB1dC5maWxlc1swXSkge1xyXG4gICAgICAgICAgICAgICAgICAgIHZhciByZWFkZXIgPSBuZXcgRmlsZVJlYWRlcigpO1xyXG4gICAgICAgICAgICAgICAgICAgIHJlYWRlci5vbmxvYWQgPSBmdW5jdGlvbiAoZSkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAkKCcjbW9kYWxfcHJldmlldycpLmF0dHIoJ3NyYycsIGUudGFyZ2V0LnJlc3VsdCk7XHJcbiAgICAgICAgICAgICAgICAgICAgfTtcclxuICAgICAgICAgICAgICAgICAgICByZWFkZXIucmVhZEFzRGF0YVVSTChpbnB1dC5maWxlc1swXSk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH07XHJcblxyXG4gICAgICAgICAgICAkKCcjbW9kYWxfaW1hZ2UnKS5jaGFuZ2UoZnVuY3Rpb24oKXtcclxuICAgICAgICAgICAgICAgIHJlYWRVUkwodGhpcyk7XHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgIH07XHJcbiAgICAgICAgJHRoaXMuZ2V0VVJMID0gZnVuY3Rpb24oKXtcclxuICAgICAgICAgICAgcmV0dXJuIHtcclxuICAgICAgICAgICAgICAgIGdldENvbXBvbmVudHNEYXRhOiBzZWxmLkdsb2JhbC5Sb290VVJMICsgXCJnZXQvYWxsXCIsXHJcbiAgICAgICAgICAgICAgICB1cGRhdGU6IHNlbGYuR2xvYmFsLlJvb3RVUkwgKyBcInVwZGF0ZS9hbGxcIixcclxuICAgICAgICAgICAgICAgIGRlbGV0ZTogc2VsZi5HbG9iYWwuUm9vdFVSTCArIFwiZGVsZXRlL2FsbFwiXHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9O1xyXG4gICAgICAgICR0aGlzLm1vZGFsID0gbmV3IGZ1bmN0aW9uKCl7XHJcbiAgICAgICAgICAgIHZhciB0aGF0ID0gdGhpcztcclxuICAgICAgICAgICAgdmFyIHRhcmdldCA9ICQoXCIjbW9kYWxcIik7XHJcbiAgICAgICAgICAgIHZhciBpdGVtID0gbnVsbDtcclxuICAgICAgICAgICAgdmFyIGlzTmV3SXRlbSA9IGZhbHNlO1xyXG4gICAgICAgICAgICB0aGlzLm9wZW4gPSBmdW5jdGlvbihvcHRpb25zKXtcclxuICAgICAgICAgICAgICAgIGl0ZW0gPSBvcHRpb25zO1xyXG4gICAgICAgICAgICAgICAgZm9yKHZhciBpID0gb3B0aW9ucy5wcm9wZXJ0aWVzLmxlbmd0aDsgaS0tOyl7XHJcbiAgICAgICAgICAgICAgICAgICAgaWYob3B0aW9ucy5wcm9wZXJ0aWVzW2ldID09IFwib3JkZXJcIil7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICQoXCIjbW9kYWxfXCIgKyBvcHRpb25zLnByb3BlcnRpZXNbaV0pXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAudGV4dChvcHRpb25zLml0ZW0uYXR0cignZGF0YS1vcmRlcicpKVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgLnBhcmVudCgpXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAucmVtb3ZlQ2xhc3MoJ2hpZGRlbicpO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICBpZihvcHRpb25zLnByb3BlcnRpZXNbaV0gPT0gXCJpbWFnZVwiKXtcclxuICAgICAgICAgICAgICAgICAgICAgICAgJChcIiNtb2RhbF9wcmV2aWV3XCIpXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAuYXR0cignc3JjJywgb3B0aW9ucy5pdGVtLmZpbmQoXCJpbWdcIikuYXR0cignc3JjJykpXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAucGFyZW50KClcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIC5yZW1vdmVDbGFzcygnaGlkZGVuJyk7XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgIGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAkKFwiI21vZGFsX1wiICsgb3B0aW9ucy5wcm9wZXJ0aWVzW2ldKVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgLnZhbChvcHRpb25zLml0ZW0uZmluZChcIi5cIiArIG9wdGlvbnMucHJvcGVydGllc1tpXSkudGV4dCgpKVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgLnBhcmVudCgpXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAucmVtb3ZlQ2xhc3MoJ2hpZGRlbicpO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIHRhcmdldC5tb2RhbCgpO1xyXG4gICAgICAgICAgICB9O1xyXG4gICAgICAgICAgICB0aGlzLnNhdmUgPSBmdW5jdGlvbihvcHRpb25zKXtcclxuICAgICAgICAgICAgICAgIG9wdGlvbnMuaXRlbS5hdHRyKCdjaGFuZ2VkJywgJ3RydWUnKTtcclxuICAgICAgICAgICAgICAgIGZvcih2YXIgaSA9IG9wdGlvbnMucHJvcGVydGllcy5sZW5ndGg7IGktLTspe1xyXG4gICAgICAgICAgICAgICAgICAgIGlmKG9wdGlvbnMucHJvcGVydGllc1tpXSA9PSBcIm9yZGVyXCIpXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnRpbnVlO1xyXG4gICAgICAgICAgICAgICAgICAgIGlmKG9wdGlvbnMucHJvcGVydGllc1tpXSA9PSBcImltYWdlXCIpe1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBvcHRpb25zLml0ZW0uZmluZChcImltZ1wiKVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgLmF0dHIoJ3NyYycsICQoXCIjbW9kYWxfcHJldmlld1wiKS5hdHRyKCdzcmMnKSlcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgZWxzZSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIG9wdGlvbnMuaXRlbS5maW5kKFwiLlwiICsgb3B0aW9ucy5wcm9wZXJ0aWVzW2ldKVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgLnRleHQoJChcIiNtb2RhbF9cIiArIG9wdGlvbnMucHJvcGVydGllc1tpXSkudmFsKCkpO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIGlmKGlzTmV3SXRlbSl7XHJcbiAgICAgICAgICAgICAgICAgICAgb3B0aW9ucy50YXJnZXQuYXBwZW5kKFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBvcHRpb25zLml0ZW1cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIC5yZW1vdmVDbGFzcygnaGlkZGVuIGNsb25lYWJsZScpXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAuYWRkQ2xhc3MoJ2l0ZW0nKVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgLmF0dHIoJ2RhdGEtaWQnLCBEYXRlLm5vdygpKVxyXG4gICAgICAgICAgICAgICAgICAgICk7XHJcbiAgICAgICAgICAgICAgICAgICAgb3B0aW9ucy50YXJnZXQucGFyZW50KClcclxuICAgICAgICAgICAgICAgICAgICAgICAgLnNvcnRhYmxlKCdvcHRpb24nLCAnc3RvcCcpKHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRhcmdldDogb3B0aW9ucy50YXJnZXQuZ2V0KDApXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgfTtcclxuICAgICAgICAgICAgdGhpcy5pbml0ID0gZnVuY3Rpb24ob3B0aW9ucyl7XHJcbiAgICAgICAgICAgICAgICBvcHRpb25zLnRhcmdldC5vbignY2xpY2snLCAnLml0ZW0nLCBmdW5jdGlvbigpe1xyXG4gICAgICAgICAgICAgICAgICAgIHRoYXQub3Blbih7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGl0ZW06ICQodGhpcyksXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHByb3BlcnRpZXM6IG9wdGlvbnMucHJvcGVydGllc1xyXG4gICAgICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgIH07XHJcbiAgICAgICAgICAgIHRoaXMuaW5pdE5ld0l0ZW0gPSBmdW5jdGlvbihvcHRpb25zKXtcclxuICAgICAgICAgICAgICAgIG9wdGlvbnMudGFyZ2V0Lm9uKCdjbGljaycsICcubmV3LWl0ZW0nLCBmdW5jdGlvbigpe1xyXG4gICAgICAgICAgICAgICAgICAgIGlzTmV3SXRlbSA9IHRydWU7XHJcbiAgICAgICAgICAgICAgICAgICAgdGhhdC5vcGVuKHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgdGFyZ2V0OiBvcHRpb25zLnRhcmdldC5maW5kKFwiLmlubmVyQ29udGVudFwiKSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgaXRlbTogb3B0aW9ucy5pdGVtLmNsb25lKCksXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHByb3BlcnRpZXM6IG9wdGlvbnMucHJvcGVydGllc1xyXG4gICAgICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgIH07XHJcblxyXG4gICAgICAgICAgICAvL0V2ZW50c1xyXG4gICAgICAgICAgICAkdGhpcy5pbml0SW1hZ2VQcmV2aWV3KCk7XHJcblxyXG4gICAgICAgICAgICB0YXJnZXQuZmluZCgnLnNhdmUtaXRlbScpLm9uKCdjbGljaycsIGZ1bmN0aW9uKCl7XHJcbiAgICAgICAgICAgICAgICB0YXJnZXQubW9kYWwoJ2hpZGUnKTtcclxuICAgICAgICAgICAgICAgIHRoYXQuc2F2ZShpdGVtKTtcclxuICAgICAgICAgICAgICAgIGl0ZW0gPSBudWxsO1xyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgdGFyZ2V0LmZpbmQoJy5kZWxldGUtaXRlbScpLm9uKCdjbGljaycsIGZ1bmN0aW9uKCl7XHJcbiAgICAgICAgICAgICAgICBpdGVtLml0ZW0ucmVtb3ZlKCk7XHJcbiAgICAgICAgICAgICAgICBpdGVtID0gbnVsbDtcclxuICAgICAgICAgICAgICAgIHRhcmdldC5tb2RhbCgnaGlkZScpO1xyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgdGFyZ2V0Lm9uKFwiaGlkZGVuLmJzLm1vZGFsXCIsIGZ1bmN0aW9uKCl7XHJcbiAgICAgICAgICAgICAgICB0YXJnZXQuZmluZChcImZvcm1cIikuZ2V0KDApLnJlc2V0KCk7XHJcbiAgICAgICAgICAgICAgICB0YXJnZXQuZmluZChcImltZ1wiKS5hdHRyKFwic3JjXCIsIFwiXCIpO1xyXG4gICAgICAgICAgICAgICAgdGFyZ2V0LmZpbmQoXCIuZm9ybS1ncm91cFwiKS5hZGRDbGFzcygnaGlkZGVuJyk7XHJcbiAgICAgICAgICAgICAgICBpc05ld0l0ZW0gPSBmYWxzZTtcclxuICAgICAgICAgICAgfSk7XHJcblxyXG4gICAgICAgICAgICAkKFwiI21vZGFsX2RhdGVcIikuZGF0ZXRpbWVwaWNrZXIoe1xyXG4gICAgICAgICAgICAgICAgZm9ybWF0OiAnWS1tLWQnLFxyXG4gICAgICAgICAgICAgICAgdGltZXBpY2tlcjogZmFsc2VcclxuICAgICAgICAgICAgfSk7XHJcblxyXG4gICAgICAgIH07XHJcbiAgICAgICAgJHRoaXMuaW5pdFN0YXJGaXZlID0gZnVuY3Rpb24odGFyZ2V0KXtcclxuICAgICAgICAgICAgdmFyIHN0YXJDbG9uZSA9IG51bGw7XHJcbiAgICAgICAgICAgIHZhciBzdGFyVGFyZ2V0ID0gdGFyZ2V0LmZpbmQoXCIuc3RhcnNcIik7XHJcbiAgICAgICAgICAgIHN0YXJUYXJnZXQuZWFjaChmdW5jdGlvbihpLCBvYmope1xyXG4gICAgICAgICAgICAgICAgdmFyIGNvdW50ID0gKHBhcnNlSW50KCQob2JqKS5wYXJlbnQoKS5hdHRyKCdkYXRhLXN0YXJzJykpIHx8IDEpO1xyXG4gICAgICAgICAgICAgICAgZm9yKHZhciBpID0gMDsgaSA8IDU7IGkrKyl7XHJcbiAgICAgICAgICAgICAgICAgICAgaWYoaSA8IGNvdW50KXtcclxuICAgICAgICAgICAgICAgICAgICAgICAgJChvYmopLmFwcGVuZCgnPHNwYW4gY2xhc3M9XCJnbHlwaGljb24gZ2x5cGhpY29uLXN0YXIgYWN0aXZlXCI+PC9zcGFuPicpO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICBlbHNle1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAkKG9iaikuYXBwZW5kKCc8c3BhbiBjbGFzcz1cImdseXBoaWNvbiBnbHlwaGljb24tc3RhclwiPjwvc3Bhbj4nKTtcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICBzdGFyVGFyZ2V0Lm9uKCdtb3VzZWVudGVyJywgZnVuY3Rpb24oKXtcclxuICAgICAgICAgICAgICAgIHN0YXJDbG9uZSA9ICQodGhpcykuY2xvbmUoKTtcclxuICAgICAgICAgICAgICAgICQodGhpcykub24oXCJtb3VzZW92ZXJcIiwgZnVuY3Rpb24oZSl7XHJcbiAgICAgICAgICAgICAgICAgICAgaWYoZS50YXJnZXQgPT0gdGhpcykgcmV0dXJuIGZhbHNlO1xyXG4gICAgICAgICAgICAgICAgICAgICQoZS50YXJnZXQpLnByZXZBbGwoKS5hZGRDbGFzcygnYWN0aXZlJyk7XHJcbiAgICAgICAgICAgICAgICAgICAgJChlLnRhcmdldCkuYWRkQ2xhc3MoJ2FjdGl2ZScpO1xyXG4gICAgICAgICAgICAgICAgICAgICQoZS50YXJnZXQpLm5leHRBbGwoKS5yZW1vdmVDbGFzcygnYWN0aXZlJyk7XHJcbiAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgfSkub24oJ21vdXNlbGVhdmUnLCBmdW5jdGlvbigpe1xyXG4gICAgICAgICAgICAgICAgJCh0aGlzKS5vZmYoXCJtb3VzZW92ZXJcIik7XHJcbiAgICAgICAgICAgICAgICAkKHRoaXMpLmh0bWwoc3RhckNsb25lLmh0bWwoKSk7XHJcbiAgICAgICAgICAgIH0pLm9uKCdjbGljaycsIGZ1bmN0aW9uKGUpe1xyXG4gICAgICAgICAgICAgICAgZS5zdG9wUHJvcGFnYXRpb24oKTtcclxuICAgICAgICAgICAgICAgIGlmKGUudGFyZ2V0ID09IHRoaXMpIHJldHVybjtcclxuICAgICAgICAgICAgICAgIHN0YXJDbG9uZSA9ICQodGhpcykuY2xvbmUoKTtcclxuICAgICAgICAgICAgICAgICQodGhpcykucGFyZW50KClcclxuICAgICAgICAgICAgICAgICAgICAuYXR0cignZGF0YS1zdGFycycsICQodGhpcykuZmluZCgnLmFjdGl2ZScpLmxlbmd0aClcclxuICAgICAgICAgICAgICAgICAgICAuYXR0cihcImNoYW5nZWRcIiwgJ3RydWUnKTtcclxuXHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgIH1cclxuICAgIH07XHJcbiAgICBzZWxmLmxvYWRDb21wb25lbnRzID0gbmV3IGZ1bmN0aW9uKCl7XHJcbiAgICAgICAgc2VsZi5HbG9iYWwucmVxdWVzdE9wdGlvbnMuc3VjY2VzcyA9IGZ1bmN0aW9uKHJlc3BvbnNlKXtcclxuICAgICAgICAgICAgdmFyIGNvbXBvbmVudE5hbWVzID0gT2JqZWN0LmtleXMocmVzcG9uc2UpO1xyXG4gICAgICAgICAgICBmb3IodmFyIGkgPSBjb21wb25lbnROYW1lcy5sZW5ndGg7IGktLTspe1xyXG4gICAgICAgICAgICAgICAgc2VsZi5pbml0Q29tcG9uZW50KGNvbXBvbmVudE5hbWVzW2ldLCByZXNwb25zZVtjb21wb25lbnROYW1lc1tpXV0uZGF0YSwgcmVzcG9uc2VbY29tcG9uZW50TmFtZXNbaV1dLnNjaGVtYSk7XHJcblxyXG4gICAgICAgICAgICAgICAgc2VsZi5HbG9iYWwuZm9yRGVsZXRlW2NvbXBvbmVudE5hbWVzW2ldXSA9IFtdO1xyXG4gICAgICAgICAgICAgICAgc2VsZi5HbG9iYWwuZm9yU2F2ZVtjb21wb25lbnROYW1lc1tpXV0gPSB7fTtcclxuICAgICAgICAgICAgICAgIHNlbGYuR2xvYmFsLmZvclNhdmVbY29tcG9uZW50TmFtZXNbaV1dWydjb21wb25lbnREYXRhJ10gPSBbXTtcclxuICAgICAgICAgICAgICAgIHNlbGYuR2xvYmFsLmZvclNhdmVbY29tcG9uZW50TmFtZXNbaV1dWydyZXF1ZXN0RGF0YSddID0gcmVzcG9uc2VbY29tcG9uZW50TmFtZXNbaV1dLnNjaGVtYTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH07XHJcbiAgICAgICAgc2VsZi5HbG9iYWwucmVxdWVzdE9wdGlvbnMudHlwZSA9IFwiR0VUXCI7XHJcbiAgICAgICAgJC5hamF4KHNlbGYuSGVscGVyLmdldFVSTCgpLmdldENvbXBvbmVudHNEYXRhLCBzZWxmLkdsb2JhbC5yZXF1ZXN0T3B0aW9ucyk7XHJcblxyXG4gICAgICAgIHdpbmRvdy5vbmxvYWQgPSBmdW5jdGlvbigpe1xyXG4gICAgICAgICAgICAkKFwiI3NhdmUtY2hhbmdlc1wiKS5vbihcImNsaWNrXCIsIHNlbGYuc2F2ZUNvbXBvbmVudHMpO1xyXG4gICAgICAgIH1cclxuICAgIH07XHJcbiAgICBzZWxmLmluaXRDb21wb25lbnQgPSBmdW5jdGlvbihjb21wb25lbnROYW1lLCBjb21wb25lbnREYXRhLCBjb21wb25lbnRTY2hlbWEpe1xyXG4gICAgICAgIFwidXNlIHN0cmljdFwiO1xyXG4gICAgICAgIHZhciB0YXJnZXQgPSAkKCcuY29tcG9uZW50XycgKyBjb21wb25lbnROYW1lKTtcclxuICAgICAgICB2YXIgY2xvbmVhYmxlID0gdGFyZ2V0LmZpbmQoXCIuY2xvbmVhYmxlXCIpO1xyXG4gICAgICAgIHZhciBpbm5lckNvbnRlbnQgPSB0YXJnZXQuZmluZCgnLmlubmVyQ29udGVudCcpO1xyXG4gICAgICAgIHZhciBzb3J0YWJsZUhhbmRsZSA9IHRhcmdldC5maW5kKFwiLnNvcnRhYmxlSGFuZGxlXCIpO1xyXG5cclxuICAgICAgICBzZWxmLkhlbHBlci5pbml0U29ydGFibGUodGFyZ2V0LCBzb3J0YWJsZUhhbmRsZS5sZW5ndGggPiAwID8gXCIuc29ydGFibGVIYW5kbGVcIiA6IGZhbHNlKTtcclxuICAgICAgICBpZih0YXJnZXQuZ2V0KDApLmhhc0F0dHJpYnV0ZSgnZGF0YS1tb2RhbCcpKXtcclxuICAgICAgICAgICAgc2VsZi5IZWxwZXIubW9kYWwuaW5pdCh7XHJcbiAgICAgICAgICAgICAgICB0YXJnZXQ6IGlubmVyQ29udGVudCxcclxuICAgICAgICAgICAgICAgIHByb3BlcnRpZXM6IGNvbXBvbmVudFNjaGVtYVxyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgc2VsZi5IZWxwZXIubW9kYWwuaW5pdE5ld0l0ZW0oe1xyXG4gICAgICAgICAgICAgICAgdGFyZ2V0OiB0YXJnZXQsXHJcbiAgICAgICAgICAgICAgICBwcm9wZXJ0aWVzOiBjb21wb25lbnRTY2hlbWEsXHJcbiAgICAgICAgICAgICAgICBpdGVtOiBjbG9uZWFibGVcclxuICAgICAgICAgICAgfSlcclxuICAgICAgICB9XHJcbiAgICAgICAgZm9yKHZhciBpID0gY29tcG9uZW50RGF0YS5sZW5ndGg7IGktLTspe1xyXG4gICAgICAgICAgICB2YXIgaXRlbSA9IGNsb25lYWJsZS5jbG9uZSgpO1xyXG4gICAgICAgICAgICB2YXIga2V5cyA9IE9iamVjdC5rZXlzKGNvbXBvbmVudERhdGFbaV0pO1xyXG4gICAgICAgICAgICBmb3IodmFyIGsgPSBrZXlzLmxlbmd0aDsgay0tOyl7XHJcbiAgICAgICAgICAgICAgICB2YXIga2V5ID0ga2V5c1trXTtcclxuICAgICAgICAgICAgICAgIGlmKGtleSA9PSAnaWQnIHx8IGtleSA9PSAnb3JkZXInIHx8IGtleSA9PSAnc3RhcnMnKVxyXG4gICAgICAgICAgICAgICAgICAgIGl0ZW0uYXR0cignZGF0YS0nK2tleSwgY29tcG9uZW50RGF0YVtpXVtrZXldKTtcclxuICAgICAgICAgICAgICAgIGVsc2UgaWYoa2V5ID09ICdpbWFnZScpXHJcbiAgICAgICAgICAgICAgICAgICAgaXRlbS5maW5kKFwiaW1nXCIpLmF0dHIoJ3NyYycsIGNvbXBvbmVudERhdGFbaV1ba2V5XSk7XHJcbiAgICAgICAgICAgICAgICBlbHNlXHJcbiAgICAgICAgICAgICAgICAgICAgaXRlbS5maW5kKFwiLlwiICsga2V5KS50ZXh0KGNvbXBvbmVudERhdGFbaV1ba2V5XSk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgaXRlbS5yZW1vdmVDbGFzcygnaGlkZGVuIGNsb25lYWJsZScpO1xyXG4gICAgICAgICAgICBpdGVtLmFkZENsYXNzKCdpdGVtJyk7XHJcbiAgICAgICAgICAgIGlubmVyQ29udGVudC5wcmVwZW5kKGl0ZW0pO1xyXG4gICAgICAgIH1cclxuICAgICAgICBpZihjb21wb25lbnROYW1lID09IFwiQmxvY2txdW90ZVwiKXtcclxuICAgICAgICAgICAgc2VsZi5IZWxwZXIuaW5pdFN0YXJGaXZlKHRhcmdldCk7XHJcbiAgICAgICAgICAgIHRhcmdldC5maW5kKFwiLnBhbmVsLWJvZHlcIikub24oXCJpbnB1dFwiLCAnLm5hbWUnLCBmdW5jdGlvbihlKXtcclxuICAgICAgICAgICAgICAgICQoZS5kZWxlZ2F0ZVRhcmdldCkucGFyZW50KCkucHJldigpLmZpbmQoXCIubmFtZVwiKS50ZXh0KCQodGhpcykudGV4dCgpKTtcclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgfVxyXG5cclxuXHJcbiAgICB9O1xyXG4gICAgc2VsZi5zYXZlQ29tcG9uZW50cyA9IGZ1bmN0aW9uKCl7XHJcbiAgICAgICAgdmFyIGNvbXBvbmVudHMgPSBPYmplY3Qua2V5cyhzZWxmLkdsb2JhbC5mb3JTYXZlKTtcclxuICAgICAgICB2YXIgbmV3SXRlbXMgPSBmYWxzZTtcclxuICAgICAgICBmb3IodmFyIGkgPSBjb21wb25lbnRzLmxlbmd0aDsgaS0tOyl7XHJcbiAgICAgICAgICAgIHZhciBpdGVtID0gJChcIiNcIiArIGNvbXBvbmVudHNbaV0gKyBcIiBbY2hhbmdlZD0ndHJ1ZSddXCIpO1xyXG4gICAgICAgICAgICB2YXIgcmVxdWVzdERhdGEgPSBzZWxmLkdsb2JhbC5mb3JTYXZlW2NvbXBvbmVudHNbaV1dLnJlcXVlc3REYXRhO1xyXG4gICAgICAgICAgICB2YXIgY29tcG9uZW50RGF0YSA9IHNlbGYuR2xvYmFsLmZvclNhdmVbY29tcG9uZW50c1tpXV0uY29tcG9uZW50RGF0YTtcclxuICAgICAgICAgICAgaXRlbS5lYWNoKGZ1bmN0aW9uKGksIG9iail7XHJcbiAgICAgICAgICAgICAgICB2YXIgZGF0YSA9IHt9O1xyXG4gICAgICAgICAgICAgICAgZm9yKHZhciBqID0gcmVxdWVzdERhdGEubGVuZ3RoOyBqLS07KXtcclxuICAgICAgICAgICAgICAgICAgICB2YXIga2V5ID0gcmVxdWVzdERhdGFbal07XHJcbiAgICAgICAgICAgICAgICAgICAgaWYoa2V5ID09ICdpZCcgfHwga2V5ID09ICdvcmRlcicgfHwga2V5ID09ICdzdGFycycpXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGRhdGFba2V5XSA9IHBhcnNlSW50KCQob2JqKS5hdHRyKCdkYXRhLScra2V5KSk7XHJcbiAgICAgICAgICAgICAgICAgICAgZWxzZSBpZihrZXkgPT0gJ2ltYWdlJylcclxuICAgICAgICAgICAgICAgICAgICAgICAgZGF0YVtrZXldID0gJChvYmopLmZpbmQoXCJpbWdcIikuYXR0cignc3JjJyk7XHJcbiAgICAgICAgICAgICAgICAgICAgZWxzZVxyXG4gICAgICAgICAgICAgICAgICAgICAgICBkYXRhW2tleV0gPSAkKG9iaikuZmluZChcIi5cIiArIGtleSkudGV4dCgpO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgY29tcG9uZW50RGF0YS5wdXNoKGRhdGEpO1xyXG4gICAgICAgICAgICAgICAgbmV3SXRlbXMgPSBjb21wb25lbnREYXRhLmxlbmd0aCA+IDAgPyB0cnVlIDogZmFsc2U7XHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgIH1cclxuICAgICAgICBzZWxmLkdsb2JhbC5yZXF1ZXN0T3B0aW9ucy5zdWNjZXNzID0gZnVuY3Rpb24ocmVzcG9uc2Upe1xyXG4gICAgICAgICAgICAkLm5vdGlmeSgnU3VjY2Vzc2Z1bGx5IHNhdmVkJywgXCJzdWNjZXNzXCIpO1xyXG4gICAgICAgICAgICBmb3IodmFyIGkgPSBjb21wb25lbnRzLmxlbmd0aDsgaS0tOyl7XHJcbiAgICAgICAgICAgICAgICBzZWxmLkdsb2JhbC5mb3JTYXZlW2NvbXBvbmVudHNbaV1dLmNvbXBvbmVudERhdGEgPSBbXTtcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgJChcIltjaGFuZ2VkPXRydWVdXCIpLmF0dHIoXCJjaGFuZ2VkXCIsICdmYWxzZScpO1xyXG5cclxuICAgICAgICAgICAgdmFyIGNvbXBvbmVudE5hbWVzID0gT2JqZWN0LmtleXMocmVzcG9uc2UpO1xyXG4gICAgICAgICAgICBmb3IodmFyIGkgPSBjb21wb25lbnROYW1lcy5sZW5ndGg7IGktLTspe1xyXG4gICAgICAgICAgICAgICAgdmFyIGNvbXBvbmVudCA9IGNvbXBvbmVudE5hbWVzW2ldO1xyXG4gICAgICAgICAgICAgICAgZm9yKHZhciBjID0gcmVzcG9uc2VbY29tcG9uZW50XS5sZW5ndGg7IGMtLTspe1xyXG4gICAgICAgICAgICAgICAgICAgICQoXCIjXCIgKyBjb21wb25lbnQgKyBcIiBbZGF0YS1pZD0nXCIrIHJlc3BvbnNlW2NvbXBvbmVudF1bY11bJ3JlcXVlc3RfaWQnXSArXCInXVwiKVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAuYXR0cihcImRhdGEtaWRcIiwgcmVzcG9uc2VbY29tcG9uZW50XVtjXVsncmVzcG9uc2VfaWQnXSk7XHJcblxyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfTtcclxuICAgICAgICBzZWxmLkdsb2JhbC5yZXF1ZXN0T3B0aW9ucy5lcnJvciA9IGZ1bmN0aW9uKHJlc3BvbnNlKXtcclxuICAgICAgICAgICAgZm9yKHZhciBpID0gY29tcG9uZW50cy5sZW5ndGg7IGktLTspe1xyXG4gICAgICAgICAgICAgICAgc2VsZi5HbG9iYWwuZm9yU2F2ZVtjb21wb25lbnRzW2ldXS5jb21wb25lbnREYXRhID0gW107XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIHZhciB3ID0gd2luZG93Lm9wZW4oJycsICc6RXJyb3IgTWVzc2FnZScsICdtZW51YmFyPW5vLCBsb2NhdGlvbj1ubycpO1xyXG4gICAgICAgICAgICB3LmRvY3VtZW50LndyaXRlKHJlc3BvbnNlLnJlc3BvbnNlVGV4dCk7XHJcbiAgICAgICAgfTtcclxuICAgICAgICBzZWxmLkdsb2JhbC5yZXF1ZXN0T3B0aW9ucy5kYXRhID0ge1xyXG4gICAgICAgICAgICBmb3JEZWxldGU6IHNlbGYuR2xvYmFsLmZvckRlbGV0ZSxcclxuICAgICAgICAgICAgZm9yU2F2ZTogc2VsZi5HbG9iYWwuZm9yU2F2ZVxyXG4gICAgICAgIH07XHJcbiAgICAgICAgc2VsZi5HbG9iYWwucmVxdWVzdE9wdGlvbnMudHlwZSA9IFwiUE9TVFwiO1xyXG4gICAgICAgIGlmKG5ld0l0ZW1zKVxyXG4gICAgICAgICAgICAkLmFqYXgoc2VsZi5IZWxwZXIuZ2V0VVJMKCkudXBkYXRlLCBzZWxmLkdsb2JhbC5yZXF1ZXN0T3B0aW9ucylcclxuICAgICAgICBlbHNle1xyXG4gICAgICAgICAgICAkLm5vdGlmeSgnTm90aGluZyBjaGFuZ2VkJywgXCJpbmZvXCIpO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbn07Il0sImZpbGUiOiJkYXNoYm9hcmQvY29tcG9uZW50cy5qcyIsInNvdXJjZVJvb3QiOiIvc291cmNlLyJ9
