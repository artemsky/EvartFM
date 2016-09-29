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
        $.ajax($("#componentsControl").attr('data-url'), {
            type: "POST",
            headers: {
                'X-CSRF-TOKEN': $('meta[name="csrf-token"]').attr('content')
            },
            data: (function(){
                var data = [];
                $(".isActive").each(function(i, obj){
                    data.push({
                        id: $(obj).attr("data-id"),
                        active: $(obj).prop('checked')
                    });
                });
                return {data: data};
            })(),
        });
    }

};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiIiwic291cmNlcyI6WyJkYXNoYm9hcmQvY29tcG9uZW50cy5qcyJdLCJzb3VyY2VzQ29udGVudCI6WyJ2YXIgQVBQTElDQVRJT04gPSBBUFBMSUNBVElPTiB8fCB7fTtcbkFQUExJQ0FUSU9OLkNvbXBvbmVudHMgPSBuZXcgZnVuY3Rpb24oKXtcbiAgICBcInVzZSBzdHJpY3RcIjtcbiAgICB2YXIgc2VsZiA9IHRoaXM7XG4gICAgc2VsZi5HbG9iYWwgPSBuZXcgZnVuY3Rpb24oKXtcbiAgICAgICAgXCJ1c2Ugc3RyaWN0XCI7XG4gICAgICAgIHZhciAkdGhpcyA9IHRoaXM7XG4gICAgICAgICR0aGlzLmZvckRlbGV0ZSA9IHt9O1xuICAgICAgICAkdGhpcy5mb3JTYXZlID0ge307XG4gICAgICAgICR0aGlzLlJvb3RVUkwgPSBcImNvbnRlbnQvY29tcG9uZW50L1wiO1xuICAgICAgICAkdGhpcy5yZXF1ZXN0T3B0aW9ucyA9IHtcbiAgICAgICAgICAgIGhlYWRlcnM6IHtcbiAgICAgICAgICAgICAgICAnWC1DU1JGLVRPS0VOJzogJCgnbWV0YVtuYW1lPVwiY3NyZi10b2tlblwiXScpLmF0dHIoJ2NvbnRlbnQnKVxuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIGVycm9yOiBmdW5jdGlvbihyZXNwb25zZSl7XG4gICAgICAgICAgICAgICAgdmFyIHcgPSB3aW5kb3cub3BlbignJywgJzpFcnJvciBNZXNzYWdlJywgJ21lbnViYXI9bm8sIGxvY2F0aW9uPW5vJyk7XG4gICAgICAgICAgICAgICAgdy5kb2N1bWVudC53cml0ZShyZXNwb25zZS5yZXNwb25zZVRleHQpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9O1xuICAgIH07XG4gICAgc2VsZi5IZWxwZXIgPSBuZXcgZnVuY3Rpb24oKXtcbiAgICAgICAgXCJ1c2Ugc3RyaWN0XCI7XG4gICAgICAgIHZhciAkdGhpcyA9IHRoaXM7XG4gICAgICAgICR0aGlzLmluaXRTb3J0YWJsZSA9IGZ1bmN0aW9uKHRhcmdldCwgaGFuZGxlKXtcbiAgICAgICAgICAgIHZhciByZW1vdmVJbnRlbnQgPSBmYWxzZTtcbiAgICAgICAgICAgIHRhcmdldC5zb3J0YWJsZSh7XG4gICAgICAgICAgICAgICAgaXRlbXM6IFwiLml0ZW1cIixcbiAgICAgICAgICAgICAgICBoYW5kbGU6IGhhbmRsZSxcbiAgICAgICAgICAgICAgICBvcGFjaXR5OiAwLjgsXG4gICAgICAgICAgICAgICAgc3RvcDogZnVuY3Rpb24oIGV2ZW50ICkge1xuICAgICAgICAgICAgICAgICAgICAkKGV2ZW50LnRhcmdldCkuZmluZChcIi5pdGVtXCIpLmVhY2goZnVuY3Rpb24oaSwgb2JqKXtcbiAgICAgICAgICAgICAgICAgICAgICAgICQob2JqKS5hdHRyKFwiZGF0YS1vcmRlclwiLCBpKzEpLmF0dHIoJ2NoYW5nZWQnLCAndHJ1ZScpO1xuICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICB9LFxuXG4gICAgICAgICAgICAgICAgb3ZlcjogZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgICAgICByZW1vdmVJbnRlbnQgPSBmYWxzZTtcbiAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgIG91dDogZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgICAgICByZW1vdmVJbnRlbnQgPSB0cnVlO1xuICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgYmVmb3JlU3RvcDogZnVuY3Rpb24gKGV2ZW50LCB1aSkge1xuICAgICAgICAgICAgICAgICAgICBpZihyZW1vdmVJbnRlbnQgPT0gdHJ1ZSl7XG4gICAgICAgICAgICAgICAgICAgICAgICB1aS5pdGVtLnJlbW92ZSgpO1xuICAgICAgICAgICAgICAgICAgICAgICAgdmFyIGlkID0gdWkuaXRlbS5hdHRyKFwiZGF0YS1pZFwiKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIHNlbGYuR2xvYmFsLmZvckRlbGV0ZVt0YXJnZXQuc2VsZWN0b3Iuc3Vic3RyaW5nKDExKV0ucHVzaCh1aS5pdGVtLmF0dHIoXCJkYXRhLWlkXCIpKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9O1xuICAgICAgICAkdGhpcy5pbml0SW1hZ2VQcmV2aWV3ID0gZnVuY3Rpb24oKXtcbiAgICAgICAgICAgIHZhciByZWFkVVJMID0gIGZ1bmN0aW9uIChpbnB1dCkge1xuICAgICAgICAgICAgICAgIGlmIChpbnB1dC5maWxlcyAmJiBpbnB1dC5maWxlc1swXSkge1xuICAgICAgICAgICAgICAgICAgICB2YXIgcmVhZGVyID0gbmV3IEZpbGVSZWFkZXIoKTtcbiAgICAgICAgICAgICAgICAgICAgcmVhZGVyLm9ubG9hZCA9IGZ1bmN0aW9uIChlKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAkKCcjbW9kYWxfcHJldmlldycpLmF0dHIoJ3NyYycsIGUudGFyZ2V0LnJlc3VsdCk7XG4gICAgICAgICAgICAgICAgICAgIH07XG4gICAgICAgICAgICAgICAgICAgIHJlYWRlci5yZWFkQXNEYXRhVVJMKGlucHV0LmZpbGVzWzBdKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9O1xuXG4gICAgICAgICAgICAkKCcjbW9kYWxfaW1hZ2UnKS5jaGFuZ2UoZnVuY3Rpb24oKXtcbiAgICAgICAgICAgICAgICByZWFkVVJMKHRoaXMpO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgIH07XG4gICAgICAgICR0aGlzLmdldFVSTCA9IGZ1bmN0aW9uKCl7XG4gICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICAgIGdldENvbXBvbmVudHNEYXRhOiBzZWxmLkdsb2JhbC5Sb290VVJMICsgXCJnZXQvYWxsXCIsXG4gICAgICAgICAgICAgICAgdXBkYXRlOiBzZWxmLkdsb2JhbC5Sb290VVJMICsgXCJ1cGRhdGUvYWxsXCIsXG4gICAgICAgICAgICAgICAgZGVsZXRlOiBzZWxmLkdsb2JhbC5Sb290VVJMICsgXCJkZWxldGUvYWxsXCJcbiAgICAgICAgICAgIH1cbiAgICAgICAgfTtcbiAgICAgICAgJHRoaXMubW9kYWwgPSBuZXcgZnVuY3Rpb24oKXtcbiAgICAgICAgICAgIHZhciB0aGF0ID0gdGhpcztcbiAgICAgICAgICAgIHZhciB0YXJnZXQgPSAkKFwiI21vZGFsXCIpO1xuICAgICAgICAgICAgdmFyIGl0ZW0gPSBudWxsO1xuICAgICAgICAgICAgdmFyIGlzTmV3SXRlbSA9IGZhbHNlO1xuICAgICAgICAgICAgdGhpcy5vcGVuID0gZnVuY3Rpb24ob3B0aW9ucyl7XG4gICAgICAgICAgICAgICAgaXRlbSA9IG9wdGlvbnM7XG4gICAgICAgICAgICAgICAgZm9yKHZhciBpID0gb3B0aW9ucy5wcm9wZXJ0aWVzLmxlbmd0aDsgaS0tOyl7XG4gICAgICAgICAgICAgICAgICAgIGlmKG9wdGlvbnMucHJvcGVydGllc1tpXSA9PSBcIm9yZGVyXCIpe1xuICAgICAgICAgICAgICAgICAgICAgICAgJChcIiNtb2RhbF9cIiArIG9wdGlvbnMucHJvcGVydGllc1tpXSlcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAudGV4dChvcHRpb25zLml0ZW0uYXR0cignZGF0YS1vcmRlcicpKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIC5wYXJlbnQoKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIC5yZW1vdmVDbGFzcygnaGlkZGVuJyk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgaWYob3B0aW9ucy5wcm9wZXJ0aWVzW2ldID09IFwiaW1hZ2VcIil7XG4gICAgICAgICAgICAgICAgICAgICAgICAkKFwiI21vZGFsX3ByZXZpZXdcIilcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAuYXR0cignc3JjJywgb3B0aW9ucy5pdGVtLmZpbmQoXCJpbWdcIikuYXR0cignc3JjJykpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgLnBhcmVudCgpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgLnJlbW92ZUNsYXNzKCdoaWRkZW4nKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICQoXCIjbW9kYWxfXCIgKyBvcHRpb25zLnByb3BlcnRpZXNbaV0pXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgLnZhbChvcHRpb25zLml0ZW0uZmluZChcIi5cIiArIG9wdGlvbnMucHJvcGVydGllc1tpXSkudGV4dCgpKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIC5wYXJlbnQoKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIC5yZW1vdmVDbGFzcygnaGlkZGVuJyk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgdGFyZ2V0Lm1vZGFsKCk7XG4gICAgICAgICAgICB9O1xuICAgICAgICAgICAgdGhpcy5zYXZlID0gZnVuY3Rpb24ob3B0aW9ucyl7XG4gICAgICAgICAgICAgICAgb3B0aW9ucy5pdGVtLmF0dHIoJ2NoYW5nZWQnLCAndHJ1ZScpO1xuICAgICAgICAgICAgICAgIGZvcih2YXIgaSA9IG9wdGlvbnMucHJvcGVydGllcy5sZW5ndGg7IGktLTspe1xuICAgICAgICAgICAgICAgICAgICBpZihvcHRpb25zLnByb3BlcnRpZXNbaV0gPT0gXCJvcmRlclwiKVxuICAgICAgICAgICAgICAgICAgICAgICAgY29udGludWU7XG4gICAgICAgICAgICAgICAgICAgIGlmKG9wdGlvbnMucHJvcGVydGllc1tpXSA9PSBcImltYWdlXCIpe1xuICAgICAgICAgICAgICAgICAgICAgICAgb3B0aW9ucy5pdGVtLmZpbmQoXCJpbWdcIilcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAuYXR0cignc3JjJywgJChcIiNtb2RhbF9wcmV2aWV3XCIpLmF0dHIoJ3NyYycpKVxuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAgICAgb3B0aW9ucy5pdGVtLmZpbmQoXCIuXCIgKyBvcHRpb25zLnByb3BlcnRpZXNbaV0pXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgLnRleHQoJChcIiNtb2RhbF9cIiArIG9wdGlvbnMucHJvcGVydGllc1tpXSkudmFsKCkpO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGlmKGlzTmV3SXRlbSl7XG4gICAgICAgICAgICAgICAgICAgIG9wdGlvbnMudGFyZ2V0LmFwcGVuZChcbiAgICAgICAgICAgICAgICAgICAgICAgIG9wdGlvbnMuaXRlbVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIC5yZW1vdmVDbGFzcygnaGlkZGVuIGNsb25lYWJsZScpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgLmFkZENsYXNzKCdpdGVtJylcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAuYXR0cignZGF0YS1pZCcsIERhdGUubm93KCkpXG4gICAgICAgICAgICAgICAgICAgICk7XG4gICAgICAgICAgICAgICAgICAgIG9wdGlvbnMudGFyZ2V0LnBhcmVudCgpXG4gICAgICAgICAgICAgICAgICAgICAgICAuc29ydGFibGUoJ29wdGlvbicsICdzdG9wJykoe1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRhcmdldDogb3B0aW9ucy50YXJnZXQuZ2V0KDApXG4gICAgICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIH07XG4gICAgICAgICAgICB0aGlzLmluaXQgPSBmdW5jdGlvbihvcHRpb25zKXtcbiAgICAgICAgICAgICAgICBvcHRpb25zLnRhcmdldC5vbignY2xpY2snLCAnLml0ZW0nLCBmdW5jdGlvbigpe1xuICAgICAgICAgICAgICAgICAgICB0aGF0Lm9wZW4oe1xuICAgICAgICAgICAgICAgICAgICAgICAgaXRlbTogJCh0aGlzKSxcbiAgICAgICAgICAgICAgICAgICAgICAgIHByb3BlcnRpZXM6IG9wdGlvbnMucHJvcGVydGllc1xuICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIH07XG4gICAgICAgICAgICB0aGlzLmluaXROZXdJdGVtID0gZnVuY3Rpb24ob3B0aW9ucyl7XG4gICAgICAgICAgICAgICAgb3B0aW9ucy50YXJnZXQub24oJ2NsaWNrJywgJy5uZXctaXRlbScsIGZ1bmN0aW9uKCl7XG4gICAgICAgICAgICAgICAgICAgIGlzTmV3SXRlbSA9IHRydWU7XG4gICAgICAgICAgICAgICAgICAgIHRoYXQub3Blbih7XG4gICAgICAgICAgICAgICAgICAgICAgICB0YXJnZXQ6IG9wdGlvbnMudGFyZ2V0LmZpbmQoXCIuaW5uZXJDb250ZW50XCIpLFxuICAgICAgICAgICAgICAgICAgICAgICAgaXRlbTogb3B0aW9ucy5pdGVtLmNsb25lKCksXG4gICAgICAgICAgICAgICAgICAgICAgICBwcm9wZXJ0aWVzOiBvcHRpb25zLnByb3BlcnRpZXNcbiAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB9O1xuXG4gICAgICAgICAgICAvL0V2ZW50c1xuICAgICAgICAgICAgJHRoaXMuaW5pdEltYWdlUHJldmlldygpO1xuXG4gICAgICAgICAgICB0YXJnZXQuZmluZCgnLnNhdmUtaXRlbScpLm9uKCdjbGljaycsIGZ1bmN0aW9uKCl7XG4gICAgICAgICAgICAgICAgdGFyZ2V0Lm1vZGFsKCdoaWRlJyk7XG4gICAgICAgICAgICAgICAgdGhhdC5zYXZlKGl0ZW0pO1xuICAgICAgICAgICAgICAgIGl0ZW0gPSBudWxsO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB0YXJnZXQuZmluZCgnLmRlbGV0ZS1pdGVtJykub24oJ2NsaWNrJywgZnVuY3Rpb24oKXtcbiAgICAgICAgICAgICAgICBpdGVtLml0ZW0ucmVtb3ZlKCk7XG4gICAgICAgICAgICAgICAgaXRlbSA9IG51bGw7XG4gICAgICAgICAgICAgICAgdGFyZ2V0Lm1vZGFsKCdoaWRlJyk7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIHRhcmdldC5vbihcImhpZGRlbi5icy5tb2RhbFwiLCBmdW5jdGlvbigpe1xuICAgICAgICAgICAgICAgIHRhcmdldC5maW5kKFwiZm9ybVwiKS5nZXQoMCkucmVzZXQoKTtcbiAgICAgICAgICAgICAgICB0YXJnZXQuZmluZChcImltZ1wiKS5hdHRyKFwic3JjXCIsIFwiXCIpO1xuICAgICAgICAgICAgICAgIHRhcmdldC5maW5kKFwiLmZvcm0tZ3JvdXBcIikuYWRkQ2xhc3MoJ2hpZGRlbicpO1xuICAgICAgICAgICAgICAgIGlzTmV3SXRlbSA9IGZhbHNlO1xuICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgICAgICQoXCIjbW9kYWxfZGF0ZVwiKS5kYXRldGltZXBpY2tlcih7XG4gICAgICAgICAgICAgICAgZm9ybWF0OiAnWS1tLWQnLFxuICAgICAgICAgICAgICAgIHRpbWVwaWNrZXI6IGZhbHNlXG4gICAgICAgICAgICB9KTtcblxuICAgICAgICB9O1xuICAgICAgICAkdGhpcy5pbml0U3RhckZpdmUgPSBmdW5jdGlvbih0YXJnZXQpe1xuICAgICAgICAgICAgdmFyIHN0YXJDbG9uZSA9IG51bGw7XG4gICAgICAgICAgICB2YXIgc3RhclRhcmdldCA9IHRhcmdldC5maW5kKFwiLnN0YXJzXCIpO1xuICAgICAgICAgICAgc3RhclRhcmdldC5lYWNoKGZ1bmN0aW9uKGksIG9iail7XG4gICAgICAgICAgICAgICAgdmFyIGNvdW50ID0gKHBhcnNlSW50KCQob2JqKS5wYXJlbnQoKS5hdHRyKCdkYXRhLXN0YXJzJykpIHx8IDEpO1xuICAgICAgICAgICAgICAgIGZvcih2YXIgaSA9IDA7IGkgPCA1OyBpKyspe1xuICAgICAgICAgICAgICAgICAgICBpZihpIDwgY291bnQpe1xuICAgICAgICAgICAgICAgICAgICAgICAgJChvYmopLmFwcGVuZCgnPHNwYW4gY2xhc3M9XCJnbHlwaGljb24gZ2x5cGhpY29uLXN0YXIgYWN0aXZlXCI+PC9zcGFuPicpO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIGVsc2V7XG4gICAgICAgICAgICAgICAgICAgICAgICAkKG9iaikuYXBwZW5kKCc8c3BhbiBjbGFzcz1cImdseXBoaWNvbiBnbHlwaGljb24tc3RhclwiPjwvc3Bhbj4nKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgc3RhclRhcmdldC5vbignbW91c2VlbnRlcicsIGZ1bmN0aW9uKCl7XG4gICAgICAgICAgICAgICAgc3RhckNsb25lID0gJCh0aGlzKS5jbG9uZSgpO1xuICAgICAgICAgICAgICAgICQodGhpcykub24oXCJtb3VzZW92ZXJcIiwgZnVuY3Rpb24oZSl7XG4gICAgICAgICAgICAgICAgICAgIGlmKGUudGFyZ2V0ID09IHRoaXMpIHJldHVybiBmYWxzZTtcbiAgICAgICAgICAgICAgICAgICAgJChlLnRhcmdldCkucHJldkFsbCgpLmFkZENsYXNzKCdhY3RpdmUnKTtcbiAgICAgICAgICAgICAgICAgICAgJChlLnRhcmdldCkuYWRkQ2xhc3MoJ2FjdGl2ZScpO1xuICAgICAgICAgICAgICAgICAgICAkKGUudGFyZ2V0KS5uZXh0QWxsKCkucmVtb3ZlQ2xhc3MoJ2FjdGl2ZScpO1xuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgfSkub24oJ21vdXNlbGVhdmUnLCBmdW5jdGlvbigpe1xuICAgICAgICAgICAgICAgICQodGhpcykub2ZmKFwibW91c2VvdmVyXCIpO1xuICAgICAgICAgICAgICAgICQodGhpcykuaHRtbChzdGFyQ2xvbmUuaHRtbCgpKTtcbiAgICAgICAgICAgIH0pLm9uKCdjbGljaycsIGZ1bmN0aW9uKGUpe1xuICAgICAgICAgICAgICAgIGUuc3RvcFByb3BhZ2F0aW9uKCk7XG4gICAgICAgICAgICAgICAgaWYoZS50YXJnZXQgPT0gdGhpcykgcmV0dXJuO1xuICAgICAgICAgICAgICAgIHN0YXJDbG9uZSA9ICQodGhpcykuY2xvbmUoKTtcbiAgICAgICAgICAgICAgICAkKHRoaXMpLnBhcmVudCgpXG4gICAgICAgICAgICAgICAgICAgIC5hdHRyKCdkYXRhLXN0YXJzJywgJCh0aGlzKS5maW5kKCcuYWN0aXZlJykubGVuZ3RoKVxuICAgICAgICAgICAgICAgICAgICAuYXR0cihcImNoYW5nZWRcIiwgJ3RydWUnKTtcblxuICAgICAgICAgICAgfSk7XG4gICAgICAgIH1cbiAgICB9O1xuICAgIHNlbGYubG9hZENvbXBvbmVudHMgPSBuZXcgZnVuY3Rpb24oKXtcbiAgICAgICAgc2VsZi5HbG9iYWwucmVxdWVzdE9wdGlvbnMuc3VjY2VzcyA9IGZ1bmN0aW9uKHJlc3BvbnNlKXtcbiAgICAgICAgICAgIHZhciBjb21wb25lbnROYW1lcyA9IE9iamVjdC5rZXlzKHJlc3BvbnNlKTtcbiAgICAgICAgICAgIGZvcih2YXIgaSA9IGNvbXBvbmVudE5hbWVzLmxlbmd0aDsgaS0tOyl7XG4gICAgICAgICAgICAgICAgc2VsZi5pbml0Q29tcG9uZW50KGNvbXBvbmVudE5hbWVzW2ldLCByZXNwb25zZVtjb21wb25lbnROYW1lc1tpXV0uZGF0YSwgcmVzcG9uc2VbY29tcG9uZW50TmFtZXNbaV1dLnNjaGVtYSk7XG5cbiAgICAgICAgICAgICAgICBzZWxmLkdsb2JhbC5mb3JEZWxldGVbY29tcG9uZW50TmFtZXNbaV1dID0gW107XG4gICAgICAgICAgICAgICAgc2VsZi5HbG9iYWwuZm9yU2F2ZVtjb21wb25lbnROYW1lc1tpXV0gPSB7fTtcbiAgICAgICAgICAgICAgICBzZWxmLkdsb2JhbC5mb3JTYXZlW2NvbXBvbmVudE5hbWVzW2ldXVsnY29tcG9uZW50RGF0YSddID0gW107XG4gICAgICAgICAgICAgICAgc2VsZi5HbG9iYWwuZm9yU2F2ZVtjb21wb25lbnROYW1lc1tpXV1bJ3JlcXVlc3REYXRhJ10gPSByZXNwb25zZVtjb21wb25lbnROYW1lc1tpXV0uc2NoZW1hO1xuICAgICAgICAgICAgfVxuICAgICAgICB9O1xuICAgICAgICBzZWxmLkdsb2JhbC5yZXF1ZXN0T3B0aW9ucy50eXBlID0gXCJHRVRcIjtcbiAgICAgICAgJC5hamF4KHNlbGYuSGVscGVyLmdldFVSTCgpLmdldENvbXBvbmVudHNEYXRhLCBzZWxmLkdsb2JhbC5yZXF1ZXN0T3B0aW9ucyk7XG5cbiAgICAgICAgd2luZG93Lm9ubG9hZCA9IGZ1bmN0aW9uKCl7XG4gICAgICAgICAgICAkKFwiI3NhdmUtY2hhbmdlc1wiKS5vbihcImNsaWNrXCIsIHNlbGYuc2F2ZUNvbXBvbmVudHMpO1xuICAgICAgICB9XG4gICAgfTtcbiAgICBzZWxmLmluaXRDb21wb25lbnQgPSBmdW5jdGlvbihjb21wb25lbnROYW1lLCBjb21wb25lbnREYXRhLCBjb21wb25lbnRTY2hlbWEpe1xuICAgICAgICBcInVzZSBzdHJpY3RcIjtcbiAgICAgICAgdmFyIHRhcmdldCA9ICQoJy5jb21wb25lbnRfJyArIGNvbXBvbmVudE5hbWUpO1xuICAgICAgICB2YXIgY2xvbmVhYmxlID0gdGFyZ2V0LmZpbmQoXCIuY2xvbmVhYmxlXCIpO1xuICAgICAgICB2YXIgaW5uZXJDb250ZW50ID0gdGFyZ2V0LmZpbmQoJy5pbm5lckNvbnRlbnQnKTtcbiAgICAgICAgdmFyIHNvcnRhYmxlSGFuZGxlID0gdGFyZ2V0LmZpbmQoXCIuc29ydGFibGVIYW5kbGVcIik7XG5cbiAgICAgICAgc2VsZi5IZWxwZXIuaW5pdFNvcnRhYmxlKHRhcmdldCwgc29ydGFibGVIYW5kbGUubGVuZ3RoID4gMCA/IFwiLnNvcnRhYmxlSGFuZGxlXCIgOiBmYWxzZSk7XG4gICAgICAgIGlmKHRhcmdldC5nZXQoMCkuaGFzQXR0cmlidXRlKCdkYXRhLW1vZGFsJykpe1xuICAgICAgICAgICAgc2VsZi5IZWxwZXIubW9kYWwuaW5pdCh7XG4gICAgICAgICAgICAgICAgdGFyZ2V0OiBpbm5lckNvbnRlbnQsXG4gICAgICAgICAgICAgICAgcHJvcGVydGllczogY29tcG9uZW50U2NoZW1hXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIHNlbGYuSGVscGVyLm1vZGFsLmluaXROZXdJdGVtKHtcbiAgICAgICAgICAgICAgICB0YXJnZXQ6IHRhcmdldCxcbiAgICAgICAgICAgICAgICBwcm9wZXJ0aWVzOiBjb21wb25lbnRTY2hlbWEsXG4gICAgICAgICAgICAgICAgaXRlbTogY2xvbmVhYmxlXG4gICAgICAgICAgICB9KVxuICAgICAgICB9XG4gICAgICAgIGZvcih2YXIgaSA9IGNvbXBvbmVudERhdGEubGVuZ3RoOyBpLS07KXtcbiAgICAgICAgICAgIHZhciBpdGVtID0gY2xvbmVhYmxlLmNsb25lKCk7XG4gICAgICAgICAgICB2YXIga2V5cyA9IE9iamVjdC5rZXlzKGNvbXBvbmVudERhdGFbaV0pO1xuICAgICAgICAgICAgZm9yKHZhciBrID0ga2V5cy5sZW5ndGg7IGstLTspe1xuICAgICAgICAgICAgICAgIHZhciBrZXkgPSBrZXlzW2tdO1xuICAgICAgICAgICAgICAgIGlmKGtleSA9PSAnaWQnIHx8IGtleSA9PSAnb3JkZXInIHx8IGtleSA9PSAnc3RhcnMnKVxuICAgICAgICAgICAgICAgICAgICBpdGVtLmF0dHIoJ2RhdGEtJytrZXksIGNvbXBvbmVudERhdGFbaV1ba2V5XSk7XG4gICAgICAgICAgICAgICAgZWxzZSBpZihrZXkgPT0gJ2ltYWdlJylcbiAgICAgICAgICAgICAgICAgICAgaXRlbS5maW5kKFwiaW1nXCIpLmF0dHIoJ3NyYycsIGNvbXBvbmVudERhdGFbaV1ba2V5XSk7XG4gICAgICAgICAgICAgICAgZWxzZVxuICAgICAgICAgICAgICAgICAgICBpdGVtLmZpbmQoXCIuXCIgKyBrZXkpLnRleHQoY29tcG9uZW50RGF0YVtpXVtrZXldKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGl0ZW0ucmVtb3ZlQ2xhc3MoJ2hpZGRlbiBjbG9uZWFibGUnKTtcbiAgICAgICAgICAgIGl0ZW0uYWRkQ2xhc3MoJ2l0ZW0nKTtcbiAgICAgICAgICAgIGlubmVyQ29udGVudC5wcmVwZW5kKGl0ZW0pO1xuICAgICAgICB9XG4gICAgICAgIGlmKGNvbXBvbmVudE5hbWUgPT0gXCJCbG9ja3F1b3RlXCIpe1xuICAgICAgICAgICAgc2VsZi5IZWxwZXIuaW5pdFN0YXJGaXZlKHRhcmdldCk7XG4gICAgICAgICAgICB0YXJnZXQuZmluZChcIi5wYW5lbC1ib2R5XCIpLm9uKFwiaW5wdXRcIiwgJy5uYW1lJywgZnVuY3Rpb24oZSl7XG4gICAgICAgICAgICAgICAgJChlLmRlbGVnYXRlVGFyZ2V0KS5wYXJlbnQoKS5wcmV2KCkuZmluZChcIi5uYW1lXCIpLnRleHQoJCh0aGlzKS50ZXh0KCkpO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgIH1cblxuXG4gICAgfTtcbiAgICBzZWxmLnNhdmVDb21wb25lbnRzID0gZnVuY3Rpb24oKXtcbiAgICAgICAgdmFyIGNvbXBvbmVudHMgPSBPYmplY3Qua2V5cyhzZWxmLkdsb2JhbC5mb3JTYXZlKTtcbiAgICAgICAgdmFyIG5ld0l0ZW1zID0gZmFsc2U7XG4gICAgICAgIGZvcih2YXIgaSA9IGNvbXBvbmVudHMubGVuZ3RoOyBpLS07KXtcbiAgICAgICAgICAgIHZhciBpdGVtID0gJChcIiNcIiArIGNvbXBvbmVudHNbaV0gKyBcIiBbY2hhbmdlZD0ndHJ1ZSddXCIpO1xuICAgICAgICAgICAgdmFyIHJlcXVlc3REYXRhID0gc2VsZi5HbG9iYWwuZm9yU2F2ZVtjb21wb25lbnRzW2ldXS5yZXF1ZXN0RGF0YTtcbiAgICAgICAgICAgIHZhciBjb21wb25lbnREYXRhID0gc2VsZi5HbG9iYWwuZm9yU2F2ZVtjb21wb25lbnRzW2ldXS5jb21wb25lbnREYXRhO1xuICAgICAgICAgICAgaXRlbS5lYWNoKGZ1bmN0aW9uKGksIG9iail7XG4gICAgICAgICAgICAgICAgdmFyIGRhdGEgPSB7fTtcbiAgICAgICAgICAgICAgICBmb3IodmFyIGogPSByZXF1ZXN0RGF0YS5sZW5ndGg7IGotLTspe1xuICAgICAgICAgICAgICAgICAgICB2YXIga2V5ID0gcmVxdWVzdERhdGFbal07XG4gICAgICAgICAgICAgICAgICAgIGlmKGtleSA9PSAnaWQnIHx8IGtleSA9PSAnb3JkZXInIHx8IGtleSA9PSAnc3RhcnMnKVxuICAgICAgICAgICAgICAgICAgICAgICAgZGF0YVtrZXldID0gcGFyc2VJbnQoJChvYmopLmF0dHIoJ2RhdGEtJytrZXkpKTtcbiAgICAgICAgICAgICAgICAgICAgZWxzZSBpZihrZXkgPT0gJ2ltYWdlJylcbiAgICAgICAgICAgICAgICAgICAgICAgIGRhdGFba2V5XSA9ICQob2JqKS5maW5kKFwiaW1nXCIpLmF0dHIoJ3NyYycpO1xuICAgICAgICAgICAgICAgICAgICBlbHNlXG4gICAgICAgICAgICAgICAgICAgICAgICBkYXRhW2tleV0gPSAkKG9iaikuZmluZChcIi5cIiArIGtleSkudGV4dCgpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBjb21wb25lbnREYXRhLnB1c2goZGF0YSk7XG4gICAgICAgICAgICAgICAgbmV3SXRlbXMgPSBjb21wb25lbnREYXRhLmxlbmd0aCA+IDAgPyB0cnVlIDogZmFsc2U7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfVxuICAgICAgICBzZWxmLkdsb2JhbC5yZXF1ZXN0T3B0aW9ucy5zdWNjZXNzID0gZnVuY3Rpb24ocmVzcG9uc2Upe1xuICAgICAgICAgICAgJC5ub3RpZnkoJ1N1Y2Nlc3NmdWxseSBzYXZlZCcsIFwic3VjY2Vzc1wiKTtcbiAgICAgICAgICAgIGZvcih2YXIgaSA9IGNvbXBvbmVudHMubGVuZ3RoOyBpLS07KXtcbiAgICAgICAgICAgICAgICBzZWxmLkdsb2JhbC5mb3JTYXZlW2NvbXBvbmVudHNbaV1dLmNvbXBvbmVudERhdGEgPSBbXTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgJChcIltjaGFuZ2VkPXRydWVdXCIpLmF0dHIoXCJjaGFuZ2VkXCIsICdmYWxzZScpO1xuXG4gICAgICAgICAgICB2YXIgY29tcG9uZW50TmFtZXMgPSBPYmplY3Qua2V5cyhyZXNwb25zZSk7XG4gICAgICAgICAgICBmb3IodmFyIGkgPSBjb21wb25lbnROYW1lcy5sZW5ndGg7IGktLTspe1xuICAgICAgICAgICAgICAgIHZhciBjb21wb25lbnQgPSBjb21wb25lbnROYW1lc1tpXTtcbiAgICAgICAgICAgICAgICBmb3IodmFyIGMgPSByZXNwb25zZVtjb21wb25lbnRdLmxlbmd0aDsgYy0tOyl7XG4gICAgICAgICAgICAgICAgICAgICQoXCIjXCIgKyBjb21wb25lbnQgKyBcIiBbZGF0YS1pZD0nXCIrIHJlc3BvbnNlW2NvbXBvbmVudF1bY11bJ3JlcXVlc3RfaWQnXSArXCInXVwiKVxuICAgICAgICAgICAgICAgICAgICAgICAgLmF0dHIoXCJkYXRhLWlkXCIsIHJlc3BvbnNlW2NvbXBvbmVudF1bY11bJ3Jlc3BvbnNlX2lkJ10pO1xuXG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9O1xuICAgICAgICBzZWxmLkdsb2JhbC5yZXF1ZXN0T3B0aW9ucy5lcnJvciA9IGZ1bmN0aW9uKHJlc3BvbnNlKXtcbiAgICAgICAgICAgIGZvcih2YXIgaSA9IGNvbXBvbmVudHMubGVuZ3RoOyBpLS07KXtcbiAgICAgICAgICAgICAgICBzZWxmLkdsb2JhbC5mb3JTYXZlW2NvbXBvbmVudHNbaV1dLmNvbXBvbmVudERhdGEgPSBbXTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgdmFyIHcgPSB3aW5kb3cub3BlbignJywgJzpFcnJvciBNZXNzYWdlJywgJ21lbnViYXI9bm8sIGxvY2F0aW9uPW5vJyk7XG4gICAgICAgICAgICB3LmRvY3VtZW50LndyaXRlKHJlc3BvbnNlLnJlc3BvbnNlVGV4dCk7XG4gICAgICAgIH07XG4gICAgICAgIHNlbGYuR2xvYmFsLnJlcXVlc3RPcHRpb25zLmRhdGEgPSB7XG4gICAgICAgICAgICBmb3JEZWxldGU6IHNlbGYuR2xvYmFsLmZvckRlbGV0ZSxcbiAgICAgICAgICAgIGZvclNhdmU6IHNlbGYuR2xvYmFsLmZvclNhdmVcbiAgICAgICAgfTtcbiAgICAgICAgc2VsZi5HbG9iYWwucmVxdWVzdE9wdGlvbnMudHlwZSA9IFwiUE9TVFwiO1xuICAgICAgICBpZihuZXdJdGVtcylcbiAgICAgICAgICAgICQuYWpheChzZWxmLkhlbHBlci5nZXRVUkwoKS51cGRhdGUsIHNlbGYuR2xvYmFsLnJlcXVlc3RPcHRpb25zKVxuICAgICAgICBlbHNle1xuICAgICAgICAgICAgJC5ub3RpZnkoJ05vdGhpbmcgY2hhbmdlZCcsIFwiaW5mb1wiKTtcbiAgICAgICAgfVxuICAgICAgICAkLmFqYXgoJChcIiNjb21wb25lbnRzQ29udHJvbFwiKS5hdHRyKCdkYXRhLXVybCcpLCB7XG4gICAgICAgICAgICB0eXBlOiBcIlBPU1RcIixcbiAgICAgICAgICAgIGhlYWRlcnM6IHtcbiAgICAgICAgICAgICAgICAnWC1DU1JGLVRPS0VOJzogJCgnbWV0YVtuYW1lPVwiY3NyZi10b2tlblwiXScpLmF0dHIoJ2NvbnRlbnQnKVxuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIGRhdGE6IChmdW5jdGlvbigpe1xuICAgICAgICAgICAgICAgIHZhciBkYXRhID0gW107XG4gICAgICAgICAgICAgICAgJChcIi5pc0FjdGl2ZVwiKS5lYWNoKGZ1bmN0aW9uKGksIG9iail7XG4gICAgICAgICAgICAgICAgICAgIGRhdGEucHVzaCh7XG4gICAgICAgICAgICAgICAgICAgICAgICBpZDogJChvYmopLmF0dHIoXCJkYXRhLWlkXCIpLFxuICAgICAgICAgICAgICAgICAgICAgICAgYWN0aXZlOiAkKG9iaikucHJvcCgnY2hlY2tlZCcpXG4gICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgIHJldHVybiB7ZGF0YTogZGF0YX07XG4gICAgICAgICAgICB9KSgpLFxuICAgICAgICB9KTtcbiAgICB9XG5cbn07Il0sImZpbGUiOiJkYXNoYm9hcmQvY29tcG9uZW50cy5qcyIsInNvdXJjZVJvb3QiOiIvc291cmNlLyJ9
