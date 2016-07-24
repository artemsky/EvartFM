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
            repeat: null
        },
        'get': function(key){
            this.target.repeat = false;
            if(!this.disk.getItem(key))
              return null;
            this.target.object = JSON.parse(this.disk.getItem(key));
            this.target.name = key;
            return this;
        },
        'set': function(key, value){
            this.target.repeat = false;
            this.disk.setItem(key, JSON.stringify(value));
            this.target.name = key;
            return this;
        },
        add: function(event){
            var identity = event.id > 0 ? event.id : Date.now();
            var result = {
                id: identity,
                title: event.title,
                description: event.description,
                date: event.date,
                repeat: {
                    event_id: identity,
                    everyDay: event.everyDay ? 1 : 0,
                    everyWeek: event.everyWeek ? 1 : 0,
                }
            };
            if(event.days){
                var dayKeys = Object.keys(event.days);
                for(var i = dayKeys.length; i--;){
                    var key = dayKeys[i];
                    result.repeat[key] = event.days[key];
                }
            }
            var isExists = false;
            this.target.object.forEach(function(value, i, arr){
                if(value.id == result.id){
                    isExists = true;
                    arr[i] = result;
                }
            });
            if(!isExists){
                this.target.object.push(result);
            }

            return this;
        },
        save: function(){
            this.set('events', this.target.object);
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
                    switch(key){
                        case "mon":
                        case "tue":
                        case "wed":
                        case "thu":
                        case "fri":
                        case "sat":
                        case "sun":
                            days[key] = this.target.object[i].repeat[key];
                            break;
                        default:
                            repeat[key] = this.target.object[i].repeat[key];
                    }

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
    var clndr = {};
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
        if(id){
            (function(){
                var repeats = storage.get('events').whereId(id).repeat().result()[0];
                if(repeats.everyWeek){
                    $('#repeat-month').iCheck('check');
                    for(var i in repeats.days){
                        $("#repeat-on-" + i).iCheck(repeats.days[i] ? 'check': 'uncheck')
                    }

                }
                if(repeats.everyDay){
                    $('#repeat-day').iCheck('check');
                }
            })();
        }
        //!checked days
        modal.modal('show');
    };
    //on Saving changes
    var saveChanges = function(id){
        var title = $.trim($("#Title").val()),
            description = $.trim($("#Description").val()),
            isDayRepeat = $("#repeat-day").prop("checked"),
            dateTime = $("#datetimepicker").val();

        if(!title){
            $("#Title").tooltip({
                trigger:'manual'
            }).tooltip('show');
            setTimeout(function(){
                $("#Title").tooltip('destroy');
            }, 2000);
            return;
        }
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
            id: id || -1,
            title: title,
            date : dateTime,
            description: description,
            everyDay: isDayRepeat,
            everyWeek: isWeekRepeat,
            days: daysRepeat
        }).save();
        
        clndr.setEvents(storage.get('events').result());
        modal.modal('hide');
    };

    //Init calendar
    var initCalendar = function(events){
        clndr = $('#full-clndr').clndr({
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
                    modal.find(".save-changes").off("click").on('click', saveChanges.bind(null,$(this).attr('data-id')));
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
                    modal.find(".save-changes").off("click").on('click', saveChanges.bind(null,$(this).attr('data-id')));
                });

                var calendar = $(".clndr");
                calendar.height(calendar.height());

            }//!doneRendering
        });
    };

})();
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiIiwic291cmNlcyI6WyJzY2hlZHVsZS5qcyJdLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24oKXtcclxuICAgIFwidXNlIHN0cmljdFwiO1xyXG4gICAgLy9TZXQgdW5kZXJzY29yZSB0ZW1wbGF0ZSBzZXR0aW5nIGFzIHt7JSV9fSBmb3IgYmV0dGVyIGNvZGUgcmVhZGluZ1xyXG4gICAgXy50ZW1wbGF0ZVNldHRpbmdzID0ge1xyXG4gICAgICAgIGV2YWx1YXRlICAgIDogL1xce1xceyUoW1xcc1xcU10rPyklXFx9XFx9L2csXHJcbiAgICAgICAgaW50ZXJwb2xhdGUgOiAvXFx7XFx7JT0oW1xcc1xcU10rPyklXFx9XFx9L2csXHJcbiAgICAgICAgZXNjYXBlICAgICAgOiAvXFx7XFx7JS0oW1xcc1xcU10rPyklXFx9XFx9L2dcclxuICAgIH07XHJcbiAgICAvL1NldCBtb21lbnQgbG9jYWxlXHJcbiAgICBtb21lbnQubG9jYWxlKFwiZW4tZ2JcIik7XHJcblxyXG4gICAgLy9Jbml0IHN0b3JhZ2UgaGVscGVyc1xyXG4gICAgdmFyIHN0b3JhZ2UgPSB7XHJcbiAgICAgICAgZGlzazogc2Vzc2lvblN0b3JhZ2UgfHwgbG9jYWxTdG9yYWdlLFxyXG4gICAgICAgIHRhcmdldDoge1xyXG4gICAgICAgICAgICBuYW1lOiBudWxsLFxyXG4gICAgICAgICAgICBvYmplY3Q6IG51bGwsXHJcbiAgICAgICAgICAgIHJlcGVhdDogbnVsbFxyXG4gICAgICAgIH0sXHJcbiAgICAgICAgJ2dldCc6IGZ1bmN0aW9uKGtleSl7XHJcbiAgICAgICAgICAgIHRoaXMudGFyZ2V0LnJlcGVhdCA9IGZhbHNlO1xyXG4gICAgICAgICAgICBpZighdGhpcy5kaXNrLmdldEl0ZW0oa2V5KSlcclxuICAgICAgICAgICAgICByZXR1cm4gbnVsbDtcclxuICAgICAgICAgICAgdGhpcy50YXJnZXQub2JqZWN0ID0gSlNPTi5wYXJzZSh0aGlzLmRpc2suZ2V0SXRlbShrZXkpKTtcclxuICAgICAgICAgICAgdGhpcy50YXJnZXQubmFtZSA9IGtleTtcclxuICAgICAgICAgICAgcmV0dXJuIHRoaXM7XHJcbiAgICAgICAgfSxcclxuICAgICAgICAnc2V0JzogZnVuY3Rpb24oa2V5LCB2YWx1ZSl7XHJcbiAgICAgICAgICAgIHRoaXMudGFyZ2V0LnJlcGVhdCA9IGZhbHNlO1xyXG4gICAgICAgICAgICB0aGlzLmRpc2suc2V0SXRlbShrZXksIEpTT04uc3RyaW5naWZ5KHZhbHVlKSk7XHJcbiAgICAgICAgICAgIHRoaXMudGFyZ2V0Lm5hbWUgPSBrZXk7XHJcbiAgICAgICAgICAgIHJldHVybiB0aGlzO1xyXG4gICAgICAgIH0sXHJcbiAgICAgICAgYWRkOiBmdW5jdGlvbihldmVudCl7XHJcbiAgICAgICAgICAgIHZhciBpZGVudGl0eSA9IGV2ZW50LmlkID4gMCA/IGV2ZW50LmlkIDogRGF0ZS5ub3coKTtcclxuICAgICAgICAgICAgdmFyIHJlc3VsdCA9IHtcclxuICAgICAgICAgICAgICAgIGlkOiBpZGVudGl0eSxcclxuICAgICAgICAgICAgICAgIHRpdGxlOiBldmVudC50aXRsZSxcclxuICAgICAgICAgICAgICAgIGRlc2NyaXB0aW9uOiBldmVudC5kZXNjcmlwdGlvbixcclxuICAgICAgICAgICAgICAgIGRhdGU6IGV2ZW50LmRhdGUsXHJcbiAgICAgICAgICAgICAgICByZXBlYXQ6IHtcclxuICAgICAgICAgICAgICAgICAgICBldmVudF9pZDogaWRlbnRpdHksXHJcbiAgICAgICAgICAgICAgICAgICAgZXZlcnlEYXk6IGV2ZW50LmV2ZXJ5RGF5ID8gMSA6IDAsXHJcbiAgICAgICAgICAgICAgICAgICAgZXZlcnlXZWVrOiBldmVudC5ldmVyeVdlZWsgPyAxIDogMCxcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfTtcclxuICAgICAgICAgICAgaWYoZXZlbnQuZGF5cyl7XHJcbiAgICAgICAgICAgICAgICB2YXIgZGF5S2V5cyA9IE9iamVjdC5rZXlzKGV2ZW50LmRheXMpO1xyXG4gICAgICAgICAgICAgICAgZm9yKHZhciBpID0gZGF5S2V5cy5sZW5ndGg7IGktLTspe1xyXG4gICAgICAgICAgICAgICAgICAgIHZhciBrZXkgPSBkYXlLZXlzW2ldO1xyXG4gICAgICAgICAgICAgICAgICAgIHJlc3VsdC5yZXBlYXRba2V5XSA9IGV2ZW50LmRheXNba2V5XTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB2YXIgaXNFeGlzdHMgPSBmYWxzZTtcclxuICAgICAgICAgICAgdGhpcy50YXJnZXQub2JqZWN0LmZvckVhY2goZnVuY3Rpb24odmFsdWUsIGksIGFycil7XHJcbiAgICAgICAgICAgICAgICBpZih2YWx1ZS5pZCA9PSByZXN1bHQuaWQpe1xyXG4gICAgICAgICAgICAgICAgICAgIGlzRXhpc3RzID0gdHJ1ZTtcclxuICAgICAgICAgICAgICAgICAgICBhcnJbaV0gPSByZXN1bHQ7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICBpZighaXNFeGlzdHMpe1xyXG4gICAgICAgICAgICAgICAgdGhpcy50YXJnZXQub2JqZWN0LnB1c2gocmVzdWx0KTtcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgcmV0dXJuIHRoaXM7XHJcbiAgICAgICAgfSxcclxuICAgICAgICBzYXZlOiBmdW5jdGlvbigpe1xyXG4gICAgICAgICAgICB0aGlzLnNldCgnZXZlbnRzJywgdGhpcy50YXJnZXQub2JqZWN0KTtcclxuICAgICAgICB9LFxyXG4gICAgICAgIHdoZXJlRGF0ZTogZnVuY3Rpb24oZGF0ZSl7XHJcbiAgICAgICAgICAgIGlmKCFkYXRlKVxyXG4gICAgICAgICAgICAgICAgcmV0dXJuIG51bGw7XHJcbiAgICAgICAgICAgIGZvcih2YXIgaSBpbiB0aGlzLnRhcmdldC5vYmplY3QpXHJcbiAgICAgICAgICAgICAgICBpZih0aGlzLnRhcmdldC5vYmplY3RbaV0uZGF0ZS5zdWJzdHJpbmcoMCwxMCkgPT0gZGF0ZSl7XHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy50YXJnZXQub2JqZWN0ID0gW3RoaXMudGFyZ2V0Lm9iamVjdFtpXV07XHJcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHRoaXM7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIHRoaXMudGFyZ2V0Lm9iamVjdCA9IFtdO1xyXG4gICAgICAgICAgICByZXR1cm4gdGhpcztcclxuICAgICAgICB9LFxyXG4gICAgICAgIHdoZXJlSWQ6IGZ1bmN0aW9uKGlkKXtcclxuICAgICAgICAgICAgaWYoIWlkKVxyXG4gICAgICAgICAgICAgICAgcmV0dXJuIG51bGw7XHJcbiAgICAgICAgICAgIGZvcih2YXIgaSBpbiB0aGlzLnRhcmdldC5vYmplY3QpXHJcbiAgICAgICAgICAgICAgICBpZih0aGlzLnRhcmdldC5vYmplY3RbaV0uaWQgPT0gaWQpe1xyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMudGFyZ2V0Lm9iamVjdCA9IFt0aGlzLnRhcmdldC5vYmplY3RbaV1dO1xyXG4gICAgICAgICAgICAgICAgICAgIHJldHVybiB0aGlzO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB0aGlzLnRhcmdldC5vYmplY3QgPSBbXTtcclxuICAgICAgICAgICAgcmV0dXJuIHRoaXM7XHJcbiAgICAgICAgfSxcclxuICAgICAgICByZXBlYXQ6IGZ1bmN0aW9uKCl7XHJcbiAgICAgICAgICAgIHRoaXMudGFyZ2V0LnJlcGVhdCA9IHRydWU7XHJcbiAgICAgICAgICAgIHJldHVybiB0aGlzO1xyXG4gICAgICAgIH0sXHJcbiAgICAgICAgcmVzdWx0OiBmdW5jdGlvbigpe1xyXG4gICAgICAgICAgICBpZighdGhpcy50YXJnZXQucmVwZWF0KVxyXG4gICAgICAgICAgICAgICAgcmV0dXJuIHRoaXMudGFyZ2V0Lm9iamVjdDtcclxuICAgICAgICAgICAgdmFyIHJlc3VsdCA9IFtdO1xyXG4gICAgICAgICAgICBmb3IodmFyIGkgaW4gdGhpcy50YXJnZXQub2JqZWN0KXtcclxuICAgICAgICAgICAgICAgIHZhciByZXBlYXRLZXlzID0gT2JqZWN0LmtleXModGhpcy50YXJnZXQub2JqZWN0W2ldLnJlcGVhdCksXHJcbiAgICAgICAgICAgICAgICAgICAgZGF5cyA9IHt9LFxyXG4gICAgICAgICAgICAgICAgICAgIHJlcGVhdCA9IHt9LFxyXG4gICAgICAgICAgICAgICAgICAgIGtleSA9ICcnO1xyXG4gICAgICAgICAgICAgICAgZm9yKHZhciByID0gcmVwZWF0S2V5cy5sZW5ndGg7IHItLTspe1xyXG4gICAgICAgICAgICAgICAgICAgIGtleSA9IHJlcGVhdEtleXNbcl07XHJcbiAgICAgICAgICAgICAgICAgICAgc3dpdGNoKGtleSl7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGNhc2UgXCJtb25cIjpcclxuICAgICAgICAgICAgICAgICAgICAgICAgY2FzZSBcInR1ZVwiOlxyXG4gICAgICAgICAgICAgICAgICAgICAgICBjYXNlIFwid2VkXCI6XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGNhc2UgXCJ0aHVcIjpcclxuICAgICAgICAgICAgICAgICAgICAgICAgY2FzZSBcImZyaVwiOlxyXG4gICAgICAgICAgICAgICAgICAgICAgICBjYXNlIFwic2F0XCI6XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGNhc2UgXCJzdW5cIjpcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRheXNba2V5XSA9IHRoaXMudGFyZ2V0Lm9iamVjdFtpXS5yZXBlYXRba2V5XTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBkZWZhdWx0OlxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcmVwZWF0W2tleV0gPSB0aGlzLnRhcmdldC5vYmplY3RbaV0ucmVwZWF0W2tleV07XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIHJlcGVhdC5kYXlzID0gZGF5cztcclxuICAgICAgICAgICAgICAgIHJlc3VsdC5wdXNoKHJlcGVhdCk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgcmV0dXJuIHJlc3VsdDtcclxuICAgICAgICB9XHJcbiAgICB9O1xyXG5cclxuICAgIC8vZXZlbnRzXHJcbiAgICB2YXIgZXZlbnRzID0gW107XHJcbiAgICB2YXIgb25FdmVudHNTdWNjZXNzID0gZnVuY3Rpb24ocmVzcG9uc2Upe1xyXG4gICAgICAgICAgICAkKFwiI2ZvdW50YWluVGV4dEdcIikuaGlkZSgpO1xyXG4gICAgICAgICAgICBpbml0Q2FsZW5kYXIocmVzcG9uc2UpO1xyXG4gICAgICAgICAgICBzdG9yYWdlLnNldCgnZXZlbnRzJywgcmVzcG9uc2UpO1xyXG4gICAgICAgIH0sXHJcbiAgICAgICAgb25FdmVudHNFcnJvciA9IGZ1bmN0aW9uIChyZXNwb25zZSl7XHJcbiAgICAgICAgICAgICQoXCIjZm91bnRhaW5UZXh0R1wiKS5oaWRlKCk7XHJcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKHJlc3BvbnNlKTtcclxuICAgICAgICB9O1xyXG4gICAgdmFyIHJlcXVlc3RPcHRpb25zID0ge1xyXG4gICAgICAgIHR5cGU6IFwiR0VUXCIsXHJcbiAgICAgICAgY2FjaGU6IGZhbHNlLFxyXG4gICAgICAgIHN1Y2Nlc3M6IG9uRXZlbnRzU3VjY2VzcyxcclxuICAgICAgICBlcnJvcjogb25FdmVudHNFcnJvclxyXG4gICAgfTtcclxuICAgICQuYWpheCgnc2NoZWR1bGUvZXZlbnRzJywgcmVxdWVzdE9wdGlvbnMpO1xyXG4gICAgXHJcbiAgICAvLyFldmVudHNcclxuXHJcbiAgICAvL2luaXQgdmFyaWFibGVzXHJcbiAgICB2YXIgY2xuZHIgPSB7fTtcclxuICAgIHZhciBkYXlFdmVudHNUZW1wbGF0ZSA9ICQoJyNkYXktZXZlbnRzJykuaHRtbCgpO1xyXG5cclxuICAgIHZhciBtb2RhbCA9ICQoXCIjbW9kYWxcIik7XHJcbiAgICB2YXIgZGF0ZXRpbWVQaWNrZXJJbml0ID0gZnVuY3Rpb24ob3B0aW9ucywgaWQpe1xyXG4gICAgICAgIC8vRGF0ZSBpbml0XHJcbiAgICAgICAgdmFyIGR0UGlja2VyID0gJCgnI2RhdGV0aW1lcGlja2VyJyksXHJcbiAgICAgICAgICAgIGNoZWNrT3B0aW9ucyA9IHtcclxuICAgICAgICAgICAgICAgIGNoZWNrYm94Q2xhc3M6ICdpY2hlY2tib3hfc3F1YXJlLWJsdWUnLFxyXG4gICAgICAgICAgICAgICAgcmFkaW9DbGFzczogJ2lyYWRpb19zcXVhcmUtYmx1ZScsXHJcbiAgICAgICAgICAgICAgICBpbmNyZWFzZUFyZWE6ICcyMCUnLFxyXG4gICAgICAgICAgICB9O1xyXG4gICAgICAgICQoJyNyZXBlYXQtZGF5JykuaUNoZWNrKCd1bmNoZWNrJylcclxuICAgICAgICAgICAgLmlDaGVjayhjaGVja09wdGlvbnMpLm9uKFwiaWZVbmNoZWNrZWRcIiwgZnVuY3Rpb24oKXtcclxuICAgICAgICAgICAgICAgIGR0UGlja2VyXHJcbiAgICAgICAgICAgICAgICAgICAgLmRhdGV0aW1lcGlja2VyKCdkZXN0cm95JylcclxuICAgICAgICAgICAgICAgICAgICAuZGF0ZXRpbWVwaWNrZXIoKTtcclxuICAgICAgICAgICAgICAgICQoXCIjcmVwZWF0LW1vbnRoXCIpLmlDaGVjaygnZW5hYmxlJyk7XHJcbiAgICAgICAgICAgICAgICByZXBlYXRPbi5pQ2hlY2soJ2VuYWJsZScpO1xyXG4gICAgICAgICAgICB9KS5vbihcImlmQ2hlY2tlZFwiLCBmdW5jdGlvbigpe1xyXG4gICAgICAgICAgICAgICAgZHRQaWNrZXJcclxuICAgICAgICAgICAgICAgICAgICAuZGF0ZXRpbWVwaWNrZXIoJ2Rlc3Ryb3knKVxyXG4gICAgICAgICAgICAgICAgICAgIC5kYXRldGltZXBpY2tlcih7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGRhdGVwaWNrZXI6ZmFsc2UsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGZvcm1hdDonSDppJ1xyXG4gICAgICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICAgICAgJChcIiNyZXBlYXQtbW9udGhcIikuaUNoZWNrKCdkaXNhYmxlJyk7XHJcbiAgICAgICAgICAgICAgICByZXBlYXRPbi5pQ2hlY2soJ2Rpc2FibGUnKTtcclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgZHRQaWNrZXJcclxuICAgICAgICAgICAgLmRhdGV0aW1lcGlja2VyKCdkZXN0cm95JylcclxuICAgICAgICAgICAgLmRhdGV0aW1lcGlja2VyKG9wdGlvbnMpO1xyXG5cclxuICAgICAgICAvL1JlcGVhdCBpbml0XHJcbiAgICAgICAgdmFyIHJlcGVhdE9uID0gJChcIiNyZXBlYXQtb25cIik7XHJcbiAgICAgICAgcmVwZWF0T24uaGlkZSgpO1xyXG4gICAgICAgICQoJyNyZXBlYXQtbW9udGgnKS5pQ2hlY2soJ3VuY2hlY2snKVxyXG4gICAgICAgICAgICAuaUNoZWNrKGNoZWNrT3B0aW9ucylcclxuICAgICAgICAgICAgLm9uKFwiaWZVbmNoZWNrZWRcIiwgZnVuY3Rpb24oKXtcclxuICAgICAgICAgICAgICAgIHJlcGVhdE9uLmhpZGUoKTtcclxuICAgICAgICAgICAgfSlcclxuICAgICAgICAgICAgLm9uKFwiaWZDaGVja2VkXCIsIGZ1bmN0aW9uKCl7XHJcbiAgICAgICAgICAgICAgICAkKFwiW2lkKj0ncmVwZWF0LW9uLSddXCIpXHJcbiAgICAgICAgICAgICAgICAgICAgLmlDaGVjayhjaGVja09wdGlvbnMpO1xyXG4gICAgICAgICAgICAgICAgcmVwZWF0T24uc2hvdygpO1xyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICAvL1NldCBjaGVja2VkIGRheXNcclxuICAgICAgICBpZihpZCl7XHJcbiAgICAgICAgICAgIChmdW5jdGlvbigpe1xyXG4gICAgICAgICAgICAgICAgdmFyIHJlcGVhdHMgPSBzdG9yYWdlLmdldCgnZXZlbnRzJykud2hlcmVJZChpZCkucmVwZWF0KCkucmVzdWx0KClbMF07XHJcbiAgICAgICAgICAgICAgICBpZihyZXBlYXRzLmV2ZXJ5V2Vlayl7XHJcbiAgICAgICAgICAgICAgICAgICAgJCgnI3JlcGVhdC1tb250aCcpLmlDaGVjaygnY2hlY2snKTtcclxuICAgICAgICAgICAgICAgICAgICBmb3IodmFyIGkgaW4gcmVwZWF0cy5kYXlzKXtcclxuICAgICAgICAgICAgICAgICAgICAgICAgJChcIiNyZXBlYXQtb24tXCIgKyBpKS5pQ2hlY2socmVwZWF0cy5kYXlzW2ldID8gJ2NoZWNrJzogJ3VuY2hlY2snKVxyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICBpZihyZXBlYXRzLmV2ZXJ5RGF5KXtcclxuICAgICAgICAgICAgICAgICAgICAkKCcjcmVwZWF0LWRheScpLmlDaGVjaygnY2hlY2snKTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfSkoKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgLy8hY2hlY2tlZCBkYXlzXHJcbiAgICAgICAgbW9kYWwubW9kYWwoJ3Nob3cnKTtcclxuICAgIH07XHJcbiAgICAvL29uIFNhdmluZyBjaGFuZ2VzXHJcbiAgICB2YXIgc2F2ZUNoYW5nZXMgPSBmdW5jdGlvbihpZCl7XHJcbiAgICAgICAgdmFyIHRpdGxlID0gJC50cmltKCQoXCIjVGl0bGVcIikudmFsKCkpLFxyXG4gICAgICAgICAgICBkZXNjcmlwdGlvbiA9ICQudHJpbSgkKFwiI0Rlc2NyaXB0aW9uXCIpLnZhbCgpKSxcclxuICAgICAgICAgICAgaXNEYXlSZXBlYXQgPSAkKFwiI3JlcGVhdC1kYXlcIikucHJvcChcImNoZWNrZWRcIiksXHJcbiAgICAgICAgICAgIGRhdGVUaW1lID0gJChcIiNkYXRldGltZXBpY2tlclwiKS52YWwoKTtcclxuXHJcbiAgICAgICAgaWYoIXRpdGxlKXtcclxuICAgICAgICAgICAgJChcIiNUaXRsZVwiKS50b29sdGlwKHtcclxuICAgICAgICAgICAgICAgIHRyaWdnZXI6J21hbnVhbCdcclxuICAgICAgICAgICAgfSkudG9vbHRpcCgnc2hvdycpO1xyXG4gICAgICAgICAgICBzZXRUaW1lb3V0KGZ1bmN0aW9uKCl7XHJcbiAgICAgICAgICAgICAgICAkKFwiI1RpdGxlXCIpLnRvb2x0aXAoJ2Rlc3Ryb3knKTtcclxuICAgICAgICAgICAgfSwgMjAwMCk7XHJcbiAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICB9XHJcbiAgICAgICAgaWYoIWlzRGF5UmVwZWF0KXtcclxuICAgICAgICAgICAgdmFyIGlzV2Vla1JlcGVhdCA9ICAkKFwiI3JlcGVhdC1tb250aFwiKS5wcm9wKFwiY2hlY2tlZFwiKTtcclxuICAgICAgICAgICAgaWYoaXNXZWVrUmVwZWF0KXtcclxuICAgICAgICAgICAgICAgIHZhciBkYXlzUmVwZWF0ID0ge307XHJcbiAgICAgICAgICAgICAgICAkKFwiW2lkKj0ncmVwZWF0LW9uLSddXCIpLmVhY2goZnVuY3Rpb24gKGksIG9iaikge1xyXG4gICAgICAgICAgICAgICAgICAgIGRheXNSZXBlYXRbJChvYmopLmF0dHIoJ2lkJykuc3Vic3RyaW5nKDEwKV0gPSAkKG9iaikucHJvcChcImNoZWNrZWRcIikgPyAxIDogMDtcclxuICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgICAgIFxyXG4gICAgICAgIHN0b3JhZ2UuZ2V0KCdldmVudHMnKS5hZGQoe1xyXG4gICAgICAgICAgICBpZDogaWQgfHwgLTEsXHJcbiAgICAgICAgICAgIHRpdGxlOiB0aXRsZSxcclxuICAgICAgICAgICAgZGF0ZSA6IGRhdGVUaW1lLFxyXG4gICAgICAgICAgICBkZXNjcmlwdGlvbjogZGVzY3JpcHRpb24sXHJcbiAgICAgICAgICAgIGV2ZXJ5RGF5OiBpc0RheVJlcGVhdCxcclxuICAgICAgICAgICAgZXZlcnlXZWVrOiBpc1dlZWtSZXBlYXQsXHJcbiAgICAgICAgICAgIGRheXM6IGRheXNSZXBlYXRcclxuICAgICAgICB9KS5zYXZlKCk7XHJcbiAgICAgICAgXHJcbiAgICAgICAgY2xuZHIuc2V0RXZlbnRzKHN0b3JhZ2UuZ2V0KCdldmVudHMnKS5yZXN1bHQoKSk7XHJcbiAgICAgICAgbW9kYWwubW9kYWwoJ2hpZGUnKTtcclxuICAgIH07XHJcblxyXG4gICAgLy9Jbml0IGNhbGVuZGFyXHJcbiAgICB2YXIgaW5pdENhbGVuZGFyID0gZnVuY3Rpb24oZXZlbnRzKXtcclxuICAgICAgICBjbG5kciA9ICQoJyNmdWxsLWNsbmRyJykuY2xuZHIoe1xyXG4gICAgICAgICAgICB0ZW1wbGF0ZTogJCgnI2Z1bGwtY2xuZHItdGVtcGxhdGUnKS5odG1sKCksXHJcbiAgICAgICAgICAgIGV2ZW50czogZXZlbnRzLFxyXG4gICAgICAgICAgICBjbGlja0V2ZW50czoge1xyXG4gICAgICAgICAgICAgICAgY2xpY2s6IGZ1bmN0aW9uICh0YXJnZXQpIHtcclxuICAgICAgICAgICAgICAgICAgICB2YXIgdGVtcGxhdGUgPSBfLnRlbXBsYXRlKGRheUV2ZW50c1RlbXBsYXRlKTtcclxuICAgICAgICAgICAgICAgICAgICAkKFwiLmRheS1ldmVudHNcIilcclxuICAgICAgICAgICAgICAgICAgICAgICAgLm1DdXN0b21TY3JvbGxiYXIoXCJkZXN0cm95XCIpXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIC5odG1sKHRlbXBsYXRlKHtldmVudHNUaGlzRGF5OiB0YXJnZXQuZXZlbnRzfSkpXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIC5oZWlnaHQoICQoXCIuY2xuZHItZ3JpZCAuZGF5c1wiKS5oZWlnaHQoKSAtICQoXCIuY2xuZHItZ3JpZCAuZGF5cy1vZi10aGUtd2Vla1wiKS5oZWlnaHQoKSApXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIC5tQ3VzdG9tU2Nyb2xsYmFyKHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHNjcm9sbEJ1dHRvbnM6e2VuYWJsZTp0cnVlfSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRoZW1lOlwibWluaW1hbC1kYXJrXCJcclxuICAgICAgICAgICAgICAgICAgICAgICAgfSk7XHJcblxyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICBmb3JjZVNpeFJvd3M6IHRydWUsXHJcbiAgICAgICAgICAgIG11bHRpRGF5RXZlbnRzOiB7XHJcbiAgICAgICAgICAgICAgICBzaW5nbGVEYXk6ICdkYXRlJyxcclxuICAgICAgICAgICAgICAgIGVuZERhdGU6ICdlbmREYXRlJyxcclxuICAgICAgICAgICAgICAgIHN0YXJ0RGF0ZTogJ3N0YXJ0RGF0ZSdcclxuICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgc2hvd0FkamFjZW50TW9udGhzOiB0cnVlLFxyXG4gICAgICAgICAgICBhZGphY2VudERheXNDaGFuZ2VNb250aDogZmFsc2UsXHJcbiAgICAgICAgICAgIHRyYWNrU2VsZWN0ZWREYXRlOiB0cnVlLFxyXG4gICAgICAgICAgICBkYXlzT2ZUaGVXZWVrOiAoZnVuY3Rpb24oKXtcclxuICAgICAgICAgICAgICAgIHZhciByZXN1bHQgPSBbXTtcclxuICAgICAgICAgICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgNzsgaSsrKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgcmVzdWx0LnB1c2gobW9tZW50KCkud2Vla2RheShpKS5mb3JtYXQoJ2RkZCcpKTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIHJldHVybiByZXN1bHQ7XHJcbiAgICAgICAgICAgIH0pKCksXHJcbiAgICAgICAgICAgIGRvbmVSZW5kZXJpbmc6IGZ1bmN0aW9uKCl7IC8vZG9uZVJlbmRlcmluZ1xyXG4gICAgICAgICAgICAgICAgJChcIi5kYXktZXZlbnRzXCIpXHJcbiAgICAgICAgICAgICAgICAgICAgLmhlaWdodCggJChcIi5jbG5kci1ncmlkIC5kYXlzXCIpLmhlaWdodCgpIC0gJChcIi5jbG5kci1ncmlkIC5kYXlzLW9mLXRoZS13ZWVrXCIpLmhlaWdodCgpIClcclxuICAgICAgICAgICAgICAgICAgICAubUN1c3RvbVNjcm9sbGJhcih7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHNjcm9sbEJ1dHRvbnM6e2VuYWJsZTp0cnVlfSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgdGhlbWU6XCJtaW5pbWFsLWRhcmtcIlxyXG4gICAgICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICAgICAgdmFyIGNhbGVuZGFyID0gJChcIiNmdWxsLWNsbmRyXCIpO1xyXG4gICAgICAgICAgICAgICAgaWYoY2FsZW5kYXIuZmluZChcIi50b2RheVwiKS5sZW5ndGggPiAwKVxyXG4gICAgICAgICAgICAgICAgICAgIGNhbGVuZGFyLmZpbmQoXCIudG9kYXlcIikuY2xpY2soKTtcclxuICAgICAgICAgICAgICAgIGVsc2VcclxuICAgICAgICAgICAgICAgICAgICBjYWxlbmRhci5maW5kKFwiLmRheVwiKS5lcSgwKS5jbGljaygpO1xyXG5cclxuICAgICAgICAgICAgICAgIHZhciBldmVudExpc3RpbmdUaXRsZSA9ICQoXCIuZXZlbnQtbGlzdGluZy10aXRsZVwiKTtcclxuICAgICAgICAgICAgICAgIC8vSW5pdCBibG9jayBPcGVuL0Nsb3NlIGV2ZW50XHJcbiAgICAgICAgICAgICAgICBldmVudExpc3RpbmdUaXRsZS5vbihcImNsaWNrXCIsIFwiLmdseXBoaWNvbi1jaGV2cm9uLXVwLCAuZ2x5cGhpY29uLWNoZXZyb24tZG93blwiLCBmdW5jdGlvbigpe1xyXG4gICAgICAgICAgICAgICAgICAgIHZhciBlbCA9IHt9O1xyXG4gICAgICAgICAgICAgICAgICAgIHZhciBibG9jayA9IHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgb3BlbjogXCJnbHlwaGljb24tY2hldnJvbi11cFwiLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBjbG9zZTogXCJnbHlwaGljb24tY2hldnJvbi1kb3duXCJcclxuICAgICAgICAgICAgICAgICAgICB9O1xyXG4gICAgICAgICAgICAgICAgICAgIHZhciAkdGhpcyA9ICQodGhpcyk7XHJcbiAgICAgICAgICAgICAgICAgICAgaWYoJHRoaXMucGFyZW50KCkuaGFzQ2xhc3MoXCJtb250aC10aXRsZVwiKSlcclxuICAgICAgICAgICAgICAgICAgICAgICAgZWwgPSAkKFwiLmRheS10aXRsZSBbY2xhc3MgKj1nbHlwaGljb24tY2hldnJvbl1cIikuZXEoMCk7XHJcbiAgICAgICAgICAgICAgICAgICAgZWxzZVxyXG4gICAgICAgICAgICAgICAgICAgICAgICBlbCA9ICQoXCIubW9udGgtdGl0bGUgW2NsYXNzICo9Z2x5cGhpY29uLWNoZXZyb25dXCIpLmVxKDApO1xyXG5cclxuICAgICAgICAgICAgICAgICAgICBpZihlbC5oYXNDbGFzcyhibG9jay5vcGVuKSlcclxuICAgICAgICAgICAgICAgICAgICAgICAgZWwucmVtb3ZlQ2xhc3MoYmxvY2sub3BlbikuYWRkQ2xhc3MoYmxvY2suY2xvc2UpO1xyXG4gICAgICAgICAgICAgICAgICAgIGVsc2VcclxuICAgICAgICAgICAgICAgICAgICAgICAgZWwucmVtb3ZlQ2xhc3MoYmxvY2suY2xvc2UpLmFkZENsYXNzKGJsb2NrLm9wZW4pO1xyXG5cclxuICAgICAgICAgICAgICAgICAgICBpZigkdGhpcy5oYXNDbGFzcyhibG9jay5vcGVuKSlcclxuICAgICAgICAgICAgICAgICAgICAgICAgJHRoaXMucmVtb3ZlQ2xhc3MoYmxvY2sub3BlbikuYWRkQ2xhc3MoYmxvY2suY2xvc2UpO1xyXG4gICAgICAgICAgICAgICAgICAgIGVsc2VcclxuICAgICAgICAgICAgICAgICAgICAgICAgJHRoaXMucmVtb3ZlQ2xhc3MoYmxvY2suY2xvc2UpLmFkZENsYXNzKGJsb2NrLm9wZW4pO1xyXG5cclxuICAgICAgICAgICAgICAgICAgICAkKFwiLmV2ZW50LWl0ZW1zLCAuZGF5LWV2ZW50c1wiKS5zbGlkZVRvZ2dsZSgpO1xyXG5cclxuICAgICAgICAgICAgICAgIH0pO1xyXG5cclxuXHJcbiAgICAgICAgICAgICAgICB2YXIgZGF0ZXRpbWVwaWNrZXJPcHRpb25zID0ge1xyXG4gICAgICAgICAgICAgICAgICAgIHN0ZXA6IDMwXHJcbiAgICAgICAgICAgICAgICB9O1xyXG4gICAgICAgICAgICAgICAgLy9Jbml0IG1vZGFsIHdpbmRvdyBcIkVkaXQgZXZlbnRcIlxyXG4gICAgICAgICAgICAgICAgJChcIi5ldmVudC1saXN0aW5nXCIpLm9uKCdjbGljaycsICcuZXZlbnQtaXRlbScsIGZ1bmN0aW9uKCl7XHJcbiAgICAgICAgICAgICAgICAgICAgbW9kYWwuZmluZChcImZvcm1cIikuZ2V0KDApLnJlc2V0KCk7XHJcbiAgICAgICAgICAgICAgICAgICAgbW9kYWwuZmluZChcIi5tb2RhbC10aXRsZVwiKS50ZXh0KFwiRWRpdCBldmVudFwiKTtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgZGF0ZXRpbWVwaWNrZXJPcHRpb25zLnZhbHVlID0gJCh0aGlzKS5maW5kKFwiLmV2ZW50LWl0ZW0tdGltZVwiKS5hdHRyKFwiZGF0YS1kYXRldGltZVwiKTtcclxuICAgICAgICAgICAgICAgICAgICBtb2RhbC5maW5kKFwiI1RpdGxlXCIpLnZhbCgkKHRoaXMpLmZpbmQoXCIuZXZlbnQtaXRlbS1uYW1lXCIpLnRleHQoKSk7XHJcbiAgICAgICAgICAgICAgICAgICAgbW9kYWwuZmluZChcIiNEZXNjcmlwdGlvblwiKS52YWwoJCh0aGlzKS5maW5kKFwiLmV2ZW50LWl0ZW0tbG9jYXRpb25cIikudGV4dCgpKTtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgZGF0ZXRpbWVQaWNrZXJJbml0KGRhdGV0aW1lcGlja2VyT3B0aW9ucywgJCh0aGlzKS5hdHRyKCdkYXRhLWlkJykpO1xyXG4gICAgICAgICAgICAgICAgICAgIG1vZGFsLmZpbmQoXCIuc2F2ZS1jaGFuZ2VzXCIpLm9mZihcImNsaWNrXCIpLm9uKCdjbGljaycsIHNhdmVDaGFuZ2VzLmJpbmQobnVsbCwkKHRoaXMpLmF0dHIoJ2RhdGEtaWQnKSkpO1xyXG4gICAgICAgICAgICAgICAgfSk7XHJcblxyXG4gICAgICAgICAgICAgICAgLy9Jbml0IG1vZGFsIHdpbmRvdyBcIkFkZCBldmVudFwiXHJcbiAgICAgICAgICAgICAgICBldmVudExpc3RpbmdUaXRsZS5vbihcImNsaWNrXCIsIFwiLmdseXBoaWNvbi1wbHVzXCIsIGZ1bmN0aW9uKCl7XHJcbiAgICAgICAgICAgICAgICAgICAgbW9kYWwuZmluZChcImZvcm1cIikuZ2V0KDApLnJlc2V0KCk7XHJcbiAgICAgICAgICAgICAgICAgICAgbW9kYWwuZmluZChcIi5tb2RhbC10aXRsZVwiKS50ZXh0KFwiQWRkIGV2ZW50XCIpO1xyXG5cclxuICAgICAgICAgICAgICAgICAgICBpZigkKHRoaXMpLnBhcmVudCgpLmhhc0NsYXNzKFwiZGF5LXRpdGxlXCIpKXtcclxuICAgICAgICAgICAgICAgICAgICAgICAgZGF0ZXRpbWVwaWNrZXJPcHRpb25zLnZhbHVlID0gKGZ1bmN0aW9uKCl7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB2YXIgdGltZSA9IFwiIFwiICsgbW9tZW50KCkuZm9ybWF0KFwiSEg6bW1cIik7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB2YXIgZWwgPSAkKGNsbmRyLmVsZW1lbnQpLmZpbmQoXCIuc2VsZWN0ZWRcIik7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZihlbC5sZW5ndGggPiAwKVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBlbC5hdHRyKFwiZGF0YS1pZFwiKSArIHRpbWU7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBlbHNlXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuICQoY2xuZHIuZWxlbWVudCkuZmluZChcInRvZGF5XCIpLmF0dHIoXCJkYXRhLWlkXCIpICsgdGltZTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgfSkoKTtcclxuICAgICAgICAgICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAgICAgICAgIGRhdGV0aW1lUGlja2VySW5pdChkYXRldGltZXBpY2tlck9wdGlvbnMpO1xyXG4gICAgICAgICAgICAgICAgICAgIG1vZGFsLmZpbmQoXCIuc2F2ZS1jaGFuZ2VzXCIpLm9mZihcImNsaWNrXCIpLm9uKCdjbGljaycsIHNhdmVDaGFuZ2VzLmJpbmQobnVsbCwkKHRoaXMpLmF0dHIoJ2RhdGEtaWQnKSkpO1xyXG4gICAgICAgICAgICAgICAgfSk7XHJcblxyXG4gICAgICAgICAgICAgICAgdmFyIGNhbGVuZGFyID0gJChcIi5jbG5kclwiKTtcclxuICAgICAgICAgICAgICAgIGNhbGVuZGFyLmhlaWdodChjYWxlbmRhci5oZWlnaHQoKSk7XHJcblxyXG4gICAgICAgICAgICB9Ly8hZG9uZVJlbmRlcmluZ1xyXG4gICAgICAgIH0pO1xyXG4gICAgfTtcclxuXHJcbn0pKCk7Il0sImZpbGUiOiJzY2hlZHVsZS5qcyIsInNvdXJjZVJvb3QiOiIvc291cmNlLyJ9
