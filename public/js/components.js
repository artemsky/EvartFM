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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiIiwic291cmNlcyI6WyJjb21wb25lbnRzLmpzIl0sInNvdXJjZXNDb250ZW50IjpbInZhciBBUFBMSUNBVElPTiA9IEFQUExJQ0FUSU9OIHx8IHt9O1xyXG5BUFBMSUNBVElPTi5Db21wb25lbnRzID0gbmV3IGZ1bmN0aW9uKCl7XHJcbiAgICBcInVzZSBzdHJpY3RcIjtcclxuICAgIHZhciBzZWxmID0gdGhpcztcclxuICAgIHNlbGYuR2xvYmFsID0gbmV3IGZ1bmN0aW9uKCl7XHJcbiAgICAgICAgXCJ1c2Ugc3RyaWN0XCI7XHJcbiAgICAgICAgdmFyICR0aGlzID0gdGhpcztcclxuICAgICAgICAkdGhpcy5mb3JEZWxldGUgPSB7fTtcclxuICAgICAgICAkdGhpcy5mb3JTYXZlID0ge307XHJcbiAgICAgICAgJHRoaXMuUm9vdFVSTCA9IFwiY29udGVudC9jb21wb25lbnQvXCI7XHJcbiAgICAgICAgJHRoaXMucmVxdWVzdE9wdGlvbnMgPSB7XHJcbiAgICAgICAgICAgIGhlYWRlcnM6IHtcclxuICAgICAgICAgICAgICAgICd0eXBlJzogXCJQT1NUXCIsXHJcbiAgICAgICAgICAgICAgICAnWC1DU1JGLVRPS0VOJzogJCgnbWV0YVtuYW1lPVwiY3NyZi10b2tlblwiXScpLmF0dHIoJ2NvbnRlbnQnKVxyXG4gICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICBlcnJvcjogZnVuY3Rpb24ocmVzcG9uc2Upe1xyXG4gICAgICAgICAgICAgICAgdmFyIHcgPSB3aW5kb3cub3BlbignJywgJzpFcnJvciBNZXNzYWdlJywgJ21lbnViYXI9bm8sIGxvY2F0aW9uPW5vJyk7XHJcbiAgICAgICAgICAgICAgICB3LmRvY3VtZW50LndyaXRlKHJlc3BvbnNlLnJlc3BvbnNlVGV4dCk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9O1xyXG4gICAgfTtcclxuICAgIHNlbGYuSGVscGVyID0gbmV3IGZ1bmN0aW9uKCl7XHJcbiAgICAgICAgXCJ1c2Ugc3RyaWN0XCI7XHJcbiAgICAgICAgdmFyICR0aGlzID0gdGhpcztcclxuICAgICAgICAkdGhpcy5pbml0U29ydGFibGUgPSBmdW5jdGlvbih0YXJnZXQsIGhhbmRsZSl7XHJcbiAgICAgICAgICAgIHZhciByZW1vdmVJbnRlbnQgPSBmYWxzZTtcclxuICAgICAgICAgICAgdGFyZ2V0LnNvcnRhYmxlKHtcclxuICAgICAgICAgICAgICAgIGl0ZW1zOiBcIi5pdGVtXCIsXHJcbiAgICAgICAgICAgICAgICBoYW5kbGU6IGhhbmRsZSxcclxuICAgICAgICAgICAgICAgIG9wYWNpdHk6IDAuOCxcclxuICAgICAgICAgICAgICAgIHN0b3A6IGZ1bmN0aW9uKCBldmVudCApIHtcclxuICAgICAgICAgICAgICAgICAgICAkKGV2ZW50LnRhcmdldCkuZmluZChcIi5pdGVtXCIpLmVhY2goZnVuY3Rpb24oaSwgb2JqKXtcclxuICAgICAgICAgICAgICAgICAgICAgICAgJChvYmopLmF0dHIoXCJkYXRhLW9yZGVyXCIsIGkrMSkuYXR0cignY2hhbmdlZCcsICd0cnVlJyk7XHJcbiAgICAgICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgICAgICB9LFxyXG5cclxuICAgICAgICAgICAgICAgIG92ZXI6IGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgICAgICAgICByZW1vdmVJbnRlbnQgPSBmYWxzZTtcclxuICAgICAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgICAgICBvdXQ6IGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgICAgICAgICByZW1vdmVJbnRlbnQgPSB0cnVlO1xyXG4gICAgICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgICAgIGJlZm9yZVN0b3A6IGZ1bmN0aW9uIChldmVudCwgdWkpIHtcclxuICAgICAgICAgICAgICAgICAgICBpZihyZW1vdmVJbnRlbnQgPT0gdHJ1ZSl7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHVpLml0ZW0ucmVtb3ZlKCk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHZhciBpZCA9IHVpLml0ZW0uYXR0cihcImRhdGEtaWRcIik7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHNlbGYuR2xvYmFsLmZvckRlbGV0ZVt0YXJnZXQuc2VsZWN0b3Iuc3Vic3RyaW5nKDExKV0ucHVzaCh1aS5pdGVtLmF0dHIoXCJkYXRhLWlkXCIpKTtcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgIH07XHJcbiAgICAgICAgJHRoaXMuaW5pdEltYWdlUHJldmlldyA9IGZ1bmN0aW9uKCl7XHJcbiAgICAgICAgICAgIHZhciByZWFkVVJMID0gIGZ1bmN0aW9uIChpbnB1dCkge1xyXG4gICAgICAgICAgICAgICAgaWYgKGlucHV0LmZpbGVzICYmIGlucHV0LmZpbGVzWzBdKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgdmFyIHJlYWRlciA9IG5ldyBGaWxlUmVhZGVyKCk7XHJcbiAgICAgICAgICAgICAgICAgICAgcmVhZGVyLm9ubG9hZCA9IGZ1bmN0aW9uIChlKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICQoJyNtb2RhbF9wcmV2aWV3JykuYXR0cignc3JjJywgZS50YXJnZXQucmVzdWx0KTtcclxuICAgICAgICAgICAgICAgICAgICB9O1xyXG4gICAgICAgICAgICAgICAgICAgIHJlYWRlci5yZWFkQXNEYXRhVVJMKGlucHV0LmZpbGVzWzBdKTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfTtcclxuXHJcbiAgICAgICAgICAgICQoJyNtb2RhbF9pbWFnZScpLmNoYW5nZShmdW5jdGlvbigpe1xyXG4gICAgICAgICAgICAgICAgcmVhZFVSTCh0aGlzKTtcclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgfTtcclxuICAgICAgICAkdGhpcy5nZXRVUkwgPSBmdW5jdGlvbigpe1xyXG4gICAgICAgICAgICByZXR1cm4ge1xyXG4gICAgICAgICAgICAgICAgZ2V0Q29tcG9uZW50c0RhdGE6IHNlbGYuR2xvYmFsLlJvb3RVUkwgKyBcImdldC9hbGxcIixcclxuICAgICAgICAgICAgICAgIHVwZGF0ZTogc2VsZi5HbG9iYWwuUm9vdFVSTCArIFwidXBkYXRlL2FsbFwiLFxyXG4gICAgICAgICAgICAgICAgZGVsZXRlOiBzZWxmLkdsb2JhbC5Sb290VVJMICsgXCJkZWxldGUvYWxsXCJcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH07XHJcbiAgICAgICAgJHRoaXMubW9kYWwgPSBuZXcgZnVuY3Rpb24oKXtcclxuICAgICAgICAgICAgdmFyIHRoYXQgPSB0aGlzO1xyXG4gICAgICAgICAgICB2YXIgdGFyZ2V0ID0gJChcIiNtb2RhbFwiKTtcclxuICAgICAgICAgICAgdmFyIGl0ZW0gPSBudWxsO1xyXG4gICAgICAgICAgICB2YXIgaXNOZXdJdGVtID0gZmFsc2U7XHJcbiAgICAgICAgICAgIHRoaXMub3BlbiA9IGZ1bmN0aW9uKG9wdGlvbnMpe1xyXG4gICAgICAgICAgICAgICAgaXRlbSA9IG9wdGlvbnM7XHJcbiAgICAgICAgICAgICAgICBmb3IodmFyIGkgPSBvcHRpb25zLnByb3BlcnRpZXMubGVuZ3RoOyBpLS07KXtcclxuICAgICAgICAgICAgICAgICAgICBpZihvcHRpb25zLnByb3BlcnRpZXNbaV0gPT0gXCJvcmRlclwiKXtcclxuICAgICAgICAgICAgICAgICAgICAgICAgJChcIiNtb2RhbF9cIiArIG9wdGlvbnMucHJvcGVydGllc1tpXSlcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIC50ZXh0KG9wdGlvbnMuaXRlbS5hdHRyKCdkYXRhLW9yZGVyJykpXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAucGFyZW50KClcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIC5yZW1vdmVDbGFzcygnaGlkZGVuJyk7XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgIGlmKG9wdGlvbnMucHJvcGVydGllc1tpXSA9PSBcImltYWdlXCIpe1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAkKFwiI21vZGFsX3ByZXZpZXdcIilcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIC5hdHRyKCdzcmMnLCBvcHRpb25zLml0ZW0uZmluZChcImltZ1wiKS5hdHRyKCdzcmMnKSlcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIC5wYXJlbnQoKVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgLnJlbW92ZUNsYXNzKCdoaWRkZW4nKTtcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgZWxzZSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICQoXCIjbW9kYWxfXCIgKyBvcHRpb25zLnByb3BlcnRpZXNbaV0pXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAudmFsKG9wdGlvbnMuaXRlbS5maW5kKFwiLlwiICsgb3B0aW9ucy5wcm9wZXJ0aWVzW2ldKS50ZXh0KCkpXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAucGFyZW50KClcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIC5yZW1vdmVDbGFzcygnaGlkZGVuJyk7XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgdGFyZ2V0Lm1vZGFsKCk7XHJcbiAgICAgICAgICAgIH07XHJcbiAgICAgICAgICAgIHRoaXMuc2F2ZSA9IGZ1bmN0aW9uKG9wdGlvbnMpe1xyXG4gICAgICAgICAgICAgICAgb3B0aW9ucy5pdGVtLmF0dHIoJ2NoYW5nZWQnLCAndHJ1ZScpO1xyXG4gICAgICAgICAgICAgICAgZm9yKHZhciBpID0gb3B0aW9ucy5wcm9wZXJ0aWVzLmxlbmd0aDsgaS0tOyl7XHJcbiAgICAgICAgICAgICAgICAgICAgaWYob3B0aW9ucy5wcm9wZXJ0aWVzW2ldID09IFwib3JkZXJcIilcclxuICAgICAgICAgICAgICAgICAgICAgICAgY29udGludWU7XHJcbiAgICAgICAgICAgICAgICAgICAgaWYob3B0aW9ucy5wcm9wZXJ0aWVzW2ldID09IFwiaW1hZ2VcIil7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIG9wdGlvbnMuaXRlbS5maW5kKFwiaW1nXCIpXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAuYXR0cignc3JjJywgJChcIiNtb2RhbF9wcmV2aWV3XCIpLmF0dHIoJ3NyYycpKVxyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICBlbHNlIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgb3B0aW9ucy5pdGVtLmZpbmQoXCIuXCIgKyBvcHRpb25zLnByb3BlcnRpZXNbaV0pXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAudGV4dCgkKFwiI21vZGFsX1wiICsgb3B0aW9ucy5wcm9wZXJ0aWVzW2ldKS52YWwoKSk7XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgaWYoaXNOZXdJdGVtKXtcclxuICAgICAgICAgICAgICAgICAgICBvcHRpb25zLnRhcmdldC5hcHBlbmQoXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIG9wdGlvbnMuaXRlbVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgLnJlbW92ZUNsYXNzKCdoaWRkZW4gY2xvbmVhYmxlJylcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIC5hZGRDbGFzcygnaXRlbScpXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAuYXR0cignZGF0YS1pZCcsIERhdGUubm93KCkpXHJcbiAgICAgICAgICAgICAgICAgICAgKTtcclxuICAgICAgICAgICAgICAgICAgICBvcHRpb25zLnRhcmdldC5wYXJlbnQoKVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAuc29ydGFibGUoJ29wdGlvbicsICdzdG9wJykoe1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdGFyZ2V0OiBvcHRpb25zLnRhcmdldC5nZXQoMClcclxuICAgICAgICAgICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICB9O1xyXG4gICAgICAgICAgICB0aGlzLmluaXQgPSBmdW5jdGlvbihvcHRpb25zKXtcclxuICAgICAgICAgICAgICAgIG9wdGlvbnMudGFyZ2V0Lm9uKCdjbGljaycsICcuaXRlbScsIGZ1bmN0aW9uKCl7XHJcbiAgICAgICAgICAgICAgICAgICAgdGhhdC5vcGVuKHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgaXRlbTogJCh0aGlzKSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgcHJvcGVydGllczogb3B0aW9ucy5wcm9wZXJ0aWVzXHJcbiAgICAgICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgfTtcclxuICAgICAgICAgICAgdGhpcy5pbml0TmV3SXRlbSA9IGZ1bmN0aW9uKG9wdGlvbnMpe1xyXG4gICAgICAgICAgICAgICAgb3B0aW9ucy50YXJnZXQub24oJ2NsaWNrJywgJy5uZXctaXRlbScsIGZ1bmN0aW9uKCl7XHJcbiAgICAgICAgICAgICAgICAgICAgaXNOZXdJdGVtID0gdHJ1ZTtcclxuICAgICAgICAgICAgICAgICAgICB0aGF0Lm9wZW4oe1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB0YXJnZXQ6IG9wdGlvbnMudGFyZ2V0LmZpbmQoXCIuaW5uZXJDb250ZW50XCIpLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBpdGVtOiBvcHRpb25zLml0ZW0uY2xvbmUoKSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgcHJvcGVydGllczogb3B0aW9ucy5wcm9wZXJ0aWVzXHJcbiAgICAgICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgfTtcclxuXHJcbiAgICAgICAgICAgIC8vRXZlbnRzXHJcbiAgICAgICAgICAgICR0aGlzLmluaXRJbWFnZVByZXZpZXcoKTtcclxuXHJcbiAgICAgICAgICAgIHRhcmdldC5maW5kKCcuc2F2ZS1pdGVtJykub24oJ2NsaWNrJywgZnVuY3Rpb24oKXtcclxuICAgICAgICAgICAgICAgIHRhcmdldC5tb2RhbCgnaGlkZScpO1xyXG4gICAgICAgICAgICAgICAgdGhhdC5zYXZlKGl0ZW0pO1xyXG4gICAgICAgICAgICAgICAgaXRlbSA9IG51bGw7XHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICB0YXJnZXQuZmluZCgnLmRlbGV0ZS1pdGVtJykub24oJ2NsaWNrJywgZnVuY3Rpb24oKXtcclxuICAgICAgICAgICAgICAgIGl0ZW0uaXRlbS5yZW1vdmUoKTtcclxuICAgICAgICAgICAgICAgIGl0ZW0gPSBudWxsO1xyXG4gICAgICAgICAgICAgICAgdGFyZ2V0Lm1vZGFsKCdoaWRlJyk7XHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICB0YXJnZXQub24oXCJoaWRkZW4uYnMubW9kYWxcIiwgZnVuY3Rpb24oKXtcclxuICAgICAgICAgICAgICAgIHRhcmdldC5maW5kKFwiZm9ybVwiKS5nZXQoMCkucmVzZXQoKTtcclxuICAgICAgICAgICAgICAgIHRhcmdldC5maW5kKFwiaW1nXCIpLmF0dHIoXCJzcmNcIiwgXCJcIik7XHJcbiAgICAgICAgICAgICAgICB0YXJnZXQuZmluZChcIi5mb3JtLWdyb3VwXCIpLmFkZENsYXNzKCdoaWRkZW4nKTtcclxuICAgICAgICAgICAgICAgIGlzTmV3SXRlbSA9IGZhbHNlO1xyXG4gICAgICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgICAgICQoXCIjbW9kYWxfZGF0ZVwiKS5kYXRldGltZXBpY2tlcih7XHJcbiAgICAgICAgICAgICAgICBmb3JtYXQ6ICdZLW0tZCcsXHJcbiAgICAgICAgICAgICAgICB0aW1lcGlja2VyOiBmYWxzZVxyXG4gICAgICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgfTtcclxuICAgICAgICAkdGhpcy5pbml0U3RhckZpdmUgPSBmdW5jdGlvbih0YXJnZXQpe1xyXG4gICAgICAgICAgICB2YXIgc3RhckNsb25lID0gbnVsbDtcclxuICAgICAgICAgICAgdmFyIHN0YXJUYXJnZXQgPSB0YXJnZXQuZmluZChcIi5zdGFyc1wiKTtcclxuICAgICAgICAgICAgc3RhclRhcmdldC5lYWNoKGZ1bmN0aW9uKGksIG9iail7XHJcbiAgICAgICAgICAgICAgICB2YXIgY291bnQgPSAocGFyc2VJbnQoJChvYmopLnBhcmVudCgpLmF0dHIoJ2RhdGEtc3RhcnMnKSkgfHwgMSk7XHJcbiAgICAgICAgICAgICAgICBmb3IodmFyIGkgPSAwOyBpIDwgNTsgaSsrKXtcclxuICAgICAgICAgICAgICAgICAgICBpZihpIDwgY291bnQpe1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAkKG9iaikuYXBwZW5kKCc8c3BhbiBjbGFzcz1cImdseXBoaWNvbiBnbHlwaGljb24tc3RhciBhY3RpdmVcIj48L3NwYW4+Jyk7XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgIGVsc2V7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICQob2JqKS5hcHBlbmQoJzxzcGFuIGNsYXNzPVwiZ2x5cGhpY29uIGdseXBoaWNvbi1zdGFyXCI+PC9zcGFuPicpO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgIHN0YXJUYXJnZXQub24oJ21vdXNlZW50ZXInLCBmdW5jdGlvbigpe1xyXG4gICAgICAgICAgICAgICAgc3RhckNsb25lID0gJCh0aGlzKS5jbG9uZSgpO1xyXG4gICAgICAgICAgICAgICAgJCh0aGlzKS5vbihcIm1vdXNlb3ZlclwiLCBmdW5jdGlvbihlKXtcclxuICAgICAgICAgICAgICAgICAgICBpZihlLnRhcmdldCA9PSB0aGlzKSByZXR1cm4gZmFsc2U7XHJcbiAgICAgICAgICAgICAgICAgICAgJChlLnRhcmdldCkucHJldkFsbCgpLmFkZENsYXNzKCdhY3RpdmUnKTtcclxuICAgICAgICAgICAgICAgICAgICAkKGUudGFyZ2V0KS5hZGRDbGFzcygnYWN0aXZlJyk7XHJcbiAgICAgICAgICAgICAgICAgICAgJChlLnRhcmdldCkubmV4dEFsbCgpLnJlbW92ZUNsYXNzKCdhY3RpdmUnKTtcclxuICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICB9KS5vbignbW91c2VsZWF2ZScsIGZ1bmN0aW9uKCl7XHJcbiAgICAgICAgICAgICAgICAkKHRoaXMpLm9mZihcIm1vdXNlb3ZlclwiKTtcclxuICAgICAgICAgICAgICAgICQodGhpcykuaHRtbChzdGFyQ2xvbmUuaHRtbCgpKTtcclxuICAgICAgICAgICAgfSkub24oJ2NsaWNrJywgZnVuY3Rpb24oZSl7XHJcbiAgICAgICAgICAgICAgICBlLnN0b3BQcm9wYWdhdGlvbigpO1xyXG4gICAgICAgICAgICAgICAgaWYoZS50YXJnZXQgPT0gdGhpcykgcmV0dXJuO1xyXG4gICAgICAgICAgICAgICAgc3RhckNsb25lID0gJCh0aGlzKS5jbG9uZSgpO1xyXG4gICAgICAgICAgICAgICAgJCh0aGlzKS5wYXJlbnQoKVxyXG4gICAgICAgICAgICAgICAgICAgIC5hdHRyKCdkYXRhLXN0YXJzJywgJCh0aGlzKS5maW5kKCcuYWN0aXZlJykubGVuZ3RoKVxyXG4gICAgICAgICAgICAgICAgICAgIC5hdHRyKFwiY2hhbmdlZFwiLCAndHJ1ZScpO1xyXG5cclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgfVxyXG4gICAgfTtcclxuICAgIHNlbGYubG9hZENvbXBvbmVudHMgPSBuZXcgZnVuY3Rpb24oKXtcclxuICAgICAgICBzZWxmLkdsb2JhbC5yZXF1ZXN0T3B0aW9ucy5zdWNjZXNzID0gZnVuY3Rpb24ocmVzcG9uc2Upe1xyXG4gICAgICAgICAgICB2YXIgY29tcG9uZW50TmFtZXMgPSBPYmplY3Qua2V5cyhyZXNwb25zZSk7XHJcbiAgICAgICAgICAgIGZvcih2YXIgaSA9IGNvbXBvbmVudE5hbWVzLmxlbmd0aDsgaS0tOyl7XHJcbiAgICAgICAgICAgICAgICBzZWxmLmluaXRDb21wb25lbnQoY29tcG9uZW50TmFtZXNbaV0sIHJlc3BvbnNlW2NvbXBvbmVudE5hbWVzW2ldXS5kYXRhLCByZXNwb25zZVtjb21wb25lbnROYW1lc1tpXV0uc2NoZW1hKTtcclxuXHJcbiAgICAgICAgICAgICAgICBzZWxmLkdsb2JhbC5mb3JEZWxldGVbY29tcG9uZW50TmFtZXNbaV1dID0gW107XHJcbiAgICAgICAgICAgICAgICBzZWxmLkdsb2JhbC5mb3JTYXZlW2NvbXBvbmVudE5hbWVzW2ldXSA9IHt9O1xyXG4gICAgICAgICAgICAgICAgc2VsZi5HbG9iYWwuZm9yU2F2ZVtjb21wb25lbnROYW1lc1tpXV1bJ2NvbXBvbmVudERhdGEnXSA9IFtdO1xyXG4gICAgICAgICAgICAgICAgc2VsZi5HbG9iYWwuZm9yU2F2ZVtjb21wb25lbnROYW1lc1tpXV1bJ3JlcXVlc3REYXRhJ10gPSByZXNwb25zZVtjb21wb25lbnROYW1lc1tpXV0uc2NoZW1hO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfTtcclxuICAgICAgICBzZWxmLkdsb2JhbC5yZXF1ZXN0T3B0aW9ucy50eXBlID0gXCJHRVRcIjtcclxuICAgICAgICAkLmFqYXgoc2VsZi5IZWxwZXIuZ2V0VVJMKCkuZ2V0Q29tcG9uZW50c0RhdGEsIHNlbGYuR2xvYmFsLnJlcXVlc3RPcHRpb25zKTtcclxuXHJcbiAgICAgICAgd2luZG93Lm9ubG9hZCA9IGZ1bmN0aW9uKCl7XHJcbiAgICAgICAgICAgICQoXCIjc2F2ZS1jaGFuZ2VzXCIpLm9uKFwiY2xpY2tcIiwgc2VsZi5zYXZlQ29tcG9uZW50cyk7XHJcbiAgICAgICAgfVxyXG4gICAgfTtcclxuICAgIHNlbGYuaW5pdENvbXBvbmVudCA9IGZ1bmN0aW9uKGNvbXBvbmVudE5hbWUsIGNvbXBvbmVudERhdGEsIGNvbXBvbmVudFNjaGVtYSl7XHJcbiAgICAgICAgXCJ1c2Ugc3RyaWN0XCI7XHJcbiAgICAgICAgdmFyIHRhcmdldCA9ICQoJy5jb21wb25lbnRfJyArIGNvbXBvbmVudE5hbWUpO1xyXG4gICAgICAgIHZhciBjbG9uZWFibGUgPSB0YXJnZXQuZmluZChcIi5jbG9uZWFibGVcIik7XHJcbiAgICAgICAgdmFyIGlubmVyQ29udGVudCA9IHRhcmdldC5maW5kKCcuaW5uZXJDb250ZW50Jyk7XHJcbiAgICAgICAgdmFyIHNvcnRhYmxlSGFuZGxlID0gdGFyZ2V0LmZpbmQoXCIuc29ydGFibGVIYW5kbGVcIik7XHJcblxyXG4gICAgICAgIHNlbGYuSGVscGVyLmluaXRTb3J0YWJsZSh0YXJnZXQsIHNvcnRhYmxlSGFuZGxlLmxlbmd0aCA+IDAgPyBcIi5zb3J0YWJsZUhhbmRsZVwiIDogZmFsc2UpO1xyXG4gICAgICAgIGlmKHRhcmdldC5nZXQoMCkuaGFzQXR0cmlidXRlKCdkYXRhLW1vZGFsJykpe1xyXG4gICAgICAgICAgICBzZWxmLkhlbHBlci5tb2RhbC5pbml0KHtcclxuICAgICAgICAgICAgICAgIHRhcmdldDogaW5uZXJDb250ZW50LFxyXG4gICAgICAgICAgICAgICAgcHJvcGVydGllczogY29tcG9uZW50U2NoZW1hXHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICBzZWxmLkhlbHBlci5tb2RhbC5pbml0TmV3SXRlbSh7XHJcbiAgICAgICAgICAgICAgICB0YXJnZXQ6IHRhcmdldCxcclxuICAgICAgICAgICAgICAgIHByb3BlcnRpZXM6IGNvbXBvbmVudFNjaGVtYSxcclxuICAgICAgICAgICAgICAgIGl0ZW06IGNsb25lYWJsZVxyXG4gICAgICAgICAgICB9KVxyXG4gICAgICAgIH1cclxuICAgICAgICBmb3IodmFyIGkgPSBjb21wb25lbnREYXRhLmxlbmd0aDsgaS0tOyl7XHJcbiAgICAgICAgICAgIHZhciBpdGVtID0gY2xvbmVhYmxlLmNsb25lKCk7XHJcbiAgICAgICAgICAgIHZhciBrZXlzID0gT2JqZWN0LmtleXMoY29tcG9uZW50RGF0YVtpXSk7XHJcbiAgICAgICAgICAgIGZvcih2YXIgayA9IGtleXMubGVuZ3RoOyBrLS07KXtcclxuICAgICAgICAgICAgICAgIHZhciBrZXkgPSBrZXlzW2tdO1xyXG4gICAgICAgICAgICAgICAgaWYoa2V5ID09ICdpZCcgfHwga2V5ID09ICdvcmRlcicgfHwga2V5ID09ICdzdGFycycpXHJcbiAgICAgICAgICAgICAgICAgICAgaXRlbS5hdHRyKCdkYXRhLScra2V5LCBjb21wb25lbnREYXRhW2ldW2tleV0pO1xyXG4gICAgICAgICAgICAgICAgZWxzZSBpZihrZXkgPT0gJ2ltYWdlJylcclxuICAgICAgICAgICAgICAgICAgICBpdGVtLmZpbmQoXCJpbWdcIikuYXR0cignc3JjJywgY29tcG9uZW50RGF0YVtpXVtrZXldKTtcclxuICAgICAgICAgICAgICAgIGVsc2VcclxuICAgICAgICAgICAgICAgICAgICBpdGVtLmZpbmQoXCIuXCIgKyBrZXkpLnRleHQoY29tcG9uZW50RGF0YVtpXVtrZXldKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBpdGVtLnJlbW92ZUNsYXNzKCdoaWRkZW4gY2xvbmVhYmxlJyk7XHJcbiAgICAgICAgICAgIGl0ZW0uYWRkQ2xhc3MoJ2l0ZW0nKTtcclxuICAgICAgICAgICAgaW5uZXJDb250ZW50LnByZXBlbmQoaXRlbSk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGlmKGNvbXBvbmVudE5hbWUgPT0gXCJCbG9ja3F1b3RlXCIpe1xyXG4gICAgICAgICAgICBzZWxmLkhlbHBlci5pbml0U3RhckZpdmUodGFyZ2V0KTtcclxuICAgICAgICAgICAgdGFyZ2V0LmZpbmQoXCIucGFuZWwtYm9keVwiKS5vbihcImlucHV0XCIsICcubmFtZScsIGZ1bmN0aW9uKGUpe1xyXG4gICAgICAgICAgICAgICAgJChlLmRlbGVnYXRlVGFyZ2V0KS5wYXJlbnQoKS5wcmV2KCkuZmluZChcIi5uYW1lXCIpLnRleHQoJCh0aGlzKS50ZXh0KCkpO1xyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICB9XHJcblxyXG5cclxuICAgIH07XHJcbiAgICBzZWxmLnNhdmVDb21wb25lbnRzID0gZnVuY3Rpb24oKXtcclxuICAgICAgICB2YXIgY29tcG9uZW50cyA9IE9iamVjdC5rZXlzKHNlbGYuR2xvYmFsLmZvclNhdmUpO1xyXG4gICAgICAgIHZhciBuZXdJdGVtcyA9IGZhbHNlO1xyXG4gICAgICAgIGZvcih2YXIgaSA9IGNvbXBvbmVudHMubGVuZ3RoOyBpLS07KXtcclxuICAgICAgICAgICAgdmFyIGl0ZW0gPSAkKFwiI1wiICsgY29tcG9uZW50c1tpXSArIFwiIFtjaGFuZ2VkPSd0cnVlJ11cIik7XHJcbiAgICAgICAgICAgIHZhciByZXF1ZXN0RGF0YSA9IHNlbGYuR2xvYmFsLmZvclNhdmVbY29tcG9uZW50c1tpXV0ucmVxdWVzdERhdGE7XHJcbiAgICAgICAgICAgIHZhciBjb21wb25lbnREYXRhID0gc2VsZi5HbG9iYWwuZm9yU2F2ZVtjb21wb25lbnRzW2ldXS5jb21wb25lbnREYXRhO1xyXG4gICAgICAgICAgICBpdGVtLmVhY2goZnVuY3Rpb24oaSwgb2JqKXtcclxuICAgICAgICAgICAgICAgIHZhciBkYXRhID0ge307XHJcbiAgICAgICAgICAgICAgICBmb3IodmFyIGogPSByZXF1ZXN0RGF0YS5sZW5ndGg7IGotLTspe1xyXG4gICAgICAgICAgICAgICAgICAgIHZhciBrZXkgPSByZXF1ZXN0RGF0YVtqXTtcclxuICAgICAgICAgICAgICAgICAgICBpZihrZXkgPT0gJ2lkJyB8fCBrZXkgPT0gJ29yZGVyJyB8fCBrZXkgPT0gJ3N0YXJzJylcclxuICAgICAgICAgICAgICAgICAgICAgICAgZGF0YVtrZXldID0gcGFyc2VJbnQoJChvYmopLmF0dHIoJ2RhdGEtJytrZXkpKTtcclxuICAgICAgICAgICAgICAgICAgICBlbHNlIGlmKGtleSA9PSAnaW1hZ2UnKVxyXG4gICAgICAgICAgICAgICAgICAgICAgICBkYXRhW2tleV0gPSAkKG9iaikuZmluZChcImltZ1wiKS5hdHRyKCdzcmMnKTtcclxuICAgICAgICAgICAgICAgICAgICBlbHNlXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGRhdGFba2V5XSA9ICQob2JqKS5maW5kKFwiLlwiICsga2V5KS50ZXh0KCk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICBjb21wb25lbnREYXRhLnB1c2goZGF0YSk7XHJcbiAgICAgICAgICAgICAgICBuZXdJdGVtcyA9IGNvbXBvbmVudERhdGEubGVuZ3RoID4gMCA/IHRydWUgOiBmYWxzZTtcclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHNlbGYuR2xvYmFsLnJlcXVlc3RPcHRpb25zLnN1Y2Nlc3MgPSBmdW5jdGlvbihyZXNwb25zZSl7XHJcbiAgICAgICAgICAgICQubm90aWZ5KCdTdWNjZXNzZnVsbHkgc2F2ZWQnLCBcInN1Y2Nlc3NcIik7XHJcbiAgICAgICAgICAgIGZvcih2YXIgaSA9IGNvbXBvbmVudHMubGVuZ3RoOyBpLS07KXtcclxuICAgICAgICAgICAgICAgIHNlbGYuR2xvYmFsLmZvclNhdmVbY29tcG9uZW50c1tpXV0uY29tcG9uZW50RGF0YSA9IFtdO1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAkKFwiW2NoYW5nZWQ9dHJ1ZV1cIikuYXR0cihcImNoYW5nZWRcIiwgJ2ZhbHNlJyk7XHJcblxyXG4gICAgICAgICAgICB2YXIgY29tcG9uZW50TmFtZXMgPSBPYmplY3Qua2V5cyhyZXNwb25zZSk7XHJcbiAgICAgICAgICAgIGZvcih2YXIgaSA9IGNvbXBvbmVudE5hbWVzLmxlbmd0aDsgaS0tOyl7XHJcbiAgICAgICAgICAgICAgICB2YXIgY29tcG9uZW50ID0gY29tcG9uZW50TmFtZXNbaV07XHJcbiAgICAgICAgICAgICAgICBmb3IodmFyIGMgPSByZXNwb25zZVtjb21wb25lbnRdLmxlbmd0aDsgYy0tOyl7XHJcbiAgICAgICAgICAgICAgICAgICAgJChcIiNcIiArIGNvbXBvbmVudCArIFwiIFtkYXRhLWlkPSdcIisgcmVzcG9uc2VbY29tcG9uZW50XVtjXVsncmVxdWVzdF9pZCddICtcIiddXCIpXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIC5hdHRyKFwiZGF0YS1pZFwiLCByZXNwb25zZVtjb21wb25lbnRdW2NdWydyZXNwb25zZV9pZCddKTtcclxuXHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9O1xyXG4gICAgICAgIHNlbGYuR2xvYmFsLnJlcXVlc3RPcHRpb25zLmVycm9yID0gZnVuY3Rpb24ocmVzcG9uc2Upe1xyXG4gICAgICAgICAgICBmb3IodmFyIGkgPSBjb21wb25lbnRzLmxlbmd0aDsgaS0tOyl7XHJcbiAgICAgICAgICAgICAgICBzZWxmLkdsb2JhbC5mb3JTYXZlW2NvbXBvbmVudHNbaV1dLmNvbXBvbmVudERhdGEgPSBbXTtcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgdmFyIHcgPSB3aW5kb3cub3BlbignJywgJzpFcnJvciBNZXNzYWdlJywgJ21lbnViYXI9bm8sIGxvY2F0aW9uPW5vJyk7XHJcbiAgICAgICAgICAgIHcuZG9jdW1lbnQud3JpdGUocmVzcG9uc2UucmVzcG9uc2VUZXh0KTtcclxuICAgICAgICB9O1xyXG4gICAgICAgIHNlbGYuR2xvYmFsLnJlcXVlc3RPcHRpb25zLmRhdGEgPSB7XHJcbiAgICAgICAgICAgIGZvckRlbGV0ZTogc2VsZi5HbG9iYWwuZm9yRGVsZXRlLFxyXG4gICAgICAgICAgICBmb3JTYXZlOiBzZWxmLkdsb2JhbC5mb3JTYXZlXHJcbiAgICAgICAgfTtcclxuICAgICAgICBzZWxmLkdsb2JhbC5yZXF1ZXN0T3B0aW9ucy50eXBlID0gXCJQT1NUXCI7XHJcbiAgICAgICAgaWYobmV3SXRlbXMpXHJcbiAgICAgICAgICAgICQuYWpheChzZWxmLkhlbHBlci5nZXRVUkwoKS51cGRhdGUsIHNlbGYuR2xvYmFsLnJlcXVlc3RPcHRpb25zKVxyXG4gICAgICAgIGVsc2V7XHJcbiAgICAgICAgICAgICQubm90aWZ5KCdOb3RoaW5nIGNoYW5nZWQnLCBcImluZm9cIik7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxufTsiXSwiZmlsZSI6ImNvbXBvbmVudHMuanMiLCJzb3VyY2VSb290IjoiL3NvdXJjZS8ifQ==
