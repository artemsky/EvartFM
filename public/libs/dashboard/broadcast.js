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


//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiIiwic291cmNlcyI6WyJkYXNoYm9hcmQvYnJvYWRjYXN0LmpzIl0sInNvdXJjZXNDb250ZW50IjpbInZhciBBUFBMSUNBVElPTiA9IEFQUExJQ0FUSU9OIHx8IHt9O1xuQVBQTElDQVRJT04uQnJvYWRjYXN0aW5nID0gbmV3IGZ1bmN0aW9uKCl7XG4gICAgXCJ1c2Ugc3RyaWN0XCI7XG4gICAgdmFyIHNlbGYgPSB0aGlzO1xuICAgIHNlbGYuR2xvYmFsID0gbmV3IGZ1bmN0aW9uKCl7XG4gICAgICAgIFwidXNlIHN0cmljdFwiO1xuICAgICAgICB2YXIgJHRoaXMgPSB0aGlzO1xuICAgICAgICAkdGhpcy5Sb290VVJMID0gXCJicm9hZGNhc3QvXCI7XG4gICAgICAgICR0aGlzLnJlcXVlc3RPcHRpb25zID0ge1xuICAgICAgICAgICAgdHlwZTogXCJQT1NUXCIsXG4gICAgICAgICAgICBoZWFkZXJzOiB7XG4gICAgICAgICAgICAgICAgJ1gtQ1NSRi1UT0tFTic6ICQoJ21ldGFbbmFtZT1cImNzcmYtdG9rZW5cIl0nKS5hdHRyKCdjb250ZW50JylcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICBlcnJvcjogZnVuY3Rpb24ocmVzcG9uc2Upe1xuICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKHJlc3BvbnNlKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfTtcbiAgICB9O1xuICAgIHNlbGYuSGVscGVyID0gbmV3IGZ1bmN0aW9uKCl7XG4gICAgICAgIFwidXNlIHN0cmljdFwiO1xuICAgICAgICB2YXIgJHRoaXMgPSB0aGlzO1xuICAgICAgICAkdGhpcy5pbml0U29ydGFibGUgPSBmdW5jdGlvbih0YXJnZXQsIGhhbmRsZSl7XG4gICAgICAgICAgICB2YXIgcmVtb3ZlSW50ZW50ID0gZmFsc2U7XG4gICAgICAgICAgICB0YXJnZXQuc29ydGFibGUoe1xuICAgICAgICAgICAgICAgIGl0ZW1zOiBcIi5pdGVtXCIsXG4gICAgICAgICAgICAgICAgaGFuZGxlOiBoYW5kbGUsXG4gICAgICAgICAgICAgICAgb3BhY2l0eTogMC44LFxuICAgICAgICAgICAgICAgIHN0b3A6IGZ1bmN0aW9uKCBldmVudCApIHtcbiAgICAgICAgICAgICAgICAgICAgJChldmVudC50YXJnZXQpLmZpbmQoXCIuaXRlbVwiKS5lYWNoKGZ1bmN0aW9uKGksIG9iail7XG4gICAgICAgICAgICAgICAgICAgICAgICAkKG9iaikuYXR0cihcImRhdGEtb3JkZXJcIiwgaSsxKS5hdHRyKCdjaGFuZ2VkJywgJ3RydWUnKTtcbiAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgfSxcblxuICAgICAgICAgICAgICAgIG92ZXI6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICAgICAgcmVtb3ZlSW50ZW50ID0gZmFsc2U7XG4gICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICBvdXQ6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICAgICAgcmVtb3ZlSW50ZW50ID0gdHJ1ZTtcbiAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgIGJlZm9yZVN0b3A6IGZ1bmN0aW9uIChldmVudCwgdWkpIHtcbiAgICAgICAgICAgICAgICAgICAgaWYocmVtb3ZlSW50ZW50ID09IHRydWUpe1xuICAgICAgICAgICAgICAgICAgICAgICAgdWkuaXRlbS5yZW1vdmUoKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIHZhciBpZCA9IHVpLml0ZW0uYXR0cihcImRhdGEtaWRcIik7XG4gICAgICAgICAgICAgICAgICAgICAgICBzZWxmLkdsb2JhbC5mb3JEZWxldGVbdGFyZ2V0LnNlbGVjdG9yLnN1YnN0cmluZygxMSldLnB1c2godWkuaXRlbS5hdHRyKFwiZGF0YS1pZFwiKSk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfTtcbiAgICAgICAgJHRoaXMuU2VydmVyU3RhdHVzQ2hlY2sgPSBmdW5jdGlvbigpe1xuICAgICAgICAgICAgdmFyIHNlcnZlclN0YXR1cyA9ICQoXCIjc2VydmVyU3RhdHVzXCIpO1xuICAgICAgICAgICAgdmFyIG9uYnRuID0gJChcIi5yYWRpby1vblwiKTtcbiAgICAgICAgICAgIHZhciBvZmZidG4gPSAkKFwiLnJhZGlvLW9mZlwiKTtcbiAgICAgICAgICAgIHNlbGYuR2xvYmFsLnJlcXVlc3RPcHRpb25zLnR5cGUgPSBcIkdFVFwiO1xuICAgICAgICAgICAgc2VsZi5HbG9iYWwucmVxdWVzdE9wdGlvbnMuc3VjY2VzcyA9IGZ1bmN0aW9uKHJlc3BvbnNlKXtcbiAgICAgICAgICAgIGlmKHJlc3BvbnNlKXtcbiAgICAgICAgICAgICAgc2VydmVyU3RhdHVzLnJlbW92ZUNsYXNzKFwidGV4dC1kYW5nZXJcIikuYWRkQ2xhc3MoXCJ0ZXh0LXN1Y2Nlc3NcIik7XG4gICAgICAgICAgICAgICAgb2ZmYnRuLnByb3AoXCJkaXNhYmxlZFwiLCBmYWxzZSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBlbHNle1xuICAgICAgICAgICAgICBzZXJ2ZXJTdGF0dXMucmVtb3ZlQ2xhc3MoXCJ0ZXh0LXN1Y2Nlc3NcIikuYWRkQ2xhc3MoXCJ0ZXh0LWRhbmdlclwiKTtcbiAgICAgICAgICAgICAgICBvbmJ0bi5wcm9wKFwiZGlzYWJsZWRcIiwgZmFsc2UpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgfTtcbiAgICAgICAgICAgICQuYWpheChzZXJ2ZXJTdGF0dXMuYXR0cihcImRhdGEtc3RhdHVzLXVybFwiKSwgc2VsZi5HbG9iYWwucmVxdWVzdE9wdGlvbnMpXG5cbiAgICAgICAgfTtcbiAgICAgICAgJHRoaXMuZ2V0VVJMID0gZnVuY3Rpb24oKXtcbiAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgICAgc3dpdGNoOiBzZWxmLkdsb2JhbC5Sb290VVJMICsgXCJzd2l0Y2hcIlxuICAgICAgICAgICAgfVxuICAgICAgICB9O1xuICAgIH07XG4gICAgc2VsZi5pbml0UmFkaW9Db250cm9sbCA9IG5ldyBmdW5jdGlvbigpe1xuICAgICAgICB2YXIgb25idG4gPSAkKFwiLnJhZGlvLW9uXCIpO1xuICAgICAgICB2YXIgb2ZmYnRuID0gJChcIi5yYWRpby1vZmZcIik7XG4gICAgICAgIG9uYnRuLm9uKFwiY2xpY2tcIiwgZnVuY3Rpb24oKXtcbiAgICAgICAgICAgIG9uYnRuLnByb3AoXCJkaXNhYmxlZFwiLCB0cnVlKTtcbiAgICAgICAgICAgIG9mZmJ0bi5wcm9wKFwiZGlzYWJsZWRcIiwgdHJ1ZSk7XG4gICAgICAgICAgc2VsZi5HbG9iYWwucmVxdWVzdE9wdGlvbnMuZGF0YSA9IHthY3Rpb246IFwib25cIn07XG4gICAgICAgICAgICBzZWxmLkdsb2JhbC5yZXF1ZXN0T3B0aW9ucy50eXBlID0gXCJQT1NUXCI7XG4gICAgICAgICAgICBzZWxmLkdsb2JhbC5yZXF1ZXN0T3B0aW9ucy5zdWNjZXNzID0gc2VsZi5IZWxwZXIuU2VydmVyU3RhdHVzQ2hlY2s7XG4gICAgICAgICAgJC5hamF4KHNlbGYuSGVscGVyLmdldFVSTCgpLnN3aXRjaCwgc2VsZi5HbG9iYWwucmVxdWVzdE9wdGlvbnMpO1xuICAgICAgICB9KTtcbiAgICAgICAgb2ZmYnRuLm9uKFwiY2xpY2tcIiwgZnVuY3Rpb24oKXtcbiAgICAgICAgICAgIG9uYnRuLnByb3AoXCJkaXNhYmxlZFwiLCB0cnVlKTtcbiAgICAgICAgICAgIG9mZmJ0bi5wcm9wKFwiZGlzYWJsZWRcIiwgdHJ1ZSk7XG4gICAgICAgICAgICBzZWxmLkdsb2JhbC5yZXF1ZXN0T3B0aW9ucy5kYXRhID0ge2FjdGlvbjogXCJvZmZcIn07XG4gICAgICAgICAgICBzZWxmLkdsb2JhbC5yZXF1ZXN0T3B0aW9ucy50eXBlID0gXCJQT1NUXCI7XG4gICAgICAgICAgICBzZWxmLkdsb2JhbC5yZXF1ZXN0T3B0aW9ucy5zdWNjZXNzID0gc2VsZi5IZWxwZXIuU2VydmVyU3RhdHVzQ2hlY2s7XG4gICAgICAgICAgICAkLmFqYXgoc2VsZi5IZWxwZXIuZ2V0VVJMKCkuc3dpdGNoLCBzZWxmLkdsb2JhbC5yZXF1ZXN0T3B0aW9ucyk7XG4gICAgICAgIH0pO1xuICAgICAgICAkKFwiLnJhZGlvLXJlZnJlc2hcIikub24oXCJjbGlja1wiLCBmdW5jdGlvbigpe1xuICAgICAgICAgICAgc2VsZi5HbG9iYWwucmVxdWVzdE9wdGlvbnMuZGF0YSA9IHthY3Rpb246IFwicmVmcmVzaFwifTtcbiAgICAgICAgICAgIHNlbGYuR2xvYmFsLnJlcXVlc3RPcHRpb25zLnR5cGUgPSBcIlBPU1RcIjtcbiAgICAgICAgICAgICQuYWpheChzZWxmLkhlbHBlci5nZXRVUkwoKS5zd2l0Y2gsIHNlbGYuR2xvYmFsLnJlcXVlc3RPcHRpb25zKTtcbiAgICAgICAgfSk7XG4gICAgICAgICQoXCIucmFkaW8tbmV4dFwiKS5vbihcImNsaWNrXCIsIGZ1bmN0aW9uKCl7XG4gICAgICAgICAgICBzZWxmLkdsb2JhbC5yZXF1ZXN0T3B0aW9ucy5kYXRhID0ge2FjdGlvbjogXCJuZXh0XCJ9O1xuICAgICAgICAgICAgc2VsZi5HbG9iYWwucmVxdWVzdE9wdGlvbnMudHlwZSA9IFwiUE9TVFwiO1xuICAgICAgICAgICAgJC5hamF4KHNlbGYuSGVscGVyLmdldFVSTCgpLnN3aXRjaCwgc2VsZi5HbG9iYWwucmVxdWVzdE9wdGlvbnMpO1xuICAgICAgICB9KTtcbiAgICAgICAgc2VsZi5IZWxwZXIuU2VydmVyU3RhdHVzQ2hlY2soKTtcbiAgICAgICAgc2V0SW50ZXJ2YWwoc2VsZi5IZWxwZXIuU2VydmVyU3RhdHVzQ2hlY2ssIDUwMDApO1xuICAgIH07XG5cbn07XG5cbiJdLCJmaWxlIjoiZGFzaGJvYXJkL2Jyb2FkY2FzdC5qcyIsInNvdXJjZVJvb3QiOiIvc291cmNlLyJ9
