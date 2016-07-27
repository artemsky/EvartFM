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
                $(".event-items")
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
                var isTipOpen = false;
                $(".event-listing").on('click', '.event-item', function(e){
                    e.stopPropagation();
                    var hover = $(this).find(".event-item-hover");
                    if(isTipOpen)
                        hover.css('transform', 'translateX(202gitpx)');
                    else
                        hover.css('transform', 'translateX(0px)');
                    isTipOpen = !isTipOpen;
                })
                //Init modal window "Edit event"
                    .on('click', '.event-item span:first-child', function(e){
                    e.stopPropagation();
                    var $this = $(this).parent().parent();
                    modal.find("form").get(0).reset();
                    modal.find(".modal-title").text("Edit event");

                    datetimepickerOptions.value = $this.find(".event-item-time").attr("data-datetime");
                    modal.find("#Title").val($this.find(".event-item-name").text());
                    modal.find("#Description").val($this.find(".event-item-location").text());

                    datetimePickerInit(datetimepickerOptions, $this.attr('data-id'));
                    modal.find(".save-changes").off("click").on('click', saveChanges.bind(null,$this.attr('data-id')));
                });
                $(".event-listing").on('click', '.event-item .event-item-hover span:last-child', function(e){
                    e.stopPropagation();
                    $(this).toggleClass('text-info');
                    var $this = $(this).parent().parent();
                    var id = $this.attr('data-id');
                    var match = $('.days [data-id*="'+ id +'"]');
                    if(!$(this).hasClass('text-info')){
                        match.css("background-color", "#eee");
                        return;
                    }
                    var color = (function() {
                        var letters = 'BCDEF'.split('');
                        var color = '#';
                        for (var i = 0; i < 6; i++ ) {
                            color += letters[Math.floor(Math.random() * letters.length)];
                        }
                        return color;
                    })();
                    match.css("background-color", color);
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
                                return el.attr("data-date") + time;
                            else
                                return $(clndr.element).find("today").attr("data-date") + time;
                        })();
                    }

                    datetimePickerInit(datetimepickerOptions);
                    modal.find(".save-changes").off("click").on('click', saveChanges.bind(null,$(this).attr('data-date')));
                });

                var calendar = $(".clndr");
                calendar.height(calendar.height());

            }//!doneRendering
        });
    };

})();
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiIiwic291cmNlcyI6WyJzY2hlZHVsZS5qcyJdLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24oKXtcbiAgICBcInVzZSBzdHJpY3RcIjtcbiAgICAvL1NldCB1bmRlcnNjb3JlIHRlbXBsYXRlIHNldHRpbmcgYXMge3slJX19IGZvciBiZXR0ZXIgY29kZSByZWFkaW5nXG4gICAgXy50ZW1wbGF0ZVNldHRpbmdzID0ge1xuICAgICAgICBldmFsdWF0ZSAgICA6IC9cXHtcXHslKFtcXHNcXFNdKz8pJVxcfVxcfS9nLFxuICAgICAgICBpbnRlcnBvbGF0ZSA6IC9cXHtcXHslPShbXFxzXFxTXSs/KSVcXH1cXH0vZyxcbiAgICAgICAgZXNjYXBlICAgICAgOiAvXFx7XFx7JS0oW1xcc1xcU10rPyklXFx9XFx9L2dcbiAgICB9O1xuICAgIC8vU2V0IG1vbWVudCBsb2NhbGVcbiAgICBtb21lbnQubG9jYWxlKFwiZW4tZ2JcIik7XG5cbiAgICAvL0luaXQgc3RvcmFnZSBoZWxwZXJzXG4gICAgdmFyIHN0b3JhZ2UgPSB7XG4gICAgICAgIGRpc2s6IHNlc3Npb25TdG9yYWdlIHx8IGxvY2FsU3RvcmFnZSxcbiAgICAgICAgdGFyZ2V0OiB7XG4gICAgICAgICAgICBuYW1lOiBudWxsLFxuICAgICAgICAgICAgb2JqZWN0OiBudWxsLFxuICAgICAgICAgICAgcmVuZGVyZDogbnVsbCxcbiAgICAgICAgICAgIHJlcGVhdDogbnVsbFxuICAgICAgICB9LFxuICAgICAgICAnZ2V0JzogZnVuY3Rpb24oa2V5KXtcbiAgICAgICAgICAgIHRoaXMudGFyZ2V0LnJlcGVhdCA9IGZhbHNlO1xuICAgICAgICAgICAgaWYoIXRoaXMuZGlzay5nZXRJdGVtKGtleSkpXG4gICAgICAgICAgICAgIHJldHVybiBudWxsO1xuICAgICAgICAgICAgdGhpcy50YXJnZXQub2JqZWN0ID0gSlNPTi5wYXJzZSh0aGlzLmRpc2suZ2V0SXRlbShrZXkpKTtcbiAgICAgICAgICAgIHRoaXMudGFyZ2V0Lm5hbWUgPSBrZXk7XG4gICAgICAgICAgICByZXR1cm4gdGhpcztcbiAgICAgICAgfSxcbiAgICAgICAgJ3NldCc6IGZ1bmN0aW9uKGtleSwgdmFsdWUpe1xuICAgICAgICAgICAgdGhpcy50YXJnZXQucmVwZWF0ID0gZmFsc2U7XG4gICAgICAgICAgICB0aGlzLmRpc2suc2V0SXRlbShrZXksIEpTT04uc3RyaW5naWZ5KHZhbHVlKSk7XG4gICAgICAgICAgICB0aGlzLnRhcmdldC5uYW1lID0ga2V5O1xuICAgICAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgICAgIH0sXG4gICAgICAgIGFkZDogZnVuY3Rpb24oZXZlbnQpe1xuICAgICAgICAgICAgdmFyIGlkZW50aXR5ID0gZXZlbnQuaWQgPiAwID8gZXZlbnQuaWQgOiBEYXRlLm5vdygpO1xuICAgICAgICAgICAgdmFyIHJlc3VsdCA9IHtcbiAgICAgICAgICAgICAgICBpZDogaWRlbnRpdHksXG4gICAgICAgICAgICAgICAgdGl0bGU6IGV2ZW50LnRpdGxlLFxuICAgICAgICAgICAgICAgIGRlc2NyaXB0aW9uOiBldmVudC5kZXNjcmlwdGlvbixcbiAgICAgICAgICAgICAgICBkYXRlOiBldmVudC5kYXRlLFxuICAgICAgICAgICAgICAgIHJlcGVhdDoge1xuICAgICAgICAgICAgICAgICAgICBldmVudF9pZDogaWRlbnRpdHksXG4gICAgICAgICAgICAgICAgICAgIGV2ZXJ5RGF5OiBldmVudC5ldmVyeURheSA/IDEgOiAwLFxuICAgICAgICAgICAgICAgICAgICBldmVyeVdlZWs6IGV2ZW50LmV2ZXJ5V2VlayA/IDEgOiAwLFxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH07XG4gICAgICAgICAgICBpZihldmVudC5kYXlzKXtcbiAgICAgICAgICAgICAgICB2YXIgZGF5S2V5cyA9IE9iamVjdC5rZXlzKGV2ZW50LmRheXMpO1xuICAgICAgICAgICAgICAgIGZvcih2YXIgaSA9IGRheUtleXMubGVuZ3RoOyBpLS07KXtcbiAgICAgICAgICAgICAgICAgICAgdmFyIGtleSA9IGRheUtleXNbaV07XG4gICAgICAgICAgICAgICAgICAgIHJlc3VsdC5yZXBlYXRba2V5XSA9IGV2ZW50LmRheXNba2V5XTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICB2YXIgaXNFeGlzdHMgPSBmYWxzZTtcbiAgICAgICAgICAgIHRoaXMudGFyZ2V0Lm9iamVjdC5mb3JFYWNoKGZ1bmN0aW9uKHZhbHVlLCBpLCBhcnIpe1xuICAgICAgICAgICAgICAgIGlmKHZhbHVlLmlkID09IHJlc3VsdC5pZCl7XG4gICAgICAgICAgICAgICAgICAgIGlzRXhpc3RzID0gdHJ1ZTtcbiAgICAgICAgICAgICAgICAgICAgYXJyW2ldID0gcmVzdWx0O1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgaWYoIWlzRXhpc3RzKXtcbiAgICAgICAgICAgICAgICB0aGlzLnRhcmdldC5vYmplY3QucHVzaChyZXN1bHQpO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICByZXR1cm4gdGhpcztcbiAgICAgICAgfSxcbiAgICAgICAgc2F2ZTogZnVuY3Rpb24oKXtcbiAgICAgICAgICAgIHRoaXMuc2V0KCdldmVudHMnLCB0aGlzLnRhcmdldC5vYmplY3QpO1xuICAgICAgICB9LFxuICAgICAgICB3aGVyZURhdGU6IGZ1bmN0aW9uKGRhdGUpe1xuICAgICAgICAgICAgaWYoIWRhdGUpXG4gICAgICAgICAgICAgICAgcmV0dXJuIG51bGw7XG4gICAgICAgICAgICBmb3IodmFyIGkgaW4gdGhpcy50YXJnZXQub2JqZWN0KVxuICAgICAgICAgICAgICAgIGlmKHRoaXMudGFyZ2V0Lm9iamVjdFtpXS5kYXRlLnN1YnN0cmluZygwLDEwKSA9PSBkYXRlKXtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy50YXJnZXQub2JqZWN0ID0gW3RoaXMudGFyZ2V0Lm9iamVjdFtpXV07XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiB0aGlzO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHRoaXMudGFyZ2V0Lm9iamVjdCA9IFtdO1xuICAgICAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgICAgIH0sXG4gICAgICAgIHdoZXJlSWQ6IGZ1bmN0aW9uKGlkKXtcbiAgICAgICAgICAgIGlmKCFpZClcbiAgICAgICAgICAgICAgICByZXR1cm4gbnVsbDtcbiAgICAgICAgICAgIGZvcih2YXIgaSBpbiB0aGlzLnRhcmdldC5vYmplY3QpXG4gICAgICAgICAgICAgICAgaWYodGhpcy50YXJnZXQub2JqZWN0W2ldLmlkID09IGlkKXtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy50YXJnZXQub2JqZWN0ID0gW3RoaXMudGFyZ2V0Lm9iamVjdFtpXV07XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiB0aGlzO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHRoaXMudGFyZ2V0Lm9iamVjdCA9IFtdO1xuICAgICAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgICAgIH0sXG4gICAgICAgIHJlcGVhdDogZnVuY3Rpb24oKXtcbiAgICAgICAgICAgIHRoaXMudGFyZ2V0LnJlcGVhdCA9IHRydWU7XG4gICAgICAgICAgICByZXR1cm4gdGhpcztcbiAgICAgICAgfSxcbiAgICAgICAgZ2V0UmVuZGVyZWQ6IGZ1bmN0aW9uKHJhbmdlKXtcbiAgICAgICAgICAgIHZhciBkYXRlRm9ybWF0ID0gJ1lZWVktTU0tREQgSEg6c3MnO1xuICAgICAgICAgICAgdGhpcy50YXJnZXQucmVuZGVyZCA9IFtdO1xuICAgICAgICAgICAgLy8gdmFyIHJhbmdlID0gbW9tZW50KCkuYWRkKG1vbnRoLCAnbW9udGgnKS5kaWZmKG1vbWVudCgpLmFkZCgtbW9udGgsICdtb250aCcpLCAnZGF5cycpO1xuICAgICAgICAgICAgcmFuZ2UgLz0gMjtcblxuICAgICAgICAgICAgdGhpcy50YXJnZXQub2JqZWN0LmZvckVhY2goZnVuY3Rpb24odmFsdWUpe1xuICAgICAgICAgICAgICAgIHZhciBmbGFnID0ge1xuICAgICAgICAgICAgICAgICAgICBldmVyeURheTogZmFsc2UsXG4gICAgICAgICAgICAgICAgICAgIGV2ZXJ5V2VlazogZmFsc2VcbiAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgICAgIGlmKHZhbHVlLnJlcGVhdC5ldmVyeURheSl7XG4gICAgICAgICAgICAgICAgICAgIGZsYWcuZXZlcnlEYXkgPSB0cnVlO1xuICAgICAgICAgICAgICAgICAgICBmb3IodmFyIGkgPSAtcmFuZ2U7IGkgPCByYW5nZTsgaSsrKXtcbiAgICAgICAgICAgICAgICAgICAgICAgIHZhbHVlLmRhdGUgPSBtb21lbnQoKS5hZGQoaSwgJ2RheXMnKS5mb3JtYXQoZGF0ZUZvcm1hdCk7XG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLnRhcmdldC5yZW5kZXJkLnB1c2goJC5leHRlbmQodHJ1ZSwge30sIHZhbHVlKSk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgZWxzZSBpZih2YWx1ZS5yZXBlYXQuZXZlcnlXZWVrKXtcbiAgICAgICAgICAgICAgICAgICAgZmxhZy5ldmVyeVdlZWsgPSB0cnVlO1xuICAgICAgICAgICAgICAgICAgICB2YXIgd2Vla1JhbmdlID0gTWF0aC5mbG9vcihyYW5nZSAvIDcpO1xuICAgICAgICAgICAgICAgICAgICB2YXIgd2Vla05vdyA9IG1vbWVudCgpLndlZWsoKTtcbiAgICAgICAgICAgICAgICAgICAgZm9yKHZhciBpID0gLXdlZWtSYW5nZTsgaSA8IHdlZWtSYW5nZTsgaSsrKXtcbiAgICAgICAgICAgICAgICAgICAgICAgIHZhciB3ZWVrID0gbW9tZW50KCkud2Vlayh3ZWVrTm93ICsgaSk7XG4gICAgICAgICAgICAgICAgICAgICAgICBmb3IodmFyIGRheSBpbiB2YWx1ZS5yZXBlYXQpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgc3dpdGNoKGRheSl7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNhc2UgXCJtb25cIjpcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY2FzZSBcInR1ZVwiOlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjYXNlIFwid2VkXCI6XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNhc2UgXCJ0aHVcIjpcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY2FzZSBcImZyaVwiOlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjYXNlIFwic2F0XCI6XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNhc2UgXCJzdW5cIjpcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmKHZhbHVlLnJlcGVhdFtkYXldKXtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB2YWx1ZS5kYXRlID0gd2Vlay5kYXkoZGF5KS5mb3JtYXQoZGF0ZUZvcm1hdCk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy50YXJnZXQucmVuZGVyZC5wdXNoKCQuZXh0ZW5kKHRydWUsIHt9LCB2YWx1ZSkpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGlmKCFmbGFnLmV2ZXJ5RGF5ICYmICFmbGFnLmV2ZXJ5V2Vlayl7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMudGFyZ2V0LnJlbmRlcmQucHVzaCgkLmV4dGVuZCh0cnVlLCB7fSwgdmFsdWUpKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgfS5iaW5kKHRoaXMpKTtcbiAgICAgICAgICAgIHJldHVybiB0aGlzLnRhcmdldC5yZW5kZXJkO1xuICAgICAgICB9LFxuICAgICAgICByZXN1bHQ6IGZ1bmN0aW9uKCl7XG4gICAgICAgICAgICBpZighdGhpcy50YXJnZXQucmVwZWF0KVxuICAgICAgICAgICAgICAgIHJldHVybiB0aGlzLnRhcmdldC5vYmplY3Q7XG4gICAgICAgICAgICB2YXIgcmVzdWx0ID0gW107XG4gICAgICAgICAgICBmb3IodmFyIGkgaW4gdGhpcy50YXJnZXQub2JqZWN0KXtcbiAgICAgICAgICAgICAgICB2YXIgcmVwZWF0S2V5cyA9IE9iamVjdC5rZXlzKHRoaXMudGFyZ2V0Lm9iamVjdFtpXS5yZXBlYXQpLFxuICAgICAgICAgICAgICAgICAgICBkYXlzID0ge30sXG4gICAgICAgICAgICAgICAgICAgIHJlcGVhdCA9IHt9LFxuICAgICAgICAgICAgICAgICAgICBrZXkgPSAnJztcbiAgICAgICAgICAgICAgICBmb3IodmFyIHIgPSByZXBlYXRLZXlzLmxlbmd0aDsgci0tOyl7XG4gICAgICAgICAgICAgICAgICAgIGtleSA9IHJlcGVhdEtleXNbcl07XG4gICAgICAgICAgICAgICAgICAgIHN3aXRjaChrZXkpe1xuICAgICAgICAgICAgICAgICAgICAgICAgY2FzZSBcIm1vblwiOlxuICAgICAgICAgICAgICAgICAgICAgICAgY2FzZSBcInR1ZVwiOlxuICAgICAgICAgICAgICAgICAgICAgICAgY2FzZSBcIndlZFwiOlxuICAgICAgICAgICAgICAgICAgICAgICAgY2FzZSBcInRodVwiOlxuICAgICAgICAgICAgICAgICAgICAgICAgY2FzZSBcImZyaVwiOlxuICAgICAgICAgICAgICAgICAgICAgICAgY2FzZSBcInNhdFwiOlxuICAgICAgICAgICAgICAgICAgICAgICAgY2FzZSBcInN1blwiOlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRheXNba2V5XSA9IHRoaXMudGFyZ2V0Lm9iamVjdFtpXS5yZXBlYXRba2V5XTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICAgICAgICAgIGRlZmF1bHQ6XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcmVwZWF0W2tleV0gPSB0aGlzLnRhcmdldC5vYmplY3RbaV0ucmVwZWF0W2tleV07XG4gICAgICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICByZXBlYXQuZGF5cyA9IGRheXM7XG4gICAgICAgICAgICAgICAgcmVzdWx0LnB1c2gocmVwZWF0KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJldHVybiByZXN1bHQ7XG4gICAgICAgIH1cbiAgICB9O1xuXG4gICAgLy9ldmVudHNcbiAgICB2YXIgb25FdmVudHNTdWNjZXNzID0gZnVuY3Rpb24ocmVzcG9uc2Upe1xuICAgICAgICAgICAgJChcIiNmb3VudGFpblRleHRHXCIpLmhpZGUoKTtcbiAgICAgICAgICAgIHN0b3JhZ2Uuc2V0KCdldmVudHMnLCByZXNwb25zZSk7XG4gICAgICAgICAgICB2YXIgZXZlbnRzID0gc3RvcmFnZS5nZXQoJ2V2ZW50cycpLmdldFJlbmRlcmVkKDYwKTtcbiAgICAgICAgICAgIGluaXRDYWxlbmRhcihldmVudHMpO1xuICAgICAgICB9LFxuICAgICAgICBvbkV2ZW50c0Vycm9yID0gZnVuY3Rpb24gKHJlc3BvbnNlKXtcbiAgICAgICAgICAgICQoXCIjZm91bnRhaW5UZXh0R1wiKS5oaWRlKCk7XG4gICAgICAgICAgICBjb25zb2xlLmxvZyhyZXNwb25zZSk7XG4gICAgICAgIH07XG4gICAgdmFyIHJlcXVlc3RPcHRpb25zID0ge1xuICAgICAgICB0eXBlOiBcIkdFVFwiLFxuICAgICAgICBjYWNoZTogZmFsc2UsXG4gICAgICAgIHN1Y2Nlc3M6IG9uRXZlbnRzU3VjY2VzcyxcbiAgICAgICAgZXJyb3I6IG9uRXZlbnRzRXJyb3JcbiAgICB9O1xuICAgICQuYWpheCgnc2NoZWR1bGUvZXZlbnRzJywgcmVxdWVzdE9wdGlvbnMpO1xuICAgIFxuICAgIC8vIWV2ZW50c1xuXG4gICAgLy9pbml0IHZhcmlhYmxlc1xuICAgIHZhciBjbG5kciA9IHt9O1xuICAgIHZhciBkYXlFdmVudHNUZW1wbGF0ZSA9ICQoJyNkYXktZXZlbnRzJykuaHRtbCgpO1xuXG4gICAgdmFyIG1vZGFsID0gJChcIiNtb2RhbFwiKTtcbiAgICB2YXIgZGF0ZXRpbWVQaWNrZXJJbml0ID0gZnVuY3Rpb24ob3B0aW9ucywgaWQpe1xuICAgICAgICAvL0RhdGUgaW5pdFxuICAgICAgICB2YXIgZHRQaWNrZXIgPSAkKCcjZGF0ZXRpbWVwaWNrZXInKSxcbiAgICAgICAgICAgIGNoZWNrT3B0aW9ucyA9IHtcbiAgICAgICAgICAgICAgICBjaGVja2JveENsYXNzOiAnaWNoZWNrYm94X3NxdWFyZS1ibHVlJyxcbiAgICAgICAgICAgICAgICByYWRpb0NsYXNzOiAnaXJhZGlvX3NxdWFyZS1ibHVlJyxcbiAgICAgICAgICAgICAgICBpbmNyZWFzZUFyZWE6ICcyMCUnLFxuICAgICAgICAgICAgfTtcbiAgICAgICAgJCgnI3JlcGVhdC1kYXknKS5pQ2hlY2soJ3VuY2hlY2snKVxuICAgICAgICAgICAgLmlDaGVjayhjaGVja09wdGlvbnMpLm9uKFwiaWZVbmNoZWNrZWRcIiwgZnVuY3Rpb24oKXtcbiAgICAgICAgICAgICAgICBkdFBpY2tlclxuICAgICAgICAgICAgICAgICAgICAuZGF0ZXRpbWVwaWNrZXIoJ2Rlc3Ryb3knKVxuICAgICAgICAgICAgICAgICAgICAuZGF0ZXRpbWVwaWNrZXIoKTtcbiAgICAgICAgICAgICAgICAkKFwiI3JlcGVhdC1tb250aFwiKS5pQ2hlY2soJ2VuYWJsZScpO1xuICAgICAgICAgICAgICAgIHJlcGVhdE9uLmlDaGVjaygnZW5hYmxlJyk7XG4gICAgICAgICAgICB9KS5vbihcImlmQ2hlY2tlZFwiLCBmdW5jdGlvbigpe1xuICAgICAgICAgICAgICAgIGR0UGlja2VyXG4gICAgICAgICAgICAgICAgICAgIC5kYXRldGltZXBpY2tlcignZGVzdHJveScpXG4gICAgICAgICAgICAgICAgICAgIC5kYXRldGltZXBpY2tlcih7XG4gICAgICAgICAgICAgICAgICAgICAgICBkYXRlcGlja2VyOmZhbHNlLFxuICAgICAgICAgICAgICAgICAgICAgICAgZm9ybWF0OidIOmknXG4gICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgICQoXCIjcmVwZWF0LW1vbnRoXCIpLmlDaGVjaygnZGlzYWJsZScpO1xuICAgICAgICAgICAgICAgIHJlcGVhdE9uLmlDaGVjaygnZGlzYWJsZScpO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgIGR0UGlja2VyXG4gICAgICAgICAgICAuZGF0ZXRpbWVwaWNrZXIoJ2Rlc3Ryb3knKVxuICAgICAgICAgICAgLmRhdGV0aW1lcGlja2VyKG9wdGlvbnMpO1xuXG4gICAgICAgIC8vUmVwZWF0IGluaXRcbiAgICAgICAgdmFyIHJlcGVhdE9uID0gJChcIiNyZXBlYXQtb25cIik7XG4gICAgICAgIHJlcGVhdE9uLmhpZGUoKTtcbiAgICAgICAgJCgnI3JlcGVhdC1tb250aCcpLmlDaGVjaygndW5jaGVjaycpXG4gICAgICAgICAgICAuaUNoZWNrKGNoZWNrT3B0aW9ucylcbiAgICAgICAgICAgIC5vbihcImlmVW5jaGVja2VkXCIsIGZ1bmN0aW9uKCl7XG4gICAgICAgICAgICAgICAgcmVwZWF0T24uaGlkZSgpO1xuICAgICAgICAgICAgfSlcbiAgICAgICAgICAgIC5vbihcImlmQ2hlY2tlZFwiLCBmdW5jdGlvbigpe1xuICAgICAgICAgICAgICAgICQoXCJbaWQqPSdyZXBlYXQtb24tJ11cIilcbiAgICAgICAgICAgICAgICAgICAgLmlDaGVjayhjaGVja09wdGlvbnMpO1xuICAgICAgICAgICAgICAgIHJlcGVhdE9uLnNob3coKTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAvL1NldCBjaGVja2VkIGRheXNcbiAgICAgICAgaWYoaWQpe1xuICAgICAgICAgICAgKGZ1bmN0aW9uKCl7XG4gICAgICAgICAgICAgICAgdmFyIHJlcGVhdHMgPSBzdG9yYWdlLmdldCgnZXZlbnRzJykud2hlcmVJZChpZCkucmVwZWF0KCkucmVzdWx0KClbMF07XG4gICAgICAgICAgICAgICAgaWYocmVwZWF0cy5ldmVyeVdlZWspe1xuICAgICAgICAgICAgICAgICAgICAkKCcjcmVwZWF0LW1vbnRoJykuaUNoZWNrKCdjaGVjaycpO1xuICAgICAgICAgICAgICAgICAgICBmb3IodmFyIGkgaW4gcmVwZWF0cy5kYXlzKXtcbiAgICAgICAgICAgICAgICAgICAgICAgICQoXCIjcmVwZWF0LW9uLVwiICsgaSkuaUNoZWNrKHJlcGVhdHMuZGF5c1tpXSA/ICdjaGVjayc6ICd1bmNoZWNrJylcbiAgICAgICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGlmKHJlcGVhdHMuZXZlcnlEYXkpe1xuICAgICAgICAgICAgICAgICAgICAkKCcjcmVwZWF0LWRheScpLmlDaGVjaygnY2hlY2snKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9KSgpO1xuICAgICAgICB9XG4gICAgICAgIC8vIWNoZWNrZWQgZGF5c1xuICAgICAgICBtb2RhbC5tb2RhbCgnc2hvdycpO1xuICAgIH07XG4gICAgLy9vbiBTYXZpbmcgY2hhbmdlc1xuICAgIHZhciBzYXZlQ2hhbmdlcyA9IGZ1bmN0aW9uKGlkKXtcbiAgICAgICAgdmFyIHRpdGxlID0gJC50cmltKCQoXCIjVGl0bGVcIikudmFsKCkpLFxuICAgICAgICAgICAgZGVzY3JpcHRpb24gPSAkLnRyaW0oJChcIiNEZXNjcmlwdGlvblwiKS52YWwoKSksXG4gICAgICAgICAgICBpc0RheVJlcGVhdCA9ICQoXCIjcmVwZWF0LWRheVwiKS5wcm9wKFwiY2hlY2tlZFwiKSxcbiAgICAgICAgICAgIGRhdGVUaW1lID0gJChcIiNkYXRldGltZXBpY2tlclwiKS52YWwoKTtcblxuICAgICAgICBpZighdGl0bGUpe1xuICAgICAgICAgICAgJChcIiNUaXRsZVwiKS50b29sdGlwKHtcbiAgICAgICAgICAgICAgICB0cmlnZ2VyOidtYW51YWwnXG4gICAgICAgICAgICB9KS50b29sdGlwKCdzaG93Jyk7XG4gICAgICAgICAgICBzZXRUaW1lb3V0KGZ1bmN0aW9uKCl7XG4gICAgICAgICAgICAgICAgJChcIiNUaXRsZVwiKS50b29sdGlwKCdkZXN0cm95Jyk7XG4gICAgICAgICAgICB9LCAyMDAwKTtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuICAgICAgICBpZighaXNEYXlSZXBlYXQpe1xuICAgICAgICAgICAgdmFyIGlzV2Vla1JlcGVhdCA9ICAkKFwiI3JlcGVhdC1tb250aFwiKS5wcm9wKFwiY2hlY2tlZFwiKTtcbiAgICAgICAgICAgIGlmKGlzV2Vla1JlcGVhdCl7XG4gICAgICAgICAgICAgICAgdmFyIGRheXNSZXBlYXQgPSB7fTtcbiAgICAgICAgICAgICAgICAkKFwiW2lkKj0ncmVwZWF0LW9uLSddXCIpLmVhY2goZnVuY3Rpb24gKGksIG9iaikge1xuICAgICAgICAgICAgICAgICAgICBkYXlzUmVwZWF0WyQob2JqKS5hdHRyKCdpZCcpLnN1YnN0cmluZygxMCldID0gJChvYmopLnByb3AoXCJjaGVja2VkXCIpID8gMSA6IDA7XG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgXG4gICAgICAgIHN0b3JhZ2UuZ2V0KCdldmVudHMnKS5hZGQoe1xuICAgICAgICAgICAgaWQ6IGlkIHx8IC0xLFxuICAgICAgICAgICAgdGl0bGU6IHRpdGxlLFxuICAgICAgICAgICAgZGF0ZSA6IGRhdGVUaW1lLFxuICAgICAgICAgICAgZGVzY3JpcHRpb246IGRlc2NyaXB0aW9uLFxuICAgICAgICAgICAgZXZlcnlEYXk6IGlzRGF5UmVwZWF0LFxuICAgICAgICAgICAgZXZlcnlXZWVrOiBpc1dlZWtSZXBlYXQsXG4gICAgICAgICAgICBkYXlzOiBkYXlzUmVwZWF0XG4gICAgICAgIH0pLnNhdmUoKTtcbiAgICAgICAgXG4gICAgICAgIGNsbmRyLnNldEV2ZW50cyhzdG9yYWdlLmdldCgnZXZlbnRzJykuZ2V0UmVuZGVyZWQoNjApKTtcbiAgICAgICAgbW9kYWwubW9kYWwoJ2hpZGUnKTtcbiAgICB9O1xuXG4gICAgLy9Jbml0IGNhbGVuZGFyXG4gICAgdmFyIGluaXRDYWxlbmRhciA9IGZ1bmN0aW9uKGV2ZW50cyl7XG4gICAgICAgIGNsbmRyID0gJCgnI2Z1bGwtY2xuZHInKS5jbG5kcih7XG4gICAgICAgICAgICB0ZW1wbGF0ZTogJCgnI2Z1bGwtY2xuZHItdGVtcGxhdGUnKS5odG1sKCksXG4gICAgICAgICAgICBldmVudHM6IGV2ZW50cyxcbiAgICAgICAgICAgIGNsaWNrRXZlbnRzOiB7XG4gICAgICAgICAgICAgICAgY2xpY2s6IGZ1bmN0aW9uICh0YXJnZXQpIHtcbiAgICAgICAgICAgICAgICAgICAgdmFyIHRlbXBsYXRlID0gXy50ZW1wbGF0ZShkYXlFdmVudHNUZW1wbGF0ZSk7XG4gICAgICAgICAgICAgICAgICAgICQoXCIuZGF5LWV2ZW50c1wiKVxuICAgICAgICAgICAgICAgICAgICAgICAgLm1DdXN0b21TY3JvbGxiYXIoXCJkZXN0cm95XCIpXG4gICAgICAgICAgICAgICAgICAgICAgICAuaHRtbCh0ZW1wbGF0ZSh7ZXZlbnRzVGhpc0RheTogdGFyZ2V0LmV2ZW50c30pKVxuICAgICAgICAgICAgICAgICAgICAgICAgLmhlaWdodCggJChcIi5jbG5kci1ncmlkIC5kYXlzXCIpLmhlaWdodCgpIC0gJChcIi5jbG5kci1ncmlkIC5kYXlzLW9mLXRoZS13ZWVrXCIpLmhlaWdodCgpIClcbiAgICAgICAgICAgICAgICAgICAgICAgIC5tQ3VzdG9tU2Nyb2xsYmFyKHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBzY3JvbGxCdXR0b25zOntlbmFibGU6dHJ1ZX0sXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdGhlbWU6XCJtaW5pbWFsLWRhcmtcIlxuICAgICAgICAgICAgICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgZm9yY2VTaXhSb3dzOiB0cnVlLFxuICAgICAgICAgICAgbXVsdGlEYXlFdmVudHM6IHtcbiAgICAgICAgICAgICAgICBzaW5nbGVEYXk6ICdkYXRlJyxcbiAgICAgICAgICAgICAgICBlbmREYXRlOiAnZW5kRGF0ZScsXG4gICAgICAgICAgICAgICAgc3RhcnREYXRlOiAnc3RhcnREYXRlJ1xuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIHNob3dBZGphY2VudE1vbnRoczogdHJ1ZSxcbiAgICAgICAgICAgIGFkamFjZW50RGF5c0NoYW5nZU1vbnRoOiBmYWxzZSxcbiAgICAgICAgICAgIHRyYWNrU2VsZWN0ZWREYXRlOiB0cnVlLFxuICAgICAgICAgICAgZGF5c09mVGhlV2VlazogKGZ1bmN0aW9uKCl7XG4gICAgICAgICAgICAgICAgdmFyIHJlc3VsdCA9IFtdO1xuICAgICAgICAgICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgNzsgaSsrKSB7XG4gICAgICAgICAgICAgICAgICAgIHJlc3VsdC5wdXNoKG1vbWVudCgpLndlZWtkYXkoaSkuZm9ybWF0KCdkZGQnKSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIHJldHVybiByZXN1bHQ7XG4gICAgICAgICAgICB9KSgpLFxuICAgICAgICAgICAgZG9uZVJlbmRlcmluZzogZnVuY3Rpb24oKXsgLy9kb25lUmVuZGVyaW5nXG4gICAgICAgICAgICAgICAgJChcIi5ldmVudC1pdGVtc1wiKVxuICAgICAgICAgICAgICAgICAgICAuaGVpZ2h0KCAkKFwiLmNsbmRyLWdyaWQgLmRheXNcIikuaGVpZ2h0KCkgLSAkKFwiLmNsbmRyLWdyaWQgLmRheXMtb2YtdGhlLXdlZWtcIikuaGVpZ2h0KCkgKVxuICAgICAgICAgICAgICAgICAgICAubUN1c3RvbVNjcm9sbGJhcih7XG4gICAgICAgICAgICAgICAgICAgICAgICBzY3JvbGxCdXR0b25zOntlbmFibGU6dHJ1ZX0sXG4gICAgICAgICAgICAgICAgICAgICAgICB0aGVtZTpcIm1pbmltYWwtZGFya1wiXG4gICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgIHZhciBjYWxlbmRhciA9ICQoXCIjZnVsbC1jbG5kclwiKTtcbiAgICAgICAgICAgICAgICBpZihjYWxlbmRhci5maW5kKFwiLnRvZGF5XCIpLmxlbmd0aCA+IDApXG4gICAgICAgICAgICAgICAgICAgIGNhbGVuZGFyLmZpbmQoXCIudG9kYXlcIikuY2xpY2soKTtcbiAgICAgICAgICAgICAgICBlbHNlXG4gICAgICAgICAgICAgICAgICAgIGNhbGVuZGFyLmZpbmQoXCIuZGF5XCIpLmVxKDApLmNsaWNrKCk7XG5cbiAgICAgICAgICAgICAgICB2YXIgZXZlbnRMaXN0aW5nVGl0bGUgPSAkKFwiLmV2ZW50LWxpc3RpbmctdGl0bGVcIik7XG4gICAgICAgICAgICAgICAgLy9Jbml0IGJsb2NrIE9wZW4vQ2xvc2UgZXZlbnRcbiAgICAgICAgICAgICAgICBldmVudExpc3RpbmdUaXRsZS5vbihcImNsaWNrXCIsIFwiLmdseXBoaWNvbi1jaGV2cm9uLXVwLCAuZ2x5cGhpY29uLWNoZXZyb24tZG93blwiLCBmdW5jdGlvbigpe1xuICAgICAgICAgICAgICAgICAgICB2YXIgZWwgPSB7fTtcbiAgICAgICAgICAgICAgICAgICAgdmFyIGJsb2NrID0ge1xuICAgICAgICAgICAgICAgICAgICAgICAgb3BlbjogXCJnbHlwaGljb24tY2hldnJvbi11cFwiLFxuICAgICAgICAgICAgICAgICAgICAgICAgY2xvc2U6IFwiZ2x5cGhpY29uLWNoZXZyb24tZG93blwiXG4gICAgICAgICAgICAgICAgICAgIH07XG4gICAgICAgICAgICAgICAgICAgIHZhciAkdGhpcyA9ICQodGhpcyk7XG4gICAgICAgICAgICAgICAgICAgIGlmKCR0aGlzLnBhcmVudCgpLmhhc0NsYXNzKFwibW9udGgtdGl0bGVcIikpXG4gICAgICAgICAgICAgICAgICAgICAgICBlbCA9ICQoXCIuZGF5LXRpdGxlIFtjbGFzcyAqPWdseXBoaWNvbi1jaGV2cm9uXVwiKS5lcSgwKTtcbiAgICAgICAgICAgICAgICAgICAgZWxzZVxuICAgICAgICAgICAgICAgICAgICAgICAgZWwgPSAkKFwiLm1vbnRoLXRpdGxlIFtjbGFzcyAqPWdseXBoaWNvbi1jaGV2cm9uXVwiKS5lcSgwKTtcblxuICAgICAgICAgICAgICAgICAgICBpZihlbC5oYXNDbGFzcyhibG9jay5vcGVuKSlcbiAgICAgICAgICAgICAgICAgICAgICAgIGVsLnJlbW92ZUNsYXNzKGJsb2NrLm9wZW4pLmFkZENsYXNzKGJsb2NrLmNsb3NlKTtcbiAgICAgICAgICAgICAgICAgICAgZWxzZVxuICAgICAgICAgICAgICAgICAgICAgICAgZWwucmVtb3ZlQ2xhc3MoYmxvY2suY2xvc2UpLmFkZENsYXNzKGJsb2NrLm9wZW4pO1xuXG4gICAgICAgICAgICAgICAgICAgIGlmKCR0aGlzLmhhc0NsYXNzKGJsb2NrLm9wZW4pKVxuICAgICAgICAgICAgICAgICAgICAgICAgJHRoaXMucmVtb3ZlQ2xhc3MoYmxvY2sub3BlbikuYWRkQ2xhc3MoYmxvY2suY2xvc2UpO1xuICAgICAgICAgICAgICAgICAgICBlbHNlXG4gICAgICAgICAgICAgICAgICAgICAgICAkdGhpcy5yZW1vdmVDbGFzcyhibG9jay5jbG9zZSkuYWRkQ2xhc3MoYmxvY2sub3Blbik7XG5cbiAgICAgICAgICAgICAgICAgICAgJChcIi5ldmVudC1pdGVtcywgLmRheS1ldmVudHNcIikuc2xpZGVUb2dnbGUoKTtcblxuICAgICAgICAgICAgICAgIH0pO1xuXG5cbiAgICAgICAgICAgICAgICB2YXIgZGF0ZXRpbWVwaWNrZXJPcHRpb25zID0ge1xuICAgICAgICAgICAgICAgICAgICBzdGVwOiAzMFxuICAgICAgICAgICAgICAgIH07XG4gICAgICAgICAgICAgICAgdmFyIGlzVGlwT3BlbiA9IGZhbHNlO1xuICAgICAgICAgICAgICAgICQoXCIuZXZlbnQtbGlzdGluZ1wiKS5vbignY2xpY2snLCAnLmV2ZW50LWl0ZW0nLCBmdW5jdGlvbihlKXtcbiAgICAgICAgICAgICAgICAgICAgZS5zdG9wUHJvcGFnYXRpb24oKTtcbiAgICAgICAgICAgICAgICAgICAgdmFyIGhvdmVyID0gJCh0aGlzKS5maW5kKFwiLmV2ZW50LWl0ZW0taG92ZXJcIik7XG4gICAgICAgICAgICAgICAgICAgIGlmKGlzVGlwT3BlbilcbiAgICAgICAgICAgICAgICAgICAgICAgIGhvdmVyLmNzcygndHJhbnNmb3JtJywgJ3RyYW5zbGF0ZVgoMjAyZ2l0cHgpJyk7XG4gICAgICAgICAgICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgICAgICAgICAgICAgIGhvdmVyLmNzcygndHJhbnNmb3JtJywgJ3RyYW5zbGF0ZVgoMHB4KScpO1xuICAgICAgICAgICAgICAgICAgICBpc1RpcE9wZW4gPSAhaXNUaXBPcGVuO1xuICAgICAgICAgICAgICAgIH0pXG4gICAgICAgICAgICAgICAgLy9Jbml0IG1vZGFsIHdpbmRvdyBcIkVkaXQgZXZlbnRcIlxuICAgICAgICAgICAgICAgICAgICAub24oJ2NsaWNrJywgJy5ldmVudC1pdGVtIHNwYW46Zmlyc3QtY2hpbGQnLCBmdW5jdGlvbihlKXtcbiAgICAgICAgICAgICAgICAgICAgZS5zdG9wUHJvcGFnYXRpb24oKTtcbiAgICAgICAgICAgICAgICAgICAgdmFyICR0aGlzID0gJCh0aGlzKS5wYXJlbnQoKS5wYXJlbnQoKTtcbiAgICAgICAgICAgICAgICAgICAgbW9kYWwuZmluZChcImZvcm1cIikuZ2V0KDApLnJlc2V0KCk7XG4gICAgICAgICAgICAgICAgICAgIG1vZGFsLmZpbmQoXCIubW9kYWwtdGl0bGVcIikudGV4dChcIkVkaXQgZXZlbnRcIik7XG5cbiAgICAgICAgICAgICAgICAgICAgZGF0ZXRpbWVwaWNrZXJPcHRpb25zLnZhbHVlID0gJHRoaXMuZmluZChcIi5ldmVudC1pdGVtLXRpbWVcIikuYXR0cihcImRhdGEtZGF0ZXRpbWVcIik7XG4gICAgICAgICAgICAgICAgICAgIG1vZGFsLmZpbmQoXCIjVGl0bGVcIikudmFsKCR0aGlzLmZpbmQoXCIuZXZlbnQtaXRlbS1uYW1lXCIpLnRleHQoKSk7XG4gICAgICAgICAgICAgICAgICAgIG1vZGFsLmZpbmQoXCIjRGVzY3JpcHRpb25cIikudmFsKCR0aGlzLmZpbmQoXCIuZXZlbnQtaXRlbS1sb2NhdGlvblwiKS50ZXh0KCkpO1xuXG4gICAgICAgICAgICAgICAgICAgIGRhdGV0aW1lUGlja2VySW5pdChkYXRldGltZXBpY2tlck9wdGlvbnMsICR0aGlzLmF0dHIoJ2RhdGEtaWQnKSk7XG4gICAgICAgICAgICAgICAgICAgIG1vZGFsLmZpbmQoXCIuc2F2ZS1jaGFuZ2VzXCIpLm9mZihcImNsaWNrXCIpLm9uKCdjbGljaycsIHNhdmVDaGFuZ2VzLmJpbmQobnVsbCwkdGhpcy5hdHRyKCdkYXRhLWlkJykpKTtcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICAkKFwiLmV2ZW50LWxpc3RpbmdcIikub24oJ2NsaWNrJywgJy5ldmVudC1pdGVtIC5ldmVudC1pdGVtLWhvdmVyIHNwYW46bGFzdC1jaGlsZCcsIGZ1bmN0aW9uKGUpe1xuICAgICAgICAgICAgICAgICAgICBlLnN0b3BQcm9wYWdhdGlvbigpO1xuICAgICAgICAgICAgICAgICAgICAkKHRoaXMpLnRvZ2dsZUNsYXNzKCd0ZXh0LWluZm8nKTtcbiAgICAgICAgICAgICAgICAgICAgdmFyICR0aGlzID0gJCh0aGlzKS5wYXJlbnQoKS5wYXJlbnQoKTtcbiAgICAgICAgICAgICAgICAgICAgdmFyIGlkID0gJHRoaXMuYXR0cignZGF0YS1pZCcpO1xuICAgICAgICAgICAgICAgICAgICB2YXIgbWF0Y2ggPSAkKCcuZGF5cyBbZGF0YS1pZCo9XCInKyBpZCArJ1wiXScpO1xuICAgICAgICAgICAgICAgICAgICBpZighJCh0aGlzKS5oYXNDbGFzcygndGV4dC1pbmZvJykpe1xuICAgICAgICAgICAgICAgICAgICAgICAgbWF0Y2guY3NzKFwiYmFja2dyb3VuZC1jb2xvclwiLCBcIiNlZWVcIik7XG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgdmFyIGNvbG9yID0gKGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgdmFyIGxldHRlcnMgPSAnQkNERUYnLnNwbGl0KCcnKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIHZhciBjb2xvciA9ICcjJztcbiAgICAgICAgICAgICAgICAgICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgNjsgaSsrICkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbG9yICs9IGxldHRlcnNbTWF0aC5mbG9vcihNYXRoLnJhbmRvbSgpICogbGV0dGVycy5sZW5ndGgpXTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBjb2xvcjtcbiAgICAgICAgICAgICAgICAgICAgfSkoKTtcbiAgICAgICAgICAgICAgICAgICAgbWF0Y2guY3NzKFwiYmFja2dyb3VuZC1jb2xvclwiLCBjb2xvcik7XG4gICAgICAgICAgICAgICAgfSk7XG5cblxuXG4gICAgICAgICAgICAgICAgLy9Jbml0IG1vZGFsIHdpbmRvdyBcIkFkZCBldmVudFwiXG4gICAgICAgICAgICAgICAgZXZlbnRMaXN0aW5nVGl0bGUub24oXCJjbGlja1wiLCBcIi5nbHlwaGljb24tcGx1c1wiLCBmdW5jdGlvbigpe1xuICAgICAgICAgICAgICAgICAgICBtb2RhbC5maW5kKFwiZm9ybVwiKS5nZXQoMCkucmVzZXQoKTtcbiAgICAgICAgICAgICAgICAgICAgbW9kYWwuZmluZChcIi5tb2RhbC10aXRsZVwiKS50ZXh0KFwiQWRkIGV2ZW50XCIpO1xuXG4gICAgICAgICAgICAgICAgICAgIGlmKCQodGhpcykucGFyZW50KCkuaGFzQ2xhc3MoXCJkYXktdGl0bGVcIikpe1xuICAgICAgICAgICAgICAgICAgICAgICAgZGF0ZXRpbWVwaWNrZXJPcHRpb25zLnZhbHVlID0gKGZ1bmN0aW9uKCl7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdmFyIHRpbWUgPSBcIiBcIiArIG1vbWVudCgpLmZvcm1hdChcIkhIOm1tXCIpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHZhciBlbCA9ICQoY2xuZHIuZWxlbWVudCkuZmluZChcIi5zZWxlY3RlZFwiKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZihlbC5sZW5ndGggPiAwKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gZWwuYXR0cihcImRhdGEtZGF0ZVwiKSArIHRpbWU7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZWxzZVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gJChjbG5kci5lbGVtZW50KS5maW5kKFwidG9kYXlcIikuYXR0cihcImRhdGEtZGF0ZVwiKSArIHRpbWU7XG4gICAgICAgICAgICAgICAgICAgICAgICB9KSgpO1xuICAgICAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICAgICAgZGF0ZXRpbWVQaWNrZXJJbml0KGRhdGV0aW1lcGlja2VyT3B0aW9ucyk7XG4gICAgICAgICAgICAgICAgICAgIG1vZGFsLmZpbmQoXCIuc2F2ZS1jaGFuZ2VzXCIpLm9mZihcImNsaWNrXCIpLm9uKCdjbGljaycsIHNhdmVDaGFuZ2VzLmJpbmQobnVsbCwkKHRoaXMpLmF0dHIoJ2RhdGEtZGF0ZScpKSk7XG4gICAgICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgICAgICAgICB2YXIgY2FsZW5kYXIgPSAkKFwiLmNsbmRyXCIpO1xuICAgICAgICAgICAgICAgIGNhbGVuZGFyLmhlaWdodChjYWxlbmRhci5oZWlnaHQoKSk7XG5cbiAgICAgICAgICAgIH0vLyFkb25lUmVuZGVyaW5nXG4gICAgICAgIH0pO1xuICAgIH07XG5cbn0pKCk7Il0sImZpbGUiOiJzY2hlZHVsZS5qcyIsInNvdXJjZVJvb3QiOiIvc291cmNlLyJ9
