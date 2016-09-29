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


//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiIiwic291cmNlcyI6WyJkYXNoYm9hcmQvYnJvYWRjYXN0LmpzIl0sInNvdXJjZXNDb250ZW50IjpbInZhciBBUFBMSUNBVElPTiA9IEFQUExJQ0FUSU9OIHx8IHt9O1xyXG5BUFBMSUNBVElPTi5Ccm9hZGNhc3RpbmcgPSBuZXcgZnVuY3Rpb24oKXtcclxuICAgIFwidXNlIHN0cmljdFwiO1xyXG4gICAgdmFyIHNlbGYgPSB0aGlzO1xyXG4gICAgc2VsZi5HbG9iYWwgPSBuZXcgZnVuY3Rpb24oKXtcclxuICAgICAgICBcInVzZSBzdHJpY3RcIjtcclxuICAgICAgICB2YXIgJHRoaXMgPSB0aGlzO1xyXG4gICAgICAgICR0aGlzLlJvb3RVUkwgPSBcImJyb2FkY2FzdC9cIjtcclxuICAgICAgICAkdGhpcy5yZXF1ZXN0T3B0aW9ucyA9IHtcclxuICAgICAgICAgICAgdHlwZTogXCJQT1NUXCIsXHJcbiAgICAgICAgICAgIGhlYWRlcnM6IHtcclxuICAgICAgICAgICAgICAgICdYLUNTUkYtVE9LRU4nOiAkKCdtZXRhW25hbWU9XCJjc3JmLXRva2VuXCJdJykuYXR0cignY29udGVudCcpXHJcbiAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgIGVycm9yOiBmdW5jdGlvbihyZXNwb25zZSl7XHJcbiAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhyZXNwb25zZSk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9O1xyXG4gICAgfTtcclxuICAgIHNlbGYuSGVscGVyID0gbmV3IGZ1bmN0aW9uKCl7XHJcbiAgICAgICAgXCJ1c2Ugc3RyaWN0XCI7XHJcbiAgICAgICAgdmFyICR0aGlzID0gdGhpcztcclxuICAgICAgICAkdGhpcy5pbml0U29ydGFibGUgPSBmdW5jdGlvbih0YXJnZXQsIGhhbmRsZSl7XHJcbiAgICAgICAgICAgIHZhciByZW1vdmVJbnRlbnQgPSBmYWxzZTtcclxuICAgICAgICAgICAgdGFyZ2V0LnNvcnRhYmxlKHtcclxuICAgICAgICAgICAgICAgIGl0ZW1zOiBcIi5pdGVtXCIsXHJcbiAgICAgICAgICAgICAgICBoYW5kbGU6IGhhbmRsZSxcclxuICAgICAgICAgICAgICAgIG9wYWNpdHk6IDAuOCxcclxuICAgICAgICAgICAgICAgIHN0b3A6IGZ1bmN0aW9uKCBldmVudCApIHtcclxuICAgICAgICAgICAgICAgICAgICAkKGV2ZW50LnRhcmdldCkuZmluZChcIi5pdGVtXCIpLmVhY2goZnVuY3Rpb24oaSwgb2JqKXtcclxuICAgICAgICAgICAgICAgICAgICAgICAgJChvYmopLmF0dHIoXCJkYXRhLW9yZGVyXCIsIGkrMSkuYXR0cignY2hhbmdlZCcsICd0cnVlJyk7XHJcbiAgICAgICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgICAgICB9LFxyXG5cclxuICAgICAgICAgICAgICAgIG92ZXI6IGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgICAgICAgICByZW1vdmVJbnRlbnQgPSBmYWxzZTtcclxuICAgICAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgICAgICBvdXQ6IGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgICAgICAgICByZW1vdmVJbnRlbnQgPSB0cnVlO1xyXG4gICAgICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgICAgIGJlZm9yZVN0b3A6IGZ1bmN0aW9uIChldmVudCwgdWkpIHtcclxuICAgICAgICAgICAgICAgICAgICBpZihyZW1vdmVJbnRlbnQgPT0gdHJ1ZSl7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHVpLml0ZW0ucmVtb3ZlKCk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHZhciBpZCA9IHVpLml0ZW0uYXR0cihcImRhdGEtaWRcIik7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHNlbGYuR2xvYmFsLmZvckRlbGV0ZVt0YXJnZXQuc2VsZWN0b3Iuc3Vic3RyaW5nKDExKV0ucHVzaCh1aS5pdGVtLmF0dHIoXCJkYXRhLWlkXCIpKTtcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgIH07XHJcbiAgICAgICAgJHRoaXMuU2VydmVyU3RhdHVzQ2hlY2sgPSBmdW5jdGlvbigpe1xyXG4gICAgICAgICAgICB2YXIgc2VydmVyU3RhdHVzID0gJChcIiNzZXJ2ZXJTdGF0dXNcIik7XHJcbiAgICAgICAgICAgIHZhciBvbmJ0biA9ICQoXCIucmFkaW8tb25cIik7XHJcbiAgICAgICAgICAgIHZhciBvZmZidG4gPSAkKFwiLnJhZGlvLW9mZlwiKTtcclxuICAgICAgICAgICAgc2VsZi5HbG9iYWwucmVxdWVzdE9wdGlvbnMudHlwZSA9IFwiR0VUXCI7XHJcbiAgICAgICAgICAgIHNlbGYuR2xvYmFsLnJlcXVlc3RPcHRpb25zLnN1Y2Nlc3MgPSBmdW5jdGlvbihyZXNwb25zZSl7XHJcbiAgICAgICAgICAgIGlmKHJlc3BvbnNlKXtcclxuICAgICAgICAgICAgICBzZXJ2ZXJTdGF0dXMucmVtb3ZlQ2xhc3MoXCJ0ZXh0LWRhbmdlclwiKS5hZGRDbGFzcyhcInRleHQtc3VjY2Vzc1wiKTtcclxuICAgICAgICAgICAgICAgIG9mZmJ0bi5wcm9wKFwiZGlzYWJsZWRcIiwgZmFsc2UpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGVsc2V7XHJcbiAgICAgICAgICAgICAgc2VydmVyU3RhdHVzLnJlbW92ZUNsYXNzKFwidGV4dC1zdWNjZXNzXCIpLmFkZENsYXNzKFwidGV4dC1kYW5nZXJcIik7XHJcbiAgICAgICAgICAgICAgICBvbmJ0bi5wcm9wKFwiZGlzYWJsZWRcIiwgZmFsc2UpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH07XHJcbiAgICAgICAgICAgICQuYWpheChzZXJ2ZXJTdGF0dXMuYXR0cihcImRhdGEtc3RhdHVzLXVybFwiKSwgc2VsZi5HbG9iYWwucmVxdWVzdE9wdGlvbnMpXHJcblxyXG4gICAgICAgIH07XHJcbiAgICAgICAgJHRoaXMuZ2V0VVJMID0gZnVuY3Rpb24oKXtcclxuICAgICAgICAgICAgcmV0dXJuIHtcclxuICAgICAgICAgICAgICAgIHN3aXRjaDogc2VsZi5HbG9iYWwuUm9vdFVSTCArIFwic3dpdGNoXCJcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH07XHJcbiAgICB9O1xyXG4gICAgc2VsZi5pbml0UmFkaW9Db250cm9sbCA9IG5ldyBmdW5jdGlvbigpe1xyXG4gICAgICAgIHZhciBvbmJ0biA9ICQoXCIucmFkaW8tb25cIik7XHJcbiAgICAgICAgdmFyIG9mZmJ0biA9ICQoXCIucmFkaW8tb2ZmXCIpO1xyXG4gICAgICAgIG9uYnRuLm9uKFwiY2xpY2tcIiwgZnVuY3Rpb24oKXtcclxuICAgICAgICAgICAgb25idG4ucHJvcChcImRpc2FibGVkXCIsIHRydWUpO1xyXG4gICAgICAgICAgICBvZmZidG4ucHJvcChcImRpc2FibGVkXCIsIHRydWUpO1xyXG4gICAgICAgICAgc2VsZi5HbG9iYWwucmVxdWVzdE9wdGlvbnMuZGF0YSA9IHthY3Rpb246IFwib25cIn07XHJcbiAgICAgICAgICAgIHNlbGYuR2xvYmFsLnJlcXVlc3RPcHRpb25zLnR5cGUgPSBcIlBPU1RcIjtcclxuICAgICAgICAgICAgc2VsZi5HbG9iYWwucmVxdWVzdE9wdGlvbnMuc3VjY2VzcyA9IHNlbGYuSGVscGVyLlNlcnZlclN0YXR1c0NoZWNrO1xyXG4gICAgICAgICAgJC5hamF4KHNlbGYuSGVscGVyLmdldFVSTCgpLnN3aXRjaCwgc2VsZi5HbG9iYWwucmVxdWVzdE9wdGlvbnMpO1xyXG4gICAgICAgIH0pO1xyXG4gICAgICAgIG9mZmJ0bi5vbihcImNsaWNrXCIsIGZ1bmN0aW9uKCl7XHJcbiAgICAgICAgICAgIG9uYnRuLnByb3AoXCJkaXNhYmxlZFwiLCB0cnVlKTtcclxuICAgICAgICAgICAgb2ZmYnRuLnByb3AoXCJkaXNhYmxlZFwiLCB0cnVlKTtcclxuICAgICAgICAgICAgc2VsZi5HbG9iYWwucmVxdWVzdE9wdGlvbnMuZGF0YSA9IHthY3Rpb246IFwib2ZmXCJ9O1xyXG4gICAgICAgICAgICBzZWxmLkdsb2JhbC5yZXF1ZXN0T3B0aW9ucy50eXBlID0gXCJQT1NUXCI7XHJcbiAgICAgICAgICAgIHNlbGYuR2xvYmFsLnJlcXVlc3RPcHRpb25zLnN1Y2Nlc3MgPSBzZWxmLkhlbHBlci5TZXJ2ZXJTdGF0dXNDaGVjaztcclxuICAgICAgICAgICAgJC5hamF4KHNlbGYuSGVscGVyLmdldFVSTCgpLnN3aXRjaCwgc2VsZi5HbG9iYWwucmVxdWVzdE9wdGlvbnMpO1xyXG4gICAgICAgIH0pO1xyXG4gICAgICAgICQoXCIucmFkaW8tcmVmcmVzaFwiKS5vbihcImNsaWNrXCIsIGZ1bmN0aW9uKCl7XHJcbiAgICAgICAgICAgIHNlbGYuR2xvYmFsLnJlcXVlc3RPcHRpb25zLmRhdGEgPSB7YWN0aW9uOiBcInJlZnJlc2hcIn07XHJcbiAgICAgICAgICAgIHNlbGYuR2xvYmFsLnJlcXVlc3RPcHRpb25zLnR5cGUgPSBcIlBPU1RcIjtcclxuICAgICAgICAgICAgJC5hamF4KHNlbGYuSGVscGVyLmdldFVSTCgpLnN3aXRjaCwgc2VsZi5HbG9iYWwucmVxdWVzdE9wdGlvbnMpO1xyXG4gICAgICAgIH0pO1xyXG4gICAgICAgICQoXCIucmFkaW8tbmV4dFwiKS5vbihcImNsaWNrXCIsIGZ1bmN0aW9uKCl7XHJcbiAgICAgICAgICAgIHNlbGYuR2xvYmFsLnJlcXVlc3RPcHRpb25zLmRhdGEgPSB7YWN0aW9uOiBcIm5leHRcIn07XHJcbiAgICAgICAgICAgIHNlbGYuR2xvYmFsLnJlcXVlc3RPcHRpb25zLnR5cGUgPSBcIlBPU1RcIjtcclxuICAgICAgICAgICAgJC5hamF4KHNlbGYuSGVscGVyLmdldFVSTCgpLnN3aXRjaCwgc2VsZi5HbG9iYWwucmVxdWVzdE9wdGlvbnMpO1xyXG4gICAgICAgIH0pO1xyXG4gICAgICAgIHNlbGYuSGVscGVyLlNlcnZlclN0YXR1c0NoZWNrKCk7XHJcbiAgICAgICAgc2V0SW50ZXJ2YWwoc2VsZi5IZWxwZXIuU2VydmVyU3RhdHVzQ2hlY2ssIDUwMDApO1xyXG4gICAgfTtcclxuXHJcbn07XHJcblxyXG4iXSwiZmlsZSI6ImRhc2hib2FyZC9icm9hZGNhc3QuanMiLCJzb3VyY2VSb290IjoiL3NvdXJjZS8ifQ==
