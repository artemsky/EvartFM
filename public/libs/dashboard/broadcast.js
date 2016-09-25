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
        self.Helper.ServerStatusCheck();
        setInterval(self.Helper.ServerStatusCheck, 5000);
    };

};


//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiIiwic291cmNlcyI6WyJkYXNoYm9hcmQvYnJvYWRjYXN0LmpzIl0sInNvdXJjZXNDb250ZW50IjpbInZhciBBUFBMSUNBVElPTiA9IEFQUExJQ0FUSU9OIHx8IHt9O1xyXG5BUFBMSUNBVElPTi5Ccm9hZGNhc3RpbmcgPSBuZXcgZnVuY3Rpb24oKXtcclxuICAgIFwidXNlIHN0cmljdFwiO1xyXG4gICAgdmFyIHNlbGYgPSB0aGlzO1xyXG4gICAgc2VsZi5HbG9iYWwgPSBuZXcgZnVuY3Rpb24oKXtcclxuICAgICAgICBcInVzZSBzdHJpY3RcIjtcclxuICAgICAgICB2YXIgJHRoaXMgPSB0aGlzO1xyXG4gICAgICAgICR0aGlzLlJvb3RVUkwgPSBcImJyb2FkY2FzdC9cIjtcclxuICAgICAgICAkdGhpcy5yZXF1ZXN0T3B0aW9ucyA9IHtcclxuICAgICAgICAgICAgdHlwZTogXCJQT1NUXCIsXHJcbiAgICAgICAgICAgIGhlYWRlcnM6IHtcclxuICAgICAgICAgICAgICAgICdYLUNTUkYtVE9LRU4nOiAkKCdtZXRhW25hbWU9XCJjc3JmLXRva2VuXCJdJykuYXR0cignY29udGVudCcpXHJcbiAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgIGVycm9yOiBmdW5jdGlvbihyZXNwb25zZSl7XHJcbiAgICAgICAgICAgICAgICB2YXIgdyA9IHdpbmRvdy5vcGVuKCcnLCAnOkVycm9yIE1lc3NhZ2UnLCAnbWVudWJhcj1ubywgbG9jYXRpb249bm8nKTtcclxuICAgICAgICAgICAgICAgIHcuZG9jdW1lbnQud3JpdGUocmVzcG9uc2UucmVzcG9uc2VUZXh0KTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH07XHJcbiAgICB9O1xyXG4gICAgc2VsZi5IZWxwZXIgPSBuZXcgZnVuY3Rpb24oKXtcclxuICAgICAgICBcInVzZSBzdHJpY3RcIjtcclxuICAgICAgICB2YXIgJHRoaXMgPSB0aGlzO1xyXG4gICAgICAgICR0aGlzLmluaXRTb3J0YWJsZSA9IGZ1bmN0aW9uKHRhcmdldCwgaGFuZGxlKXtcclxuICAgICAgICAgICAgdmFyIHJlbW92ZUludGVudCA9IGZhbHNlO1xyXG4gICAgICAgICAgICB0YXJnZXQuc29ydGFibGUoe1xyXG4gICAgICAgICAgICAgICAgaXRlbXM6IFwiLml0ZW1cIixcclxuICAgICAgICAgICAgICAgIGhhbmRsZTogaGFuZGxlLFxyXG4gICAgICAgICAgICAgICAgb3BhY2l0eTogMC44LFxyXG4gICAgICAgICAgICAgICAgc3RvcDogZnVuY3Rpb24oIGV2ZW50ICkge1xyXG4gICAgICAgICAgICAgICAgICAgICQoZXZlbnQudGFyZ2V0KS5maW5kKFwiLml0ZW1cIikuZWFjaChmdW5jdGlvbihpLCBvYmope1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAkKG9iaikuYXR0cihcImRhdGEtb3JkZXJcIiwgaSsxKS5hdHRyKCdjaGFuZ2VkJywgJ3RydWUnKTtcclxuICAgICAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgICAgIH0sXHJcblxyXG4gICAgICAgICAgICAgICAgb3ZlcjogZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICAgICAgICAgIHJlbW92ZUludGVudCA9IGZhbHNlO1xyXG4gICAgICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgICAgIG91dDogZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICAgICAgICAgIHJlbW92ZUludGVudCA9IHRydWU7XHJcbiAgICAgICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICAgICAgYmVmb3JlU3RvcDogZnVuY3Rpb24gKGV2ZW50LCB1aSkge1xyXG4gICAgICAgICAgICAgICAgICAgIGlmKHJlbW92ZUludGVudCA9PSB0cnVlKXtcclxuICAgICAgICAgICAgICAgICAgICAgICAgdWkuaXRlbS5yZW1vdmUoKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgdmFyIGlkID0gdWkuaXRlbS5hdHRyKFwiZGF0YS1pZFwiKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgc2VsZi5HbG9iYWwuZm9yRGVsZXRlW3RhcmdldC5zZWxlY3Rvci5zdWJzdHJpbmcoMTEpXS5wdXNoKHVpLml0ZW0uYXR0cihcImRhdGEtaWRcIikpO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgfTtcclxuICAgICAgICAkdGhpcy5TZXJ2ZXJTdGF0dXNDaGVjayA9IGZ1bmN0aW9uKCl7XHJcbiAgICAgICAgICAgIHZhciBzZXJ2ZXJTdGF0dXMgPSAkKFwiI3NlcnZlclN0YXR1c1wiKTtcclxuICAgICAgICAgICAgdmFyIG9uYnRuID0gJChcIi5yYWRpby1vblwiKTtcclxuICAgICAgICAgICAgdmFyIG9mZmJ0biA9ICQoXCIucmFkaW8tb2ZmXCIpO1xyXG4gICAgICAgICAgICBzZWxmLkdsb2JhbC5yZXF1ZXN0T3B0aW9ucy50eXBlID0gXCJHRVRcIjtcclxuICAgICAgICAgICAgc2VsZi5HbG9iYWwucmVxdWVzdE9wdGlvbnMuc3VjY2VzcyA9IGZ1bmN0aW9uKHJlc3BvbnNlKXtcclxuICAgICAgICAgICAgaWYocmVzcG9uc2Upe1xyXG4gICAgICAgICAgICAgIHNlcnZlclN0YXR1cy5yZW1vdmVDbGFzcyhcInRleHQtZGFuZ2VyXCIpLmFkZENsYXNzKFwidGV4dC1zdWNjZXNzXCIpO1xyXG4gICAgICAgICAgICAgICAgb2ZmYnRuLnByb3AoXCJkaXNhYmxlZFwiLCBmYWxzZSk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgZWxzZXtcclxuICAgICAgICAgICAgICBzZXJ2ZXJTdGF0dXMucmVtb3ZlQ2xhc3MoXCJ0ZXh0LXN1Y2Nlc3NcIikuYWRkQ2xhc3MoXCJ0ZXh0LWRhbmdlclwiKTtcclxuICAgICAgICAgICAgICAgIG9uYnRuLnByb3AoXCJkaXNhYmxlZFwiLCBmYWxzZSk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfTtcclxuICAgICAgICAgICAgJC5hamF4KHNlcnZlclN0YXR1cy5hdHRyKFwiZGF0YS1zdGF0dXMtdXJsXCIpLCBzZWxmLkdsb2JhbC5yZXF1ZXN0T3B0aW9ucylcclxuXHJcbiAgICAgICAgfTtcclxuICAgICAgICAkdGhpcy5nZXRVUkwgPSBmdW5jdGlvbigpe1xyXG4gICAgICAgICAgICByZXR1cm4ge1xyXG4gICAgICAgICAgICAgICAgc3dpdGNoOiBzZWxmLkdsb2JhbC5Sb290VVJMICsgXCJzd2l0Y2hcIlxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfTtcclxuICAgIH07XHJcbiAgICBzZWxmLmluaXRSYWRpb0NvbnRyb2xsID0gbmV3IGZ1bmN0aW9uKCl7XHJcbiAgICAgICAgdmFyIG9uYnRuID0gJChcIi5yYWRpby1vblwiKTtcclxuICAgICAgICB2YXIgb2ZmYnRuID0gJChcIi5yYWRpby1vZmZcIik7XHJcbiAgICAgICAgb25idG4ub24oXCJjbGlja1wiLCBmdW5jdGlvbigpe1xyXG4gICAgICAgICAgICBvbmJ0bi5wcm9wKFwiZGlzYWJsZWRcIiwgdHJ1ZSk7XHJcbiAgICAgICAgICAgIG9mZmJ0bi5wcm9wKFwiZGlzYWJsZWRcIiwgdHJ1ZSk7XHJcbiAgICAgICAgICBzZWxmLkdsb2JhbC5yZXF1ZXN0T3B0aW9ucy5kYXRhID0ge2FjdGlvbjogXCJvblwifTtcclxuICAgICAgICAgICAgc2VsZi5HbG9iYWwucmVxdWVzdE9wdGlvbnMudHlwZSA9IFwiUE9TVFwiO1xyXG4gICAgICAgICAgICBzZWxmLkdsb2JhbC5yZXF1ZXN0T3B0aW9ucy5zdWNjZXNzID0gc2VsZi5IZWxwZXIuU2VydmVyU3RhdHVzQ2hlY2s7XHJcbiAgICAgICAgICAkLmFqYXgoc2VsZi5IZWxwZXIuZ2V0VVJMKCkuc3dpdGNoLCBzZWxmLkdsb2JhbC5yZXF1ZXN0T3B0aW9ucyk7XHJcbiAgICAgICAgfSk7XHJcbiAgICAgICAgb2ZmYnRuLm9uKFwiY2xpY2tcIiwgZnVuY3Rpb24oKXtcclxuICAgICAgICAgICAgb25idG4ucHJvcChcImRpc2FibGVkXCIsIHRydWUpO1xyXG4gICAgICAgICAgICBvZmZidG4ucHJvcChcImRpc2FibGVkXCIsIHRydWUpO1xyXG4gICAgICAgICAgICBzZWxmLkdsb2JhbC5yZXF1ZXN0T3B0aW9ucy5kYXRhID0ge2FjdGlvbjogXCJvZmZcIn07XHJcbiAgICAgICAgICAgIHNlbGYuR2xvYmFsLnJlcXVlc3RPcHRpb25zLnR5cGUgPSBcIlBPU1RcIjtcclxuICAgICAgICAgICAgc2VsZi5HbG9iYWwucmVxdWVzdE9wdGlvbnMuc3VjY2VzcyA9IHNlbGYuSGVscGVyLlNlcnZlclN0YXR1c0NoZWNrO1xyXG4gICAgICAgICAgICAkLmFqYXgoc2VsZi5IZWxwZXIuZ2V0VVJMKCkuc3dpdGNoLCBzZWxmLkdsb2JhbC5yZXF1ZXN0T3B0aW9ucyk7XHJcbiAgICAgICAgfSk7XHJcbiAgICAgICAgJChcIi5yYWRpby1yZWZyZXNoXCIpLm9uKFwiY2xpY2tcIiwgZnVuY3Rpb24oKXtcclxuICAgICAgICAgICAgc2VsZi5HbG9iYWwucmVxdWVzdE9wdGlvbnMuZGF0YSA9IHthY3Rpb246IFwicmVmcmVzaFwifTtcclxuICAgICAgICAgICAgc2VsZi5HbG9iYWwucmVxdWVzdE9wdGlvbnMudHlwZSA9IFwiUE9TVFwiO1xyXG4gICAgICAgICAgICAkLmFqYXgoc2VsZi5IZWxwZXIuZ2V0VVJMKCkuc3dpdGNoLCBzZWxmLkdsb2JhbC5yZXF1ZXN0T3B0aW9ucyk7XHJcbiAgICAgICAgfSk7XHJcbiAgICAgICAgc2VsZi5IZWxwZXIuU2VydmVyU3RhdHVzQ2hlY2soKTtcclxuICAgICAgICBzZXRJbnRlcnZhbChzZWxmLkhlbHBlci5TZXJ2ZXJTdGF0dXNDaGVjaywgNTAwMCk7XHJcbiAgICB9O1xyXG5cclxufTtcclxuXHJcbiJdLCJmaWxlIjoiZGFzaGJvYXJkL2Jyb2FkY2FzdC5qcyIsInNvdXJjZVJvb3QiOiIvc291cmNlLyJ9
