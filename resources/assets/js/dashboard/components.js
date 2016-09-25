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