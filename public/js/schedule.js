(function(){
    "use strict";

    //Set underscore template setting as {{%%}} for better code reading
    _.templateSettings = {
        evaluate    : /\{\{%([\s\S]+?)%\}\}/g,
        interpolate : /\{\{%=([\s\S]+?)%\}\}/g,
        escape      : /\{\{%-([\s\S]+?)%\}\}/g
    };
    //Set moment locale
    moment.locale("en-gb");

    //Init storage helpers
    var storage = {
        disk: sessionStorage || localStorage,
        target: {
            name: null,
            object: null,
            repeat: false
        },
        'get': function(key){
            if(!this.disk.getItem(key))
              return null;
            this.target.object = JSON.parse(this.disk.getItem(key));
            this.target.name = key;
            return this;
        },
        'set': function(key, value){
            this.disk.setItem(key, JSON.stringify(value));
            this.target.name = key;
            return this;
        },
        whereDate: function(date){
            if(!date)
                return null;
            for(var i in this.target.object)
                if(this.target.object[i].date.substring(0,10) == date){
                    this.target.object = [this.target.object[i]];
                    return this;
                }
            this.target.object = [];
            return this;
        },
        repeat: function(){
            this.target.repeat = true;
            return this;
        },
        result: function(){
            if(!this.target.repeat)
                return this.target.object;
            var result = [];
            for(var i in this.target.object)
                result.push(this.target.object[i].repeat);
            return result;
        }
    };

    //events
    var events = [];
    var onEventsSuccess = function(response){
            $("#fountainTextG").hide();
            initCalendar(response);
            storage.set('events', events);
        },
        onEventsError = function (response){
            $("#fountainTextG").hide();
            console.log(response);
        };
    var requestOptions = {
        type: "GET",
        cache: false,
        success: onEventsSuccess,
        error: onEventsError
    };
    $.ajax('schedule/events', requestOptions);
    
    //!events

    //read events template
    var dayEventsTemplate = $('#day-events').html();

    //Init calendar
    var initCalendar = function(events){
        var clndr = $('#full-clndr').clndr({
            template: $('#full-clndr-template').html(),
            events: events,
            clickEvents: {
                click: function (target) {
                    var template = _.template(dayEventsTemplate);
                    $(".day-events")
                        .mCustomScrollbar("destroy")
                        .html(template({eventsThisDay: target.events}))
                        .height( $(".clndr-grid .days").height() - $(".clndr-grid .days-of-the-week").height() )
                        .mCustomScrollbar({
                            scrollButtons:{enable:true},
                            theme:"minimal-dark"
                        });

                },
                onMonthChange: function () {
                    this.options.ready();
                }
            },
            forceSixRows: true,
            multiDayEvents: {
                singleDay: 'date',
                endDate: 'endDate',
                startDate: 'startDate'
            },
            showAdjacentMonths: true,
            adjacentDaysChangeMonth: false,
            trackSelectedDate: true,
            daysOfTheWeek: (function(){
                var result = [];
                for (var i = 0; i < 7; i++) {
                    result.push(moment().weekday(i).format('ddd'));
                }
                return result;
            })(),
            ready: function(){ //ready
                var eventListingTitle = $(".event-listing-title");
                //Init block Open/Close event
                eventListingTitle.on("click", ".glyphicon-chevron-up, .glyphicon-chevron-down", function(){
                    var el = {};
                    var block = {
                        open: "glyphicon-chevron-up",
                        close: "glyphicon-chevron-down"
                    };
                    var $this = $(this);
                    if($this.parent().hasClass("month-title"))
                        el = $(".day-title [class *=glyphicon-chevron]").eq(0);
                    else
                        el = $(".month-title [class *=glyphicon-chevron]").eq(0);

                    if(el.hasClass(block.open))
                        el.removeClass(block.open).addClass(block.close);
                    else
                        el.removeClass(block.close).addClass(block.open);

                    if($this.hasClass(block.open))
                        $this.removeClass(block.open).addClass(block.close);
                    else
                        $this.removeClass(block.close).addClass(block.open);

                    $(".event-items, .day-events").slideToggle();

                });

                //Init modal window
                var modal = $("#modal");
                var datetimepickerOptions = {
                    step: 30
                };
                var datetimePickerInit = function(options){
                    var dtPicker = $('#datetimepicker');
                    $('#repeat-day').iCheck('uncheck')
                        .iCheck({
                            checkboxClass: 'icheckbox_square-blue',
                            radioClass: 'iradio_square-blue',
                            increaseArea: '20%', // optional
                        }).on("ifUnchecked", function(){
                        dtPicker
                            .datetimepicker('destroy')
                            .datetimepicker();
                    }).on("ifChecked", function(){
                        dtPicker
                            .datetimepicker('destroy')
                            .datetimepicker({
                                datepicker:false,
                                format:'H:i'
                            });
                    });
                    dtPicker
                        .datetimepicker('destroy')
                        .datetimepicker(options);

                    var repeatOn = $("#repeat-on");
                    repeatOn.hide();
                    $('#repeat-month').iCheck('uncheck')
                        .iCheck({
                            checkboxClass: 'icheckbox_square-blue',
                            radioClass: 'iradio_square-blue',
                            increaseArea: '20%', // optional
                        }).on("ifUnchecked", function(){
                            repeatOn.hide();
                        }).on("ifChecked", function(){
                            $("[id*='repeat-on-']").iCheck({
                                checkboxClass: 'icheckbox_square-blue',
                                radioClass: 'iradio_square-blue',
                                increaseArea: '20%', // optional
                            });
                            repeatOn.show();
                        });
                        modal.modal('show');
                };

                //Init modal window "Edit event"
                $(".event-listing").on('click', '.event-item', function(){
                    modal.find("form").get(0).reset();
                    modal.find(".modal-title").text("Edit event");

                    datetimepickerOptions.value = $(this).find(".event-item-time").attr("data-datetime");
                    modal.find("#Title").val($(this).find(".event-item-name").text());
                    modal.find("#Description").val($(this).find(".event-item-location").text());

                    datetimePickerInit(datetimepickerOptions);
                });

                //Init modal window "Add event"
                eventListingTitle.on("click", ".glyphicon-plus", function(){
                    modal.find("form").get(0).reset();
                    modal.find(".modal-title").text("Add event");

                    if($(this).parent().hasClass("day-title")){
                        datetimepickerOptions.value = (function(){
                            var time = " " + moment().format("HH:mm");
                            var el = $(clndr.element).find(".selected");
                            if(el.length > 0)
                                return el.attr("data-id") + time;
                            else
                                return $(clndr.element).find("today").attr("data-id") + time;
                        })();
                    }

                    datetimePickerInit(datetimepickerOptions);
                });

                var calendar = $(".clndr");
                calendar.height(calendar.height());

            },//!ready
            doneRendering: function(){ //doneRendering
                $(".day-events")
                    .height( $(".clndr-grid .days").height() - $(".clndr-grid .days-of-the-week").height() )
                    .mCustomScrollbar({
                        scrollButtons:{enable:true},
                        theme:"minimal-dark"
                    });
                var calendar = $("#full-clndr");
                if(calendar.find(".today").length > 0)
                    calendar.find(".today").click();
                else
                    calendar.find(".day").eq(0).click();

            }//!doneRendering
        });
    };

})();
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiIiwic291cmNlcyI6WyJzY2hlZHVsZS5qcyJdLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24oKXtcclxuICAgIFwidXNlIHN0cmljdFwiO1xyXG5cclxuICAgIC8vU2V0IHVuZGVyc2NvcmUgdGVtcGxhdGUgc2V0dGluZyBhcyB7eyUlfX0gZm9yIGJldHRlciBjb2RlIHJlYWRpbmdcclxuICAgIF8udGVtcGxhdGVTZXR0aW5ncyA9IHtcclxuICAgICAgICBldmFsdWF0ZSAgICA6IC9cXHtcXHslKFtcXHNcXFNdKz8pJVxcfVxcfS9nLFxyXG4gICAgICAgIGludGVycG9sYXRlIDogL1xce1xceyU9KFtcXHNcXFNdKz8pJVxcfVxcfS9nLFxyXG4gICAgICAgIGVzY2FwZSAgICAgIDogL1xce1xceyUtKFtcXHNcXFNdKz8pJVxcfVxcfS9nXHJcbiAgICB9O1xyXG4gICAgLy9TZXQgbW9tZW50IGxvY2FsZVxyXG4gICAgbW9tZW50LmxvY2FsZShcImVuLWdiXCIpO1xyXG5cclxuICAgIC8vSW5pdCBzdG9yYWdlIGhlbHBlcnNcclxuICAgIHZhciBzdG9yYWdlID0ge1xyXG4gICAgICAgIGRpc2s6IHNlc3Npb25TdG9yYWdlIHx8IGxvY2FsU3RvcmFnZSxcclxuICAgICAgICB0YXJnZXQ6IHtcclxuICAgICAgICAgICAgbmFtZTogbnVsbCxcclxuICAgICAgICAgICAgb2JqZWN0OiBudWxsLFxyXG4gICAgICAgICAgICByZXBlYXQ6IGZhbHNlXHJcbiAgICAgICAgfSxcclxuICAgICAgICAnZ2V0JzogZnVuY3Rpb24oa2V5KXtcclxuICAgICAgICAgICAgaWYoIXRoaXMuZGlzay5nZXRJdGVtKGtleSkpXHJcbiAgICAgICAgICAgICAgcmV0dXJuIG51bGw7XHJcbiAgICAgICAgICAgIHRoaXMudGFyZ2V0Lm9iamVjdCA9IEpTT04ucGFyc2UodGhpcy5kaXNrLmdldEl0ZW0oa2V5KSk7XHJcbiAgICAgICAgICAgIHRoaXMudGFyZ2V0Lm5hbWUgPSBrZXk7XHJcbiAgICAgICAgICAgIHJldHVybiB0aGlzO1xyXG4gICAgICAgIH0sXHJcbiAgICAgICAgJ3NldCc6IGZ1bmN0aW9uKGtleSwgdmFsdWUpe1xyXG4gICAgICAgICAgICB0aGlzLmRpc2suc2V0SXRlbShrZXksIEpTT04uc3RyaW5naWZ5KHZhbHVlKSk7XHJcbiAgICAgICAgICAgIHRoaXMudGFyZ2V0Lm5hbWUgPSBrZXk7XHJcbiAgICAgICAgICAgIHJldHVybiB0aGlzO1xyXG4gICAgICAgIH0sXHJcbiAgICAgICAgd2hlcmVEYXRlOiBmdW5jdGlvbihkYXRlKXtcclxuICAgICAgICAgICAgaWYoIWRhdGUpXHJcbiAgICAgICAgICAgICAgICByZXR1cm4gbnVsbDtcclxuICAgICAgICAgICAgZm9yKHZhciBpIGluIHRoaXMudGFyZ2V0Lm9iamVjdClcclxuICAgICAgICAgICAgICAgIGlmKHRoaXMudGFyZ2V0Lm9iamVjdFtpXS5kYXRlLnN1YnN0cmluZygwLDEwKSA9PSBkYXRlKXtcclxuICAgICAgICAgICAgICAgICAgICB0aGlzLnRhcmdldC5vYmplY3QgPSBbdGhpcy50YXJnZXQub2JqZWN0W2ldXTtcclxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gdGhpcztcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgdGhpcy50YXJnZXQub2JqZWN0ID0gW107XHJcbiAgICAgICAgICAgIHJldHVybiB0aGlzO1xyXG4gICAgICAgIH0sXHJcbiAgICAgICAgcmVwZWF0OiBmdW5jdGlvbigpe1xyXG4gICAgICAgICAgICB0aGlzLnRhcmdldC5yZXBlYXQgPSB0cnVlO1xyXG4gICAgICAgICAgICByZXR1cm4gdGhpcztcclxuICAgICAgICB9LFxyXG4gICAgICAgIHJlc3VsdDogZnVuY3Rpb24oKXtcclxuICAgICAgICAgICAgaWYoIXRoaXMudGFyZ2V0LnJlcGVhdClcclxuICAgICAgICAgICAgICAgIHJldHVybiB0aGlzLnRhcmdldC5vYmplY3Q7XHJcbiAgICAgICAgICAgIHZhciByZXN1bHQgPSBbXTtcclxuICAgICAgICAgICAgZm9yKHZhciBpIGluIHRoaXMudGFyZ2V0Lm9iamVjdClcclxuICAgICAgICAgICAgICAgIHJlc3VsdC5wdXNoKHRoaXMudGFyZ2V0Lm9iamVjdFtpXS5yZXBlYXQpO1xyXG4gICAgICAgICAgICByZXR1cm4gcmVzdWx0O1xyXG4gICAgICAgIH1cclxuICAgIH07XHJcblxyXG4gICAgLy9ldmVudHNcclxuICAgIHZhciBldmVudHMgPSBbXTtcclxuICAgIHZhciBvbkV2ZW50c1N1Y2Nlc3MgPSBmdW5jdGlvbihyZXNwb25zZSl7XHJcbiAgICAgICAgICAgICQoXCIjZm91bnRhaW5UZXh0R1wiKS5oaWRlKCk7XHJcbiAgICAgICAgICAgIGluaXRDYWxlbmRhcihyZXNwb25zZSk7XHJcbiAgICAgICAgICAgIHN0b3JhZ2Uuc2V0KCdldmVudHMnLCBldmVudHMpO1xyXG4gICAgICAgIH0sXHJcbiAgICAgICAgb25FdmVudHNFcnJvciA9IGZ1bmN0aW9uIChyZXNwb25zZSl7XHJcbiAgICAgICAgICAgICQoXCIjZm91bnRhaW5UZXh0R1wiKS5oaWRlKCk7XHJcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKHJlc3BvbnNlKTtcclxuICAgICAgICB9O1xyXG4gICAgdmFyIHJlcXVlc3RPcHRpb25zID0ge1xyXG4gICAgICAgIHR5cGU6IFwiR0VUXCIsXHJcbiAgICAgICAgY2FjaGU6IGZhbHNlLFxyXG4gICAgICAgIHN1Y2Nlc3M6IG9uRXZlbnRzU3VjY2VzcyxcclxuICAgICAgICBlcnJvcjogb25FdmVudHNFcnJvclxyXG4gICAgfTtcclxuICAgICQuYWpheCgnc2NoZWR1bGUvZXZlbnRzJywgcmVxdWVzdE9wdGlvbnMpO1xyXG4gICAgXHJcbiAgICAvLyFldmVudHNcclxuXHJcbiAgICAvL3JlYWQgZXZlbnRzIHRlbXBsYXRlXHJcbiAgICB2YXIgZGF5RXZlbnRzVGVtcGxhdGUgPSAkKCcjZGF5LWV2ZW50cycpLmh0bWwoKTtcclxuXHJcbiAgICAvL0luaXQgY2FsZW5kYXJcclxuICAgIHZhciBpbml0Q2FsZW5kYXIgPSBmdW5jdGlvbihldmVudHMpe1xyXG4gICAgICAgIHZhciBjbG5kciA9ICQoJyNmdWxsLWNsbmRyJykuY2xuZHIoe1xyXG4gICAgICAgICAgICB0ZW1wbGF0ZTogJCgnI2Z1bGwtY2xuZHItdGVtcGxhdGUnKS5odG1sKCksXHJcbiAgICAgICAgICAgIGV2ZW50czogZXZlbnRzLFxyXG4gICAgICAgICAgICBjbGlja0V2ZW50czoge1xyXG4gICAgICAgICAgICAgICAgY2xpY2s6IGZ1bmN0aW9uICh0YXJnZXQpIHtcclxuICAgICAgICAgICAgICAgICAgICB2YXIgdGVtcGxhdGUgPSBfLnRlbXBsYXRlKGRheUV2ZW50c1RlbXBsYXRlKTtcclxuICAgICAgICAgICAgICAgICAgICAkKFwiLmRheS1ldmVudHNcIilcclxuICAgICAgICAgICAgICAgICAgICAgICAgLm1DdXN0b21TY3JvbGxiYXIoXCJkZXN0cm95XCIpXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIC5odG1sKHRlbXBsYXRlKHtldmVudHNUaGlzRGF5OiB0YXJnZXQuZXZlbnRzfSkpXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIC5oZWlnaHQoICQoXCIuY2xuZHItZ3JpZCAuZGF5c1wiKS5oZWlnaHQoKSAtICQoXCIuY2xuZHItZ3JpZCAuZGF5cy1vZi10aGUtd2Vla1wiKS5oZWlnaHQoKSApXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIC5tQ3VzdG9tU2Nyb2xsYmFyKHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHNjcm9sbEJ1dHRvbnM6e2VuYWJsZTp0cnVlfSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRoZW1lOlwibWluaW1hbC1kYXJrXCJcclxuICAgICAgICAgICAgICAgICAgICAgICAgfSk7XHJcblxyXG4gICAgICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgICAgIG9uTW9udGhDaGFuZ2U6IGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgICAgICAgICB0aGlzLm9wdGlvbnMucmVhZHkoKTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgZm9yY2VTaXhSb3dzOiB0cnVlLFxyXG4gICAgICAgICAgICBtdWx0aURheUV2ZW50czoge1xyXG4gICAgICAgICAgICAgICAgc2luZ2xlRGF5OiAnZGF0ZScsXHJcbiAgICAgICAgICAgICAgICBlbmREYXRlOiAnZW5kRGF0ZScsXHJcbiAgICAgICAgICAgICAgICBzdGFydERhdGU6ICdzdGFydERhdGUnXHJcbiAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgIHNob3dBZGphY2VudE1vbnRoczogdHJ1ZSxcclxuICAgICAgICAgICAgYWRqYWNlbnREYXlzQ2hhbmdlTW9udGg6IGZhbHNlLFxyXG4gICAgICAgICAgICB0cmFja1NlbGVjdGVkRGF0ZTogdHJ1ZSxcclxuICAgICAgICAgICAgZGF5c09mVGhlV2VlazogKGZ1bmN0aW9uKCl7XHJcbiAgICAgICAgICAgICAgICB2YXIgcmVzdWx0ID0gW107XHJcbiAgICAgICAgICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IDc7IGkrKykge1xyXG4gICAgICAgICAgICAgICAgICAgIHJlc3VsdC5wdXNoKG1vbWVudCgpLndlZWtkYXkoaSkuZm9ybWF0KCdkZGQnKSk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gcmVzdWx0O1xyXG4gICAgICAgICAgICB9KSgpLFxyXG4gICAgICAgICAgICByZWFkeTogZnVuY3Rpb24oKXsgLy9yZWFkeVxyXG4gICAgICAgICAgICAgICAgdmFyIGV2ZW50TGlzdGluZ1RpdGxlID0gJChcIi5ldmVudC1saXN0aW5nLXRpdGxlXCIpO1xyXG4gICAgICAgICAgICAgICAgLy9Jbml0IGJsb2NrIE9wZW4vQ2xvc2UgZXZlbnRcclxuICAgICAgICAgICAgICAgIGV2ZW50TGlzdGluZ1RpdGxlLm9uKFwiY2xpY2tcIiwgXCIuZ2x5cGhpY29uLWNoZXZyb24tdXAsIC5nbHlwaGljb24tY2hldnJvbi1kb3duXCIsIGZ1bmN0aW9uKCl7XHJcbiAgICAgICAgICAgICAgICAgICAgdmFyIGVsID0ge307XHJcbiAgICAgICAgICAgICAgICAgICAgdmFyIGJsb2NrID0ge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBvcGVuOiBcImdseXBoaWNvbi1jaGV2cm9uLXVwXCIsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGNsb3NlOiBcImdseXBoaWNvbi1jaGV2cm9uLWRvd25cIlxyXG4gICAgICAgICAgICAgICAgICAgIH07XHJcbiAgICAgICAgICAgICAgICAgICAgdmFyICR0aGlzID0gJCh0aGlzKTtcclxuICAgICAgICAgICAgICAgICAgICBpZigkdGhpcy5wYXJlbnQoKS5oYXNDbGFzcyhcIm1vbnRoLXRpdGxlXCIpKVxyXG4gICAgICAgICAgICAgICAgICAgICAgICBlbCA9ICQoXCIuZGF5LXRpdGxlIFtjbGFzcyAqPWdseXBoaWNvbi1jaGV2cm9uXVwiKS5lcSgwKTtcclxuICAgICAgICAgICAgICAgICAgICBlbHNlXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGVsID0gJChcIi5tb250aC10aXRsZSBbY2xhc3MgKj1nbHlwaGljb24tY2hldnJvbl1cIikuZXEoMCk7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgIGlmKGVsLmhhc0NsYXNzKGJsb2NrLm9wZW4pKVxyXG4gICAgICAgICAgICAgICAgICAgICAgICBlbC5yZW1vdmVDbGFzcyhibG9jay5vcGVuKS5hZGRDbGFzcyhibG9jay5jbG9zZSk7XHJcbiAgICAgICAgICAgICAgICAgICAgZWxzZVxyXG4gICAgICAgICAgICAgICAgICAgICAgICBlbC5yZW1vdmVDbGFzcyhibG9jay5jbG9zZSkuYWRkQ2xhc3MoYmxvY2sub3Blbik7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgIGlmKCR0aGlzLmhhc0NsYXNzKGJsb2NrLm9wZW4pKVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAkdGhpcy5yZW1vdmVDbGFzcyhibG9jay5vcGVuKS5hZGRDbGFzcyhibG9jay5jbG9zZSk7XHJcbiAgICAgICAgICAgICAgICAgICAgZWxzZVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAkdGhpcy5yZW1vdmVDbGFzcyhibG9jay5jbG9zZSkuYWRkQ2xhc3MoYmxvY2sub3Blbik7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgICQoXCIuZXZlbnQtaXRlbXMsIC5kYXktZXZlbnRzXCIpLnNsaWRlVG9nZ2xlKCk7XHJcblxyXG4gICAgICAgICAgICAgICAgfSk7XHJcblxyXG4gICAgICAgICAgICAgICAgLy9Jbml0IG1vZGFsIHdpbmRvd1xyXG4gICAgICAgICAgICAgICAgdmFyIG1vZGFsID0gJChcIiNtb2RhbFwiKTtcclxuICAgICAgICAgICAgICAgIHZhciBkYXRldGltZXBpY2tlck9wdGlvbnMgPSB7XHJcbiAgICAgICAgICAgICAgICAgICAgc3RlcDogMzBcclxuICAgICAgICAgICAgICAgIH07XHJcbiAgICAgICAgICAgICAgICB2YXIgZGF0ZXRpbWVQaWNrZXJJbml0ID0gZnVuY3Rpb24ob3B0aW9ucyl7XHJcbiAgICAgICAgICAgICAgICAgICAgdmFyIGR0UGlja2VyID0gJCgnI2RhdGV0aW1lcGlja2VyJyk7XHJcbiAgICAgICAgICAgICAgICAgICAgJCgnI3JlcGVhdC1kYXknKS5pQ2hlY2soJ3VuY2hlY2snKVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAuaUNoZWNrKHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNoZWNrYm94Q2xhc3M6ICdpY2hlY2tib3hfc3F1YXJlLWJsdWUnLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcmFkaW9DbGFzczogJ2lyYWRpb19zcXVhcmUtYmx1ZScsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpbmNyZWFzZUFyZWE6ICcyMCUnLCAvLyBvcHRpb25hbFxyXG4gICAgICAgICAgICAgICAgICAgICAgICB9KS5vbihcImlmVW5jaGVja2VkXCIsIGZ1bmN0aW9uKCl7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGR0UGlja2VyXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAuZGF0ZXRpbWVwaWNrZXIoJ2Rlc3Ryb3knKVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgLmRhdGV0aW1lcGlja2VyKCk7XHJcbiAgICAgICAgICAgICAgICAgICAgfSkub24oXCJpZkNoZWNrZWRcIiwgZnVuY3Rpb24oKXtcclxuICAgICAgICAgICAgICAgICAgICAgICAgZHRQaWNrZXJcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIC5kYXRldGltZXBpY2tlcignZGVzdHJveScpXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAuZGF0ZXRpbWVwaWNrZXIoe1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRhdGVwaWNrZXI6ZmFsc2UsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZm9ybWF0OidIOmknXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgICAgICAgICBkdFBpY2tlclxyXG4gICAgICAgICAgICAgICAgICAgICAgICAuZGF0ZXRpbWVwaWNrZXIoJ2Rlc3Ryb3knKVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAuZGF0ZXRpbWVwaWNrZXIob3B0aW9ucyk7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgIHZhciByZXBlYXRPbiA9ICQoXCIjcmVwZWF0LW9uXCIpO1xyXG4gICAgICAgICAgICAgICAgICAgIHJlcGVhdE9uLmhpZGUoKTtcclxuICAgICAgICAgICAgICAgICAgICAkKCcjcmVwZWF0LW1vbnRoJykuaUNoZWNrKCd1bmNoZWNrJylcclxuICAgICAgICAgICAgICAgICAgICAgICAgLmlDaGVjayh7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjaGVja2JveENsYXNzOiAnaWNoZWNrYm94X3NxdWFyZS1ibHVlJyxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJhZGlvQ2xhc3M6ICdpcmFkaW9fc3F1YXJlLWJsdWUnLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaW5jcmVhc2VBcmVhOiAnMjAlJywgLy8gb3B0aW9uYWxcclxuICAgICAgICAgICAgICAgICAgICAgICAgfSkub24oXCJpZlVuY2hlY2tlZFwiLCBmdW5jdGlvbigpe1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcmVwZWF0T24uaGlkZSgpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB9KS5vbihcImlmQ2hlY2tlZFwiLCBmdW5jdGlvbigpe1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgJChcIltpZCo9J3JlcGVhdC1vbi0nXVwiKS5pQ2hlY2soe1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNoZWNrYm94Q2xhc3M6ICdpY2hlY2tib3hfc3F1YXJlLWJsdWUnLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJhZGlvQ2xhc3M6ICdpcmFkaW9fc3F1YXJlLWJsdWUnLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGluY3JlYXNlQXJlYTogJzIwJScsIC8vIG9wdGlvbmFsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJlcGVhdE9uLnNob3coKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIG1vZGFsLm1vZGFsKCdzaG93Jyk7XHJcbiAgICAgICAgICAgICAgICB9O1xyXG5cclxuICAgICAgICAgICAgICAgIC8vSW5pdCBtb2RhbCB3aW5kb3cgXCJFZGl0IGV2ZW50XCJcclxuICAgICAgICAgICAgICAgICQoXCIuZXZlbnQtbGlzdGluZ1wiKS5vbignY2xpY2snLCAnLmV2ZW50LWl0ZW0nLCBmdW5jdGlvbigpe1xyXG4gICAgICAgICAgICAgICAgICAgIG1vZGFsLmZpbmQoXCJmb3JtXCIpLmdldCgwKS5yZXNldCgpO1xyXG4gICAgICAgICAgICAgICAgICAgIG1vZGFsLmZpbmQoXCIubW9kYWwtdGl0bGVcIikudGV4dChcIkVkaXQgZXZlbnRcIik7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgIGRhdGV0aW1lcGlja2VyT3B0aW9ucy52YWx1ZSA9ICQodGhpcykuZmluZChcIi5ldmVudC1pdGVtLXRpbWVcIikuYXR0cihcImRhdGEtZGF0ZXRpbWVcIik7XHJcbiAgICAgICAgICAgICAgICAgICAgbW9kYWwuZmluZChcIiNUaXRsZVwiKS52YWwoJCh0aGlzKS5maW5kKFwiLmV2ZW50LWl0ZW0tbmFtZVwiKS50ZXh0KCkpO1xyXG4gICAgICAgICAgICAgICAgICAgIG1vZGFsLmZpbmQoXCIjRGVzY3JpcHRpb25cIikudmFsKCQodGhpcykuZmluZChcIi5ldmVudC1pdGVtLWxvY2F0aW9uXCIpLnRleHQoKSk7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgIGRhdGV0aW1lUGlja2VySW5pdChkYXRldGltZXBpY2tlck9wdGlvbnMpO1xyXG4gICAgICAgICAgICAgICAgfSk7XHJcblxyXG4gICAgICAgICAgICAgICAgLy9Jbml0IG1vZGFsIHdpbmRvdyBcIkFkZCBldmVudFwiXHJcbiAgICAgICAgICAgICAgICBldmVudExpc3RpbmdUaXRsZS5vbihcImNsaWNrXCIsIFwiLmdseXBoaWNvbi1wbHVzXCIsIGZ1bmN0aW9uKCl7XHJcbiAgICAgICAgICAgICAgICAgICAgbW9kYWwuZmluZChcImZvcm1cIikuZ2V0KDApLnJlc2V0KCk7XHJcbiAgICAgICAgICAgICAgICAgICAgbW9kYWwuZmluZChcIi5tb2RhbC10aXRsZVwiKS50ZXh0KFwiQWRkIGV2ZW50XCIpO1xyXG5cclxuICAgICAgICAgICAgICAgICAgICBpZigkKHRoaXMpLnBhcmVudCgpLmhhc0NsYXNzKFwiZGF5LXRpdGxlXCIpKXtcclxuICAgICAgICAgICAgICAgICAgICAgICAgZGF0ZXRpbWVwaWNrZXJPcHRpb25zLnZhbHVlID0gKGZ1bmN0aW9uKCl7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB2YXIgdGltZSA9IFwiIFwiICsgbW9tZW50KCkuZm9ybWF0KFwiSEg6bW1cIik7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB2YXIgZWwgPSAkKGNsbmRyLmVsZW1lbnQpLmZpbmQoXCIuc2VsZWN0ZWRcIik7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZihlbC5sZW5ndGggPiAwKVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBlbC5hdHRyKFwiZGF0YS1pZFwiKSArIHRpbWU7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBlbHNlXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuICQoY2xuZHIuZWxlbWVudCkuZmluZChcInRvZGF5XCIpLmF0dHIoXCJkYXRhLWlkXCIpICsgdGltZTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgfSkoKTtcclxuICAgICAgICAgICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAgICAgICAgIGRhdGV0aW1lUGlja2VySW5pdChkYXRldGltZXBpY2tlck9wdGlvbnMpO1xyXG4gICAgICAgICAgICAgICAgfSk7XHJcblxyXG4gICAgICAgICAgICAgICAgdmFyIGNhbGVuZGFyID0gJChcIi5jbG5kclwiKTtcclxuICAgICAgICAgICAgICAgIGNhbGVuZGFyLmhlaWdodChjYWxlbmRhci5oZWlnaHQoKSk7XHJcblxyXG4gICAgICAgICAgICB9LC8vIXJlYWR5XHJcbiAgICAgICAgICAgIGRvbmVSZW5kZXJpbmc6IGZ1bmN0aW9uKCl7IC8vZG9uZVJlbmRlcmluZ1xyXG4gICAgICAgICAgICAgICAgJChcIi5kYXktZXZlbnRzXCIpXHJcbiAgICAgICAgICAgICAgICAgICAgLmhlaWdodCggJChcIi5jbG5kci1ncmlkIC5kYXlzXCIpLmhlaWdodCgpIC0gJChcIi5jbG5kci1ncmlkIC5kYXlzLW9mLXRoZS13ZWVrXCIpLmhlaWdodCgpIClcclxuICAgICAgICAgICAgICAgICAgICAubUN1c3RvbVNjcm9sbGJhcih7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHNjcm9sbEJ1dHRvbnM6e2VuYWJsZTp0cnVlfSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgdGhlbWU6XCJtaW5pbWFsLWRhcmtcIlxyXG4gICAgICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICAgICAgdmFyIGNhbGVuZGFyID0gJChcIiNmdWxsLWNsbmRyXCIpO1xyXG4gICAgICAgICAgICAgICAgaWYoY2FsZW5kYXIuZmluZChcIi50b2RheVwiKS5sZW5ndGggPiAwKVxyXG4gICAgICAgICAgICAgICAgICAgIGNhbGVuZGFyLmZpbmQoXCIudG9kYXlcIikuY2xpY2soKTtcclxuICAgICAgICAgICAgICAgIGVsc2VcclxuICAgICAgICAgICAgICAgICAgICBjYWxlbmRhci5maW5kKFwiLmRheVwiKS5lcSgwKS5jbGljaygpO1xyXG5cclxuICAgICAgICAgICAgfS8vIWRvbmVSZW5kZXJpbmdcclxuICAgICAgICB9KTtcclxuICAgIH07XHJcblxyXG59KSgpOyJdLCJmaWxlIjoic2NoZWR1bGUuanMiLCJzb3VyY2VSb290IjoiL3NvdXJjZS8ifQ==
