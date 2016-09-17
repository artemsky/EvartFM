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


//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiIiwic291cmNlcyI6WyJicm9hZGNhc3QuanMiXSwic291cmNlc0NvbnRlbnQiOlsidmFyIEFQUExJQ0FUSU9OID0gQVBQTElDQVRJT04gfHwge307XHJcbkFQUExJQ0FUSU9OLkJyb2FkY2FzdGluZyA9IG5ldyBmdW5jdGlvbigpe1xyXG4gICAgXCJ1c2Ugc3RyaWN0XCI7XHJcbiAgICB2YXIgc2VsZiA9IHRoaXM7XHJcbiAgICBzZWxmLkdsb2JhbCA9IG5ldyBmdW5jdGlvbigpe1xyXG4gICAgICAgIFwidXNlIHN0cmljdFwiO1xyXG4gICAgICAgIHZhciAkdGhpcyA9IHRoaXM7XHJcbiAgICAgICAgJHRoaXMuUm9vdFVSTCA9IFwiYnJvYWRjYXN0L1wiO1xyXG4gICAgICAgICR0aGlzLnJlcXVlc3RPcHRpb25zID0ge1xyXG4gICAgICAgICAgICB0eXBlOiBcIlBPU1RcIixcclxuICAgICAgICAgICAgaGVhZGVyczoge1xyXG4gICAgICAgICAgICAgICAgJ1gtQ1NSRi1UT0tFTic6ICQoJ21ldGFbbmFtZT1cImNzcmYtdG9rZW5cIl0nKS5hdHRyKCdjb250ZW50JylcclxuICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgZXJyb3I6IGZ1bmN0aW9uKHJlc3BvbnNlKXtcclxuICAgICAgICAgICAgICAgIHZhciB3ID0gd2luZG93Lm9wZW4oJycsICc6RXJyb3IgTWVzc2FnZScsICdtZW51YmFyPW5vLCBsb2NhdGlvbj1ubycpO1xyXG4gICAgICAgICAgICAgICAgdy5kb2N1bWVudC53cml0ZShyZXNwb25zZS5yZXNwb25zZVRleHQpO1xyXG4gICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICBzdWNjZXNzOiBmdW5jdGlvbihyZXNwb25zZSl7XHJcbiAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhyZXNwb25zZSk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9O1xyXG4gICAgfTtcclxuICAgIHNlbGYuSGVscGVyID0gbmV3IGZ1bmN0aW9uKCl7XHJcbiAgICAgICAgXCJ1c2Ugc3RyaWN0XCI7XHJcbiAgICAgICAgdmFyICR0aGlzID0gdGhpcztcclxuICAgICAgICAkdGhpcy5pbml0U29ydGFibGUgPSBmdW5jdGlvbih0YXJnZXQsIGhhbmRsZSl7XHJcbiAgICAgICAgICAgIHZhciByZW1vdmVJbnRlbnQgPSBmYWxzZTtcclxuICAgICAgICAgICAgdGFyZ2V0LnNvcnRhYmxlKHtcclxuICAgICAgICAgICAgICAgIGl0ZW1zOiBcIi5pdGVtXCIsXHJcbiAgICAgICAgICAgICAgICBoYW5kbGU6IGhhbmRsZSxcclxuICAgICAgICAgICAgICAgIG9wYWNpdHk6IDAuOCxcclxuICAgICAgICAgICAgICAgIHN0b3A6IGZ1bmN0aW9uKCBldmVudCApIHtcclxuICAgICAgICAgICAgICAgICAgICAkKGV2ZW50LnRhcmdldCkuZmluZChcIi5pdGVtXCIpLmVhY2goZnVuY3Rpb24oaSwgb2JqKXtcclxuICAgICAgICAgICAgICAgICAgICAgICAgJChvYmopLmF0dHIoXCJkYXRhLW9yZGVyXCIsIGkrMSkuYXR0cignY2hhbmdlZCcsICd0cnVlJyk7XHJcbiAgICAgICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgICAgICB9LFxyXG5cclxuICAgICAgICAgICAgICAgIG92ZXI6IGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgICAgICAgICByZW1vdmVJbnRlbnQgPSBmYWxzZTtcclxuICAgICAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgICAgICBvdXQ6IGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgICAgICAgICByZW1vdmVJbnRlbnQgPSB0cnVlO1xyXG4gICAgICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgICAgIGJlZm9yZVN0b3A6IGZ1bmN0aW9uIChldmVudCwgdWkpIHtcclxuICAgICAgICAgICAgICAgICAgICBpZihyZW1vdmVJbnRlbnQgPT0gdHJ1ZSl7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHVpLml0ZW0ucmVtb3ZlKCk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHZhciBpZCA9IHVpLml0ZW0uYXR0cihcImRhdGEtaWRcIik7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHNlbGYuR2xvYmFsLmZvckRlbGV0ZVt0YXJnZXQuc2VsZWN0b3Iuc3Vic3RyaW5nKDExKV0ucHVzaCh1aS5pdGVtLmF0dHIoXCJkYXRhLWlkXCIpKTtcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgIH07XHJcbiAgICAgICAgJHRoaXMuZ2V0VVJMID0gZnVuY3Rpb24oKXtcclxuICAgICAgICAgICAgcmV0dXJuIHtcclxuICAgICAgICAgICAgICAgIHN3aXRjaDogc2VsZi5HbG9iYWwuUm9vdFVSTCArIFwic3dpdGNoXCJcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH07XHJcbiAgICB9O1xyXG4gICAgc2VsZi5pbml0UmFkaW9Db250cm9sbCA9IG5ldyBmdW5jdGlvbigpe1xyXG4gICAgICAgICQoXCIucmFkaW8tb25cIikub24oXCJjbGlja1wiLCBmdW5jdGlvbigpe1xyXG4gICAgICAgICAgc2VsZi5HbG9iYWwucmVxdWVzdE9wdGlvbnMuZGF0YSA9IHthY3Rpb246IFwib25cIn07XHJcbiAgICAgICAgICAkLmFqYXgoc2VsZi5IZWxwZXIuZ2V0VVJMKCkuc3dpdGNoLCBzZWxmLkdsb2JhbC5yZXF1ZXN0T3B0aW9ucyk7XHJcbiAgICAgICAgfSk7XHJcbiAgICAgICAgJChcIi5yYWRpby1vZmZcIikub24oXCJjbGlja1wiLCBmdW5jdGlvbigpe1xyXG4gICAgICAgICAgICBzZWxmLkdsb2JhbC5yZXF1ZXN0T3B0aW9ucy5kYXRhID0ge2FjdGlvbjogXCJvZmZcIn07XHJcbiAgICAgICAgICAgICQuYWpheChzZWxmLkhlbHBlci5nZXRVUkwoKS5zd2l0Y2gsIHNlbGYuR2xvYmFsLnJlcXVlc3RPcHRpb25zKTtcclxuICAgICAgICB9KTtcclxuICAgICAgICAkKFwiLnJhZGlvLXJlZnJlc2hcIikub24oXCJjbGlja1wiLCBmdW5jdGlvbigpe1xyXG4gICAgICAgICAgICBzZWxmLkdsb2JhbC5yZXF1ZXN0T3B0aW9ucy5kYXRhID0ge2FjdGlvbjogXCJyZWZyZXNoXCJ9O1xyXG4gICAgICAgICAgICAkLmFqYXgoc2VsZi5IZWxwZXIuZ2V0VVJMKCkuc3dpdGNoLCBzZWxmLkdsb2JhbC5yZXF1ZXN0T3B0aW9ucyk7XHJcbiAgICAgICAgfSk7XHJcbiAgICB9O1xyXG5cclxufTtcclxuXHJcbiJdLCJmaWxlIjoiYnJvYWRjYXN0LmpzIiwic291cmNlUm9vdCI6Ii9zb3VyY2UvIn0=
