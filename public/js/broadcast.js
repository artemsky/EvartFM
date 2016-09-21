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


//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiIiwic291cmNlcyI6WyJicm9hZGNhc3QuanMiXSwic291cmNlc0NvbnRlbnQiOlsidmFyIEFQUExJQ0FUSU9OID0gQVBQTElDQVRJT04gfHwge307XHJcbkFQUExJQ0FUSU9OLkJyb2FkY2FzdGluZyA9IG5ldyBmdW5jdGlvbigpe1xyXG4gICAgXCJ1c2Ugc3RyaWN0XCI7XHJcbiAgICB2YXIgc2VsZiA9IHRoaXM7XHJcbiAgICBzZWxmLkdsb2JhbCA9IG5ldyBmdW5jdGlvbigpe1xyXG4gICAgICAgIFwidXNlIHN0cmljdFwiO1xyXG4gICAgICAgIHZhciAkdGhpcyA9IHRoaXM7XHJcbiAgICAgICAgJHRoaXMuUm9vdFVSTCA9IFwiYnJvYWRjYXN0L1wiO1xyXG4gICAgICAgICR0aGlzLnJlcXVlc3RPcHRpb25zID0ge1xyXG4gICAgICAgICAgICB0eXBlOiBcIlBPU1RcIixcclxuICAgICAgICAgICAgaGVhZGVyczoge1xyXG4gICAgICAgICAgICAgICAgJ1gtQ1NSRi1UT0tFTic6ICQoJ21ldGFbbmFtZT1cImNzcmYtdG9rZW5cIl0nKS5hdHRyKCdjb250ZW50JylcclxuICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgZXJyb3I6IGZ1bmN0aW9uKHJlc3BvbnNlKXtcclxuICAgICAgICAgICAgICAgIHZhciB3ID0gd2luZG93Lm9wZW4oJycsICc6RXJyb3IgTWVzc2FnZScsICdtZW51YmFyPW5vLCBsb2NhdGlvbj1ubycpO1xyXG4gICAgICAgICAgICAgICAgdy5kb2N1bWVudC53cml0ZShyZXNwb25zZS5yZXNwb25zZVRleHQpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfTtcclxuICAgIH07XHJcbiAgICBzZWxmLkhlbHBlciA9IG5ldyBmdW5jdGlvbigpe1xyXG4gICAgICAgIFwidXNlIHN0cmljdFwiO1xyXG4gICAgICAgIHZhciAkdGhpcyA9IHRoaXM7XHJcbiAgICAgICAgJHRoaXMuaW5pdFNvcnRhYmxlID0gZnVuY3Rpb24odGFyZ2V0LCBoYW5kbGUpe1xyXG4gICAgICAgICAgICB2YXIgcmVtb3ZlSW50ZW50ID0gZmFsc2U7XHJcbiAgICAgICAgICAgIHRhcmdldC5zb3J0YWJsZSh7XHJcbiAgICAgICAgICAgICAgICBpdGVtczogXCIuaXRlbVwiLFxyXG4gICAgICAgICAgICAgICAgaGFuZGxlOiBoYW5kbGUsXHJcbiAgICAgICAgICAgICAgICBvcGFjaXR5OiAwLjgsXHJcbiAgICAgICAgICAgICAgICBzdG9wOiBmdW5jdGlvbiggZXZlbnQgKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgJChldmVudC50YXJnZXQpLmZpbmQoXCIuaXRlbVwiKS5lYWNoKGZ1bmN0aW9uKGksIG9iail7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICQob2JqKS5hdHRyKFwiZGF0YS1vcmRlclwiLCBpKzEpLmF0dHIoJ2NoYW5nZWQnLCAndHJ1ZScpO1xyXG4gICAgICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICAgICAgfSxcclxuXHJcbiAgICAgICAgICAgICAgICBvdmVyOiBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgcmVtb3ZlSW50ZW50ID0gZmFsc2U7XHJcbiAgICAgICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICAgICAgb3V0OiBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgcmVtb3ZlSW50ZW50ID0gdHJ1ZTtcclxuICAgICAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgICAgICBiZWZvcmVTdG9wOiBmdW5jdGlvbiAoZXZlbnQsIHVpKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgaWYocmVtb3ZlSW50ZW50ID09IHRydWUpe1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB1aS5pdGVtLnJlbW92ZSgpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB2YXIgaWQgPSB1aS5pdGVtLmF0dHIoXCJkYXRhLWlkXCIpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBzZWxmLkdsb2JhbC5mb3JEZWxldGVbdGFyZ2V0LnNlbGVjdG9yLnN1YnN0cmluZygxMSldLnB1c2godWkuaXRlbS5hdHRyKFwiZGF0YS1pZFwiKSk7XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICB9O1xyXG4gICAgICAgICR0aGlzLlNlcnZlclN0YXR1c0NoZWNrID0gZnVuY3Rpb24oKXtcclxuICAgICAgICAgICAgdmFyIHNlcnZlclN0YXR1cyA9ICQoXCIjc2VydmVyU3RhdHVzXCIpO1xyXG4gICAgICAgICAgICB2YXIgb25idG4gPSAkKFwiLnJhZGlvLW9uXCIpO1xyXG4gICAgICAgICAgICB2YXIgb2ZmYnRuID0gJChcIi5yYWRpby1vZmZcIik7XHJcbiAgICAgICAgICAgIHNlbGYuR2xvYmFsLnJlcXVlc3RPcHRpb25zLnR5cGUgPSBcIkdFVFwiO1xyXG4gICAgICAgICAgICBzZWxmLkdsb2JhbC5yZXF1ZXN0T3B0aW9ucy5zdWNjZXNzID0gZnVuY3Rpb24ocmVzcG9uc2Upe1xyXG4gICAgICAgICAgICBpZihyZXNwb25zZSl7XHJcbiAgICAgICAgICAgICAgc2VydmVyU3RhdHVzLnJlbW92ZUNsYXNzKFwidGV4dC1kYW5nZXJcIikuYWRkQ2xhc3MoXCJ0ZXh0LXN1Y2Nlc3NcIik7XHJcbiAgICAgICAgICAgICAgICBvZmZidG4ucHJvcChcImRpc2FibGVkXCIsIGZhbHNlKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBlbHNle1xyXG4gICAgICAgICAgICAgIHNlcnZlclN0YXR1cy5yZW1vdmVDbGFzcyhcInRleHQtc3VjY2Vzc1wiKS5hZGRDbGFzcyhcInRleHQtZGFuZ2VyXCIpO1xyXG4gICAgICAgICAgICAgICAgb25idG4ucHJvcChcImRpc2FibGVkXCIsIGZhbHNlKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9O1xyXG4gICAgICAgICAgICAkLmFqYXgoc2VydmVyU3RhdHVzLmF0dHIoXCJkYXRhLXN0YXR1cy11cmxcIiksIHNlbGYuR2xvYmFsLnJlcXVlc3RPcHRpb25zKVxyXG5cclxuICAgICAgICB9O1xyXG4gICAgICAgICR0aGlzLmdldFVSTCA9IGZ1bmN0aW9uKCl7XHJcbiAgICAgICAgICAgIHJldHVybiB7XHJcbiAgICAgICAgICAgICAgICBzd2l0Y2g6IHNlbGYuR2xvYmFsLlJvb3RVUkwgKyBcInN3aXRjaFwiXHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9O1xyXG4gICAgfTtcclxuICAgIHNlbGYuaW5pdFJhZGlvQ29udHJvbGwgPSBuZXcgZnVuY3Rpb24oKXtcclxuICAgICAgICB2YXIgb25idG4gPSAkKFwiLnJhZGlvLW9uXCIpO1xyXG4gICAgICAgIHZhciBvZmZidG4gPSAkKFwiLnJhZGlvLW9mZlwiKTtcclxuICAgICAgICBvbmJ0bi5vbihcImNsaWNrXCIsIGZ1bmN0aW9uKCl7XHJcbiAgICAgICAgICAgIG9uYnRuLnByb3AoXCJkaXNhYmxlZFwiLCB0cnVlKTtcclxuICAgICAgICAgICAgb2ZmYnRuLnByb3AoXCJkaXNhYmxlZFwiLCB0cnVlKTtcclxuICAgICAgICAgIHNlbGYuR2xvYmFsLnJlcXVlc3RPcHRpb25zLmRhdGEgPSB7YWN0aW9uOiBcIm9uXCJ9O1xyXG4gICAgICAgICAgICBzZWxmLkdsb2JhbC5yZXF1ZXN0T3B0aW9ucy50eXBlID0gXCJQT1NUXCI7XHJcbiAgICAgICAgICAgIHNlbGYuR2xvYmFsLnJlcXVlc3RPcHRpb25zLnN1Y2Nlc3MgPSBzZWxmLkhlbHBlci5TZXJ2ZXJTdGF0dXNDaGVjaztcclxuICAgICAgICAgICQuYWpheChzZWxmLkhlbHBlci5nZXRVUkwoKS5zd2l0Y2gsIHNlbGYuR2xvYmFsLnJlcXVlc3RPcHRpb25zKTtcclxuICAgICAgICB9KTtcclxuICAgICAgICBvZmZidG4ub24oXCJjbGlja1wiLCBmdW5jdGlvbigpe1xyXG4gICAgICAgICAgICBvbmJ0bi5wcm9wKFwiZGlzYWJsZWRcIiwgdHJ1ZSk7XHJcbiAgICAgICAgICAgIG9mZmJ0bi5wcm9wKFwiZGlzYWJsZWRcIiwgdHJ1ZSk7XHJcbiAgICAgICAgICAgIHNlbGYuR2xvYmFsLnJlcXVlc3RPcHRpb25zLmRhdGEgPSB7YWN0aW9uOiBcIm9mZlwifTtcclxuICAgICAgICAgICAgc2VsZi5HbG9iYWwucmVxdWVzdE9wdGlvbnMudHlwZSA9IFwiUE9TVFwiO1xyXG4gICAgICAgICAgICBzZWxmLkdsb2JhbC5yZXF1ZXN0T3B0aW9ucy5zdWNjZXNzID0gc2VsZi5IZWxwZXIuU2VydmVyU3RhdHVzQ2hlY2s7XHJcbiAgICAgICAgICAgICQuYWpheChzZWxmLkhlbHBlci5nZXRVUkwoKS5zd2l0Y2gsIHNlbGYuR2xvYmFsLnJlcXVlc3RPcHRpb25zKTtcclxuICAgICAgICB9KTtcclxuICAgICAgICAkKFwiLnJhZGlvLXJlZnJlc2hcIikub24oXCJjbGlja1wiLCBmdW5jdGlvbigpe1xyXG4gICAgICAgICAgICBzZWxmLkdsb2JhbC5yZXF1ZXN0T3B0aW9ucy5kYXRhID0ge2FjdGlvbjogXCJyZWZyZXNoXCJ9O1xyXG4gICAgICAgICAgICBzZWxmLkdsb2JhbC5yZXF1ZXN0T3B0aW9ucy50eXBlID0gXCJQT1NUXCI7XHJcbiAgICAgICAgICAgICQuYWpheChzZWxmLkhlbHBlci5nZXRVUkwoKS5zd2l0Y2gsIHNlbGYuR2xvYmFsLnJlcXVlc3RPcHRpb25zKTtcclxuICAgICAgICB9KTtcclxuICAgICAgICBzZWxmLkhlbHBlci5TZXJ2ZXJTdGF0dXNDaGVjaygpO1xyXG4gICAgICAgIHNldEludGVydmFsKHNlbGYuSGVscGVyLlNlcnZlclN0YXR1c0NoZWNrLCA1MDAwKTtcclxuICAgIH07XHJcblxyXG59O1xyXG5cclxuIl0sImZpbGUiOiJicm9hZGNhc3QuanMiLCJzb3VyY2VSb290IjoiL3NvdXJjZS8ifQ==
