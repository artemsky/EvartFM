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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiIiwic291cmNlcyI6WyJzY2hlZHVsZS5qcyJdLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24oKXtcclxuICAgIFwidXNlIHN0cmljdFwiO1xyXG4gICAgLy9TZXQgdW5kZXJzY29yZSB0ZW1wbGF0ZSBzZXR0aW5nIGFzIHt7JSV9fSBmb3IgYmV0dGVyIGNvZGUgcmVhZGluZ1xyXG4gICAgXy50ZW1wbGF0ZVNldHRpbmdzID0ge1xyXG4gICAgICAgIGV2YWx1YXRlICAgIDogL1xce1xceyUoW1xcc1xcU10rPyklXFx9XFx9L2csXHJcbiAgICAgICAgaW50ZXJwb2xhdGUgOiAvXFx7XFx7JT0oW1xcc1xcU10rPyklXFx9XFx9L2csXHJcbiAgICAgICAgZXNjYXBlICAgICAgOiAvXFx7XFx7JS0oW1xcc1xcU10rPyklXFx9XFx9L2dcclxuICAgIH07XHJcbiAgICAvL1NldCBtb21lbnQgbG9jYWxlXHJcbiAgICBtb21lbnQubG9jYWxlKFwiZW4tZ2JcIik7XHJcblxyXG4gICAgLy9Jbml0IHN0b3JhZ2UgaGVscGVyc1xyXG4gICAgdmFyIHN0b3JhZ2UgPSB7XHJcbiAgICAgICAgZGlzazogc2Vzc2lvblN0b3JhZ2UgfHwgbG9jYWxTdG9yYWdlLFxyXG4gICAgICAgIHRhcmdldDoge1xyXG4gICAgICAgICAgICBuYW1lOiBudWxsLFxyXG4gICAgICAgICAgICBvYmplY3Q6IG51bGwsXHJcbiAgICAgICAgICAgIHJlcGVhdDogbnVsbFxyXG4gICAgICAgIH0sXHJcbiAgICAgICAgJ2dldCc6IGZ1bmN0aW9uKGtleSl7XHJcbiAgICAgICAgICAgIHRoaXMudGFyZ2V0LnJlcGVhdCA9IGZhbHNlO1xyXG4gICAgICAgICAgICBpZighdGhpcy5kaXNrLmdldEl0ZW0oa2V5KSlcclxuICAgICAgICAgICAgICByZXR1cm4gbnVsbDtcclxuICAgICAgICAgICAgdGhpcy50YXJnZXQub2JqZWN0ID0gSlNPTi5wYXJzZSh0aGlzLmRpc2suZ2V0SXRlbShrZXkpKTtcclxuICAgICAgICAgICAgdGhpcy50YXJnZXQubmFtZSA9IGtleTtcclxuICAgICAgICAgICAgcmV0dXJuIHRoaXM7XHJcbiAgICAgICAgfSxcclxuICAgICAgICAnc2V0JzogZnVuY3Rpb24oa2V5LCB2YWx1ZSl7XHJcbiAgICAgICAgICAgIHRoaXMudGFyZ2V0LnJlcGVhdCA9IGZhbHNlO1xyXG4gICAgICAgICAgICB0aGlzLmRpc2suc2V0SXRlbShrZXksIEpTT04uc3RyaW5naWZ5KHZhbHVlKSk7XHJcbiAgICAgICAgICAgIHRoaXMudGFyZ2V0Lm5hbWUgPSBrZXk7XHJcbiAgICAgICAgICAgIHJldHVybiB0aGlzO1xyXG4gICAgICAgIH0sXHJcbiAgICAgICAgYWRkOiBmdW5jdGlvbihldmVudCl7XHJcbiAgICAgICAgICAgIHZhciByZXN1bHQgPSB7XHJcbiAgICAgICAgICAgICAgICBpZDogZXZlbnQuaWQsXHJcbiAgICAgICAgICAgICAgICB0aXRsZTogZXZlbnQudGl0bGUsXHJcbiAgICAgICAgICAgICAgICBkZXNjcmlwdGlvbjogZXZlbnQuZGVzY3JpcHRpb24sXHJcbiAgICAgICAgICAgICAgICBkYXRlOiBldmVudC5kYXRlLFxyXG4gICAgICAgICAgICAgICAgcmVwZWF0OiB7XHJcbiAgICAgICAgICAgICAgICAgICAgZXZlbnRfaWQ6IGV2ZW50LmlkLFxyXG4gICAgICAgICAgICAgICAgICAgIGV2ZXJ5RGF5OiBldmVudC5ldmVyeURheSA/IDEgOiAwLFxyXG4gICAgICAgICAgICAgICAgICAgIGV2ZXJ5V2VlazogZXZlbnQuZXZlcnlXZWVrID8gMSA6IDAsXHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH07XHJcbiAgICAgICAgICAgIGlmKGV2ZW50LmRheXMpe1xyXG4gICAgICAgICAgICAgICAgdmFyIGRheUtleXMgPSBPYmplY3Qua2V5cyhldmVudC5kYXlzKTtcclxuICAgICAgICAgICAgICAgIGZvcih2YXIgaSA9IGRheUtleXMubGVuZ3RoOyBpLS07KXtcclxuICAgICAgICAgICAgICAgICAgICB2YXIga2V5ID0gZGF5S2V5c1tpXTtcclxuICAgICAgICAgICAgICAgICAgICByZXN1bHQucmVwZWF0W2tleV0gPSBldmVudC5kYXlzW2tleV07XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgdmFyIGlzRXhpc3RzID0gZmFsc2U7XHJcbiAgICAgICAgICAgIHRoaXMudGFyZ2V0Lm9iamVjdC5mb3JFYWNoKGZ1bmN0aW9uKHZhbHVlLCBpLCBhcnIpe1xyXG4gICAgICAgICAgICAgICAgaWYodmFsdWUuaWQgPT0gcmVzdWx0LmlkKXtcclxuICAgICAgICAgICAgICAgICAgICBpc0V4aXN0cyA9IHRydWU7XHJcbiAgICAgICAgICAgICAgICAgICAgYXJyW2ldID0gcmVzdWx0O1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgaWYoIWlzRXhpc3RzKXtcclxuICAgICAgICAgICAgICAgIHRoaXMudGFyZ2V0Lm9iamVjdC5wdXNoKHJlc3VsdCk7XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIHJldHVybiB0aGlzO1xyXG4gICAgICAgIH0sXHJcbiAgICAgICAgc2F2ZTogZnVuY3Rpb24oKXtcclxuICAgICAgICAgICAgdGhpcy5zZXQoJ2V2ZW50cycsIHRoaXMudGFyZ2V0Lm9iamVjdCk7XHJcbiAgICAgICAgfSxcclxuICAgICAgICB3aGVyZURhdGU6IGZ1bmN0aW9uKGRhdGUpe1xyXG4gICAgICAgICAgICBpZighZGF0ZSlcclxuICAgICAgICAgICAgICAgIHJldHVybiBudWxsO1xyXG4gICAgICAgICAgICBmb3IodmFyIGkgaW4gdGhpcy50YXJnZXQub2JqZWN0KVxyXG4gICAgICAgICAgICAgICAgaWYodGhpcy50YXJnZXQub2JqZWN0W2ldLmRhdGUuc3Vic3RyaW5nKDAsMTApID09IGRhdGUpe1xyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMudGFyZ2V0Lm9iamVjdCA9IFt0aGlzLnRhcmdldC5vYmplY3RbaV1dO1xyXG4gICAgICAgICAgICAgICAgICAgIHJldHVybiB0aGlzO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB0aGlzLnRhcmdldC5vYmplY3QgPSBbXTtcclxuICAgICAgICAgICAgcmV0dXJuIHRoaXM7XHJcbiAgICAgICAgfSxcclxuICAgICAgICB3aGVyZUlkOiBmdW5jdGlvbihpZCl7XHJcbiAgICAgICAgICAgIGlmKCFpZClcclxuICAgICAgICAgICAgICAgIHJldHVybiBudWxsO1xyXG4gICAgICAgICAgICBmb3IodmFyIGkgaW4gdGhpcy50YXJnZXQub2JqZWN0KVxyXG4gICAgICAgICAgICAgICAgaWYodGhpcy50YXJnZXQub2JqZWN0W2ldLmlkID09IGlkKXtcclxuICAgICAgICAgICAgICAgICAgICB0aGlzLnRhcmdldC5vYmplY3QgPSBbdGhpcy50YXJnZXQub2JqZWN0W2ldXTtcclxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gdGhpcztcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgdGhpcy50YXJnZXQub2JqZWN0ID0gW107XHJcbiAgICAgICAgICAgIHJldHVybiB0aGlzO1xyXG4gICAgICAgIH0sXHJcbiAgICAgICAgcmVwZWF0OiBmdW5jdGlvbigpe1xyXG4gICAgICAgICAgICB0aGlzLnRhcmdldC5yZXBlYXQgPSB0cnVlO1xyXG4gICAgICAgICAgICByZXR1cm4gdGhpcztcclxuICAgICAgICB9LFxyXG4gICAgICAgIHJlc3VsdDogZnVuY3Rpb24oKXtcclxuICAgICAgICAgICAgaWYoIXRoaXMudGFyZ2V0LnJlcGVhdClcclxuICAgICAgICAgICAgICAgIHJldHVybiB0aGlzLnRhcmdldC5vYmplY3Q7XHJcbiAgICAgICAgICAgIHZhciByZXN1bHQgPSBbXTtcclxuICAgICAgICAgICAgZm9yKHZhciBpIGluIHRoaXMudGFyZ2V0Lm9iamVjdCl7XHJcbiAgICAgICAgICAgICAgICB2YXIgcmVwZWF0S2V5cyA9IE9iamVjdC5rZXlzKHRoaXMudGFyZ2V0Lm9iamVjdFtpXS5yZXBlYXQpLFxyXG4gICAgICAgICAgICAgICAgICAgIGRheXMgPSB7fSxcclxuICAgICAgICAgICAgICAgICAgICByZXBlYXQgPSB7fSxcclxuICAgICAgICAgICAgICAgICAgICBrZXkgPSAnJztcclxuICAgICAgICAgICAgICAgIGZvcih2YXIgciA9IHJlcGVhdEtleXMubGVuZ3RoOyByLS07KXtcclxuICAgICAgICAgICAgICAgICAgICBrZXkgPSByZXBlYXRLZXlzW3JdO1xyXG4gICAgICAgICAgICAgICAgICAgIHN3aXRjaChrZXkpe1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBjYXNlIFwibW9uXCI6XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGNhc2UgXCJ0dWVcIjpcclxuICAgICAgICAgICAgICAgICAgICAgICAgY2FzZSBcIndlZFwiOlxyXG4gICAgICAgICAgICAgICAgICAgICAgICBjYXNlIFwidGh1XCI6XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGNhc2UgXCJmcmlcIjpcclxuICAgICAgICAgICAgICAgICAgICAgICAgY2FzZSBcInNhdFwiOlxyXG4gICAgICAgICAgICAgICAgICAgICAgICBjYXNlIFwic3VuXCI6XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBkYXlzW2tleV0gPSB0aGlzLnRhcmdldC5vYmplY3RbaV0ucmVwZWF0W2tleV07XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgICAgICAgICAgICAgICAgZGVmYXVsdDpcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJlcGVhdFtrZXldID0gdGhpcy50YXJnZXQub2JqZWN0W2ldLnJlcGVhdFtrZXldO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICByZXBlYXQuZGF5cyA9IGRheXM7XHJcbiAgICAgICAgICAgICAgICByZXN1bHQucHVzaChyZXBlYXQpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIHJldHVybiByZXN1bHQ7XHJcbiAgICAgICAgfVxyXG4gICAgfTtcclxuXHJcbiAgICAvL2V2ZW50c1xyXG4gICAgdmFyIGV2ZW50cyA9IFtdO1xyXG4gICAgdmFyIG9uRXZlbnRzU3VjY2VzcyA9IGZ1bmN0aW9uKHJlc3BvbnNlKXtcclxuICAgICAgICAgICAgJChcIiNmb3VudGFpblRleHRHXCIpLmhpZGUoKTtcclxuICAgICAgICAgICAgaW5pdENhbGVuZGFyKHJlc3BvbnNlKTtcclxuICAgICAgICAgICAgc3RvcmFnZS5zZXQoJ2V2ZW50cycsIHJlc3BvbnNlKTtcclxuICAgICAgICB9LFxyXG4gICAgICAgIG9uRXZlbnRzRXJyb3IgPSBmdW5jdGlvbiAocmVzcG9uc2Upe1xyXG4gICAgICAgICAgICAkKFwiI2ZvdW50YWluVGV4dEdcIikuaGlkZSgpO1xyXG4gICAgICAgICAgICBjb25zb2xlLmxvZyhyZXNwb25zZSk7XHJcbiAgICAgICAgfTtcclxuICAgIHZhciByZXF1ZXN0T3B0aW9ucyA9IHtcclxuICAgICAgICB0eXBlOiBcIkdFVFwiLFxyXG4gICAgICAgIGNhY2hlOiBmYWxzZSxcclxuICAgICAgICBzdWNjZXNzOiBvbkV2ZW50c1N1Y2Nlc3MsXHJcbiAgICAgICAgZXJyb3I6IG9uRXZlbnRzRXJyb3JcclxuICAgIH07XHJcbiAgICAkLmFqYXgoJ3NjaGVkdWxlL2V2ZW50cycsIHJlcXVlc3RPcHRpb25zKTtcclxuICAgIFxyXG4gICAgLy8hZXZlbnRzXHJcblxyXG4gICAgLy9pbml0IHZhcmlhYmxlc1xyXG4gICAgdmFyIGNsbmRyID0ge307XHJcbiAgICB2YXIgZGF5RXZlbnRzVGVtcGxhdGUgPSAkKCcjZGF5LWV2ZW50cycpLmh0bWwoKTtcclxuXHJcbiAgICB2YXIgbW9kYWwgPSAkKFwiI21vZGFsXCIpO1xyXG4gICAgdmFyIGRhdGV0aW1lUGlja2VySW5pdCA9IGZ1bmN0aW9uKG9wdGlvbnMsIGlkKXtcclxuICAgICAgICAvL0RhdGUgaW5pdFxyXG4gICAgICAgIHZhciBkdFBpY2tlciA9ICQoJyNkYXRldGltZXBpY2tlcicpLFxyXG4gICAgICAgICAgICBjaGVja09wdGlvbnMgPSB7XHJcbiAgICAgICAgICAgICAgICBjaGVja2JveENsYXNzOiAnaWNoZWNrYm94X3NxdWFyZS1ibHVlJyxcclxuICAgICAgICAgICAgICAgIHJhZGlvQ2xhc3M6ICdpcmFkaW9fc3F1YXJlLWJsdWUnLFxyXG4gICAgICAgICAgICAgICAgaW5jcmVhc2VBcmVhOiAnMjAlJyxcclxuICAgICAgICAgICAgfTtcclxuICAgICAgICAkKCcjcmVwZWF0LWRheScpLmlDaGVjaygndW5jaGVjaycpXHJcbiAgICAgICAgICAgIC5pQ2hlY2soY2hlY2tPcHRpb25zKS5vbihcImlmVW5jaGVja2VkXCIsIGZ1bmN0aW9uKCl7XHJcbiAgICAgICAgICAgICAgICBkdFBpY2tlclxyXG4gICAgICAgICAgICAgICAgICAgIC5kYXRldGltZXBpY2tlcignZGVzdHJveScpXHJcbiAgICAgICAgICAgICAgICAgICAgLmRhdGV0aW1lcGlja2VyKCk7XHJcbiAgICAgICAgICAgICAgICAkKFwiI3JlcGVhdC1tb250aFwiKS5pQ2hlY2soJ2VuYWJsZScpO1xyXG4gICAgICAgICAgICAgICAgcmVwZWF0T24uaUNoZWNrKCdlbmFibGUnKTtcclxuICAgICAgICAgICAgfSkub24oXCJpZkNoZWNrZWRcIiwgZnVuY3Rpb24oKXtcclxuICAgICAgICAgICAgICAgIGR0UGlja2VyXHJcbiAgICAgICAgICAgICAgICAgICAgLmRhdGV0aW1lcGlja2VyKCdkZXN0cm95JylcclxuICAgICAgICAgICAgICAgICAgICAuZGF0ZXRpbWVwaWNrZXIoe1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBkYXRlcGlja2VyOmZhbHNlLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBmb3JtYXQ6J0g6aSdcclxuICAgICAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgICAgICQoXCIjcmVwZWF0LW1vbnRoXCIpLmlDaGVjaygnZGlzYWJsZScpO1xyXG4gICAgICAgICAgICAgICAgcmVwZWF0T24uaUNoZWNrKCdkaXNhYmxlJyk7XHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgIGR0UGlja2VyXHJcbiAgICAgICAgICAgIC5kYXRldGltZXBpY2tlcignZGVzdHJveScpXHJcbiAgICAgICAgICAgIC5kYXRldGltZXBpY2tlcihvcHRpb25zKTtcclxuXHJcbiAgICAgICAgLy9SZXBlYXQgaW5pdFxyXG4gICAgICAgIHZhciByZXBlYXRPbiA9ICQoXCIjcmVwZWF0LW9uXCIpO1xyXG4gICAgICAgIHJlcGVhdE9uLmhpZGUoKTtcclxuICAgICAgICAkKCcjcmVwZWF0LW1vbnRoJykuaUNoZWNrKCd1bmNoZWNrJylcclxuICAgICAgICAgICAgLmlDaGVjayhjaGVja09wdGlvbnMpXHJcbiAgICAgICAgICAgIC5vbihcImlmVW5jaGVja2VkXCIsIGZ1bmN0aW9uKCl7XHJcbiAgICAgICAgICAgICAgICByZXBlYXRPbi5oaWRlKCk7XHJcbiAgICAgICAgICAgIH0pXHJcbiAgICAgICAgICAgIC5vbihcImlmQ2hlY2tlZFwiLCBmdW5jdGlvbigpe1xyXG4gICAgICAgICAgICAgICAgJChcIltpZCo9J3JlcGVhdC1vbi0nXVwiKVxyXG4gICAgICAgICAgICAgICAgICAgIC5pQ2hlY2soY2hlY2tPcHRpb25zKTtcclxuICAgICAgICAgICAgICAgIHJlcGVhdE9uLnNob3coKTtcclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgLy9TZXQgY2hlY2tlZCBkYXlzXHJcbiAgICAgICAgaWYoaWQpe1xyXG4gICAgICAgICAgICAoZnVuY3Rpb24oKXtcclxuICAgICAgICAgICAgICAgIHZhciByZXBlYXRzID0gc3RvcmFnZS5nZXQoJ2V2ZW50cycpLndoZXJlSWQoaWQpLnJlcGVhdCgpLnJlc3VsdCgpWzBdO1xyXG4gICAgICAgICAgICAgICAgaWYocmVwZWF0cy5ldmVyeVdlZWspe1xyXG4gICAgICAgICAgICAgICAgICAgICQoJyNyZXBlYXQtbW9udGgnKS5pQ2hlY2soJ2NoZWNrJyk7XHJcbiAgICAgICAgICAgICAgICAgICAgZm9yKHZhciBpIGluIHJlcGVhdHMuZGF5cyl7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICQoXCIjcmVwZWF0LW9uLVwiICsgaSkuaUNoZWNrKHJlcGVhdHMuZGF5c1tpXSA/ICdjaGVjayc6ICd1bmNoZWNrJylcclxuICAgICAgICAgICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgaWYocmVwZWF0cy5ldmVyeURheSl7XHJcbiAgICAgICAgICAgICAgICAgICAgJCgnI3JlcGVhdC1kYXknKS5pQ2hlY2soJ2NoZWNrJyk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH0pKCk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIC8vIWNoZWNrZWQgZGF5c1xyXG4gICAgICAgIG1vZGFsLm1vZGFsKCdzaG93Jyk7XHJcbiAgICB9O1xyXG4gICAgLy9vbiBTYXZpbmcgY2hhbmdlc1xyXG4gICAgdmFyIHNhdmVDaGFuZ2VzID0gZnVuY3Rpb24oaWQpe1xyXG4gICAgICAgIHZhciB0aXRsZSA9ICQudHJpbSgkKFwiI1RpdGxlXCIpLnZhbCgpKSxcclxuICAgICAgICAgICAgZGVzY3JpcHRpb24gPSAkLnRyaW0oJChcIiNEZXNjcmlwdGlvblwiKS52YWwoKSksXHJcbiAgICAgICAgICAgIGlzRGF5UmVwZWF0ID0gJChcIiNyZXBlYXQtZGF5XCIpLnByb3AoXCJjaGVja2VkXCIpLFxyXG4gICAgICAgICAgICBkYXRlVGltZSA9ICQoXCIjZGF0ZXRpbWVwaWNrZXJcIikudmFsKCk7XHJcblxyXG4gICAgICAgIGlmKCF0aXRsZSl7XHJcbiAgICAgICAgICAgICQoXCIjVGl0bGVcIikudG9vbHRpcCh7XHJcbiAgICAgICAgICAgICAgICB0cmlnZ2VyOidtYW51YWwnXHJcbiAgICAgICAgICAgIH0pLnRvb2x0aXAoJ3Nob3cnKTtcclxuICAgICAgICAgICAgc2V0VGltZW91dChmdW5jdGlvbigpe1xyXG4gICAgICAgICAgICAgICAgJChcIiNUaXRsZVwiKS50b29sdGlwKCdkZXN0cm95Jyk7XHJcbiAgICAgICAgICAgIH0sIDIwMDApO1xyXG4gICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGlmKCFpc0RheVJlcGVhdCl7XHJcbiAgICAgICAgICAgIHZhciBpc1dlZWtSZXBlYXQgPSAgJChcIiNyZXBlYXQtbW9udGhcIikucHJvcChcImNoZWNrZWRcIik7XHJcbiAgICAgICAgICAgIGlmKGlzV2Vla1JlcGVhdCl7XHJcbiAgICAgICAgICAgICAgICB2YXIgZGF5c1JlcGVhdCA9IHt9O1xyXG4gICAgICAgICAgICAgICAgJChcIltpZCo9J3JlcGVhdC1vbi0nXVwiKS5lYWNoKGZ1bmN0aW9uIChpLCBvYmopIHtcclxuICAgICAgICAgICAgICAgICAgICBkYXlzUmVwZWF0WyQob2JqKS5hdHRyKCdpZCcpLnN1YnN0cmluZygxMCldID0gJChvYmopLnByb3AoXCJjaGVja2VkXCIpID8gMSA6IDA7XHJcbiAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgICAgICBcclxuICAgICAgICBzdG9yYWdlLmdldCgnZXZlbnRzJykuYWRkKHtcclxuICAgICAgICAgICAgaWQ6IGlkIHx8IC0xLFxyXG4gICAgICAgICAgICB0aXRsZTogdGl0bGUsXHJcbiAgICAgICAgICAgIGRhdGUgOiBkYXRlVGltZSxcclxuICAgICAgICAgICAgZGVzY3JpcHRpb246IGRlc2NyaXB0aW9uLFxyXG4gICAgICAgICAgICBldmVyeURheTogaXNEYXlSZXBlYXQsXHJcbiAgICAgICAgICAgIGV2ZXJ5V2VlazogaXNXZWVrUmVwZWF0LFxyXG4gICAgICAgICAgICBkYXlzOiBkYXlzUmVwZWF0XHJcbiAgICAgICAgfSkuc2F2ZSgpO1xyXG4gICAgICAgIFxyXG4gICAgICAgIGNsbmRyLnNldEV2ZW50cyhzdG9yYWdlLmdldCgnZXZlbnRzJykucmVzdWx0KCkpO1xyXG4gICAgICAgIG1vZGFsLm1vZGFsKCdoaWRlJyk7XHJcbiAgICB9O1xyXG5cclxuICAgIC8vSW5pdCBjYWxlbmRhclxyXG4gICAgdmFyIGluaXRDYWxlbmRhciA9IGZ1bmN0aW9uKGV2ZW50cyl7XHJcbiAgICAgICAgY2xuZHIgPSAkKCcjZnVsbC1jbG5kcicpLmNsbmRyKHtcclxuICAgICAgICAgICAgdGVtcGxhdGU6ICQoJyNmdWxsLWNsbmRyLXRlbXBsYXRlJykuaHRtbCgpLFxyXG4gICAgICAgICAgICBldmVudHM6IGV2ZW50cyxcclxuICAgICAgICAgICAgY2xpY2tFdmVudHM6IHtcclxuICAgICAgICAgICAgICAgIGNsaWNrOiBmdW5jdGlvbiAodGFyZ2V0KSB7XHJcbiAgICAgICAgICAgICAgICAgICAgdmFyIHRlbXBsYXRlID0gXy50ZW1wbGF0ZShkYXlFdmVudHNUZW1wbGF0ZSk7XHJcbiAgICAgICAgICAgICAgICAgICAgJChcIi5kYXktZXZlbnRzXCIpXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIC5tQ3VzdG9tU2Nyb2xsYmFyKFwiZGVzdHJveVwiKVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAuaHRtbCh0ZW1wbGF0ZSh7ZXZlbnRzVGhpc0RheTogdGFyZ2V0LmV2ZW50c30pKVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAuaGVpZ2h0KCAkKFwiLmNsbmRyLWdyaWQgLmRheXNcIikuaGVpZ2h0KCkgLSAkKFwiLmNsbmRyLWdyaWQgLmRheXMtb2YtdGhlLXdlZWtcIikuaGVpZ2h0KCkgKVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAubUN1c3RvbVNjcm9sbGJhcih7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBzY3JvbGxCdXR0b25zOntlbmFibGU6dHJ1ZX0sXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aGVtZTpcIm1pbmltYWwtZGFya1wiXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xyXG5cclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgZm9yY2VTaXhSb3dzOiB0cnVlLFxyXG4gICAgICAgICAgICBtdWx0aURheUV2ZW50czoge1xyXG4gICAgICAgICAgICAgICAgc2luZ2xlRGF5OiAnZGF0ZScsXHJcbiAgICAgICAgICAgICAgICBlbmREYXRlOiAnZW5kRGF0ZScsXHJcbiAgICAgICAgICAgICAgICBzdGFydERhdGU6ICdzdGFydERhdGUnXHJcbiAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgIHNob3dBZGphY2VudE1vbnRoczogdHJ1ZSxcclxuICAgICAgICAgICAgYWRqYWNlbnREYXlzQ2hhbmdlTW9udGg6IGZhbHNlLFxyXG4gICAgICAgICAgICB0cmFja1NlbGVjdGVkRGF0ZTogdHJ1ZSxcclxuICAgICAgICAgICAgZGF5c09mVGhlV2VlazogKGZ1bmN0aW9uKCl7XHJcbiAgICAgICAgICAgICAgICB2YXIgcmVzdWx0ID0gW107XHJcbiAgICAgICAgICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IDc7IGkrKykge1xyXG4gICAgICAgICAgICAgICAgICAgIHJlc3VsdC5wdXNoKG1vbWVudCgpLndlZWtkYXkoaSkuZm9ybWF0KCdkZGQnKSk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gcmVzdWx0O1xyXG4gICAgICAgICAgICB9KSgpLFxyXG4gICAgICAgICAgICBkb25lUmVuZGVyaW5nOiBmdW5jdGlvbigpeyAvL2RvbmVSZW5kZXJpbmdcclxuICAgICAgICAgICAgICAgICQoXCIuZGF5LWV2ZW50c1wiKVxyXG4gICAgICAgICAgICAgICAgICAgIC5oZWlnaHQoICQoXCIuY2xuZHItZ3JpZCAuZGF5c1wiKS5oZWlnaHQoKSAtICQoXCIuY2xuZHItZ3JpZCAuZGF5cy1vZi10aGUtd2Vla1wiKS5oZWlnaHQoKSApXHJcbiAgICAgICAgICAgICAgICAgICAgLm1DdXN0b21TY3JvbGxiYXIoe1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBzY3JvbGxCdXR0b25zOntlbmFibGU6dHJ1ZX0sXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoZW1lOlwibWluaW1hbC1kYXJrXCJcclxuICAgICAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgICAgIHZhciBjYWxlbmRhciA9ICQoXCIjZnVsbC1jbG5kclwiKTtcclxuICAgICAgICAgICAgICAgIGlmKGNhbGVuZGFyLmZpbmQoXCIudG9kYXlcIikubGVuZ3RoID4gMClcclxuICAgICAgICAgICAgICAgICAgICBjYWxlbmRhci5maW5kKFwiLnRvZGF5XCIpLmNsaWNrKCk7XHJcbiAgICAgICAgICAgICAgICBlbHNlXHJcbiAgICAgICAgICAgICAgICAgICAgY2FsZW5kYXIuZmluZChcIi5kYXlcIikuZXEoMCkuY2xpY2soKTtcclxuXHJcbiAgICAgICAgICAgICAgICB2YXIgZXZlbnRMaXN0aW5nVGl0bGUgPSAkKFwiLmV2ZW50LWxpc3RpbmctdGl0bGVcIik7XHJcbiAgICAgICAgICAgICAgICAvL0luaXQgYmxvY2sgT3Blbi9DbG9zZSBldmVudFxyXG4gICAgICAgICAgICAgICAgZXZlbnRMaXN0aW5nVGl0bGUub24oXCJjbGlja1wiLCBcIi5nbHlwaGljb24tY2hldnJvbi11cCwgLmdseXBoaWNvbi1jaGV2cm9uLWRvd25cIiwgZnVuY3Rpb24oKXtcclxuICAgICAgICAgICAgICAgICAgICB2YXIgZWwgPSB7fTtcclxuICAgICAgICAgICAgICAgICAgICB2YXIgYmxvY2sgPSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIG9wZW46IFwiZ2x5cGhpY29uLWNoZXZyb24tdXBcIixcclxuICAgICAgICAgICAgICAgICAgICAgICAgY2xvc2U6IFwiZ2x5cGhpY29uLWNoZXZyb24tZG93blwiXHJcbiAgICAgICAgICAgICAgICAgICAgfTtcclxuICAgICAgICAgICAgICAgICAgICB2YXIgJHRoaXMgPSAkKHRoaXMpO1xyXG4gICAgICAgICAgICAgICAgICAgIGlmKCR0aGlzLnBhcmVudCgpLmhhc0NsYXNzKFwibW9udGgtdGl0bGVcIikpXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGVsID0gJChcIi5kYXktdGl0bGUgW2NsYXNzICo9Z2x5cGhpY29uLWNoZXZyb25dXCIpLmVxKDApO1xyXG4gICAgICAgICAgICAgICAgICAgIGVsc2VcclxuICAgICAgICAgICAgICAgICAgICAgICAgZWwgPSAkKFwiLm1vbnRoLXRpdGxlIFtjbGFzcyAqPWdseXBoaWNvbi1jaGV2cm9uXVwiKS5lcSgwKTtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgaWYoZWwuaGFzQ2xhc3MoYmxvY2sub3BlbikpXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGVsLnJlbW92ZUNsYXNzKGJsb2NrLm9wZW4pLmFkZENsYXNzKGJsb2NrLmNsb3NlKTtcclxuICAgICAgICAgICAgICAgICAgICBlbHNlXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGVsLnJlbW92ZUNsYXNzKGJsb2NrLmNsb3NlKS5hZGRDbGFzcyhibG9jay5vcGVuKTtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgaWYoJHRoaXMuaGFzQ2xhc3MoYmxvY2sub3BlbikpXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICR0aGlzLnJlbW92ZUNsYXNzKGJsb2NrLm9wZW4pLmFkZENsYXNzKGJsb2NrLmNsb3NlKTtcclxuICAgICAgICAgICAgICAgICAgICBlbHNlXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICR0aGlzLnJlbW92ZUNsYXNzKGJsb2NrLmNsb3NlKS5hZGRDbGFzcyhibG9jay5vcGVuKTtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgJChcIi5ldmVudC1pdGVtcywgLmRheS1ldmVudHNcIikuc2xpZGVUb2dnbGUoKTtcclxuXHJcbiAgICAgICAgICAgICAgICB9KTtcclxuXHJcblxyXG4gICAgICAgICAgICAgICAgdmFyIGRhdGV0aW1lcGlja2VyT3B0aW9ucyA9IHtcclxuICAgICAgICAgICAgICAgICAgICBzdGVwOiAzMFxyXG4gICAgICAgICAgICAgICAgfTtcclxuICAgICAgICAgICAgICAgIC8vSW5pdCBtb2RhbCB3aW5kb3cgXCJFZGl0IGV2ZW50XCJcclxuICAgICAgICAgICAgICAgICQoXCIuZXZlbnQtbGlzdGluZ1wiKS5vbignY2xpY2snLCAnLmV2ZW50LWl0ZW0nLCBmdW5jdGlvbigpe1xyXG4gICAgICAgICAgICAgICAgICAgIG1vZGFsLmZpbmQoXCJmb3JtXCIpLmdldCgwKS5yZXNldCgpO1xyXG4gICAgICAgICAgICAgICAgICAgIG1vZGFsLmZpbmQoXCIubW9kYWwtdGl0bGVcIikudGV4dChcIkVkaXQgZXZlbnRcIik7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgIGRhdGV0aW1lcGlja2VyT3B0aW9ucy52YWx1ZSA9ICQodGhpcykuZmluZChcIi5ldmVudC1pdGVtLXRpbWVcIikuYXR0cihcImRhdGEtZGF0ZXRpbWVcIik7XHJcbiAgICAgICAgICAgICAgICAgICAgbW9kYWwuZmluZChcIiNUaXRsZVwiKS52YWwoJCh0aGlzKS5maW5kKFwiLmV2ZW50LWl0ZW0tbmFtZVwiKS50ZXh0KCkpO1xyXG4gICAgICAgICAgICAgICAgICAgIG1vZGFsLmZpbmQoXCIjRGVzY3JpcHRpb25cIikudmFsKCQodGhpcykuZmluZChcIi5ldmVudC1pdGVtLWxvY2F0aW9uXCIpLnRleHQoKSk7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgIGRhdGV0aW1lUGlja2VySW5pdChkYXRldGltZXBpY2tlck9wdGlvbnMsICQodGhpcykuYXR0cignZGF0YS1pZCcpKTtcclxuICAgICAgICAgICAgICAgICAgICBtb2RhbC5maW5kKFwiLnNhdmUtY2hhbmdlc1wiKS5vZmYoXCJjbGlja1wiKS5vbignY2xpY2snLCBzYXZlQ2hhbmdlcy5iaW5kKG51bGwsJCh0aGlzKS5hdHRyKCdkYXRhLWlkJykpKTtcclxuICAgICAgICAgICAgICAgIH0pO1xyXG5cclxuICAgICAgICAgICAgICAgIC8vSW5pdCBtb2RhbCB3aW5kb3cgXCJBZGQgZXZlbnRcIlxyXG4gICAgICAgICAgICAgICAgZXZlbnRMaXN0aW5nVGl0bGUub24oXCJjbGlja1wiLCBcIi5nbHlwaGljb24tcGx1c1wiLCBmdW5jdGlvbigpe1xyXG4gICAgICAgICAgICAgICAgICAgIG1vZGFsLmZpbmQoXCJmb3JtXCIpLmdldCgwKS5yZXNldCgpO1xyXG4gICAgICAgICAgICAgICAgICAgIG1vZGFsLmZpbmQoXCIubW9kYWwtdGl0bGVcIikudGV4dChcIkFkZCBldmVudFwiKTtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgaWYoJCh0aGlzKS5wYXJlbnQoKS5oYXNDbGFzcyhcImRheS10aXRsZVwiKSl7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGRhdGV0aW1lcGlja2VyT3B0aW9ucy52YWx1ZSA9IChmdW5jdGlvbigpe1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdmFyIHRpbWUgPSBcIiBcIiArIG1vbWVudCgpLmZvcm1hdChcIkhIOm1tXCIpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdmFyIGVsID0gJChjbG5kci5lbGVtZW50KS5maW5kKFwiLnNlbGVjdGVkXCIpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYoZWwubGVuZ3RoID4gMClcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gZWwuYXR0cihcImRhdGEtaWRcIikgKyB0aW1lO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZWxzZVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiAkKGNsbmRyLmVsZW1lbnQpLmZpbmQoXCJ0b2RheVwiKS5hdHRyKFwiZGF0YS1pZFwiKSArIHRpbWU7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH0pKCk7XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgICAgICAgICBkYXRldGltZVBpY2tlckluaXQoZGF0ZXRpbWVwaWNrZXJPcHRpb25zKTtcclxuICAgICAgICAgICAgICAgICAgICBtb2RhbC5maW5kKFwiLnNhdmUtY2hhbmdlc1wiKS5vZmYoXCJjbGlja1wiKS5vbignY2xpY2snLCBzYXZlQ2hhbmdlcy5iaW5kKG51bGwsJCh0aGlzKS5hdHRyKCdkYXRhLWlkJykpKTtcclxuICAgICAgICAgICAgICAgIH0pO1xyXG5cclxuICAgICAgICAgICAgICAgIHZhciBjYWxlbmRhciA9ICQoXCIuY2xuZHJcIik7XHJcbiAgICAgICAgICAgICAgICBjYWxlbmRhci5oZWlnaHQoY2FsZW5kYXIuaGVpZ2h0KCkpO1xyXG5cclxuICAgICAgICAgICAgfS8vIWRvbmVSZW5kZXJpbmdcclxuICAgICAgICB9KTtcclxuICAgIH07XHJcblxyXG59KSgpOyJdLCJmaWxlIjoic2NoZWR1bGUuanMiLCJzb3VyY2VSb290IjoiL3NvdXJjZS8ifQ==
