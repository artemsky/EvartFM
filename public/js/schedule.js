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
        whereId: function(id){
            if(!id)
                return null;
            for(var i in this.target.object)
                if(this.target.object[i].id == id){
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
            for(var i in this.target.object){
                var repeatKeys = Object.keys(this.target.object[i].repeat),
                    days = {},
                    repeat = {},
                    key = '';
                for(var r = repeatKeys.length; r--;){
                    key = repeatKeys[r];
                    if(r > 3)
                        days[key] = (this.target.object[i].repeat[key]);
                    else
                        repeat[key] = this.target.object[i].repeat[key];
                }
                repeat.days = days;
                result.push(repeat);
            }
            return result;
        }
    };

    //events
    var events = [];
    var onEventsSuccess = function(response){
            $("#fountainTextG").hide();
            initCalendar(response);
            storage.set('events', response);
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

    //init variables
    var dayEventsTemplate = $('#day-events').html();

    var modal = $("#modal");
    var datetimePickerInit = function(options, id){
        //Date init
        var dtPicker = $('#datetimepicker'),
            checkOptions = {
                checkboxClass: 'icheckbox_square-blue',
                radioClass: 'iradio_square-blue',
                increaseArea: '20%',
            };
        $('#repeat-day').iCheck('uncheck')
            .iCheck(checkOptions).on("ifUnchecked", function(){
                dtPicker
                    .datetimepicker('destroy')
                    .datetimepicker();
                $("#repeat-month").iCheck('enable');
                repeatOn.iCheck('enable');
            }).on("ifChecked", function(){
                dtPicker
                    .datetimepicker('destroy')
                    .datetimepicker({
                        datepicker:false,
                        format:'H:i'
                    });
                $("#repeat-month").iCheck('disable');
                repeatOn.iCheck('disable');
            });
        dtPicker
            .datetimepicker('destroy')
            .datetimepicker(options);

        //Repeat init
        var repeatOn = $("#repeat-on");
        repeatOn.hide();
        $('#repeat-month').iCheck('uncheck')
            .iCheck(checkOptions)
            .on("ifUnchecked", function(){
                repeatOn.hide();
            })
            .on("ifChecked", function(){
                $("[id*='repeat-on-']")
                    .iCheck(checkOptions);
                repeatOn.show();
            });
        //Set checked days
        (function(){
            
            var repeats = storage.get('events').whereId(id).repeat().result()[0];

            if(repeats.everyWeek){
                $('#repeat-month').iCheck('check');
                for(var i in repeats.days)
                    $("#repeat-on-" + i).iCheck(repeats.days[i] ? 'check': 'uncheck')
            }
            if(repeats.everyDay){

            }
        })();

        //!checked days

        modal.modal('show');
    };

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


                var datetimepickerOptions = {
                    step: 30
                };
                //Init modal window "Edit event"
                $(".event-listing").on('click', '.event-item', function(){
                    modal.find("form").get(0).reset();
                    modal.find(".modal-title").text("Edit event");

                    datetimepickerOptions.value = $(this).find(".event-item-time").attr("data-datetime");
                    modal.find("#Title").val($(this).find(".event-item-name").text());
                    modal.find("#Description").val($(this).find(".event-item-location").text());

                    datetimePickerInit(datetimepickerOptions, $(this).attr('data-id'));
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiIiwic291cmNlcyI6WyJzY2hlZHVsZS5qcyJdLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24oKXtcclxuICAgIFwidXNlIHN0cmljdFwiO1xyXG5cclxuICAgIC8vU2V0IHVuZGVyc2NvcmUgdGVtcGxhdGUgc2V0dGluZyBhcyB7eyUlfX0gZm9yIGJldHRlciBjb2RlIHJlYWRpbmdcclxuICAgIF8udGVtcGxhdGVTZXR0aW5ncyA9IHtcclxuICAgICAgICBldmFsdWF0ZSAgICA6IC9cXHtcXHslKFtcXHNcXFNdKz8pJVxcfVxcfS9nLFxyXG4gICAgICAgIGludGVycG9sYXRlIDogL1xce1xceyU9KFtcXHNcXFNdKz8pJVxcfVxcfS9nLFxyXG4gICAgICAgIGVzY2FwZSAgICAgIDogL1xce1xceyUtKFtcXHNcXFNdKz8pJVxcfVxcfS9nXHJcbiAgICB9O1xyXG4gICAgLy9TZXQgbW9tZW50IGxvY2FsZVxyXG4gICAgbW9tZW50LmxvY2FsZShcImVuLWdiXCIpO1xyXG5cclxuICAgIC8vSW5pdCBzdG9yYWdlIGhlbHBlcnNcclxuICAgIHZhciBzdG9yYWdlID0ge1xyXG4gICAgICAgIGRpc2s6IHNlc3Npb25TdG9yYWdlIHx8IGxvY2FsU3RvcmFnZSxcclxuICAgICAgICB0YXJnZXQ6IHtcclxuICAgICAgICAgICAgbmFtZTogbnVsbCxcclxuICAgICAgICAgICAgb2JqZWN0OiBudWxsLFxyXG4gICAgICAgICAgICByZXBlYXQ6IGZhbHNlXHJcbiAgICAgICAgfSxcclxuICAgICAgICAnZ2V0JzogZnVuY3Rpb24oa2V5KXtcclxuICAgICAgICAgICAgaWYoIXRoaXMuZGlzay5nZXRJdGVtKGtleSkpXHJcbiAgICAgICAgICAgICAgcmV0dXJuIG51bGw7XHJcbiAgICAgICAgICAgIHRoaXMudGFyZ2V0Lm9iamVjdCA9IEpTT04ucGFyc2UodGhpcy5kaXNrLmdldEl0ZW0oa2V5KSk7XHJcbiAgICAgICAgICAgIHRoaXMudGFyZ2V0Lm5hbWUgPSBrZXk7XHJcbiAgICAgICAgICAgIHJldHVybiB0aGlzO1xyXG4gICAgICAgIH0sXHJcbiAgICAgICAgJ3NldCc6IGZ1bmN0aW9uKGtleSwgdmFsdWUpe1xyXG4gICAgICAgICAgICB0aGlzLmRpc2suc2V0SXRlbShrZXksIEpTT04uc3RyaW5naWZ5KHZhbHVlKSk7XHJcbiAgICAgICAgICAgIHRoaXMudGFyZ2V0Lm5hbWUgPSBrZXk7XHJcbiAgICAgICAgICAgIHJldHVybiB0aGlzO1xyXG4gICAgICAgIH0sXHJcbiAgICAgICAgd2hlcmVEYXRlOiBmdW5jdGlvbihkYXRlKXtcclxuICAgICAgICAgICAgaWYoIWRhdGUpXHJcbiAgICAgICAgICAgICAgICByZXR1cm4gbnVsbDtcclxuICAgICAgICAgICAgZm9yKHZhciBpIGluIHRoaXMudGFyZ2V0Lm9iamVjdClcclxuICAgICAgICAgICAgICAgIGlmKHRoaXMudGFyZ2V0Lm9iamVjdFtpXS5kYXRlLnN1YnN0cmluZygwLDEwKSA9PSBkYXRlKXtcclxuICAgICAgICAgICAgICAgICAgICB0aGlzLnRhcmdldC5vYmplY3QgPSBbdGhpcy50YXJnZXQub2JqZWN0W2ldXTtcclxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gdGhpcztcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgdGhpcy50YXJnZXQub2JqZWN0ID0gW107XHJcbiAgICAgICAgICAgIHJldHVybiB0aGlzO1xyXG4gICAgICAgIH0sXHJcbiAgICAgICAgd2hlcmVJZDogZnVuY3Rpb24oaWQpe1xyXG4gICAgICAgICAgICBpZighaWQpXHJcbiAgICAgICAgICAgICAgICByZXR1cm4gbnVsbDtcclxuICAgICAgICAgICAgZm9yKHZhciBpIGluIHRoaXMudGFyZ2V0Lm9iamVjdClcclxuICAgICAgICAgICAgICAgIGlmKHRoaXMudGFyZ2V0Lm9iamVjdFtpXS5pZCA9PSBpZCl7XHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy50YXJnZXQub2JqZWN0ID0gW3RoaXMudGFyZ2V0Lm9iamVjdFtpXV07XHJcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHRoaXM7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIHRoaXMudGFyZ2V0Lm9iamVjdCA9IFtdO1xyXG4gICAgICAgICAgICByZXR1cm4gdGhpcztcclxuICAgICAgICB9LFxyXG4gICAgICAgIHJlcGVhdDogZnVuY3Rpb24oKXtcclxuICAgICAgICAgICAgdGhpcy50YXJnZXQucmVwZWF0ID0gdHJ1ZTtcclxuICAgICAgICAgICAgcmV0dXJuIHRoaXM7XHJcbiAgICAgICAgfSxcclxuICAgICAgICByZXN1bHQ6IGZ1bmN0aW9uKCl7XHJcbiAgICAgICAgICAgIGlmKCF0aGlzLnRhcmdldC5yZXBlYXQpXHJcbiAgICAgICAgICAgICAgICByZXR1cm4gdGhpcy50YXJnZXQub2JqZWN0O1xyXG4gICAgICAgICAgICB2YXIgcmVzdWx0ID0gW107XHJcbiAgICAgICAgICAgIGZvcih2YXIgaSBpbiB0aGlzLnRhcmdldC5vYmplY3Qpe1xyXG4gICAgICAgICAgICAgICAgdmFyIHJlcGVhdEtleXMgPSBPYmplY3Qua2V5cyh0aGlzLnRhcmdldC5vYmplY3RbaV0ucmVwZWF0KSxcclxuICAgICAgICAgICAgICAgICAgICBkYXlzID0ge30sXHJcbiAgICAgICAgICAgICAgICAgICAgcmVwZWF0ID0ge30sXHJcbiAgICAgICAgICAgICAgICAgICAga2V5ID0gJyc7XHJcbiAgICAgICAgICAgICAgICBmb3IodmFyIHIgPSByZXBlYXRLZXlzLmxlbmd0aDsgci0tOyl7XHJcbiAgICAgICAgICAgICAgICAgICAga2V5ID0gcmVwZWF0S2V5c1tyXTtcclxuICAgICAgICAgICAgICAgICAgICBpZihyID4gMylcclxuICAgICAgICAgICAgICAgICAgICAgICAgZGF5c1trZXldID0gKHRoaXMudGFyZ2V0Lm9iamVjdFtpXS5yZXBlYXRba2V5XSk7XHJcbiAgICAgICAgICAgICAgICAgICAgZWxzZVxyXG4gICAgICAgICAgICAgICAgICAgICAgICByZXBlYXRba2V5XSA9IHRoaXMudGFyZ2V0Lm9iamVjdFtpXS5yZXBlYXRba2V5XTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIHJlcGVhdC5kYXlzID0gZGF5cztcclxuICAgICAgICAgICAgICAgIHJlc3VsdC5wdXNoKHJlcGVhdCk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgcmV0dXJuIHJlc3VsdDtcclxuICAgICAgICB9XHJcbiAgICB9O1xyXG5cclxuICAgIC8vZXZlbnRzXHJcbiAgICB2YXIgZXZlbnRzID0gW107XHJcbiAgICB2YXIgb25FdmVudHNTdWNjZXNzID0gZnVuY3Rpb24ocmVzcG9uc2Upe1xyXG4gICAgICAgICAgICAkKFwiI2ZvdW50YWluVGV4dEdcIikuaGlkZSgpO1xyXG4gICAgICAgICAgICBpbml0Q2FsZW5kYXIocmVzcG9uc2UpO1xyXG4gICAgICAgICAgICBzdG9yYWdlLnNldCgnZXZlbnRzJywgcmVzcG9uc2UpO1xyXG4gICAgICAgIH0sXHJcbiAgICAgICAgb25FdmVudHNFcnJvciA9IGZ1bmN0aW9uIChyZXNwb25zZSl7XHJcbiAgICAgICAgICAgICQoXCIjZm91bnRhaW5UZXh0R1wiKS5oaWRlKCk7XHJcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKHJlc3BvbnNlKTtcclxuICAgICAgICB9O1xyXG4gICAgdmFyIHJlcXVlc3RPcHRpb25zID0ge1xyXG4gICAgICAgIHR5cGU6IFwiR0VUXCIsXHJcbiAgICAgICAgY2FjaGU6IGZhbHNlLFxyXG4gICAgICAgIHN1Y2Nlc3M6IG9uRXZlbnRzU3VjY2VzcyxcclxuICAgICAgICBlcnJvcjogb25FdmVudHNFcnJvclxyXG4gICAgfTtcclxuICAgICQuYWpheCgnc2NoZWR1bGUvZXZlbnRzJywgcmVxdWVzdE9wdGlvbnMpO1xyXG4gICAgXHJcbiAgICAvLyFldmVudHNcclxuXHJcbiAgICAvL2luaXQgdmFyaWFibGVzXHJcbiAgICB2YXIgZGF5RXZlbnRzVGVtcGxhdGUgPSAkKCcjZGF5LWV2ZW50cycpLmh0bWwoKTtcclxuXHJcbiAgICB2YXIgbW9kYWwgPSAkKFwiI21vZGFsXCIpO1xyXG4gICAgdmFyIGRhdGV0aW1lUGlja2VySW5pdCA9IGZ1bmN0aW9uKG9wdGlvbnMsIGlkKXtcclxuICAgICAgICAvL0RhdGUgaW5pdFxyXG4gICAgICAgIHZhciBkdFBpY2tlciA9ICQoJyNkYXRldGltZXBpY2tlcicpLFxyXG4gICAgICAgICAgICBjaGVja09wdGlvbnMgPSB7XHJcbiAgICAgICAgICAgICAgICBjaGVja2JveENsYXNzOiAnaWNoZWNrYm94X3NxdWFyZS1ibHVlJyxcclxuICAgICAgICAgICAgICAgIHJhZGlvQ2xhc3M6ICdpcmFkaW9fc3F1YXJlLWJsdWUnLFxyXG4gICAgICAgICAgICAgICAgaW5jcmVhc2VBcmVhOiAnMjAlJyxcclxuICAgICAgICAgICAgfTtcclxuICAgICAgICAkKCcjcmVwZWF0LWRheScpLmlDaGVjaygndW5jaGVjaycpXHJcbiAgICAgICAgICAgIC5pQ2hlY2soY2hlY2tPcHRpb25zKS5vbihcImlmVW5jaGVja2VkXCIsIGZ1bmN0aW9uKCl7XHJcbiAgICAgICAgICAgICAgICBkdFBpY2tlclxyXG4gICAgICAgICAgICAgICAgICAgIC5kYXRldGltZXBpY2tlcignZGVzdHJveScpXHJcbiAgICAgICAgICAgICAgICAgICAgLmRhdGV0aW1lcGlja2VyKCk7XHJcbiAgICAgICAgICAgICAgICAkKFwiI3JlcGVhdC1tb250aFwiKS5pQ2hlY2soJ2VuYWJsZScpO1xyXG4gICAgICAgICAgICAgICAgcmVwZWF0T24uaUNoZWNrKCdlbmFibGUnKTtcclxuICAgICAgICAgICAgfSkub24oXCJpZkNoZWNrZWRcIiwgZnVuY3Rpb24oKXtcclxuICAgICAgICAgICAgICAgIGR0UGlja2VyXHJcbiAgICAgICAgICAgICAgICAgICAgLmRhdGV0aW1lcGlja2VyKCdkZXN0cm95JylcclxuICAgICAgICAgICAgICAgICAgICAuZGF0ZXRpbWVwaWNrZXIoe1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBkYXRlcGlja2VyOmZhbHNlLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBmb3JtYXQ6J0g6aSdcclxuICAgICAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgICAgICQoXCIjcmVwZWF0LW1vbnRoXCIpLmlDaGVjaygnZGlzYWJsZScpO1xyXG4gICAgICAgICAgICAgICAgcmVwZWF0T24uaUNoZWNrKCdkaXNhYmxlJyk7XHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgIGR0UGlja2VyXHJcbiAgICAgICAgICAgIC5kYXRldGltZXBpY2tlcignZGVzdHJveScpXHJcbiAgICAgICAgICAgIC5kYXRldGltZXBpY2tlcihvcHRpb25zKTtcclxuXHJcbiAgICAgICAgLy9SZXBlYXQgaW5pdFxyXG4gICAgICAgIHZhciByZXBlYXRPbiA9ICQoXCIjcmVwZWF0LW9uXCIpO1xyXG4gICAgICAgIHJlcGVhdE9uLmhpZGUoKTtcclxuICAgICAgICAkKCcjcmVwZWF0LW1vbnRoJykuaUNoZWNrKCd1bmNoZWNrJylcclxuICAgICAgICAgICAgLmlDaGVjayhjaGVja09wdGlvbnMpXHJcbiAgICAgICAgICAgIC5vbihcImlmVW5jaGVja2VkXCIsIGZ1bmN0aW9uKCl7XHJcbiAgICAgICAgICAgICAgICByZXBlYXRPbi5oaWRlKCk7XHJcbiAgICAgICAgICAgIH0pXHJcbiAgICAgICAgICAgIC5vbihcImlmQ2hlY2tlZFwiLCBmdW5jdGlvbigpe1xyXG4gICAgICAgICAgICAgICAgJChcIltpZCo9J3JlcGVhdC1vbi0nXVwiKVxyXG4gICAgICAgICAgICAgICAgICAgIC5pQ2hlY2soY2hlY2tPcHRpb25zKTtcclxuICAgICAgICAgICAgICAgIHJlcGVhdE9uLnNob3coKTtcclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgLy9TZXQgY2hlY2tlZCBkYXlzXHJcbiAgICAgICAgKGZ1bmN0aW9uKCl7XHJcbiAgICAgICAgICAgIFxyXG4gICAgICAgICAgICB2YXIgcmVwZWF0cyA9IHN0b3JhZ2UuZ2V0KCdldmVudHMnKS53aGVyZUlkKGlkKS5yZXBlYXQoKS5yZXN1bHQoKVswXTtcclxuXHJcbiAgICAgICAgICAgIGlmKHJlcGVhdHMuZXZlcnlXZWVrKXtcclxuICAgICAgICAgICAgICAgICQoJyNyZXBlYXQtbW9udGgnKS5pQ2hlY2soJ2NoZWNrJyk7XHJcbiAgICAgICAgICAgICAgICBmb3IodmFyIGkgaW4gcmVwZWF0cy5kYXlzKVxyXG4gICAgICAgICAgICAgICAgICAgICQoXCIjcmVwZWF0LW9uLVwiICsgaSkuaUNoZWNrKHJlcGVhdHMuZGF5c1tpXSA/ICdjaGVjayc6ICd1bmNoZWNrJylcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBpZihyZXBlYXRzLmV2ZXJ5RGF5KXtcclxuXHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9KSgpO1xyXG5cclxuICAgICAgICAvLyFjaGVja2VkIGRheXNcclxuXHJcbiAgICAgICAgbW9kYWwubW9kYWwoJ3Nob3cnKTtcclxuICAgIH07XHJcblxyXG4gICAgLy9Jbml0IGNhbGVuZGFyXHJcbiAgICB2YXIgaW5pdENhbGVuZGFyID0gZnVuY3Rpb24oZXZlbnRzKXtcclxuICAgICAgICB2YXIgY2xuZHIgPSAkKCcjZnVsbC1jbG5kcicpLmNsbmRyKHtcclxuICAgICAgICAgICAgdGVtcGxhdGU6ICQoJyNmdWxsLWNsbmRyLXRlbXBsYXRlJykuaHRtbCgpLFxyXG4gICAgICAgICAgICBldmVudHM6IGV2ZW50cyxcclxuICAgICAgICAgICAgY2xpY2tFdmVudHM6IHtcclxuICAgICAgICAgICAgICAgIGNsaWNrOiBmdW5jdGlvbiAodGFyZ2V0KSB7XHJcbiAgICAgICAgICAgICAgICAgICAgdmFyIHRlbXBsYXRlID0gXy50ZW1wbGF0ZShkYXlFdmVudHNUZW1wbGF0ZSk7XHJcbiAgICAgICAgICAgICAgICAgICAgJChcIi5kYXktZXZlbnRzXCIpXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIC5tQ3VzdG9tU2Nyb2xsYmFyKFwiZGVzdHJveVwiKVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAuaHRtbCh0ZW1wbGF0ZSh7ZXZlbnRzVGhpc0RheTogdGFyZ2V0LmV2ZW50c30pKVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAuaGVpZ2h0KCAkKFwiLmNsbmRyLWdyaWQgLmRheXNcIikuaGVpZ2h0KCkgLSAkKFwiLmNsbmRyLWdyaWQgLmRheXMtb2YtdGhlLXdlZWtcIikuaGVpZ2h0KCkgKVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAubUN1c3RvbVNjcm9sbGJhcih7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBzY3JvbGxCdXR0b25zOntlbmFibGU6dHJ1ZX0sXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aGVtZTpcIm1pbmltYWwtZGFya1wiXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xyXG5cclxuICAgICAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgICAgICBvbk1vbnRoQ2hhbmdlOiBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5vcHRpb25zLnJlYWR5KCk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgIGZvcmNlU2l4Um93czogdHJ1ZSxcclxuICAgICAgICAgICAgbXVsdGlEYXlFdmVudHM6IHtcclxuICAgICAgICAgICAgICAgIHNpbmdsZURheTogJ2RhdGUnLFxyXG4gICAgICAgICAgICAgICAgZW5kRGF0ZTogJ2VuZERhdGUnLFxyXG4gICAgICAgICAgICAgICAgc3RhcnREYXRlOiAnc3RhcnREYXRlJ1xyXG4gICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICBzaG93QWRqYWNlbnRNb250aHM6IHRydWUsXHJcbiAgICAgICAgICAgIGFkamFjZW50RGF5c0NoYW5nZU1vbnRoOiBmYWxzZSxcclxuICAgICAgICAgICAgdHJhY2tTZWxlY3RlZERhdGU6IHRydWUsXHJcbiAgICAgICAgICAgIGRheXNPZlRoZVdlZWs6IChmdW5jdGlvbigpe1xyXG4gICAgICAgICAgICAgICAgdmFyIHJlc3VsdCA9IFtdO1xyXG4gICAgICAgICAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCA3OyBpKyspIHtcclxuICAgICAgICAgICAgICAgICAgICByZXN1bHQucHVzaChtb21lbnQoKS53ZWVrZGF5KGkpLmZvcm1hdCgnZGRkJykpO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgcmV0dXJuIHJlc3VsdDtcclxuICAgICAgICAgICAgfSkoKSxcclxuICAgICAgICAgICAgcmVhZHk6IGZ1bmN0aW9uKCl7IC8vcmVhZHlcclxuICAgICAgICAgICAgICAgIHZhciBldmVudExpc3RpbmdUaXRsZSA9ICQoXCIuZXZlbnQtbGlzdGluZy10aXRsZVwiKTtcclxuICAgICAgICAgICAgICAgIC8vSW5pdCBibG9jayBPcGVuL0Nsb3NlIGV2ZW50XHJcbiAgICAgICAgICAgICAgICBldmVudExpc3RpbmdUaXRsZS5vbihcImNsaWNrXCIsIFwiLmdseXBoaWNvbi1jaGV2cm9uLXVwLCAuZ2x5cGhpY29uLWNoZXZyb24tZG93blwiLCBmdW5jdGlvbigpe1xyXG4gICAgICAgICAgICAgICAgICAgIHZhciBlbCA9IHt9O1xyXG4gICAgICAgICAgICAgICAgICAgIHZhciBibG9jayA9IHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgb3BlbjogXCJnbHlwaGljb24tY2hldnJvbi11cFwiLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBjbG9zZTogXCJnbHlwaGljb24tY2hldnJvbi1kb3duXCJcclxuICAgICAgICAgICAgICAgICAgICB9O1xyXG4gICAgICAgICAgICAgICAgICAgIHZhciAkdGhpcyA9ICQodGhpcyk7XHJcbiAgICAgICAgICAgICAgICAgICAgaWYoJHRoaXMucGFyZW50KCkuaGFzQ2xhc3MoXCJtb250aC10aXRsZVwiKSlcclxuICAgICAgICAgICAgICAgICAgICAgICAgZWwgPSAkKFwiLmRheS10aXRsZSBbY2xhc3MgKj1nbHlwaGljb24tY2hldnJvbl1cIikuZXEoMCk7XHJcbiAgICAgICAgICAgICAgICAgICAgZWxzZVxyXG4gICAgICAgICAgICAgICAgICAgICAgICBlbCA9ICQoXCIubW9udGgtdGl0bGUgW2NsYXNzICo9Z2x5cGhpY29uLWNoZXZyb25dXCIpLmVxKDApO1xyXG5cclxuICAgICAgICAgICAgICAgICAgICBpZihlbC5oYXNDbGFzcyhibG9jay5vcGVuKSlcclxuICAgICAgICAgICAgICAgICAgICAgICAgZWwucmVtb3ZlQ2xhc3MoYmxvY2sub3BlbikuYWRkQ2xhc3MoYmxvY2suY2xvc2UpO1xyXG4gICAgICAgICAgICAgICAgICAgIGVsc2VcclxuICAgICAgICAgICAgICAgICAgICAgICAgZWwucmVtb3ZlQ2xhc3MoYmxvY2suY2xvc2UpLmFkZENsYXNzKGJsb2NrLm9wZW4pO1xyXG5cclxuICAgICAgICAgICAgICAgICAgICBpZigkdGhpcy5oYXNDbGFzcyhibG9jay5vcGVuKSlcclxuICAgICAgICAgICAgICAgICAgICAgICAgJHRoaXMucmVtb3ZlQ2xhc3MoYmxvY2sub3BlbikuYWRkQ2xhc3MoYmxvY2suY2xvc2UpO1xyXG4gICAgICAgICAgICAgICAgICAgIGVsc2VcclxuICAgICAgICAgICAgICAgICAgICAgICAgJHRoaXMucmVtb3ZlQ2xhc3MoYmxvY2suY2xvc2UpLmFkZENsYXNzKGJsb2NrLm9wZW4pO1xyXG5cclxuICAgICAgICAgICAgICAgICAgICAkKFwiLmV2ZW50LWl0ZW1zLCAuZGF5LWV2ZW50c1wiKS5zbGlkZVRvZ2dsZSgpO1xyXG5cclxuICAgICAgICAgICAgICAgIH0pO1xyXG5cclxuXHJcbiAgICAgICAgICAgICAgICB2YXIgZGF0ZXRpbWVwaWNrZXJPcHRpb25zID0ge1xyXG4gICAgICAgICAgICAgICAgICAgIHN0ZXA6IDMwXHJcbiAgICAgICAgICAgICAgICB9O1xyXG4gICAgICAgICAgICAgICAgLy9Jbml0IG1vZGFsIHdpbmRvdyBcIkVkaXQgZXZlbnRcIlxyXG4gICAgICAgICAgICAgICAgJChcIi5ldmVudC1saXN0aW5nXCIpLm9uKCdjbGljaycsICcuZXZlbnQtaXRlbScsIGZ1bmN0aW9uKCl7XHJcbiAgICAgICAgICAgICAgICAgICAgbW9kYWwuZmluZChcImZvcm1cIikuZ2V0KDApLnJlc2V0KCk7XHJcbiAgICAgICAgICAgICAgICAgICAgbW9kYWwuZmluZChcIi5tb2RhbC10aXRsZVwiKS50ZXh0KFwiRWRpdCBldmVudFwiKTtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgZGF0ZXRpbWVwaWNrZXJPcHRpb25zLnZhbHVlID0gJCh0aGlzKS5maW5kKFwiLmV2ZW50LWl0ZW0tdGltZVwiKS5hdHRyKFwiZGF0YS1kYXRldGltZVwiKTtcclxuICAgICAgICAgICAgICAgICAgICBtb2RhbC5maW5kKFwiI1RpdGxlXCIpLnZhbCgkKHRoaXMpLmZpbmQoXCIuZXZlbnQtaXRlbS1uYW1lXCIpLnRleHQoKSk7XHJcbiAgICAgICAgICAgICAgICAgICAgbW9kYWwuZmluZChcIiNEZXNjcmlwdGlvblwiKS52YWwoJCh0aGlzKS5maW5kKFwiLmV2ZW50LWl0ZW0tbG9jYXRpb25cIikudGV4dCgpKTtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgZGF0ZXRpbWVQaWNrZXJJbml0KGRhdGV0aW1lcGlja2VyT3B0aW9ucywgJCh0aGlzKS5hdHRyKCdkYXRhLWlkJykpO1xyXG4gICAgICAgICAgICAgICAgfSk7XHJcblxyXG4gICAgICAgICAgICAgICAgLy9Jbml0IG1vZGFsIHdpbmRvdyBcIkFkZCBldmVudFwiXHJcbiAgICAgICAgICAgICAgICBldmVudExpc3RpbmdUaXRsZS5vbihcImNsaWNrXCIsIFwiLmdseXBoaWNvbi1wbHVzXCIsIGZ1bmN0aW9uKCl7XHJcbiAgICAgICAgICAgICAgICAgICAgbW9kYWwuZmluZChcImZvcm1cIikuZ2V0KDApLnJlc2V0KCk7XHJcbiAgICAgICAgICAgICAgICAgICAgbW9kYWwuZmluZChcIi5tb2RhbC10aXRsZVwiKS50ZXh0KFwiQWRkIGV2ZW50XCIpO1xyXG5cclxuICAgICAgICAgICAgICAgICAgICBpZigkKHRoaXMpLnBhcmVudCgpLmhhc0NsYXNzKFwiZGF5LXRpdGxlXCIpKXtcclxuICAgICAgICAgICAgICAgICAgICAgICAgZGF0ZXRpbWVwaWNrZXJPcHRpb25zLnZhbHVlID0gKGZ1bmN0aW9uKCl7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB2YXIgdGltZSA9IFwiIFwiICsgbW9tZW50KCkuZm9ybWF0KFwiSEg6bW1cIik7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB2YXIgZWwgPSAkKGNsbmRyLmVsZW1lbnQpLmZpbmQoXCIuc2VsZWN0ZWRcIik7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZihlbC5sZW5ndGggPiAwKVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBlbC5hdHRyKFwiZGF0YS1pZFwiKSArIHRpbWU7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBlbHNlXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuICQoY2xuZHIuZWxlbWVudCkuZmluZChcInRvZGF5XCIpLmF0dHIoXCJkYXRhLWlkXCIpICsgdGltZTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgfSkoKTtcclxuICAgICAgICAgICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAgICAgICAgIGRhdGV0aW1lUGlja2VySW5pdChkYXRldGltZXBpY2tlck9wdGlvbnMpO1xyXG4gICAgICAgICAgICAgICAgfSk7XHJcblxyXG4gICAgICAgICAgICAgICAgdmFyIGNhbGVuZGFyID0gJChcIi5jbG5kclwiKTtcclxuICAgICAgICAgICAgICAgIGNhbGVuZGFyLmhlaWdodChjYWxlbmRhci5oZWlnaHQoKSk7XHJcblxyXG4gICAgICAgICAgICB9LC8vIXJlYWR5XHJcbiAgICAgICAgICAgIGRvbmVSZW5kZXJpbmc6IGZ1bmN0aW9uKCl7IC8vZG9uZVJlbmRlcmluZ1xyXG4gICAgICAgICAgICAgICAgJChcIi5kYXktZXZlbnRzXCIpXHJcbiAgICAgICAgICAgICAgICAgICAgLmhlaWdodCggJChcIi5jbG5kci1ncmlkIC5kYXlzXCIpLmhlaWdodCgpIC0gJChcIi5jbG5kci1ncmlkIC5kYXlzLW9mLXRoZS13ZWVrXCIpLmhlaWdodCgpIClcclxuICAgICAgICAgICAgICAgICAgICAubUN1c3RvbVNjcm9sbGJhcih7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHNjcm9sbEJ1dHRvbnM6e2VuYWJsZTp0cnVlfSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgdGhlbWU6XCJtaW5pbWFsLWRhcmtcIlxyXG4gICAgICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICAgICAgdmFyIGNhbGVuZGFyID0gJChcIiNmdWxsLWNsbmRyXCIpO1xyXG4gICAgICAgICAgICAgICAgaWYoY2FsZW5kYXIuZmluZChcIi50b2RheVwiKS5sZW5ndGggPiAwKVxyXG4gICAgICAgICAgICAgICAgICAgIGNhbGVuZGFyLmZpbmQoXCIudG9kYXlcIikuY2xpY2soKTtcclxuICAgICAgICAgICAgICAgIGVsc2VcclxuICAgICAgICAgICAgICAgICAgICBjYWxlbmRhci5maW5kKFwiLmRheVwiKS5lcSgwKS5jbGljaygpO1xyXG5cclxuICAgICAgICAgICAgfS8vIWRvbmVSZW5kZXJpbmdcclxuICAgICAgICB9KTtcclxuICAgIH07XHJcblxyXG59KSgpOyJdLCJmaWxlIjoic2NoZWR1bGUuanMiLCJzb3VyY2VSb290IjoiL3NvdXJjZS8ifQ==
