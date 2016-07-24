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
            renderd: null,
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
        getRendered: function(range){
            var dateFormat = 'YYYY-MM-DD HH:ss';
            this.target.renderd = [];
            // var range = moment().add(month, 'month').diff(moment().add(-month, 'month'), 'days');
            range /= 2;

            this.target.object.forEach(function(value){
                var flag = {
                    everyDay: false,
                    everyWeek: false
                };
                if(value.repeat.everyDay){
                    flag.everyDay = true;
                    for(var i = -range; i < range; i++){
                        value.date = moment().add(i, 'days').format(dateFormat);
                        this.target.renderd.push($.extend(true, {}, value));
                    }
                }
                else if(value.repeat.everyWeek){
                    flag.everyWeek = true;
                    var weekRange = Math.floor(range / 7);
                    var weekNow = moment().week();
                    for(var i = -weekRange; i < weekRange; i++){
                        var week = moment().week(weekNow + i);
                        for(var day in value.repeat)
                            switch(day){
                                case "mon":
                                case "tue":
                                case "wed":
                                case "thu":
                                case "fri":
                                case "sat":
                                case "sun":
                                    if(value.repeat[day]){
                                        value.date = week.day(day).format(dateFormat);
                                        this.target.renderd.push($.extend(true, {}, value));
                                    }
                            }

                    }
                }
                if(!flag.everyDay && !flag.everyWeek){
                    this.target.renderd.push($.extend(true, {}, value));
                }
                    
            }.bind(this));
            return this.target.renderd;
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
    var onEventsSuccess = function(response){
            $("#fountainTextG").hide();
            storage.set('events', response);
            var events = storage.get('events').getRendered(60);
            initCalendar(events);
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
        
        clndr.setEvents(storage.get('events').getRendered(60));
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiIiwic291cmNlcyI6WyJzY2hlZHVsZS5qcyJdLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24oKXtcclxuICAgIFwidXNlIHN0cmljdFwiO1xyXG4gICAgLy9TZXQgdW5kZXJzY29yZSB0ZW1wbGF0ZSBzZXR0aW5nIGFzIHt7JSV9fSBmb3IgYmV0dGVyIGNvZGUgcmVhZGluZ1xyXG4gICAgXy50ZW1wbGF0ZVNldHRpbmdzID0ge1xyXG4gICAgICAgIGV2YWx1YXRlICAgIDogL1xce1xceyUoW1xcc1xcU10rPyklXFx9XFx9L2csXHJcbiAgICAgICAgaW50ZXJwb2xhdGUgOiAvXFx7XFx7JT0oW1xcc1xcU10rPyklXFx9XFx9L2csXHJcbiAgICAgICAgZXNjYXBlICAgICAgOiAvXFx7XFx7JS0oW1xcc1xcU10rPyklXFx9XFx9L2dcclxuICAgIH07XHJcbiAgICAvL1NldCBtb21lbnQgbG9jYWxlXHJcbiAgICBtb21lbnQubG9jYWxlKFwiZW4tZ2JcIik7XHJcblxyXG4gICAgLy9Jbml0IHN0b3JhZ2UgaGVscGVyc1xyXG4gICAgdmFyIHN0b3JhZ2UgPSB7XHJcbiAgICAgICAgZGlzazogc2Vzc2lvblN0b3JhZ2UgfHwgbG9jYWxTdG9yYWdlLFxyXG4gICAgICAgIHRhcmdldDoge1xyXG4gICAgICAgICAgICBuYW1lOiBudWxsLFxyXG4gICAgICAgICAgICBvYmplY3Q6IG51bGwsXHJcbiAgICAgICAgICAgIHJlbmRlcmQ6IG51bGwsXHJcbiAgICAgICAgICAgIHJlcGVhdDogbnVsbFxyXG4gICAgICAgIH0sXHJcbiAgICAgICAgJ2dldCc6IGZ1bmN0aW9uKGtleSl7XHJcbiAgICAgICAgICAgIHRoaXMudGFyZ2V0LnJlcGVhdCA9IGZhbHNlO1xyXG4gICAgICAgICAgICBpZighdGhpcy5kaXNrLmdldEl0ZW0oa2V5KSlcclxuICAgICAgICAgICAgICByZXR1cm4gbnVsbDtcclxuICAgICAgICAgICAgdGhpcy50YXJnZXQub2JqZWN0ID0gSlNPTi5wYXJzZSh0aGlzLmRpc2suZ2V0SXRlbShrZXkpKTtcclxuICAgICAgICAgICAgdGhpcy50YXJnZXQubmFtZSA9IGtleTtcclxuICAgICAgICAgICAgcmV0dXJuIHRoaXM7XHJcbiAgICAgICAgfSxcclxuICAgICAgICAnc2V0JzogZnVuY3Rpb24oa2V5LCB2YWx1ZSl7XHJcbiAgICAgICAgICAgIHRoaXMudGFyZ2V0LnJlcGVhdCA9IGZhbHNlO1xyXG4gICAgICAgICAgICB0aGlzLmRpc2suc2V0SXRlbShrZXksIEpTT04uc3RyaW5naWZ5KHZhbHVlKSk7XHJcbiAgICAgICAgICAgIHRoaXMudGFyZ2V0Lm5hbWUgPSBrZXk7XHJcbiAgICAgICAgICAgIHJldHVybiB0aGlzO1xyXG4gICAgICAgIH0sXHJcbiAgICAgICAgYWRkOiBmdW5jdGlvbihldmVudCl7XHJcbiAgICAgICAgICAgIHZhciBpZGVudGl0eSA9IGV2ZW50LmlkID4gMCA/IGV2ZW50LmlkIDogRGF0ZS5ub3coKTtcclxuICAgICAgICAgICAgdmFyIHJlc3VsdCA9IHtcclxuICAgICAgICAgICAgICAgIGlkOiBpZGVudGl0eSxcclxuICAgICAgICAgICAgICAgIHRpdGxlOiBldmVudC50aXRsZSxcclxuICAgICAgICAgICAgICAgIGRlc2NyaXB0aW9uOiBldmVudC5kZXNjcmlwdGlvbixcclxuICAgICAgICAgICAgICAgIGRhdGU6IGV2ZW50LmRhdGUsXHJcbiAgICAgICAgICAgICAgICByZXBlYXQ6IHtcclxuICAgICAgICAgICAgICAgICAgICBldmVudF9pZDogaWRlbnRpdHksXHJcbiAgICAgICAgICAgICAgICAgICAgZXZlcnlEYXk6IGV2ZW50LmV2ZXJ5RGF5ID8gMSA6IDAsXHJcbiAgICAgICAgICAgICAgICAgICAgZXZlcnlXZWVrOiBldmVudC5ldmVyeVdlZWsgPyAxIDogMCxcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfTtcclxuICAgICAgICAgICAgaWYoZXZlbnQuZGF5cyl7XHJcbiAgICAgICAgICAgICAgICB2YXIgZGF5S2V5cyA9IE9iamVjdC5rZXlzKGV2ZW50LmRheXMpO1xyXG4gICAgICAgICAgICAgICAgZm9yKHZhciBpID0gZGF5S2V5cy5sZW5ndGg7IGktLTspe1xyXG4gICAgICAgICAgICAgICAgICAgIHZhciBrZXkgPSBkYXlLZXlzW2ldO1xyXG4gICAgICAgICAgICAgICAgICAgIHJlc3VsdC5yZXBlYXRba2V5XSA9IGV2ZW50LmRheXNba2V5XTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB2YXIgaXNFeGlzdHMgPSBmYWxzZTtcclxuICAgICAgICAgICAgdGhpcy50YXJnZXQub2JqZWN0LmZvckVhY2goZnVuY3Rpb24odmFsdWUsIGksIGFycil7XHJcbiAgICAgICAgICAgICAgICBpZih2YWx1ZS5pZCA9PSByZXN1bHQuaWQpe1xyXG4gICAgICAgICAgICAgICAgICAgIGlzRXhpc3RzID0gdHJ1ZTtcclxuICAgICAgICAgICAgICAgICAgICBhcnJbaV0gPSByZXN1bHQ7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICBpZighaXNFeGlzdHMpe1xyXG4gICAgICAgICAgICAgICAgdGhpcy50YXJnZXQub2JqZWN0LnB1c2gocmVzdWx0KTtcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgcmV0dXJuIHRoaXM7XHJcbiAgICAgICAgfSxcclxuICAgICAgICBzYXZlOiBmdW5jdGlvbigpe1xyXG4gICAgICAgICAgICB0aGlzLnNldCgnZXZlbnRzJywgdGhpcy50YXJnZXQub2JqZWN0KTtcclxuICAgICAgICB9LFxyXG4gICAgICAgIHdoZXJlRGF0ZTogZnVuY3Rpb24oZGF0ZSl7XHJcbiAgICAgICAgICAgIGlmKCFkYXRlKVxyXG4gICAgICAgICAgICAgICAgcmV0dXJuIG51bGw7XHJcbiAgICAgICAgICAgIGZvcih2YXIgaSBpbiB0aGlzLnRhcmdldC5vYmplY3QpXHJcbiAgICAgICAgICAgICAgICBpZih0aGlzLnRhcmdldC5vYmplY3RbaV0uZGF0ZS5zdWJzdHJpbmcoMCwxMCkgPT0gZGF0ZSl7XHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy50YXJnZXQub2JqZWN0ID0gW3RoaXMudGFyZ2V0Lm9iamVjdFtpXV07XHJcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHRoaXM7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIHRoaXMudGFyZ2V0Lm9iamVjdCA9IFtdO1xyXG4gICAgICAgICAgICByZXR1cm4gdGhpcztcclxuICAgICAgICB9LFxyXG4gICAgICAgIHdoZXJlSWQ6IGZ1bmN0aW9uKGlkKXtcclxuICAgICAgICAgICAgaWYoIWlkKVxyXG4gICAgICAgICAgICAgICAgcmV0dXJuIG51bGw7XHJcbiAgICAgICAgICAgIGZvcih2YXIgaSBpbiB0aGlzLnRhcmdldC5vYmplY3QpXHJcbiAgICAgICAgICAgICAgICBpZih0aGlzLnRhcmdldC5vYmplY3RbaV0uaWQgPT0gaWQpe1xyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMudGFyZ2V0Lm9iamVjdCA9IFt0aGlzLnRhcmdldC5vYmplY3RbaV1dO1xyXG4gICAgICAgICAgICAgICAgICAgIHJldHVybiB0aGlzO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB0aGlzLnRhcmdldC5vYmplY3QgPSBbXTtcclxuICAgICAgICAgICAgcmV0dXJuIHRoaXM7XHJcbiAgICAgICAgfSxcclxuICAgICAgICByZXBlYXQ6IGZ1bmN0aW9uKCl7XHJcbiAgICAgICAgICAgIHRoaXMudGFyZ2V0LnJlcGVhdCA9IHRydWU7XHJcbiAgICAgICAgICAgIHJldHVybiB0aGlzO1xyXG4gICAgICAgIH0sXHJcbiAgICAgICAgZ2V0UmVuZGVyZWQ6IGZ1bmN0aW9uKHJhbmdlKXtcclxuICAgICAgICAgICAgdmFyIGRhdGVGb3JtYXQgPSAnWVlZWS1NTS1ERCBISDpzcyc7XHJcbiAgICAgICAgICAgIHRoaXMudGFyZ2V0LnJlbmRlcmQgPSBbXTtcclxuICAgICAgICAgICAgLy8gdmFyIHJhbmdlID0gbW9tZW50KCkuYWRkKG1vbnRoLCAnbW9udGgnKS5kaWZmKG1vbWVudCgpLmFkZCgtbW9udGgsICdtb250aCcpLCAnZGF5cycpO1xyXG4gICAgICAgICAgICByYW5nZSAvPSAyO1xyXG5cclxuICAgICAgICAgICAgdGhpcy50YXJnZXQub2JqZWN0LmZvckVhY2goZnVuY3Rpb24odmFsdWUpe1xyXG4gICAgICAgICAgICAgICAgdmFyIGZsYWcgPSB7XHJcbiAgICAgICAgICAgICAgICAgICAgZXZlcnlEYXk6IGZhbHNlLFxyXG4gICAgICAgICAgICAgICAgICAgIGV2ZXJ5V2VlazogZmFsc2VcclxuICAgICAgICAgICAgICAgIH07XHJcbiAgICAgICAgICAgICAgICBpZih2YWx1ZS5yZXBlYXQuZXZlcnlEYXkpe1xyXG4gICAgICAgICAgICAgICAgICAgIGZsYWcuZXZlcnlEYXkgPSB0cnVlO1xyXG4gICAgICAgICAgICAgICAgICAgIGZvcih2YXIgaSA9IC1yYW5nZTsgaSA8IHJhbmdlOyBpKyspe1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB2YWx1ZS5kYXRlID0gbW9tZW50KCkuYWRkKGksICdkYXlzJykuZm9ybWF0KGRhdGVGb3JtYXQpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLnRhcmdldC5yZW5kZXJkLnB1c2goJC5leHRlbmQodHJ1ZSwge30sIHZhbHVlKSk7XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgZWxzZSBpZih2YWx1ZS5yZXBlYXQuZXZlcnlXZWVrKXtcclxuICAgICAgICAgICAgICAgICAgICBmbGFnLmV2ZXJ5V2VlayA9IHRydWU7XHJcbiAgICAgICAgICAgICAgICAgICAgdmFyIHdlZWtSYW5nZSA9IE1hdGguZmxvb3IocmFuZ2UgLyA3KTtcclxuICAgICAgICAgICAgICAgICAgICB2YXIgd2Vla05vdyA9IG1vbWVudCgpLndlZWsoKTtcclxuICAgICAgICAgICAgICAgICAgICBmb3IodmFyIGkgPSAtd2Vla1JhbmdlOyBpIDwgd2Vla1JhbmdlOyBpKyspe1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB2YXIgd2VlayA9IG1vbWVudCgpLndlZWsod2Vla05vdyArIGkpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBmb3IodmFyIGRheSBpbiB2YWx1ZS5yZXBlYXQpXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBzd2l0Y2goZGF5KXtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjYXNlIFwibW9uXCI6XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY2FzZSBcInR1ZVwiOlxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNhc2UgXCJ3ZWRcIjpcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjYXNlIFwidGh1XCI6XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY2FzZSBcImZyaVwiOlxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNhc2UgXCJzYXRcIjpcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjYXNlIFwic3VuXCI6XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmKHZhbHVlLnJlcGVhdFtkYXldKXtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHZhbHVlLmRhdGUgPSB3ZWVrLmRheShkYXkpLmZvcm1hdChkYXRlRm9ybWF0KTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMudGFyZ2V0LnJlbmRlcmQucHVzaCgkLmV4dGVuZCh0cnVlLCB7fSwgdmFsdWUpKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICBpZighZmxhZy5ldmVyeURheSAmJiAhZmxhZy5ldmVyeVdlZWspe1xyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMudGFyZ2V0LnJlbmRlcmQucHVzaCgkLmV4dGVuZCh0cnVlLCB7fSwgdmFsdWUpKTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICBcclxuICAgICAgICAgICAgfS5iaW5kKHRoaXMpKTtcclxuICAgICAgICAgICAgcmV0dXJuIHRoaXMudGFyZ2V0LnJlbmRlcmQ7XHJcbiAgICAgICAgfSxcclxuICAgICAgICByZXN1bHQ6IGZ1bmN0aW9uKCl7XHJcbiAgICAgICAgICAgIGlmKCF0aGlzLnRhcmdldC5yZXBlYXQpXHJcbiAgICAgICAgICAgICAgICByZXR1cm4gdGhpcy50YXJnZXQub2JqZWN0O1xyXG4gICAgICAgICAgICB2YXIgcmVzdWx0ID0gW107XHJcbiAgICAgICAgICAgIGZvcih2YXIgaSBpbiB0aGlzLnRhcmdldC5vYmplY3Qpe1xyXG4gICAgICAgICAgICAgICAgdmFyIHJlcGVhdEtleXMgPSBPYmplY3Qua2V5cyh0aGlzLnRhcmdldC5vYmplY3RbaV0ucmVwZWF0KSxcclxuICAgICAgICAgICAgICAgICAgICBkYXlzID0ge30sXHJcbiAgICAgICAgICAgICAgICAgICAgcmVwZWF0ID0ge30sXHJcbiAgICAgICAgICAgICAgICAgICAga2V5ID0gJyc7XHJcbiAgICAgICAgICAgICAgICBmb3IodmFyIHIgPSByZXBlYXRLZXlzLmxlbmd0aDsgci0tOyl7XHJcbiAgICAgICAgICAgICAgICAgICAga2V5ID0gcmVwZWF0S2V5c1tyXTtcclxuICAgICAgICAgICAgICAgICAgICBzd2l0Y2goa2V5KXtcclxuICAgICAgICAgICAgICAgICAgICAgICAgY2FzZSBcIm1vblwiOlxyXG4gICAgICAgICAgICAgICAgICAgICAgICBjYXNlIFwidHVlXCI6XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGNhc2UgXCJ3ZWRcIjpcclxuICAgICAgICAgICAgICAgICAgICAgICAgY2FzZSBcInRodVwiOlxyXG4gICAgICAgICAgICAgICAgICAgICAgICBjYXNlIFwiZnJpXCI6XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGNhc2UgXCJzYXRcIjpcclxuICAgICAgICAgICAgICAgICAgICAgICAgY2FzZSBcInN1blwiOlxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZGF5c1trZXldID0gdGhpcy50YXJnZXQub2JqZWN0W2ldLnJlcGVhdFtrZXldO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGRlZmF1bHQ6XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXBlYXRba2V5XSA9IHRoaXMudGFyZ2V0Lm9iamVjdFtpXS5yZXBlYXRba2V5XTtcclxuICAgICAgICAgICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgcmVwZWF0LmRheXMgPSBkYXlzO1xyXG4gICAgICAgICAgICAgICAgcmVzdWx0LnB1c2gocmVwZWF0KTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICByZXR1cm4gcmVzdWx0O1xyXG4gICAgICAgIH1cclxuICAgIH07XHJcblxyXG4gICAgLy9ldmVudHNcclxuICAgIHZhciBvbkV2ZW50c1N1Y2Nlc3MgPSBmdW5jdGlvbihyZXNwb25zZSl7XHJcbiAgICAgICAgICAgICQoXCIjZm91bnRhaW5UZXh0R1wiKS5oaWRlKCk7XHJcbiAgICAgICAgICAgIHN0b3JhZ2Uuc2V0KCdldmVudHMnLCByZXNwb25zZSk7XHJcbiAgICAgICAgICAgIHZhciBldmVudHMgPSBzdG9yYWdlLmdldCgnZXZlbnRzJykuZ2V0UmVuZGVyZWQoNjApO1xyXG4gICAgICAgICAgICBpbml0Q2FsZW5kYXIoZXZlbnRzKTtcclxuICAgICAgICB9LFxyXG4gICAgICAgIG9uRXZlbnRzRXJyb3IgPSBmdW5jdGlvbiAocmVzcG9uc2Upe1xyXG4gICAgICAgICAgICAkKFwiI2ZvdW50YWluVGV4dEdcIikuaGlkZSgpO1xyXG4gICAgICAgICAgICBjb25zb2xlLmxvZyhyZXNwb25zZSk7XHJcbiAgICAgICAgfTtcclxuICAgIHZhciByZXF1ZXN0T3B0aW9ucyA9IHtcclxuICAgICAgICB0eXBlOiBcIkdFVFwiLFxyXG4gICAgICAgIGNhY2hlOiBmYWxzZSxcclxuICAgICAgICBzdWNjZXNzOiBvbkV2ZW50c1N1Y2Nlc3MsXHJcbiAgICAgICAgZXJyb3I6IG9uRXZlbnRzRXJyb3JcclxuICAgIH07XHJcbiAgICAkLmFqYXgoJ3NjaGVkdWxlL2V2ZW50cycsIHJlcXVlc3RPcHRpb25zKTtcclxuICAgIFxyXG4gICAgLy8hZXZlbnRzXHJcblxyXG4gICAgLy9pbml0IHZhcmlhYmxlc1xyXG4gICAgdmFyIGNsbmRyID0ge307XHJcbiAgICB2YXIgZGF5RXZlbnRzVGVtcGxhdGUgPSAkKCcjZGF5LWV2ZW50cycpLmh0bWwoKTtcclxuXHJcbiAgICB2YXIgbW9kYWwgPSAkKFwiI21vZGFsXCIpO1xyXG4gICAgdmFyIGRhdGV0aW1lUGlja2VySW5pdCA9IGZ1bmN0aW9uKG9wdGlvbnMsIGlkKXtcclxuICAgICAgICAvL0RhdGUgaW5pdFxyXG4gICAgICAgIHZhciBkdFBpY2tlciA9ICQoJyNkYXRldGltZXBpY2tlcicpLFxyXG4gICAgICAgICAgICBjaGVja09wdGlvbnMgPSB7XHJcbiAgICAgICAgICAgICAgICBjaGVja2JveENsYXNzOiAnaWNoZWNrYm94X3NxdWFyZS1ibHVlJyxcclxuICAgICAgICAgICAgICAgIHJhZGlvQ2xhc3M6ICdpcmFkaW9fc3F1YXJlLWJsdWUnLFxyXG4gICAgICAgICAgICAgICAgaW5jcmVhc2VBcmVhOiAnMjAlJyxcclxuICAgICAgICAgICAgfTtcclxuICAgICAgICAkKCcjcmVwZWF0LWRheScpLmlDaGVjaygndW5jaGVjaycpXHJcbiAgICAgICAgICAgIC5pQ2hlY2soY2hlY2tPcHRpb25zKS5vbihcImlmVW5jaGVja2VkXCIsIGZ1bmN0aW9uKCl7XHJcbiAgICAgICAgICAgICAgICBkdFBpY2tlclxyXG4gICAgICAgICAgICAgICAgICAgIC5kYXRldGltZXBpY2tlcignZGVzdHJveScpXHJcbiAgICAgICAgICAgICAgICAgICAgLmRhdGV0aW1lcGlja2VyKCk7XHJcbiAgICAgICAgICAgICAgICAkKFwiI3JlcGVhdC1tb250aFwiKS5pQ2hlY2soJ2VuYWJsZScpO1xyXG4gICAgICAgICAgICAgICAgcmVwZWF0T24uaUNoZWNrKCdlbmFibGUnKTtcclxuICAgICAgICAgICAgfSkub24oXCJpZkNoZWNrZWRcIiwgZnVuY3Rpb24oKXtcclxuICAgICAgICAgICAgICAgIGR0UGlja2VyXHJcbiAgICAgICAgICAgICAgICAgICAgLmRhdGV0aW1lcGlja2VyKCdkZXN0cm95JylcclxuICAgICAgICAgICAgICAgICAgICAuZGF0ZXRpbWVwaWNrZXIoe1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBkYXRlcGlja2VyOmZhbHNlLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBmb3JtYXQ6J0g6aSdcclxuICAgICAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgICAgICQoXCIjcmVwZWF0LW1vbnRoXCIpLmlDaGVjaygnZGlzYWJsZScpO1xyXG4gICAgICAgICAgICAgICAgcmVwZWF0T24uaUNoZWNrKCdkaXNhYmxlJyk7XHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgIGR0UGlja2VyXHJcbiAgICAgICAgICAgIC5kYXRldGltZXBpY2tlcignZGVzdHJveScpXHJcbiAgICAgICAgICAgIC5kYXRldGltZXBpY2tlcihvcHRpb25zKTtcclxuXHJcbiAgICAgICAgLy9SZXBlYXQgaW5pdFxyXG4gICAgICAgIHZhciByZXBlYXRPbiA9ICQoXCIjcmVwZWF0LW9uXCIpO1xyXG4gICAgICAgIHJlcGVhdE9uLmhpZGUoKTtcclxuICAgICAgICAkKCcjcmVwZWF0LW1vbnRoJykuaUNoZWNrKCd1bmNoZWNrJylcclxuICAgICAgICAgICAgLmlDaGVjayhjaGVja09wdGlvbnMpXHJcbiAgICAgICAgICAgIC5vbihcImlmVW5jaGVja2VkXCIsIGZ1bmN0aW9uKCl7XHJcbiAgICAgICAgICAgICAgICByZXBlYXRPbi5oaWRlKCk7XHJcbiAgICAgICAgICAgIH0pXHJcbiAgICAgICAgICAgIC5vbihcImlmQ2hlY2tlZFwiLCBmdW5jdGlvbigpe1xyXG4gICAgICAgICAgICAgICAgJChcIltpZCo9J3JlcGVhdC1vbi0nXVwiKVxyXG4gICAgICAgICAgICAgICAgICAgIC5pQ2hlY2soY2hlY2tPcHRpb25zKTtcclxuICAgICAgICAgICAgICAgIHJlcGVhdE9uLnNob3coKTtcclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgLy9TZXQgY2hlY2tlZCBkYXlzXHJcbiAgICAgICAgaWYoaWQpe1xyXG4gICAgICAgICAgICAoZnVuY3Rpb24oKXtcclxuICAgICAgICAgICAgICAgIHZhciByZXBlYXRzID0gc3RvcmFnZS5nZXQoJ2V2ZW50cycpLndoZXJlSWQoaWQpLnJlcGVhdCgpLnJlc3VsdCgpWzBdO1xyXG4gICAgICAgICAgICAgICAgaWYocmVwZWF0cy5ldmVyeVdlZWspe1xyXG4gICAgICAgICAgICAgICAgICAgICQoJyNyZXBlYXQtbW9udGgnKS5pQ2hlY2soJ2NoZWNrJyk7XHJcbiAgICAgICAgICAgICAgICAgICAgZm9yKHZhciBpIGluIHJlcGVhdHMuZGF5cyl7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICQoXCIjcmVwZWF0LW9uLVwiICsgaSkuaUNoZWNrKHJlcGVhdHMuZGF5c1tpXSA/ICdjaGVjayc6ICd1bmNoZWNrJylcclxuICAgICAgICAgICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgaWYocmVwZWF0cy5ldmVyeURheSl7XHJcbiAgICAgICAgICAgICAgICAgICAgJCgnI3JlcGVhdC1kYXknKS5pQ2hlY2soJ2NoZWNrJyk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH0pKCk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIC8vIWNoZWNrZWQgZGF5c1xyXG4gICAgICAgIG1vZGFsLm1vZGFsKCdzaG93Jyk7XHJcbiAgICB9O1xyXG4gICAgLy9vbiBTYXZpbmcgY2hhbmdlc1xyXG4gICAgdmFyIHNhdmVDaGFuZ2VzID0gZnVuY3Rpb24oaWQpe1xyXG4gICAgICAgIHZhciB0aXRsZSA9ICQudHJpbSgkKFwiI1RpdGxlXCIpLnZhbCgpKSxcclxuICAgICAgICAgICAgZGVzY3JpcHRpb24gPSAkLnRyaW0oJChcIiNEZXNjcmlwdGlvblwiKS52YWwoKSksXHJcbiAgICAgICAgICAgIGlzRGF5UmVwZWF0ID0gJChcIiNyZXBlYXQtZGF5XCIpLnByb3AoXCJjaGVja2VkXCIpLFxyXG4gICAgICAgICAgICBkYXRlVGltZSA9ICQoXCIjZGF0ZXRpbWVwaWNrZXJcIikudmFsKCk7XHJcblxyXG4gICAgICAgIGlmKCF0aXRsZSl7XHJcbiAgICAgICAgICAgICQoXCIjVGl0bGVcIikudG9vbHRpcCh7XHJcbiAgICAgICAgICAgICAgICB0cmlnZ2VyOidtYW51YWwnXHJcbiAgICAgICAgICAgIH0pLnRvb2x0aXAoJ3Nob3cnKTtcclxuICAgICAgICAgICAgc2V0VGltZW91dChmdW5jdGlvbigpe1xyXG4gICAgICAgICAgICAgICAgJChcIiNUaXRsZVwiKS50b29sdGlwKCdkZXN0cm95Jyk7XHJcbiAgICAgICAgICAgIH0sIDIwMDApO1xyXG4gICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGlmKCFpc0RheVJlcGVhdCl7XHJcbiAgICAgICAgICAgIHZhciBpc1dlZWtSZXBlYXQgPSAgJChcIiNyZXBlYXQtbW9udGhcIikucHJvcChcImNoZWNrZWRcIik7XHJcbiAgICAgICAgICAgIGlmKGlzV2Vla1JlcGVhdCl7XHJcbiAgICAgICAgICAgICAgICB2YXIgZGF5c1JlcGVhdCA9IHt9O1xyXG4gICAgICAgICAgICAgICAgJChcIltpZCo9J3JlcGVhdC1vbi0nXVwiKS5lYWNoKGZ1bmN0aW9uIChpLCBvYmopIHtcclxuICAgICAgICAgICAgICAgICAgICBkYXlzUmVwZWF0WyQob2JqKS5hdHRyKCdpZCcpLnN1YnN0cmluZygxMCldID0gJChvYmopLnByb3AoXCJjaGVja2VkXCIpID8gMSA6IDA7XHJcbiAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgICAgICBcclxuICAgICAgICBzdG9yYWdlLmdldCgnZXZlbnRzJykuYWRkKHtcclxuICAgICAgICAgICAgaWQ6IGlkIHx8IC0xLFxyXG4gICAgICAgICAgICB0aXRsZTogdGl0bGUsXHJcbiAgICAgICAgICAgIGRhdGUgOiBkYXRlVGltZSxcclxuICAgICAgICAgICAgZGVzY3JpcHRpb246IGRlc2NyaXB0aW9uLFxyXG4gICAgICAgICAgICBldmVyeURheTogaXNEYXlSZXBlYXQsXHJcbiAgICAgICAgICAgIGV2ZXJ5V2VlazogaXNXZWVrUmVwZWF0LFxyXG4gICAgICAgICAgICBkYXlzOiBkYXlzUmVwZWF0XHJcbiAgICAgICAgfSkuc2F2ZSgpO1xyXG4gICAgICAgIFxyXG4gICAgICAgIGNsbmRyLnNldEV2ZW50cyhzdG9yYWdlLmdldCgnZXZlbnRzJykuZ2V0UmVuZGVyZWQoNjApKTtcclxuICAgICAgICBtb2RhbC5tb2RhbCgnaGlkZScpO1xyXG4gICAgfTtcclxuXHJcbiAgICAvL0luaXQgY2FsZW5kYXJcclxuICAgIHZhciBpbml0Q2FsZW5kYXIgPSBmdW5jdGlvbihldmVudHMpe1xyXG4gICAgICAgIGNsbmRyID0gJCgnI2Z1bGwtY2xuZHInKS5jbG5kcih7XHJcbiAgICAgICAgICAgIHRlbXBsYXRlOiAkKCcjZnVsbC1jbG5kci10ZW1wbGF0ZScpLmh0bWwoKSxcclxuICAgICAgICAgICAgZXZlbnRzOiBldmVudHMsXHJcbiAgICAgICAgICAgIGNsaWNrRXZlbnRzOiB7XHJcbiAgICAgICAgICAgICAgICBjbGljazogZnVuY3Rpb24gKHRhcmdldCkge1xyXG4gICAgICAgICAgICAgICAgICAgIHZhciB0ZW1wbGF0ZSA9IF8udGVtcGxhdGUoZGF5RXZlbnRzVGVtcGxhdGUpO1xyXG4gICAgICAgICAgICAgICAgICAgICQoXCIuZGF5LWV2ZW50c1wiKVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAubUN1c3RvbVNjcm9sbGJhcihcImRlc3Ryb3lcIilcclxuICAgICAgICAgICAgICAgICAgICAgICAgLmh0bWwodGVtcGxhdGUoe2V2ZW50c1RoaXNEYXk6IHRhcmdldC5ldmVudHN9KSlcclxuICAgICAgICAgICAgICAgICAgICAgICAgLmhlaWdodCggJChcIi5jbG5kci1ncmlkIC5kYXlzXCIpLmhlaWdodCgpIC0gJChcIi5jbG5kci1ncmlkIC5kYXlzLW9mLXRoZS13ZWVrXCIpLmhlaWdodCgpIClcclxuICAgICAgICAgICAgICAgICAgICAgICAgLm1DdXN0b21TY3JvbGxiYXIoe1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgc2Nyb2xsQnV0dG9uczp7ZW5hYmxlOnRydWV9LFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdGhlbWU6XCJtaW5pbWFsLWRhcmtcIlxyXG4gICAgICAgICAgICAgICAgICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgIGZvcmNlU2l4Um93czogdHJ1ZSxcclxuICAgICAgICAgICAgbXVsdGlEYXlFdmVudHM6IHtcclxuICAgICAgICAgICAgICAgIHNpbmdsZURheTogJ2RhdGUnLFxyXG4gICAgICAgICAgICAgICAgZW5kRGF0ZTogJ2VuZERhdGUnLFxyXG4gICAgICAgICAgICAgICAgc3RhcnREYXRlOiAnc3RhcnREYXRlJ1xyXG4gICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICBzaG93QWRqYWNlbnRNb250aHM6IHRydWUsXHJcbiAgICAgICAgICAgIGFkamFjZW50RGF5c0NoYW5nZU1vbnRoOiBmYWxzZSxcclxuICAgICAgICAgICAgdHJhY2tTZWxlY3RlZERhdGU6IHRydWUsXHJcbiAgICAgICAgICAgIGRheXNPZlRoZVdlZWs6IChmdW5jdGlvbigpe1xyXG4gICAgICAgICAgICAgICAgdmFyIHJlc3VsdCA9IFtdO1xyXG4gICAgICAgICAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCA3OyBpKyspIHtcclxuICAgICAgICAgICAgICAgICAgICByZXN1bHQucHVzaChtb21lbnQoKS53ZWVrZGF5KGkpLmZvcm1hdCgnZGRkJykpO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgcmV0dXJuIHJlc3VsdDtcclxuICAgICAgICAgICAgfSkoKSxcclxuICAgICAgICAgICAgZG9uZVJlbmRlcmluZzogZnVuY3Rpb24oKXsgLy9kb25lUmVuZGVyaW5nXHJcbiAgICAgICAgICAgICAgICAkKFwiLmRheS1ldmVudHNcIilcclxuICAgICAgICAgICAgICAgICAgICAuaGVpZ2h0KCAkKFwiLmNsbmRyLWdyaWQgLmRheXNcIikuaGVpZ2h0KCkgLSAkKFwiLmNsbmRyLWdyaWQgLmRheXMtb2YtdGhlLXdlZWtcIikuaGVpZ2h0KCkgKVxyXG4gICAgICAgICAgICAgICAgICAgIC5tQ3VzdG9tU2Nyb2xsYmFyKHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgc2Nyb2xsQnV0dG9uczp7ZW5hYmxlOnRydWV9LFxyXG4gICAgICAgICAgICAgICAgICAgICAgICB0aGVtZTpcIm1pbmltYWwtZGFya1wiXHJcbiAgICAgICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgICAgICB2YXIgY2FsZW5kYXIgPSAkKFwiI2Z1bGwtY2xuZHJcIik7XHJcbiAgICAgICAgICAgICAgICBpZihjYWxlbmRhci5maW5kKFwiLnRvZGF5XCIpLmxlbmd0aCA+IDApXHJcbiAgICAgICAgICAgICAgICAgICAgY2FsZW5kYXIuZmluZChcIi50b2RheVwiKS5jbGljaygpO1xyXG4gICAgICAgICAgICAgICAgZWxzZVxyXG4gICAgICAgICAgICAgICAgICAgIGNhbGVuZGFyLmZpbmQoXCIuZGF5XCIpLmVxKDApLmNsaWNrKCk7XHJcblxyXG4gICAgICAgICAgICAgICAgdmFyIGV2ZW50TGlzdGluZ1RpdGxlID0gJChcIi5ldmVudC1saXN0aW5nLXRpdGxlXCIpO1xyXG4gICAgICAgICAgICAgICAgLy9Jbml0IGJsb2NrIE9wZW4vQ2xvc2UgZXZlbnRcclxuICAgICAgICAgICAgICAgIGV2ZW50TGlzdGluZ1RpdGxlLm9uKFwiY2xpY2tcIiwgXCIuZ2x5cGhpY29uLWNoZXZyb24tdXAsIC5nbHlwaGljb24tY2hldnJvbi1kb3duXCIsIGZ1bmN0aW9uKCl7XHJcbiAgICAgICAgICAgICAgICAgICAgdmFyIGVsID0ge307XHJcbiAgICAgICAgICAgICAgICAgICAgdmFyIGJsb2NrID0ge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBvcGVuOiBcImdseXBoaWNvbi1jaGV2cm9uLXVwXCIsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGNsb3NlOiBcImdseXBoaWNvbi1jaGV2cm9uLWRvd25cIlxyXG4gICAgICAgICAgICAgICAgICAgIH07XHJcbiAgICAgICAgICAgICAgICAgICAgdmFyICR0aGlzID0gJCh0aGlzKTtcclxuICAgICAgICAgICAgICAgICAgICBpZigkdGhpcy5wYXJlbnQoKS5oYXNDbGFzcyhcIm1vbnRoLXRpdGxlXCIpKVxyXG4gICAgICAgICAgICAgICAgICAgICAgICBlbCA9ICQoXCIuZGF5LXRpdGxlIFtjbGFzcyAqPWdseXBoaWNvbi1jaGV2cm9uXVwiKS5lcSgwKTtcclxuICAgICAgICAgICAgICAgICAgICBlbHNlXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGVsID0gJChcIi5tb250aC10aXRsZSBbY2xhc3MgKj1nbHlwaGljb24tY2hldnJvbl1cIikuZXEoMCk7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgIGlmKGVsLmhhc0NsYXNzKGJsb2NrLm9wZW4pKVxyXG4gICAgICAgICAgICAgICAgICAgICAgICBlbC5yZW1vdmVDbGFzcyhibG9jay5vcGVuKS5hZGRDbGFzcyhibG9jay5jbG9zZSk7XHJcbiAgICAgICAgICAgICAgICAgICAgZWxzZVxyXG4gICAgICAgICAgICAgICAgICAgICAgICBlbC5yZW1vdmVDbGFzcyhibG9jay5jbG9zZSkuYWRkQ2xhc3MoYmxvY2sub3Blbik7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgIGlmKCR0aGlzLmhhc0NsYXNzKGJsb2NrLm9wZW4pKVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAkdGhpcy5yZW1vdmVDbGFzcyhibG9jay5vcGVuKS5hZGRDbGFzcyhibG9jay5jbG9zZSk7XHJcbiAgICAgICAgICAgICAgICAgICAgZWxzZVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAkdGhpcy5yZW1vdmVDbGFzcyhibG9jay5jbG9zZSkuYWRkQ2xhc3MoYmxvY2sub3Blbik7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgICQoXCIuZXZlbnQtaXRlbXMsIC5kYXktZXZlbnRzXCIpLnNsaWRlVG9nZ2xlKCk7XHJcblxyXG4gICAgICAgICAgICAgICAgfSk7XHJcblxyXG5cclxuICAgICAgICAgICAgICAgIHZhciBkYXRldGltZXBpY2tlck9wdGlvbnMgPSB7XHJcbiAgICAgICAgICAgICAgICAgICAgc3RlcDogMzBcclxuICAgICAgICAgICAgICAgIH07XHJcbiAgICAgICAgICAgICAgICAvL0luaXQgbW9kYWwgd2luZG93IFwiRWRpdCBldmVudFwiXHJcbiAgICAgICAgICAgICAgICAkKFwiLmV2ZW50LWxpc3RpbmdcIikub24oJ2NsaWNrJywgJy5ldmVudC1pdGVtJywgZnVuY3Rpb24oKXtcclxuICAgICAgICAgICAgICAgICAgICBtb2RhbC5maW5kKFwiZm9ybVwiKS5nZXQoMCkucmVzZXQoKTtcclxuICAgICAgICAgICAgICAgICAgICBtb2RhbC5maW5kKFwiLm1vZGFsLXRpdGxlXCIpLnRleHQoXCJFZGl0IGV2ZW50XCIpO1xyXG5cclxuICAgICAgICAgICAgICAgICAgICBkYXRldGltZXBpY2tlck9wdGlvbnMudmFsdWUgPSAkKHRoaXMpLmZpbmQoXCIuZXZlbnQtaXRlbS10aW1lXCIpLmF0dHIoXCJkYXRhLWRhdGV0aW1lXCIpO1xyXG4gICAgICAgICAgICAgICAgICAgIG1vZGFsLmZpbmQoXCIjVGl0bGVcIikudmFsKCQodGhpcykuZmluZChcIi5ldmVudC1pdGVtLW5hbWVcIikudGV4dCgpKTtcclxuICAgICAgICAgICAgICAgICAgICBtb2RhbC5maW5kKFwiI0Rlc2NyaXB0aW9uXCIpLnZhbCgkKHRoaXMpLmZpbmQoXCIuZXZlbnQtaXRlbS1sb2NhdGlvblwiKS50ZXh0KCkpO1xyXG5cclxuICAgICAgICAgICAgICAgICAgICBkYXRldGltZVBpY2tlckluaXQoZGF0ZXRpbWVwaWNrZXJPcHRpb25zLCAkKHRoaXMpLmF0dHIoJ2RhdGEtaWQnKSk7XHJcbiAgICAgICAgICAgICAgICAgICAgbW9kYWwuZmluZChcIi5zYXZlLWNoYW5nZXNcIikub2ZmKFwiY2xpY2tcIikub24oJ2NsaWNrJywgc2F2ZUNoYW5nZXMuYmluZChudWxsLCQodGhpcykuYXR0cignZGF0YS1pZCcpKSk7XHJcbiAgICAgICAgICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgICAgICAgICAvL0luaXQgbW9kYWwgd2luZG93IFwiQWRkIGV2ZW50XCJcclxuICAgICAgICAgICAgICAgIGV2ZW50TGlzdGluZ1RpdGxlLm9uKFwiY2xpY2tcIiwgXCIuZ2x5cGhpY29uLXBsdXNcIiwgZnVuY3Rpb24oKXtcclxuICAgICAgICAgICAgICAgICAgICBtb2RhbC5maW5kKFwiZm9ybVwiKS5nZXQoMCkucmVzZXQoKTtcclxuICAgICAgICAgICAgICAgICAgICBtb2RhbC5maW5kKFwiLm1vZGFsLXRpdGxlXCIpLnRleHQoXCJBZGQgZXZlbnRcIik7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgIGlmKCQodGhpcykucGFyZW50KCkuaGFzQ2xhc3MoXCJkYXktdGl0bGVcIikpe1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBkYXRldGltZXBpY2tlck9wdGlvbnMudmFsdWUgPSAoZnVuY3Rpb24oKXtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHZhciB0aW1lID0gXCIgXCIgKyBtb21lbnQoKS5mb3JtYXQoXCJISDptbVwiKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHZhciBlbCA9ICQoY2xuZHIuZWxlbWVudCkuZmluZChcIi5zZWxlY3RlZFwiKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmKGVsLmxlbmd0aCA+IDApXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGVsLmF0dHIoXCJkYXRhLWlkXCIpICsgdGltZTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGVsc2VcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gJChjbG5kci5lbGVtZW50KS5maW5kKFwidG9kYXlcIikuYXR0cihcImRhdGEtaWRcIikgKyB0aW1lO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB9KSgpO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgICAgICAgICAgZGF0ZXRpbWVQaWNrZXJJbml0KGRhdGV0aW1lcGlja2VyT3B0aW9ucyk7XHJcbiAgICAgICAgICAgICAgICAgICAgbW9kYWwuZmluZChcIi5zYXZlLWNoYW5nZXNcIikub2ZmKFwiY2xpY2tcIikub24oJ2NsaWNrJywgc2F2ZUNoYW5nZXMuYmluZChudWxsLCQodGhpcykuYXR0cignZGF0YS1pZCcpKSk7XHJcbiAgICAgICAgICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgICAgICAgICB2YXIgY2FsZW5kYXIgPSAkKFwiLmNsbmRyXCIpO1xyXG4gICAgICAgICAgICAgICAgY2FsZW5kYXIuaGVpZ2h0KGNhbGVuZGFyLmhlaWdodCgpKTtcclxuXHJcbiAgICAgICAgICAgIH0vLyFkb25lUmVuZGVyaW5nXHJcbiAgICAgICAgfSk7XHJcbiAgICB9O1xyXG5cclxufSkoKTsiXSwiZmlsZSI6InNjaGVkdWxlLmpzIiwic291cmNlUm9vdCI6Ii9zb3VyY2UvIn0=
