var APPLICATION = APPLICATION || {};
APPLICATION.Broadcasting = new function(){
    "use strict";
    var self = this;
    self.Global = new function(){
        "use strict";
        var $this = this;
        $this.RootURL = "broadcast/";
        $this.requestOptions = {
            type: "POST",
            headers: {
                'X-CSRF-TOKEN': $('meta[name="csrf-token"]').attr('content')
            },
            error: function(response){
                var w = window.open('', ':Error Message', 'menubar=no, location=no');
                w.document.write(response.responseText);
            },
            success: function(response){
                console.log(response);
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
        $this.getURL = function(){
            return {
                switch: self.Global.RootURL + "switch"
            }
        };
    };
    self.initRadioControll = new function(){
        $(".radio-on").on("click", function(){
          self.Global.requestOptions.data = {action: "on"};
          $.ajax(self.Helper.getURL().switch, self.Global.requestOptions);
        });
        $(".radio-off").on("click", function(){
            self.Global.requestOptions.data = {action: "off"};
            $.ajax(self.Helper.getURL().switch, self.Global.requestOptions);
        });
        $(".radio-refresh").on("click", function(){
            self.Global.requestOptions.data = {action: "refresh"};
            $.ajax(self.Helper.getURL().switch, self.Global.requestOptions);
        });
    };

};

