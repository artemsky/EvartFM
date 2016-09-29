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
        $this.ServerStatusCheck = function(){
            var serverStatus = $("#serverStatus");
            var onbtn = $(".radio-on");
            var offbtn = $(".radio-off");
            self.Global.requestOptions.type = "GET";
            self.Global.requestOptions.success = function(response){
            if(response){
              serverStatus.removeClass("text-danger").addClass("text-success");
                offbtn.prop("disabled", false);
            }
            else{
              serverStatus.removeClass("text-success").addClass("text-danger");
                onbtn.prop("disabled", false);
            }
            };
            $.ajax(serverStatus.attr("data-status-url"), self.Global.requestOptions)

        };
        $this.getURL = function(){
            return {
                switch: self.Global.RootURL + "switch"
            }
        };
    };
    self.initRadioControll = new function(){
        var onbtn = $(".radio-on");
        var offbtn = $(".radio-off");
        onbtn.on("click", function(){
            onbtn.prop("disabled", true);
            offbtn.prop("disabled", true);
          self.Global.requestOptions.data = {action: "on"};
            self.Global.requestOptions.type = "POST";
            self.Global.requestOptions.success = self.Helper.ServerStatusCheck;
          $.ajax(self.Helper.getURL().switch, self.Global.requestOptions);
        });
        offbtn.on("click", function(){
            onbtn.prop("disabled", true);
            offbtn.prop("disabled", true);
            self.Global.requestOptions.data = {action: "off"};
            self.Global.requestOptions.type = "POST";
            self.Global.requestOptions.success = self.Helper.ServerStatusCheck;
            $.ajax(self.Helper.getURL().switch, self.Global.requestOptions);
        });
        $(".radio-refresh").on("click", function(){
            self.Global.requestOptions.data = {action: "refresh"};
            self.Global.requestOptions.type = "POST";
            $.ajax(self.Helper.getURL().switch, self.Global.requestOptions);
        });
        $(".radio-next").on("click", function(){
            self.Global.requestOptions.data = {action: "next"};
            self.Global.requestOptions.type = "POST";
            $.ajax(self.Helper.getURL().switch, self.Global.requestOptions);
        });
        self.Helper.ServerStatusCheck();
        setInterval(self.Helper.ServerStatusCheck, 5000);
    };

};

