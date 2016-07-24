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
        add: function(event){
            var result = {
                id: event.id,
                title: event.title,
                description: event.description,
                date: event.date,
                repeat: {
                    event_id: event.id,
                    everyDay: event.everyDay ? 1 : 0,
                    everyWeek: event.everyWeek ? 1 : 0,
                }
            };
            var dayKeys = Object.keys(event.days);
            for(var i = dayKeys.length; i--;){
                var key = dayKeys[i];
                result.repeat[key] = event.days[key];
            }
            var isExists = false;
            this.target.object.forEach(function(value){
                if(value.id == result.id){
                    isExists = true;
                    value = result;
                }
            });
            if(!isExists){
                this.target.object.push(result);
            }
                
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
    //on Saving changes
    var saveEditChanges = function(id){
        var title = $.trim($("#Title").val()),
            description = $.trim($("#Description").val()),
            isDayRepeat = $("#repeat-day").prop("checked"),
            dateTime = $("#datetimepicker").val();
        if(!isDayRepeat){
            var isWeekRepeat =  $("#repeat-month").prop("checked");
            if(isWeekRepeat){
                var daysRepeat = {};
                $("[id*='repeat-on-']").each(function (i, obj) {
                    daysRepeat[$(obj).attr('id').substring(10)] = $(obj).prop("checked") ? 1 : 0;
                });
            }
        }
        
        storage.get('events').add({
            id: id,
            title: title,
            date : dateTime,
            description: description,
            everyDay: isDayRepeat,
            everyWeek: isWeekRepeat,
            days: daysRepeat
        })
    },
    saveAddChanges = function(id){

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
                    modal.find(".save-changes").one('click', saveEditChanges.bind(null,$(this).attr('data-id')));
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
                    modal.find(".save-changes").one('click', saveAddChanges.bind(null,$(this).attr('data-id')));
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiIiwic291cmNlcyI6WyJzY2hlZHVsZS5qcyJdLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24oKXtcclxuICAgIFwidXNlIHN0cmljdFwiO1xyXG5cclxuICAgIC8vU2V0IHVuZGVyc2NvcmUgdGVtcGxhdGUgc2V0dGluZyBhcyB7eyUlfX0gZm9yIGJldHRlciBjb2RlIHJlYWRpbmdcclxuICAgIF8udGVtcGxhdGVTZXR0aW5ncyA9IHtcclxuICAgICAgICBldmFsdWF0ZSAgICA6IC9cXHtcXHslKFtcXHNcXFNdKz8pJVxcfVxcfS9nLFxyXG4gICAgICAgIGludGVycG9sYXRlIDogL1xce1xceyU9KFtcXHNcXFNdKz8pJVxcfVxcfS9nLFxyXG4gICAgICAgIGVzY2FwZSAgICAgIDogL1xce1xceyUtKFtcXHNcXFNdKz8pJVxcfVxcfS9nXHJcbiAgICB9O1xyXG4gICAgLy9TZXQgbW9tZW50IGxvY2FsZVxyXG4gICAgbW9tZW50LmxvY2FsZShcImVuLWdiXCIpO1xyXG5cclxuICAgIC8vSW5pdCBzdG9yYWdlIGhlbHBlcnNcclxuICAgIHZhciBzdG9yYWdlID0ge1xyXG4gICAgICAgIGRpc2s6IHNlc3Npb25TdG9yYWdlIHx8IGxvY2FsU3RvcmFnZSxcclxuICAgICAgICB0YXJnZXQ6IHtcclxuICAgICAgICAgICAgbmFtZTogbnVsbCxcclxuICAgICAgICAgICAgb2JqZWN0OiBudWxsLFxyXG4gICAgICAgICAgICByZXBlYXQ6IGZhbHNlXHJcbiAgICAgICAgfSxcclxuICAgICAgICAnZ2V0JzogZnVuY3Rpb24oa2V5KXtcclxuICAgICAgICAgICAgaWYoIXRoaXMuZGlzay5nZXRJdGVtKGtleSkpXHJcbiAgICAgICAgICAgICAgcmV0dXJuIG51bGw7XHJcbiAgICAgICAgICAgIHRoaXMudGFyZ2V0Lm9iamVjdCA9IEpTT04ucGFyc2UodGhpcy5kaXNrLmdldEl0ZW0oa2V5KSk7XHJcbiAgICAgICAgICAgIHRoaXMudGFyZ2V0Lm5hbWUgPSBrZXk7XHJcbiAgICAgICAgICAgIHJldHVybiB0aGlzO1xyXG4gICAgICAgIH0sXHJcbiAgICAgICAgJ3NldCc6IGZ1bmN0aW9uKGtleSwgdmFsdWUpe1xyXG4gICAgICAgICAgICB0aGlzLmRpc2suc2V0SXRlbShrZXksIEpTT04uc3RyaW5naWZ5KHZhbHVlKSk7XHJcbiAgICAgICAgICAgIHRoaXMudGFyZ2V0Lm5hbWUgPSBrZXk7XHJcbiAgICAgICAgICAgIHJldHVybiB0aGlzO1xyXG4gICAgICAgIH0sXHJcbiAgICAgICAgYWRkOiBmdW5jdGlvbihldmVudCl7XHJcbiAgICAgICAgICAgIHZhciByZXN1bHQgPSB7XHJcbiAgICAgICAgICAgICAgICBpZDogZXZlbnQuaWQsXHJcbiAgICAgICAgICAgICAgICB0aXRsZTogZXZlbnQudGl0bGUsXHJcbiAgICAgICAgICAgICAgICBkZXNjcmlwdGlvbjogZXZlbnQuZGVzY3JpcHRpb24sXHJcbiAgICAgICAgICAgICAgICBkYXRlOiBldmVudC5kYXRlLFxyXG4gICAgICAgICAgICAgICAgcmVwZWF0OiB7XHJcbiAgICAgICAgICAgICAgICAgICAgZXZlbnRfaWQ6IGV2ZW50LmlkLFxyXG4gICAgICAgICAgICAgICAgICAgIGV2ZXJ5RGF5OiBldmVudC5ldmVyeURheSA/IDEgOiAwLFxyXG4gICAgICAgICAgICAgICAgICAgIGV2ZXJ5V2VlazogZXZlbnQuZXZlcnlXZWVrID8gMSA6IDAsXHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH07XHJcbiAgICAgICAgICAgIHZhciBkYXlLZXlzID0gT2JqZWN0LmtleXMoZXZlbnQuZGF5cyk7XHJcbiAgICAgICAgICAgIGZvcih2YXIgaSA9IGRheUtleXMubGVuZ3RoOyBpLS07KXtcclxuICAgICAgICAgICAgICAgIHZhciBrZXkgPSBkYXlLZXlzW2ldO1xyXG4gICAgICAgICAgICAgICAgcmVzdWx0LnJlcGVhdFtrZXldID0gZXZlbnQuZGF5c1trZXldO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIHZhciBpc0V4aXN0cyA9IGZhbHNlO1xyXG4gICAgICAgICAgICB0aGlzLnRhcmdldC5vYmplY3QuZm9yRWFjaChmdW5jdGlvbih2YWx1ZSl7XHJcbiAgICAgICAgICAgICAgICBpZih2YWx1ZS5pZCA9PSByZXN1bHQuaWQpe1xyXG4gICAgICAgICAgICAgICAgICAgIGlzRXhpc3RzID0gdHJ1ZTtcclxuICAgICAgICAgICAgICAgICAgICB2YWx1ZSA9IHJlc3VsdDtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgIGlmKCFpc0V4aXN0cyl7XHJcbiAgICAgICAgICAgICAgICB0aGlzLnRhcmdldC5vYmplY3QucHVzaChyZXN1bHQpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICBcclxuICAgICAgICB9LFxyXG4gICAgICAgIHdoZXJlRGF0ZTogZnVuY3Rpb24oZGF0ZSl7XHJcbiAgICAgICAgICAgIGlmKCFkYXRlKVxyXG4gICAgICAgICAgICAgICAgcmV0dXJuIG51bGw7XHJcbiAgICAgICAgICAgIGZvcih2YXIgaSBpbiB0aGlzLnRhcmdldC5vYmplY3QpXHJcbiAgICAgICAgICAgICAgICBpZih0aGlzLnRhcmdldC5vYmplY3RbaV0uZGF0ZS5zdWJzdHJpbmcoMCwxMCkgPT0gZGF0ZSl7XHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy50YXJnZXQub2JqZWN0ID0gW3RoaXMudGFyZ2V0Lm9iamVjdFtpXV07XHJcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHRoaXM7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIHRoaXMudGFyZ2V0Lm9iamVjdCA9IFtdO1xyXG4gICAgICAgICAgICByZXR1cm4gdGhpcztcclxuICAgICAgICB9LFxyXG4gICAgICAgIHdoZXJlSWQ6IGZ1bmN0aW9uKGlkKXtcclxuICAgICAgICAgICAgaWYoIWlkKVxyXG4gICAgICAgICAgICAgICAgcmV0dXJuIG51bGw7XHJcbiAgICAgICAgICAgIGZvcih2YXIgaSBpbiB0aGlzLnRhcmdldC5vYmplY3QpXHJcbiAgICAgICAgICAgICAgICBpZih0aGlzLnRhcmdldC5vYmplY3RbaV0uaWQgPT0gaWQpe1xyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMudGFyZ2V0Lm9iamVjdCA9IFt0aGlzLnRhcmdldC5vYmplY3RbaV1dO1xyXG4gICAgICAgICAgICAgICAgICAgIHJldHVybiB0aGlzO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB0aGlzLnRhcmdldC5vYmplY3QgPSBbXTtcclxuICAgICAgICAgICAgcmV0dXJuIHRoaXM7XHJcbiAgICAgICAgfSxcclxuICAgICAgICByZXBlYXQ6IGZ1bmN0aW9uKCl7XHJcbiAgICAgICAgICAgIHRoaXMudGFyZ2V0LnJlcGVhdCA9IHRydWU7XHJcbiAgICAgICAgICAgIHJldHVybiB0aGlzO1xyXG4gICAgICAgIH0sXHJcbiAgICAgICAgcmVzdWx0OiBmdW5jdGlvbigpe1xyXG4gICAgICAgICAgICBpZighdGhpcy50YXJnZXQucmVwZWF0KVxyXG4gICAgICAgICAgICAgICAgcmV0dXJuIHRoaXMudGFyZ2V0Lm9iamVjdDtcclxuICAgICAgICAgICAgdmFyIHJlc3VsdCA9IFtdO1xyXG4gICAgICAgICAgICBmb3IodmFyIGkgaW4gdGhpcy50YXJnZXQub2JqZWN0KXtcclxuICAgICAgICAgICAgICAgIHZhciByZXBlYXRLZXlzID0gT2JqZWN0LmtleXModGhpcy50YXJnZXQub2JqZWN0W2ldLnJlcGVhdCksXHJcbiAgICAgICAgICAgICAgICAgICAgZGF5cyA9IHt9LFxyXG4gICAgICAgICAgICAgICAgICAgIHJlcGVhdCA9IHt9LFxyXG4gICAgICAgICAgICAgICAgICAgIGtleSA9ICcnO1xyXG4gICAgICAgICAgICAgICAgZm9yKHZhciByID0gcmVwZWF0S2V5cy5sZW5ndGg7IHItLTspe1xyXG4gICAgICAgICAgICAgICAgICAgIGtleSA9IHJlcGVhdEtleXNbcl07XHJcbiAgICAgICAgICAgICAgICAgICAgaWYociA+IDMpXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGRheXNba2V5XSA9ICh0aGlzLnRhcmdldC5vYmplY3RbaV0ucmVwZWF0W2tleV0pO1xyXG4gICAgICAgICAgICAgICAgICAgIGVsc2VcclxuICAgICAgICAgICAgICAgICAgICAgICAgcmVwZWF0W2tleV0gPSB0aGlzLnRhcmdldC5vYmplY3RbaV0ucmVwZWF0W2tleV07XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICByZXBlYXQuZGF5cyA9IGRheXM7XHJcbiAgICAgICAgICAgICAgICByZXN1bHQucHVzaChyZXBlYXQpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIHJldHVybiByZXN1bHQ7XHJcbiAgICAgICAgfVxyXG4gICAgfTtcclxuXHJcbiAgICAvL2V2ZW50c1xyXG4gICAgdmFyIGV2ZW50cyA9IFtdO1xyXG4gICAgdmFyIG9uRXZlbnRzU3VjY2VzcyA9IGZ1bmN0aW9uKHJlc3BvbnNlKXtcclxuICAgICAgICAgICAgJChcIiNmb3VudGFpblRleHRHXCIpLmhpZGUoKTtcclxuICAgICAgICAgICAgaW5pdENhbGVuZGFyKHJlc3BvbnNlKTtcclxuICAgICAgICAgICAgc3RvcmFnZS5zZXQoJ2V2ZW50cycsIHJlc3BvbnNlKTtcclxuICAgICAgICB9LFxyXG4gICAgICAgIG9uRXZlbnRzRXJyb3IgPSBmdW5jdGlvbiAocmVzcG9uc2Upe1xyXG4gICAgICAgICAgICAkKFwiI2ZvdW50YWluVGV4dEdcIikuaGlkZSgpO1xyXG4gICAgICAgICAgICBjb25zb2xlLmxvZyhyZXNwb25zZSk7XHJcbiAgICAgICAgfTtcclxuICAgIHZhciByZXF1ZXN0T3B0aW9ucyA9IHtcclxuICAgICAgICB0eXBlOiBcIkdFVFwiLFxyXG4gICAgICAgIGNhY2hlOiBmYWxzZSxcclxuICAgICAgICBzdWNjZXNzOiBvbkV2ZW50c1N1Y2Nlc3MsXHJcbiAgICAgICAgZXJyb3I6IG9uRXZlbnRzRXJyb3JcclxuICAgIH07XHJcbiAgICAkLmFqYXgoJ3NjaGVkdWxlL2V2ZW50cycsIHJlcXVlc3RPcHRpb25zKTtcclxuICAgIFxyXG4gICAgLy8hZXZlbnRzXHJcblxyXG4gICAgLy9pbml0IHZhcmlhYmxlc1xyXG4gICAgdmFyIGRheUV2ZW50c1RlbXBsYXRlID0gJCgnI2RheS1ldmVudHMnKS5odG1sKCk7XHJcblxyXG4gICAgdmFyIG1vZGFsID0gJChcIiNtb2RhbFwiKTtcclxuICAgIHZhciBkYXRldGltZVBpY2tlckluaXQgPSBmdW5jdGlvbihvcHRpb25zLCBpZCl7XHJcbiAgICAgICAgLy9EYXRlIGluaXRcclxuICAgICAgICB2YXIgZHRQaWNrZXIgPSAkKCcjZGF0ZXRpbWVwaWNrZXInKSxcclxuICAgICAgICAgICAgY2hlY2tPcHRpb25zID0ge1xyXG4gICAgICAgICAgICAgICAgY2hlY2tib3hDbGFzczogJ2ljaGVja2JveF9zcXVhcmUtYmx1ZScsXHJcbiAgICAgICAgICAgICAgICByYWRpb0NsYXNzOiAnaXJhZGlvX3NxdWFyZS1ibHVlJyxcclxuICAgICAgICAgICAgICAgIGluY3JlYXNlQXJlYTogJzIwJScsXHJcbiAgICAgICAgICAgIH07XHJcbiAgICAgICAgJCgnI3JlcGVhdC1kYXknKS5pQ2hlY2soJ3VuY2hlY2snKVxyXG4gICAgICAgICAgICAuaUNoZWNrKGNoZWNrT3B0aW9ucykub24oXCJpZlVuY2hlY2tlZFwiLCBmdW5jdGlvbigpe1xyXG4gICAgICAgICAgICAgICAgZHRQaWNrZXJcclxuICAgICAgICAgICAgICAgICAgICAuZGF0ZXRpbWVwaWNrZXIoJ2Rlc3Ryb3knKVxyXG4gICAgICAgICAgICAgICAgICAgIC5kYXRldGltZXBpY2tlcigpO1xyXG4gICAgICAgICAgICAgICAgJChcIiNyZXBlYXQtbW9udGhcIikuaUNoZWNrKCdlbmFibGUnKTtcclxuICAgICAgICAgICAgICAgIHJlcGVhdE9uLmlDaGVjaygnZW5hYmxlJyk7XHJcbiAgICAgICAgICAgIH0pLm9uKFwiaWZDaGVja2VkXCIsIGZ1bmN0aW9uKCl7XHJcbiAgICAgICAgICAgICAgICBkdFBpY2tlclxyXG4gICAgICAgICAgICAgICAgICAgIC5kYXRldGltZXBpY2tlcignZGVzdHJveScpXHJcbiAgICAgICAgICAgICAgICAgICAgLmRhdGV0aW1lcGlja2VyKHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgZGF0ZXBpY2tlcjpmYWxzZSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgZm9ybWF0OidIOmknXHJcbiAgICAgICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgICAgICAkKFwiI3JlcGVhdC1tb250aFwiKS5pQ2hlY2soJ2Rpc2FibGUnKTtcclxuICAgICAgICAgICAgICAgIHJlcGVhdE9uLmlDaGVjaygnZGlzYWJsZScpO1xyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICBkdFBpY2tlclxyXG4gICAgICAgICAgICAuZGF0ZXRpbWVwaWNrZXIoJ2Rlc3Ryb3knKVxyXG4gICAgICAgICAgICAuZGF0ZXRpbWVwaWNrZXIob3B0aW9ucyk7XHJcblxyXG4gICAgICAgIC8vUmVwZWF0IGluaXRcclxuICAgICAgICB2YXIgcmVwZWF0T24gPSAkKFwiI3JlcGVhdC1vblwiKTtcclxuICAgICAgICByZXBlYXRPbi5oaWRlKCk7XHJcbiAgICAgICAgJCgnI3JlcGVhdC1tb250aCcpLmlDaGVjaygndW5jaGVjaycpXHJcbiAgICAgICAgICAgIC5pQ2hlY2soY2hlY2tPcHRpb25zKVxyXG4gICAgICAgICAgICAub24oXCJpZlVuY2hlY2tlZFwiLCBmdW5jdGlvbigpe1xyXG4gICAgICAgICAgICAgICAgcmVwZWF0T24uaGlkZSgpO1xyXG4gICAgICAgICAgICB9KVxyXG4gICAgICAgICAgICAub24oXCJpZkNoZWNrZWRcIiwgZnVuY3Rpb24oKXtcclxuICAgICAgICAgICAgICAgICQoXCJbaWQqPSdyZXBlYXQtb24tJ11cIilcclxuICAgICAgICAgICAgICAgICAgICAuaUNoZWNrKGNoZWNrT3B0aW9ucyk7XHJcbiAgICAgICAgICAgICAgICByZXBlYXRPbi5zaG93KCk7XHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgIC8vU2V0IGNoZWNrZWQgZGF5c1xyXG4gICAgICAgIChmdW5jdGlvbigpe1xyXG4gICAgICAgICAgICB2YXIgcmVwZWF0cyA9IHN0b3JhZ2UuZ2V0KCdldmVudHMnKS53aGVyZUlkKGlkKS5yZXBlYXQoKS5yZXN1bHQoKVswXTtcclxuICAgICAgICAgICAgaWYocmVwZWF0cy5ldmVyeVdlZWspe1xyXG4gICAgICAgICAgICAgICAgJCgnI3JlcGVhdC1tb250aCcpLmlDaGVjaygnY2hlY2snKTtcclxuICAgICAgICAgICAgICAgIGZvcih2YXIgaSBpbiByZXBlYXRzLmRheXMpXHJcbiAgICAgICAgICAgICAgICAgICAgJChcIiNyZXBlYXQtb24tXCIgKyBpKS5pQ2hlY2socmVwZWF0cy5kYXlzW2ldID8gJ2NoZWNrJzogJ3VuY2hlY2snKVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGlmKHJlcGVhdHMuZXZlcnlEYXkpe1xyXG5cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH0pKCk7XHJcblxyXG4gICAgICAgIC8vIWNoZWNrZWQgZGF5c1xyXG5cclxuICAgICAgICBtb2RhbC5tb2RhbCgnc2hvdycpO1xyXG4gICAgfTtcclxuICAgIC8vb24gU2F2aW5nIGNoYW5nZXNcclxuICAgIHZhciBzYXZlRWRpdENoYW5nZXMgPSBmdW5jdGlvbihpZCl7XHJcbiAgICAgICAgdmFyIHRpdGxlID0gJC50cmltKCQoXCIjVGl0bGVcIikudmFsKCkpLFxyXG4gICAgICAgICAgICBkZXNjcmlwdGlvbiA9ICQudHJpbSgkKFwiI0Rlc2NyaXB0aW9uXCIpLnZhbCgpKSxcclxuICAgICAgICAgICAgaXNEYXlSZXBlYXQgPSAkKFwiI3JlcGVhdC1kYXlcIikucHJvcChcImNoZWNrZWRcIiksXHJcbiAgICAgICAgICAgIGRhdGVUaW1lID0gJChcIiNkYXRldGltZXBpY2tlclwiKS52YWwoKTtcclxuICAgICAgICBpZighaXNEYXlSZXBlYXQpe1xyXG4gICAgICAgICAgICB2YXIgaXNXZWVrUmVwZWF0ID0gICQoXCIjcmVwZWF0LW1vbnRoXCIpLnByb3AoXCJjaGVja2VkXCIpO1xyXG4gICAgICAgICAgICBpZihpc1dlZWtSZXBlYXQpe1xyXG4gICAgICAgICAgICAgICAgdmFyIGRheXNSZXBlYXQgPSB7fTtcclxuICAgICAgICAgICAgICAgICQoXCJbaWQqPSdyZXBlYXQtb24tJ11cIikuZWFjaChmdW5jdGlvbiAoaSwgb2JqKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgZGF5c1JlcGVhdFskKG9iaikuYXR0cignaWQnKS5zdWJzdHJpbmcoMTApXSA9ICQob2JqKS5wcm9wKFwiY2hlY2tlZFwiKSA/IDEgOiAwO1xyXG4gICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICAgICAgXHJcbiAgICAgICAgc3RvcmFnZS5nZXQoJ2V2ZW50cycpLmFkZCh7XHJcbiAgICAgICAgICAgIGlkOiBpZCxcclxuICAgICAgICAgICAgdGl0bGU6IHRpdGxlLFxyXG4gICAgICAgICAgICBkYXRlIDogZGF0ZVRpbWUsXHJcbiAgICAgICAgICAgIGRlc2NyaXB0aW9uOiBkZXNjcmlwdGlvbixcclxuICAgICAgICAgICAgZXZlcnlEYXk6IGlzRGF5UmVwZWF0LFxyXG4gICAgICAgICAgICBldmVyeVdlZWs6IGlzV2Vla1JlcGVhdCxcclxuICAgICAgICAgICAgZGF5czogZGF5c1JlcGVhdFxyXG4gICAgICAgIH0pXHJcbiAgICB9LFxyXG4gICAgc2F2ZUFkZENoYW5nZXMgPSBmdW5jdGlvbihpZCl7XHJcblxyXG4gICAgfTtcclxuXHJcbiAgICAvL0luaXQgY2FsZW5kYXJcclxuICAgIHZhciBpbml0Q2FsZW5kYXIgPSBmdW5jdGlvbihldmVudHMpe1xyXG4gICAgICAgIHZhciBjbG5kciA9ICQoJyNmdWxsLWNsbmRyJykuY2xuZHIoe1xyXG4gICAgICAgICAgICB0ZW1wbGF0ZTogJCgnI2Z1bGwtY2xuZHItdGVtcGxhdGUnKS5odG1sKCksXHJcbiAgICAgICAgICAgIGV2ZW50czogZXZlbnRzLFxyXG4gICAgICAgICAgICBjbGlja0V2ZW50czoge1xyXG4gICAgICAgICAgICAgICAgY2xpY2s6IGZ1bmN0aW9uICh0YXJnZXQpIHtcclxuICAgICAgICAgICAgICAgICAgICB2YXIgdGVtcGxhdGUgPSBfLnRlbXBsYXRlKGRheUV2ZW50c1RlbXBsYXRlKTtcclxuICAgICAgICAgICAgICAgICAgICAkKFwiLmRheS1ldmVudHNcIilcclxuICAgICAgICAgICAgICAgICAgICAgICAgLm1DdXN0b21TY3JvbGxiYXIoXCJkZXN0cm95XCIpXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIC5odG1sKHRlbXBsYXRlKHtldmVudHNUaGlzRGF5OiB0YXJnZXQuZXZlbnRzfSkpXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIC5oZWlnaHQoICQoXCIuY2xuZHItZ3JpZCAuZGF5c1wiKS5oZWlnaHQoKSAtICQoXCIuY2xuZHItZ3JpZCAuZGF5cy1vZi10aGUtd2Vla1wiKS5oZWlnaHQoKSApXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIC5tQ3VzdG9tU2Nyb2xsYmFyKHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHNjcm9sbEJ1dHRvbnM6e2VuYWJsZTp0cnVlfSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRoZW1lOlwibWluaW1hbC1kYXJrXCJcclxuICAgICAgICAgICAgICAgICAgICAgICAgfSk7XHJcblxyXG4gICAgICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgICAgIG9uTW9udGhDaGFuZ2U6IGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgICAgICAgICB0aGlzLm9wdGlvbnMucmVhZHkoKTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgZm9yY2VTaXhSb3dzOiB0cnVlLFxyXG4gICAgICAgICAgICBtdWx0aURheUV2ZW50czoge1xyXG4gICAgICAgICAgICAgICAgc2luZ2xlRGF5OiAnZGF0ZScsXHJcbiAgICAgICAgICAgICAgICBlbmREYXRlOiAnZW5kRGF0ZScsXHJcbiAgICAgICAgICAgICAgICBzdGFydERhdGU6ICdzdGFydERhdGUnXHJcbiAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgIHNob3dBZGphY2VudE1vbnRoczogdHJ1ZSxcclxuICAgICAgICAgICAgYWRqYWNlbnREYXlzQ2hhbmdlTW9udGg6IGZhbHNlLFxyXG4gICAgICAgICAgICB0cmFja1NlbGVjdGVkRGF0ZTogdHJ1ZSxcclxuICAgICAgICAgICAgZGF5c09mVGhlV2VlazogKGZ1bmN0aW9uKCl7XHJcbiAgICAgICAgICAgICAgICB2YXIgcmVzdWx0ID0gW107XHJcbiAgICAgICAgICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IDc7IGkrKykge1xyXG4gICAgICAgICAgICAgICAgICAgIHJlc3VsdC5wdXNoKG1vbWVudCgpLndlZWtkYXkoaSkuZm9ybWF0KCdkZGQnKSk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gcmVzdWx0O1xyXG4gICAgICAgICAgICB9KSgpLFxyXG4gICAgICAgICAgICByZWFkeTogZnVuY3Rpb24oKXsgLy9yZWFkeVxyXG4gICAgICAgICAgICAgICAgdmFyIGV2ZW50TGlzdGluZ1RpdGxlID0gJChcIi5ldmVudC1saXN0aW5nLXRpdGxlXCIpO1xyXG4gICAgICAgICAgICAgICAgLy9Jbml0IGJsb2NrIE9wZW4vQ2xvc2UgZXZlbnRcclxuICAgICAgICAgICAgICAgIGV2ZW50TGlzdGluZ1RpdGxlLm9uKFwiY2xpY2tcIiwgXCIuZ2x5cGhpY29uLWNoZXZyb24tdXAsIC5nbHlwaGljb24tY2hldnJvbi1kb3duXCIsIGZ1bmN0aW9uKCl7XHJcbiAgICAgICAgICAgICAgICAgICAgdmFyIGVsID0ge307XHJcbiAgICAgICAgICAgICAgICAgICAgdmFyIGJsb2NrID0ge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBvcGVuOiBcImdseXBoaWNvbi1jaGV2cm9uLXVwXCIsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGNsb3NlOiBcImdseXBoaWNvbi1jaGV2cm9uLWRvd25cIlxyXG4gICAgICAgICAgICAgICAgICAgIH07XHJcbiAgICAgICAgICAgICAgICAgICAgdmFyICR0aGlzID0gJCh0aGlzKTtcclxuICAgICAgICAgICAgICAgICAgICBpZigkdGhpcy5wYXJlbnQoKS5oYXNDbGFzcyhcIm1vbnRoLXRpdGxlXCIpKVxyXG4gICAgICAgICAgICAgICAgICAgICAgICBlbCA9ICQoXCIuZGF5LXRpdGxlIFtjbGFzcyAqPWdseXBoaWNvbi1jaGV2cm9uXVwiKS5lcSgwKTtcclxuICAgICAgICAgICAgICAgICAgICBlbHNlXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGVsID0gJChcIi5tb250aC10aXRsZSBbY2xhc3MgKj1nbHlwaGljb24tY2hldnJvbl1cIikuZXEoMCk7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgIGlmKGVsLmhhc0NsYXNzKGJsb2NrLm9wZW4pKVxyXG4gICAgICAgICAgICAgICAgICAgICAgICBlbC5yZW1vdmVDbGFzcyhibG9jay5vcGVuKS5hZGRDbGFzcyhibG9jay5jbG9zZSk7XHJcbiAgICAgICAgICAgICAgICAgICAgZWxzZVxyXG4gICAgICAgICAgICAgICAgICAgICAgICBlbC5yZW1vdmVDbGFzcyhibG9jay5jbG9zZSkuYWRkQ2xhc3MoYmxvY2sub3Blbik7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgIGlmKCR0aGlzLmhhc0NsYXNzKGJsb2NrLm9wZW4pKVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAkdGhpcy5yZW1vdmVDbGFzcyhibG9jay5vcGVuKS5hZGRDbGFzcyhibG9jay5jbG9zZSk7XHJcbiAgICAgICAgICAgICAgICAgICAgZWxzZVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAkdGhpcy5yZW1vdmVDbGFzcyhibG9jay5jbG9zZSkuYWRkQ2xhc3MoYmxvY2sub3Blbik7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgICQoXCIuZXZlbnQtaXRlbXMsIC5kYXktZXZlbnRzXCIpLnNsaWRlVG9nZ2xlKCk7XHJcblxyXG4gICAgICAgICAgICAgICAgfSk7XHJcblxyXG5cclxuICAgICAgICAgICAgICAgIHZhciBkYXRldGltZXBpY2tlck9wdGlvbnMgPSB7XHJcbiAgICAgICAgICAgICAgICAgICAgc3RlcDogMzBcclxuICAgICAgICAgICAgICAgIH07XHJcbiAgICAgICAgICAgICAgICAvL0luaXQgbW9kYWwgd2luZG93IFwiRWRpdCBldmVudFwiXHJcbiAgICAgICAgICAgICAgICAkKFwiLmV2ZW50LWxpc3RpbmdcIikub24oJ2NsaWNrJywgJy5ldmVudC1pdGVtJywgZnVuY3Rpb24oKXtcclxuICAgICAgICAgICAgICAgICAgICBtb2RhbC5maW5kKFwiZm9ybVwiKS5nZXQoMCkucmVzZXQoKTtcclxuICAgICAgICAgICAgICAgICAgICBtb2RhbC5maW5kKFwiLm1vZGFsLXRpdGxlXCIpLnRleHQoXCJFZGl0IGV2ZW50XCIpO1xyXG5cclxuICAgICAgICAgICAgICAgICAgICBkYXRldGltZXBpY2tlck9wdGlvbnMudmFsdWUgPSAkKHRoaXMpLmZpbmQoXCIuZXZlbnQtaXRlbS10aW1lXCIpLmF0dHIoXCJkYXRhLWRhdGV0aW1lXCIpO1xyXG4gICAgICAgICAgICAgICAgICAgIG1vZGFsLmZpbmQoXCIjVGl0bGVcIikudmFsKCQodGhpcykuZmluZChcIi5ldmVudC1pdGVtLW5hbWVcIikudGV4dCgpKTtcclxuICAgICAgICAgICAgICAgICAgICBtb2RhbC5maW5kKFwiI0Rlc2NyaXB0aW9uXCIpLnZhbCgkKHRoaXMpLmZpbmQoXCIuZXZlbnQtaXRlbS1sb2NhdGlvblwiKS50ZXh0KCkpO1xyXG5cclxuICAgICAgICAgICAgICAgICAgICBkYXRldGltZVBpY2tlckluaXQoZGF0ZXRpbWVwaWNrZXJPcHRpb25zLCAkKHRoaXMpLmF0dHIoJ2RhdGEtaWQnKSk7XHJcbiAgICAgICAgICAgICAgICAgICAgbW9kYWwuZmluZChcIi5zYXZlLWNoYW5nZXNcIikub25lKCdjbGljaycsIHNhdmVFZGl0Q2hhbmdlcy5iaW5kKG51bGwsJCh0aGlzKS5hdHRyKCdkYXRhLWlkJykpKTtcclxuICAgICAgICAgICAgICAgIH0pO1xyXG5cclxuICAgICAgICAgICAgICAgIC8vSW5pdCBtb2RhbCB3aW5kb3cgXCJBZGQgZXZlbnRcIlxyXG4gICAgICAgICAgICAgICAgZXZlbnRMaXN0aW5nVGl0bGUub24oXCJjbGlja1wiLCBcIi5nbHlwaGljb24tcGx1c1wiLCBmdW5jdGlvbigpe1xyXG4gICAgICAgICAgICAgICAgICAgIG1vZGFsLmZpbmQoXCJmb3JtXCIpLmdldCgwKS5yZXNldCgpO1xyXG4gICAgICAgICAgICAgICAgICAgIG1vZGFsLmZpbmQoXCIubW9kYWwtdGl0bGVcIikudGV4dChcIkFkZCBldmVudFwiKTtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgaWYoJCh0aGlzKS5wYXJlbnQoKS5oYXNDbGFzcyhcImRheS10aXRsZVwiKSl7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGRhdGV0aW1lcGlja2VyT3B0aW9ucy52YWx1ZSA9IChmdW5jdGlvbigpe1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdmFyIHRpbWUgPSBcIiBcIiArIG1vbWVudCgpLmZvcm1hdChcIkhIOm1tXCIpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdmFyIGVsID0gJChjbG5kci5lbGVtZW50KS5maW5kKFwiLnNlbGVjdGVkXCIpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYoZWwubGVuZ3RoID4gMClcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gZWwuYXR0cihcImRhdGEtaWRcIikgKyB0aW1lO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZWxzZVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiAkKGNsbmRyLmVsZW1lbnQpLmZpbmQoXCJ0b2RheVwiKS5hdHRyKFwiZGF0YS1pZFwiKSArIHRpbWU7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH0pKCk7XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgICAgICAgICBkYXRldGltZVBpY2tlckluaXQoZGF0ZXRpbWVwaWNrZXJPcHRpb25zKTtcclxuICAgICAgICAgICAgICAgICAgICBtb2RhbC5maW5kKFwiLnNhdmUtY2hhbmdlc1wiKS5vbmUoJ2NsaWNrJywgc2F2ZUFkZENoYW5nZXMuYmluZChudWxsLCQodGhpcykuYXR0cignZGF0YS1pZCcpKSk7XHJcbiAgICAgICAgICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgICAgICAgICB2YXIgY2FsZW5kYXIgPSAkKFwiLmNsbmRyXCIpO1xyXG4gICAgICAgICAgICAgICAgY2FsZW5kYXIuaGVpZ2h0KGNhbGVuZGFyLmhlaWdodCgpKTtcclxuXHJcbiAgICAgICAgICAgIH0sLy8hcmVhZHlcclxuICAgICAgICAgICAgZG9uZVJlbmRlcmluZzogZnVuY3Rpb24oKXsgLy9kb25lUmVuZGVyaW5nXHJcbiAgICAgICAgICAgICAgICAkKFwiLmRheS1ldmVudHNcIilcclxuICAgICAgICAgICAgICAgICAgICAuaGVpZ2h0KCAkKFwiLmNsbmRyLWdyaWQgLmRheXNcIikuaGVpZ2h0KCkgLSAkKFwiLmNsbmRyLWdyaWQgLmRheXMtb2YtdGhlLXdlZWtcIikuaGVpZ2h0KCkgKVxyXG4gICAgICAgICAgICAgICAgICAgIC5tQ3VzdG9tU2Nyb2xsYmFyKHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgc2Nyb2xsQnV0dG9uczp7ZW5hYmxlOnRydWV9LFxyXG4gICAgICAgICAgICAgICAgICAgICAgICB0aGVtZTpcIm1pbmltYWwtZGFya1wiXHJcbiAgICAgICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgICAgICB2YXIgY2FsZW5kYXIgPSAkKFwiI2Z1bGwtY2xuZHJcIik7XHJcbiAgICAgICAgICAgICAgICBpZihjYWxlbmRhci5maW5kKFwiLnRvZGF5XCIpLmxlbmd0aCA+IDApXHJcbiAgICAgICAgICAgICAgICAgICAgY2FsZW5kYXIuZmluZChcIi50b2RheVwiKS5jbGljaygpO1xyXG4gICAgICAgICAgICAgICAgZWxzZVxyXG4gICAgICAgICAgICAgICAgICAgIGNhbGVuZGFyLmZpbmQoXCIuZGF5XCIpLmVxKDApLmNsaWNrKCk7XHJcblxyXG4gICAgICAgICAgICB9Ly8hZG9uZVJlbmRlcmluZ1xyXG4gICAgICAgIH0pO1xyXG4gICAgfTtcclxuXHJcbn0pKCk7Il0sImZpbGUiOiJzY2hlZHVsZS5qcyIsInNvdXJjZVJvb3QiOiIvc291cmNlLyJ9
