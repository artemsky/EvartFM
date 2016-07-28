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
            this.ajaxUpdate();
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
        },
        ajaxUpdate: function(){
            var ajaxOptions = {
                type: "POST",
                cache: false,
                headers: {
                    'X-CSRF-TOKEN': $('meta[name="csrf-token"]').attr('content')
                },
                success: function(response){
                    console.log('success', response);
                },
                error: function(response){
                    console.log('error', response);

                    $("body").html(response.responseText)
                },
                data: {
                    events: this.get('events').target.object
                }
            };

            $.ajax('schedule/events/update', ajaxOptions);

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
                        hover.css('transform', 'translateX('+ hover.width() +'px)');
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


                //Ajax post request

            }//!doneRendering
        });
    };

})();
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiIiwic291cmNlcyI6WyJzY2hlZHVsZS5qcyJdLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24oKXtcbiAgICBcInVzZSBzdHJpY3RcIjtcbiAgICAvL1NldCB1bmRlcnNjb3JlIHRlbXBsYXRlIHNldHRpbmcgYXMge3slJX19IGZvciBiZXR0ZXIgY29kZSByZWFkaW5nXG4gICAgXy50ZW1wbGF0ZVNldHRpbmdzID0ge1xuICAgICAgICBldmFsdWF0ZSAgICA6IC9cXHtcXHslKFtcXHNcXFNdKz8pJVxcfVxcfS9nLFxuICAgICAgICBpbnRlcnBvbGF0ZSA6IC9cXHtcXHslPShbXFxzXFxTXSs/KSVcXH1cXH0vZyxcbiAgICAgICAgZXNjYXBlICAgICAgOiAvXFx7XFx7JS0oW1xcc1xcU10rPyklXFx9XFx9L2dcbiAgICB9O1xuICAgIC8vU2V0IG1vbWVudCBsb2NhbGVcbiAgICBtb21lbnQubG9jYWxlKFwiZW4tZ2JcIik7XG5cbiAgICAvL0luaXQgc3RvcmFnZSBoZWxwZXJzXG4gICAgdmFyIHN0b3JhZ2UgPSB7XG4gICAgICAgIGRpc2s6IHNlc3Npb25TdG9yYWdlIHx8IGxvY2FsU3RvcmFnZSxcbiAgICAgICAgdGFyZ2V0OiB7XG4gICAgICAgICAgICBuYW1lOiBudWxsLFxuICAgICAgICAgICAgb2JqZWN0OiBudWxsLFxuICAgICAgICAgICAgcmVuZGVyZDogbnVsbCxcbiAgICAgICAgICAgIHJlcGVhdDogbnVsbFxuICAgICAgICB9LFxuICAgICAgICAnZ2V0JzogZnVuY3Rpb24oa2V5KXtcbiAgICAgICAgICAgIHRoaXMudGFyZ2V0LnJlcGVhdCA9IGZhbHNlO1xuICAgICAgICAgICAgaWYoIXRoaXMuZGlzay5nZXRJdGVtKGtleSkpXG4gICAgICAgICAgICAgIHJldHVybiBudWxsO1xuICAgICAgICAgICAgdGhpcy50YXJnZXQub2JqZWN0ID0gSlNPTi5wYXJzZSh0aGlzLmRpc2suZ2V0SXRlbShrZXkpKTtcbiAgICAgICAgICAgIHRoaXMudGFyZ2V0Lm5hbWUgPSBrZXk7XG4gICAgICAgICAgICByZXR1cm4gdGhpcztcbiAgICAgICAgfSxcbiAgICAgICAgJ3NldCc6IGZ1bmN0aW9uKGtleSwgdmFsdWUpe1xuICAgICAgICAgICAgdGhpcy50YXJnZXQucmVwZWF0ID0gZmFsc2U7XG4gICAgICAgICAgICB0aGlzLmRpc2suc2V0SXRlbShrZXksIEpTT04uc3RyaW5naWZ5KHZhbHVlKSk7XG4gICAgICAgICAgICB0aGlzLnRhcmdldC5uYW1lID0ga2V5O1xuICAgICAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgICAgIH0sXG4gICAgICAgIGFkZDogZnVuY3Rpb24oZXZlbnQpe1xuICAgICAgICAgICAgdmFyIGlkZW50aXR5ID0gZXZlbnQuaWQgPiAwID8gZXZlbnQuaWQgOiBEYXRlLm5vdygpO1xuICAgICAgICAgICAgdmFyIHJlc3VsdCA9IHtcbiAgICAgICAgICAgICAgICBpZDogaWRlbnRpdHksXG4gICAgICAgICAgICAgICAgdGl0bGU6IGV2ZW50LnRpdGxlLFxuICAgICAgICAgICAgICAgIGRlc2NyaXB0aW9uOiBldmVudC5kZXNjcmlwdGlvbixcbiAgICAgICAgICAgICAgICBkYXRlOiBldmVudC5kYXRlLFxuICAgICAgICAgICAgICAgIHJlcGVhdDoge1xuICAgICAgICAgICAgICAgICAgICBldmVudF9pZDogaWRlbnRpdHksXG4gICAgICAgICAgICAgICAgICAgIGV2ZXJ5RGF5OiBldmVudC5ldmVyeURheSA/IDEgOiAwLFxuICAgICAgICAgICAgICAgICAgICBldmVyeVdlZWs6IGV2ZW50LmV2ZXJ5V2VlayA/IDEgOiAwLFxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH07XG4gICAgICAgICAgICBpZihldmVudC5kYXlzKXtcbiAgICAgICAgICAgICAgICB2YXIgZGF5S2V5cyA9IE9iamVjdC5rZXlzKGV2ZW50LmRheXMpO1xuICAgICAgICAgICAgICAgIGZvcih2YXIgaSA9IGRheUtleXMubGVuZ3RoOyBpLS07KXtcbiAgICAgICAgICAgICAgICAgICAgdmFyIGtleSA9IGRheUtleXNbaV07XG4gICAgICAgICAgICAgICAgICAgIHJlc3VsdC5yZXBlYXRba2V5XSA9IGV2ZW50LmRheXNba2V5XTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICB2YXIgaXNFeGlzdHMgPSBmYWxzZTtcbiAgICAgICAgICAgIHRoaXMudGFyZ2V0Lm9iamVjdC5mb3JFYWNoKGZ1bmN0aW9uKHZhbHVlLCBpLCBhcnIpe1xuICAgICAgICAgICAgICAgIGlmKHZhbHVlLmlkID09IHJlc3VsdC5pZCl7XG4gICAgICAgICAgICAgICAgICAgIGlzRXhpc3RzID0gdHJ1ZTtcbiAgICAgICAgICAgICAgICAgICAgYXJyW2ldID0gcmVzdWx0O1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgaWYoIWlzRXhpc3RzKXtcbiAgICAgICAgICAgICAgICB0aGlzLnRhcmdldC5vYmplY3QucHVzaChyZXN1bHQpO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICByZXR1cm4gdGhpcztcbiAgICAgICAgfSxcbiAgICAgICAgc2F2ZTogZnVuY3Rpb24oKXtcbiAgICAgICAgICAgIHRoaXMuc2V0KCdldmVudHMnLCB0aGlzLnRhcmdldC5vYmplY3QpO1xuICAgICAgICAgICAgdGhpcy5hamF4VXBkYXRlKCk7XG4gICAgICAgIH0sXG4gICAgICAgIHdoZXJlRGF0ZTogZnVuY3Rpb24oZGF0ZSl7XG4gICAgICAgICAgICBpZighZGF0ZSlcbiAgICAgICAgICAgICAgICByZXR1cm4gbnVsbDtcbiAgICAgICAgICAgIGZvcih2YXIgaSBpbiB0aGlzLnRhcmdldC5vYmplY3QpXG4gICAgICAgICAgICAgICAgaWYodGhpcy50YXJnZXQub2JqZWN0W2ldLmRhdGUuc3Vic3RyaW5nKDAsMTApID09IGRhdGUpe1xuICAgICAgICAgICAgICAgICAgICB0aGlzLnRhcmdldC5vYmplY3QgPSBbdGhpcy50YXJnZXQub2JqZWN0W2ldXTtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgdGhpcy50YXJnZXQub2JqZWN0ID0gW107XG4gICAgICAgICAgICByZXR1cm4gdGhpcztcbiAgICAgICAgfSxcbiAgICAgICAgd2hlcmVJZDogZnVuY3Rpb24oaWQpe1xuICAgICAgICAgICAgaWYoIWlkKVxuICAgICAgICAgICAgICAgIHJldHVybiBudWxsO1xuICAgICAgICAgICAgZm9yKHZhciBpIGluIHRoaXMudGFyZ2V0Lm9iamVjdClcbiAgICAgICAgICAgICAgICBpZih0aGlzLnRhcmdldC5vYmplY3RbaV0uaWQgPT0gaWQpe1xuICAgICAgICAgICAgICAgICAgICB0aGlzLnRhcmdldC5vYmplY3QgPSBbdGhpcy50YXJnZXQub2JqZWN0W2ldXTtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgdGhpcy50YXJnZXQub2JqZWN0ID0gW107XG4gICAgICAgICAgICByZXR1cm4gdGhpcztcbiAgICAgICAgfSxcbiAgICAgICAgcmVwZWF0OiBmdW5jdGlvbigpe1xuICAgICAgICAgICAgdGhpcy50YXJnZXQucmVwZWF0ID0gdHJ1ZTtcbiAgICAgICAgICAgIHJldHVybiB0aGlzO1xuICAgICAgICB9LFxuICAgICAgICBnZXRSZW5kZXJlZDogZnVuY3Rpb24ocmFuZ2Upe1xuICAgICAgICAgICAgdmFyIGRhdGVGb3JtYXQgPSAnWVlZWS1NTS1ERCBISDpzcyc7XG4gICAgICAgICAgICB0aGlzLnRhcmdldC5yZW5kZXJkID0gW107XG4gICAgICAgICAgICAvLyB2YXIgcmFuZ2UgPSBtb21lbnQoKS5hZGQobW9udGgsICdtb250aCcpLmRpZmYobW9tZW50KCkuYWRkKC1tb250aCwgJ21vbnRoJyksICdkYXlzJyk7XG4gICAgICAgICAgICByYW5nZSAvPSAyO1xuXG4gICAgICAgICAgICB0aGlzLnRhcmdldC5vYmplY3QuZm9yRWFjaChmdW5jdGlvbih2YWx1ZSl7XG4gICAgICAgICAgICAgICAgdmFyIGZsYWcgPSB7XG4gICAgICAgICAgICAgICAgICAgIGV2ZXJ5RGF5OiBmYWxzZSxcbiAgICAgICAgICAgICAgICAgICAgZXZlcnlXZWVrOiBmYWxzZVxuICAgICAgICAgICAgICAgIH07XG4gICAgICAgICAgICAgICAgaWYodmFsdWUucmVwZWF0LmV2ZXJ5RGF5KXtcbiAgICAgICAgICAgICAgICAgICAgZmxhZy5ldmVyeURheSA9IHRydWU7XG4gICAgICAgICAgICAgICAgICAgIGZvcih2YXIgaSA9IC1yYW5nZTsgaSA8IHJhbmdlOyBpKyspe1xuICAgICAgICAgICAgICAgICAgICAgICAgdmFsdWUuZGF0ZSA9IG1vbWVudCgpLmFkZChpLCAnZGF5cycpLmZvcm1hdChkYXRlRm9ybWF0KTtcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMudGFyZ2V0LnJlbmRlcmQucHVzaCgkLmV4dGVuZCh0cnVlLCB7fSwgdmFsdWUpKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBlbHNlIGlmKHZhbHVlLnJlcGVhdC5ldmVyeVdlZWspe1xuICAgICAgICAgICAgICAgICAgICBmbGFnLmV2ZXJ5V2VlayA9IHRydWU7XG4gICAgICAgICAgICAgICAgICAgIHZhciB3ZWVrUmFuZ2UgPSBNYXRoLmZsb29yKHJhbmdlIC8gNyk7XG4gICAgICAgICAgICAgICAgICAgIHZhciB3ZWVrTm93ID0gbW9tZW50KCkud2VlaygpO1xuICAgICAgICAgICAgICAgICAgICBmb3IodmFyIGkgPSAtd2Vla1JhbmdlOyBpIDwgd2Vla1JhbmdlOyBpKyspe1xuICAgICAgICAgICAgICAgICAgICAgICAgdmFyIHdlZWsgPSBtb21lbnQoKS53ZWVrKHdlZWtOb3cgKyBpKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGZvcih2YXIgZGF5IGluIHZhbHVlLnJlcGVhdClcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBzd2l0Y2goZGF5KXtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY2FzZSBcIm1vblwiOlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjYXNlIFwidHVlXCI6XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNhc2UgXCJ3ZWRcIjpcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY2FzZSBcInRodVwiOlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjYXNlIFwiZnJpXCI6XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNhc2UgXCJzYXRcIjpcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY2FzZSBcInN1blwiOlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYodmFsdWUucmVwZWF0W2RheV0pe1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHZhbHVlLmRhdGUgPSB3ZWVrLmRheShkYXkpLmZvcm1hdChkYXRlRm9ybWF0KTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aGlzLnRhcmdldC5yZW5kZXJkLnB1c2goJC5leHRlbmQodHJ1ZSwge30sIHZhbHVlKSk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgaWYoIWZsYWcuZXZlcnlEYXkgJiYgIWZsYWcuZXZlcnlXZWVrKXtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy50YXJnZXQucmVuZGVyZC5wdXNoKCQuZXh0ZW5kKHRydWUsIHt9LCB2YWx1ZSkpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICB9LmJpbmQodGhpcykpO1xuICAgICAgICAgICAgcmV0dXJuIHRoaXMudGFyZ2V0LnJlbmRlcmQ7XG4gICAgICAgIH0sXG4gICAgICAgIHJlc3VsdDogZnVuY3Rpb24oKXtcbiAgICAgICAgICAgIGlmKCF0aGlzLnRhcmdldC5yZXBlYXQpXG4gICAgICAgICAgICAgICAgcmV0dXJuIHRoaXMudGFyZ2V0Lm9iamVjdDtcbiAgICAgICAgICAgIHZhciByZXN1bHQgPSBbXTtcbiAgICAgICAgICAgIGZvcih2YXIgaSBpbiB0aGlzLnRhcmdldC5vYmplY3Qpe1xuICAgICAgICAgICAgICAgIHZhciByZXBlYXRLZXlzID0gT2JqZWN0LmtleXModGhpcy50YXJnZXQub2JqZWN0W2ldLnJlcGVhdCksXG4gICAgICAgICAgICAgICAgICAgIGRheXMgPSB7fSxcbiAgICAgICAgICAgICAgICAgICAgcmVwZWF0ID0ge30sXG4gICAgICAgICAgICAgICAgICAgIGtleSA9ICcnO1xuICAgICAgICAgICAgICAgIGZvcih2YXIgciA9IHJlcGVhdEtleXMubGVuZ3RoOyByLS07KXtcbiAgICAgICAgICAgICAgICAgICAga2V5ID0gcmVwZWF0S2V5c1tyXTtcbiAgICAgICAgICAgICAgICAgICAgc3dpdGNoKGtleSl7XG4gICAgICAgICAgICAgICAgICAgICAgICBjYXNlIFwibW9uXCI6XG4gICAgICAgICAgICAgICAgICAgICAgICBjYXNlIFwidHVlXCI6XG4gICAgICAgICAgICAgICAgICAgICAgICBjYXNlIFwid2VkXCI6XG4gICAgICAgICAgICAgICAgICAgICAgICBjYXNlIFwidGh1XCI6XG4gICAgICAgICAgICAgICAgICAgICAgICBjYXNlIFwiZnJpXCI6XG4gICAgICAgICAgICAgICAgICAgICAgICBjYXNlIFwic2F0XCI6XG4gICAgICAgICAgICAgICAgICAgICAgICBjYXNlIFwic3VuXCI6XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZGF5c1trZXldID0gdGhpcy50YXJnZXQub2JqZWN0W2ldLnJlcGVhdFtrZXldO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgICAgICAgICAgZGVmYXVsdDpcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXBlYXRba2V5XSA9IHRoaXMudGFyZ2V0Lm9iamVjdFtpXS5yZXBlYXRba2V5XTtcbiAgICAgICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIHJlcGVhdC5kYXlzID0gZGF5cztcbiAgICAgICAgICAgICAgICByZXN1bHQucHVzaChyZXBlYXQpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmV0dXJuIHJlc3VsdDtcbiAgICAgICAgfSxcbiAgICAgICAgYWpheFVwZGF0ZTogZnVuY3Rpb24oKXtcbiAgICAgICAgICAgIHZhciBhamF4T3B0aW9ucyA9IHtcbiAgICAgICAgICAgICAgICB0eXBlOiBcIlBPU1RcIixcbiAgICAgICAgICAgICAgICBjYWNoZTogZmFsc2UsXG4gICAgICAgICAgICAgICAgaGVhZGVyczoge1xuICAgICAgICAgICAgICAgICAgICAnWC1DU1JGLVRPS0VOJzogJCgnbWV0YVtuYW1lPVwiY3NyZi10b2tlblwiXScpLmF0dHIoJ2NvbnRlbnQnKVxuICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgc3VjY2VzczogZnVuY3Rpb24ocmVzcG9uc2Upe1xuICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmxvZygnc3VjY2VzcycsIHJlc3BvbnNlKTtcbiAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgIGVycm9yOiBmdW5jdGlvbihyZXNwb25zZSl7XG4gICAgICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKCdlcnJvcicsIHJlc3BvbnNlKTtcblxuICAgICAgICAgICAgICAgICAgICAkKFwiYm9keVwiKS5odG1sKHJlc3BvbnNlLnJlc3BvbnNlVGV4dClcbiAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgIGRhdGE6IHtcbiAgICAgICAgICAgICAgICAgICAgZXZlbnRzOiB0aGlzLmdldCgnZXZlbnRzJykudGFyZ2V0Lm9iamVjdFxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH07XG5cbiAgICAgICAgICAgICQuYWpheCgnc2NoZWR1bGUvZXZlbnRzL3VwZGF0ZScsIGFqYXhPcHRpb25zKTtcblxuICAgICAgICB9XG4gICAgfTtcblxuICAgIC8vZXZlbnRzXG4gICAgdmFyIG9uRXZlbnRzU3VjY2VzcyA9IGZ1bmN0aW9uKHJlc3BvbnNlKXtcbiAgICAgICAgICAgICQoXCIjZm91bnRhaW5UZXh0R1wiKS5oaWRlKCk7XG4gICAgICAgICAgICBzdG9yYWdlLnNldCgnZXZlbnRzJywgcmVzcG9uc2UpO1xuICAgICAgICAgICAgdmFyIGV2ZW50cyA9IHN0b3JhZ2UuZ2V0KCdldmVudHMnKS5nZXRSZW5kZXJlZCg2MCk7XG4gICAgICAgICAgICBpbml0Q2FsZW5kYXIoZXZlbnRzKTtcbiAgICAgICAgfSxcbiAgICAgICAgb25FdmVudHNFcnJvciA9IGZ1bmN0aW9uIChyZXNwb25zZSl7XG4gICAgICAgICAgICAkKFwiI2ZvdW50YWluVGV4dEdcIikuaGlkZSgpO1xuICAgICAgICAgICAgY29uc29sZS5sb2cocmVzcG9uc2UpO1xuICAgICAgICB9O1xuICAgIHZhciByZXF1ZXN0T3B0aW9ucyA9IHtcbiAgICAgICAgdHlwZTogXCJHRVRcIixcbiAgICAgICAgY2FjaGU6IGZhbHNlLFxuICAgICAgICBzdWNjZXNzOiBvbkV2ZW50c1N1Y2Nlc3MsXG4gICAgICAgIGVycm9yOiBvbkV2ZW50c0Vycm9yXG4gICAgfTtcbiAgICAkLmFqYXgoJ3NjaGVkdWxlL2V2ZW50cycsIHJlcXVlc3RPcHRpb25zKTtcbiAgICAvLyFldmVudHNcblxuICAgIC8vaW5pdCB2YXJpYWJsZXNcbiAgICB2YXIgY2xuZHIgPSB7fTtcbiAgICB2YXIgZGF5RXZlbnRzVGVtcGxhdGUgPSAkKCcjZGF5LWV2ZW50cycpLmh0bWwoKTtcblxuICAgIHZhciBtb2RhbCA9ICQoXCIjbW9kYWxcIik7XG4gICAgdmFyIGRhdGV0aW1lUGlja2VySW5pdCA9IGZ1bmN0aW9uKG9wdGlvbnMsIGlkKXtcbiAgICAgICAgLy9EYXRlIGluaXRcbiAgICAgICAgdmFyIGR0UGlja2VyID0gJCgnI2RhdGV0aW1lcGlja2VyJyksXG4gICAgICAgICAgICBjaGVja09wdGlvbnMgPSB7XG4gICAgICAgICAgICAgICAgY2hlY2tib3hDbGFzczogJ2ljaGVja2JveF9zcXVhcmUtYmx1ZScsXG4gICAgICAgICAgICAgICAgcmFkaW9DbGFzczogJ2lyYWRpb19zcXVhcmUtYmx1ZScsXG4gICAgICAgICAgICAgICAgaW5jcmVhc2VBcmVhOiAnMjAlJyxcbiAgICAgICAgICAgIH07XG4gICAgICAgICQoJyNyZXBlYXQtZGF5JykuaUNoZWNrKCd1bmNoZWNrJylcbiAgICAgICAgICAgIC5pQ2hlY2soY2hlY2tPcHRpb25zKS5vbihcImlmVW5jaGVja2VkXCIsIGZ1bmN0aW9uKCl7XG4gICAgICAgICAgICAgICAgZHRQaWNrZXJcbiAgICAgICAgICAgICAgICAgICAgLmRhdGV0aW1lcGlja2VyKCdkZXN0cm95JylcbiAgICAgICAgICAgICAgICAgICAgLmRhdGV0aW1lcGlja2VyKCk7XG4gICAgICAgICAgICAgICAgJChcIiNyZXBlYXQtbW9udGhcIikuaUNoZWNrKCdlbmFibGUnKTtcbiAgICAgICAgICAgICAgICByZXBlYXRPbi5pQ2hlY2soJ2VuYWJsZScpO1xuICAgICAgICAgICAgfSkub24oXCJpZkNoZWNrZWRcIiwgZnVuY3Rpb24oKXtcbiAgICAgICAgICAgICAgICBkdFBpY2tlclxuICAgICAgICAgICAgICAgICAgICAuZGF0ZXRpbWVwaWNrZXIoJ2Rlc3Ryb3knKVxuICAgICAgICAgICAgICAgICAgICAuZGF0ZXRpbWVwaWNrZXIoe1xuICAgICAgICAgICAgICAgICAgICAgICAgZGF0ZXBpY2tlcjpmYWxzZSxcbiAgICAgICAgICAgICAgICAgICAgICAgIGZvcm1hdDonSDppJ1xuICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICAkKFwiI3JlcGVhdC1tb250aFwiKS5pQ2hlY2soJ2Rpc2FibGUnKTtcbiAgICAgICAgICAgICAgICByZXBlYXRPbi5pQ2hlY2soJ2Rpc2FibGUnKTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICBkdFBpY2tlclxuICAgICAgICAgICAgLmRhdGV0aW1lcGlja2VyKCdkZXN0cm95JylcbiAgICAgICAgICAgIC5kYXRldGltZXBpY2tlcihvcHRpb25zKTtcblxuICAgICAgICAvL1JlcGVhdCBpbml0XG4gICAgICAgIHZhciByZXBlYXRPbiA9ICQoXCIjcmVwZWF0LW9uXCIpO1xuICAgICAgICByZXBlYXRPbi5oaWRlKCk7XG4gICAgICAgICQoJyNyZXBlYXQtbW9udGgnKS5pQ2hlY2soJ3VuY2hlY2snKVxuICAgICAgICAgICAgLmlDaGVjayhjaGVja09wdGlvbnMpXG4gICAgICAgICAgICAub24oXCJpZlVuY2hlY2tlZFwiLCBmdW5jdGlvbigpe1xuICAgICAgICAgICAgICAgIHJlcGVhdE9uLmhpZGUoKTtcbiAgICAgICAgICAgIH0pXG4gICAgICAgICAgICAub24oXCJpZkNoZWNrZWRcIiwgZnVuY3Rpb24oKXtcbiAgICAgICAgICAgICAgICAkKFwiW2lkKj0ncmVwZWF0LW9uLSddXCIpXG4gICAgICAgICAgICAgICAgICAgIC5pQ2hlY2soY2hlY2tPcHRpb25zKTtcbiAgICAgICAgICAgICAgICByZXBlYXRPbi5zaG93KCk7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgLy9TZXQgY2hlY2tlZCBkYXlzXG4gICAgICAgIGlmKGlkKXtcbiAgICAgICAgICAgIChmdW5jdGlvbigpe1xuICAgICAgICAgICAgICAgIHZhciByZXBlYXRzID0gc3RvcmFnZS5nZXQoJ2V2ZW50cycpLndoZXJlSWQoaWQpLnJlcGVhdCgpLnJlc3VsdCgpWzBdO1xuICAgICAgICAgICAgICAgIGlmKHJlcGVhdHMuZXZlcnlXZWVrKXtcbiAgICAgICAgICAgICAgICAgICAgJCgnI3JlcGVhdC1tb250aCcpLmlDaGVjaygnY2hlY2snKTtcbiAgICAgICAgICAgICAgICAgICAgZm9yKHZhciBpIGluIHJlcGVhdHMuZGF5cyl7XG4gICAgICAgICAgICAgICAgICAgICAgICAkKFwiI3JlcGVhdC1vbi1cIiArIGkpLmlDaGVjayhyZXBlYXRzLmRheXNbaV0gPyAnY2hlY2snOiAndW5jaGVjaycpXG4gICAgICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBpZihyZXBlYXRzLmV2ZXJ5RGF5KXtcbiAgICAgICAgICAgICAgICAgICAgJCgnI3JlcGVhdC1kYXknKS5pQ2hlY2soJ2NoZWNrJyk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSkoKTtcbiAgICAgICAgfVxuICAgICAgICAvLyFjaGVja2VkIGRheXNcbiAgICAgICAgbW9kYWwubW9kYWwoJ3Nob3cnKTtcbiAgICB9O1xuICAgIC8vb24gU2F2aW5nIGNoYW5nZXNcbiAgICB2YXIgc2F2ZUNoYW5nZXMgPSBmdW5jdGlvbihpZCl7XG4gICAgICAgIHZhciB0aXRsZSA9ICQudHJpbSgkKFwiI1RpdGxlXCIpLnZhbCgpKSxcbiAgICAgICAgICAgIGRlc2NyaXB0aW9uID0gJC50cmltKCQoXCIjRGVzY3JpcHRpb25cIikudmFsKCkpLFxuICAgICAgICAgICAgaXNEYXlSZXBlYXQgPSAkKFwiI3JlcGVhdC1kYXlcIikucHJvcChcImNoZWNrZWRcIiksXG4gICAgICAgICAgICBkYXRlVGltZSA9ICQoXCIjZGF0ZXRpbWVwaWNrZXJcIikudmFsKCk7XG5cbiAgICAgICAgaWYoIXRpdGxlKXtcbiAgICAgICAgICAgICQoXCIjVGl0bGVcIikudG9vbHRpcCh7XG4gICAgICAgICAgICAgICAgdHJpZ2dlcjonbWFudWFsJ1xuICAgICAgICAgICAgfSkudG9vbHRpcCgnc2hvdycpO1xuICAgICAgICAgICAgc2V0VGltZW91dChmdW5jdGlvbigpe1xuICAgICAgICAgICAgICAgICQoXCIjVGl0bGVcIikudG9vbHRpcCgnZGVzdHJveScpO1xuICAgICAgICAgICAgfSwgMjAwMCk7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cbiAgICAgICAgaWYoIWlzRGF5UmVwZWF0KXtcbiAgICAgICAgICAgIHZhciBpc1dlZWtSZXBlYXQgPSAgJChcIiNyZXBlYXQtbW9udGhcIikucHJvcChcImNoZWNrZWRcIik7XG4gICAgICAgICAgICBpZihpc1dlZWtSZXBlYXQpe1xuICAgICAgICAgICAgICAgIHZhciBkYXlzUmVwZWF0ID0ge307XG4gICAgICAgICAgICAgICAgJChcIltpZCo9J3JlcGVhdC1vbi0nXVwiKS5lYWNoKGZ1bmN0aW9uIChpLCBvYmopIHtcbiAgICAgICAgICAgICAgICAgICAgZGF5c1JlcGVhdFskKG9iaikuYXR0cignaWQnKS5zdWJzdHJpbmcoMTApXSA9ICQob2JqKS5wcm9wKFwiY2hlY2tlZFwiKSA/IDEgOiAwO1xuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIFxuICAgICAgICBzdG9yYWdlLmdldCgnZXZlbnRzJykuYWRkKHtcbiAgICAgICAgICAgIGlkOiBpZCB8fCAtMSxcbiAgICAgICAgICAgIHRpdGxlOiB0aXRsZSxcbiAgICAgICAgICAgIGRhdGUgOiBkYXRlVGltZSxcbiAgICAgICAgICAgIGRlc2NyaXB0aW9uOiBkZXNjcmlwdGlvbixcbiAgICAgICAgICAgIGV2ZXJ5RGF5OiBpc0RheVJlcGVhdCxcbiAgICAgICAgICAgIGV2ZXJ5V2VlazogaXNXZWVrUmVwZWF0LFxuICAgICAgICAgICAgZGF5czogZGF5c1JlcGVhdFxuICAgICAgICB9KS5zYXZlKCk7XG4gICAgICAgIFxuICAgICAgICBjbG5kci5zZXRFdmVudHMoc3RvcmFnZS5nZXQoJ2V2ZW50cycpLmdldFJlbmRlcmVkKDYwKSk7XG4gICAgICAgIG1vZGFsLm1vZGFsKCdoaWRlJyk7XG4gICAgfTtcblxuICAgIC8vSW5pdCBjYWxlbmRhclxuICAgIHZhciBpbml0Q2FsZW5kYXIgPSBmdW5jdGlvbihldmVudHMpe1xuICAgICAgICBjbG5kciA9ICQoJyNmdWxsLWNsbmRyJykuY2xuZHIoe1xuICAgICAgICAgICAgdGVtcGxhdGU6ICQoJyNmdWxsLWNsbmRyLXRlbXBsYXRlJykuaHRtbCgpLFxuICAgICAgICAgICAgZXZlbnRzOiBldmVudHMsXG4gICAgICAgICAgICBjbGlja0V2ZW50czoge1xuICAgICAgICAgICAgICAgIGNsaWNrOiBmdW5jdGlvbiAodGFyZ2V0KSB7XG4gICAgICAgICAgICAgICAgICAgIHZhciB0ZW1wbGF0ZSA9IF8udGVtcGxhdGUoZGF5RXZlbnRzVGVtcGxhdGUpO1xuICAgICAgICAgICAgICAgICAgICAkKFwiLmRheS1ldmVudHNcIilcbiAgICAgICAgICAgICAgICAgICAgICAgIC5tQ3VzdG9tU2Nyb2xsYmFyKFwiZGVzdHJveVwiKVxuICAgICAgICAgICAgICAgICAgICAgICAgLmh0bWwodGVtcGxhdGUoe2V2ZW50c1RoaXNEYXk6IHRhcmdldC5ldmVudHN9KSlcbiAgICAgICAgICAgICAgICAgICAgICAgIC5oZWlnaHQoICQoXCIuY2xuZHItZ3JpZCAuZGF5c1wiKS5oZWlnaHQoKSAtICQoXCIuY2xuZHItZ3JpZCAuZGF5cy1vZi10aGUtd2Vla1wiKS5oZWlnaHQoKSApXG4gICAgICAgICAgICAgICAgICAgICAgICAubUN1c3RvbVNjcm9sbGJhcih7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgc2Nyb2xsQnV0dG9uczp7ZW5hYmxlOnRydWV9LFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRoZW1lOlwibWluaW1hbC1kYXJrXCJcbiAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIGZvcmNlU2l4Um93czogdHJ1ZSxcbiAgICAgICAgICAgIG11bHRpRGF5RXZlbnRzOiB7XG4gICAgICAgICAgICAgICAgc2luZ2xlRGF5OiAnZGF0ZScsXG4gICAgICAgICAgICAgICAgZW5kRGF0ZTogJ2VuZERhdGUnLFxuICAgICAgICAgICAgICAgIHN0YXJ0RGF0ZTogJ3N0YXJ0RGF0ZSdcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICBzaG93QWRqYWNlbnRNb250aHM6IHRydWUsXG4gICAgICAgICAgICBhZGphY2VudERheXNDaGFuZ2VNb250aDogZmFsc2UsXG4gICAgICAgICAgICB0cmFja1NlbGVjdGVkRGF0ZTogdHJ1ZSxcbiAgICAgICAgICAgIGRheXNPZlRoZVdlZWs6IChmdW5jdGlvbigpe1xuICAgICAgICAgICAgICAgIHZhciByZXN1bHQgPSBbXTtcbiAgICAgICAgICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IDc7IGkrKykge1xuICAgICAgICAgICAgICAgICAgICByZXN1bHQucHVzaChtb21lbnQoKS53ZWVrZGF5KGkpLmZvcm1hdCgnZGRkJykpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICByZXR1cm4gcmVzdWx0O1xuICAgICAgICAgICAgfSkoKSxcbiAgICAgICAgICAgIGRvbmVSZW5kZXJpbmc6IGZ1bmN0aW9uKCl7IC8vZG9uZVJlbmRlcmluZ1xuICAgICAgICAgICAgICAgICQoXCIuZXZlbnQtaXRlbXNcIilcbiAgICAgICAgICAgICAgICAgICAgLmhlaWdodCggJChcIi5jbG5kci1ncmlkIC5kYXlzXCIpLmhlaWdodCgpIC0gJChcIi5jbG5kci1ncmlkIC5kYXlzLW9mLXRoZS13ZWVrXCIpLmhlaWdodCgpIClcbiAgICAgICAgICAgICAgICAgICAgLm1DdXN0b21TY3JvbGxiYXIoe1xuICAgICAgICAgICAgICAgICAgICAgICAgc2Nyb2xsQnV0dG9uczp7ZW5hYmxlOnRydWV9LFxuICAgICAgICAgICAgICAgICAgICAgICAgdGhlbWU6XCJtaW5pbWFsLWRhcmtcIlxuICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICB2YXIgY2FsZW5kYXIgPSAkKFwiI2Z1bGwtY2xuZHJcIik7XG4gICAgICAgICAgICAgICAgaWYoY2FsZW5kYXIuZmluZChcIi50b2RheVwiKS5sZW5ndGggPiAwKVxuICAgICAgICAgICAgICAgICAgICBjYWxlbmRhci5maW5kKFwiLnRvZGF5XCIpLmNsaWNrKCk7XG4gICAgICAgICAgICAgICAgZWxzZVxuICAgICAgICAgICAgICAgICAgICBjYWxlbmRhci5maW5kKFwiLmRheVwiKS5lcSgwKS5jbGljaygpO1xuXG4gICAgICAgICAgICAgICAgdmFyIGV2ZW50TGlzdGluZ1RpdGxlID0gJChcIi5ldmVudC1saXN0aW5nLXRpdGxlXCIpO1xuICAgICAgICAgICAgICAgIC8vSW5pdCBibG9jayBPcGVuL0Nsb3NlIGV2ZW50XG4gICAgICAgICAgICAgICAgZXZlbnRMaXN0aW5nVGl0bGUub24oXCJjbGlja1wiLCBcIi5nbHlwaGljb24tY2hldnJvbi11cCwgLmdseXBoaWNvbi1jaGV2cm9uLWRvd25cIiwgZnVuY3Rpb24oKXtcbiAgICAgICAgICAgICAgICAgICAgdmFyIGVsID0ge307XG4gICAgICAgICAgICAgICAgICAgIHZhciBibG9jayA9IHtcbiAgICAgICAgICAgICAgICAgICAgICAgIG9wZW46IFwiZ2x5cGhpY29uLWNoZXZyb24tdXBcIixcbiAgICAgICAgICAgICAgICAgICAgICAgIGNsb3NlOiBcImdseXBoaWNvbi1jaGV2cm9uLWRvd25cIlxuICAgICAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgICAgICAgICB2YXIgJHRoaXMgPSAkKHRoaXMpO1xuICAgICAgICAgICAgICAgICAgICBpZigkdGhpcy5wYXJlbnQoKS5oYXNDbGFzcyhcIm1vbnRoLXRpdGxlXCIpKVxuICAgICAgICAgICAgICAgICAgICAgICAgZWwgPSAkKFwiLmRheS10aXRsZSBbY2xhc3MgKj1nbHlwaGljb24tY2hldnJvbl1cIikuZXEoMCk7XG4gICAgICAgICAgICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgICAgICAgICAgICAgIGVsID0gJChcIi5tb250aC10aXRsZSBbY2xhc3MgKj1nbHlwaGljb24tY2hldnJvbl1cIikuZXEoMCk7XG5cbiAgICAgICAgICAgICAgICAgICAgaWYoZWwuaGFzQ2xhc3MoYmxvY2sub3BlbikpXG4gICAgICAgICAgICAgICAgICAgICAgICBlbC5yZW1vdmVDbGFzcyhibG9jay5vcGVuKS5hZGRDbGFzcyhibG9jay5jbG9zZSk7XG4gICAgICAgICAgICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgICAgICAgICAgICAgIGVsLnJlbW92ZUNsYXNzKGJsb2NrLmNsb3NlKS5hZGRDbGFzcyhibG9jay5vcGVuKTtcblxuICAgICAgICAgICAgICAgICAgICBpZigkdGhpcy5oYXNDbGFzcyhibG9jay5vcGVuKSlcbiAgICAgICAgICAgICAgICAgICAgICAgICR0aGlzLnJlbW92ZUNsYXNzKGJsb2NrLm9wZW4pLmFkZENsYXNzKGJsb2NrLmNsb3NlKTtcbiAgICAgICAgICAgICAgICAgICAgZWxzZVxuICAgICAgICAgICAgICAgICAgICAgICAgJHRoaXMucmVtb3ZlQ2xhc3MoYmxvY2suY2xvc2UpLmFkZENsYXNzKGJsb2NrLm9wZW4pO1xuXG4gICAgICAgICAgICAgICAgICAgICQoXCIuZXZlbnQtaXRlbXMsIC5kYXktZXZlbnRzXCIpLnNsaWRlVG9nZ2xlKCk7XG5cbiAgICAgICAgICAgICAgICB9KTtcblxuXG4gICAgICAgICAgICAgICAgdmFyIGRhdGV0aW1lcGlja2VyT3B0aW9ucyA9IHtcbiAgICAgICAgICAgICAgICAgICAgc3RlcDogMzBcbiAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgICAgIHZhciBpc1RpcE9wZW4gPSBmYWxzZTtcbiAgICAgICAgICAgICAgICAkKFwiLmV2ZW50LWxpc3RpbmdcIikub24oJ2NsaWNrJywgJy5ldmVudC1pdGVtJywgZnVuY3Rpb24oZSl7XG4gICAgICAgICAgICAgICAgICAgIGUuc3RvcFByb3BhZ2F0aW9uKCk7XG4gICAgICAgICAgICAgICAgICAgIHZhciBob3ZlciA9ICQodGhpcykuZmluZChcIi5ldmVudC1pdGVtLWhvdmVyXCIpO1xuICAgICAgICAgICAgICAgICAgICBpZihpc1RpcE9wZW4pXG4gICAgICAgICAgICAgICAgICAgICAgICBob3Zlci5jc3MoJ3RyYW5zZm9ybScsICd0cmFuc2xhdGVYKCcrIGhvdmVyLndpZHRoKCkgKydweCknKTtcbiAgICAgICAgICAgICAgICAgICAgZWxzZVxuICAgICAgICAgICAgICAgICAgICAgICAgaG92ZXIuY3NzKCd0cmFuc2Zvcm0nLCAndHJhbnNsYXRlWCgwcHgpJyk7XG4gICAgICAgICAgICAgICAgICAgIGlzVGlwT3BlbiA9ICFpc1RpcE9wZW47XG4gICAgICAgICAgICAgICAgfSlcbiAgICAgICAgICAgICAgICAvL0luaXQgbW9kYWwgd2luZG93IFwiRWRpdCBldmVudFwiXG4gICAgICAgICAgICAgICAgICAgIC5vbignY2xpY2snLCAnLmV2ZW50LWl0ZW0gc3BhbjpmaXJzdC1jaGlsZCcsIGZ1bmN0aW9uKGUpe1xuICAgICAgICAgICAgICAgICAgICBlLnN0b3BQcm9wYWdhdGlvbigpO1xuICAgICAgICAgICAgICAgICAgICB2YXIgJHRoaXMgPSAkKHRoaXMpLnBhcmVudCgpLnBhcmVudCgpO1xuICAgICAgICAgICAgICAgICAgICBtb2RhbC5maW5kKFwiZm9ybVwiKS5nZXQoMCkucmVzZXQoKTtcbiAgICAgICAgICAgICAgICAgICAgbW9kYWwuZmluZChcIi5tb2RhbC10aXRsZVwiKS50ZXh0KFwiRWRpdCBldmVudFwiKTtcblxuICAgICAgICAgICAgICAgICAgICBkYXRldGltZXBpY2tlck9wdGlvbnMudmFsdWUgPSAkdGhpcy5maW5kKFwiLmV2ZW50LWl0ZW0tdGltZVwiKS5hdHRyKFwiZGF0YS1kYXRldGltZVwiKTtcbiAgICAgICAgICAgICAgICAgICAgbW9kYWwuZmluZChcIiNUaXRsZVwiKS52YWwoJHRoaXMuZmluZChcIi5ldmVudC1pdGVtLW5hbWVcIikudGV4dCgpKTtcbiAgICAgICAgICAgICAgICAgICAgbW9kYWwuZmluZChcIiNEZXNjcmlwdGlvblwiKS52YWwoJHRoaXMuZmluZChcIi5ldmVudC1pdGVtLWxvY2F0aW9uXCIpLnRleHQoKSk7XG5cbiAgICAgICAgICAgICAgICAgICAgZGF0ZXRpbWVQaWNrZXJJbml0KGRhdGV0aW1lcGlja2VyT3B0aW9ucywgJHRoaXMuYXR0cignZGF0YS1pZCcpKTtcbiAgICAgICAgICAgICAgICAgICAgbW9kYWwuZmluZChcIi5zYXZlLWNoYW5nZXNcIikub2ZmKFwiY2xpY2tcIikub24oJ2NsaWNrJywgc2F2ZUNoYW5nZXMuYmluZChudWxsLCR0aGlzLmF0dHIoJ2RhdGEtaWQnKSkpO1xuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgICQoXCIuZXZlbnQtbGlzdGluZ1wiKS5vbignY2xpY2snLCAnLmV2ZW50LWl0ZW0gLmV2ZW50LWl0ZW0taG92ZXIgc3BhbjpsYXN0LWNoaWxkJywgZnVuY3Rpb24oZSl7XG4gICAgICAgICAgICAgICAgICAgIGUuc3RvcFByb3BhZ2F0aW9uKCk7XG4gICAgICAgICAgICAgICAgICAgICQodGhpcykudG9nZ2xlQ2xhc3MoJ3RleHQtaW5mbycpO1xuICAgICAgICAgICAgICAgICAgICB2YXIgJHRoaXMgPSAkKHRoaXMpLnBhcmVudCgpLnBhcmVudCgpO1xuICAgICAgICAgICAgICAgICAgICB2YXIgaWQgPSAkdGhpcy5hdHRyKCdkYXRhLWlkJyk7XG4gICAgICAgICAgICAgICAgICAgIHZhciBtYXRjaCA9ICQoJy5kYXlzIFtkYXRhLWlkKj1cIicrIGlkICsnXCJdJyk7XG4gICAgICAgICAgICAgICAgICAgIGlmKCEkKHRoaXMpLmhhc0NsYXNzKCd0ZXh0LWluZm8nKSl7XG4gICAgICAgICAgICAgICAgICAgICAgICBtYXRjaC5jc3MoXCJiYWNrZ3JvdW5kLWNvbG9yXCIsIFwiI2VlZVwiKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICB2YXIgY29sb3IgPSAoZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICB2YXIgbGV0dGVycyA9ICdCQ0RFRicuc3BsaXQoJycpO1xuICAgICAgICAgICAgICAgICAgICAgICAgdmFyIGNvbG9yID0gJyMnO1xuICAgICAgICAgICAgICAgICAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCA2OyBpKysgKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY29sb3IgKz0gbGV0dGVyc1tNYXRoLmZsb29yKE1hdGgucmFuZG9tKCkgKiBsZXR0ZXJzLmxlbmd0aCldO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGNvbG9yO1xuICAgICAgICAgICAgICAgICAgICB9KSgpO1xuICAgICAgICAgICAgICAgICAgICBtYXRjaC5jc3MoXCJiYWNrZ3JvdW5kLWNvbG9yXCIsIGNvbG9yKTtcbiAgICAgICAgICAgICAgICB9KTtcblxuXG5cbiAgICAgICAgICAgICAgICAvL0luaXQgbW9kYWwgd2luZG93IFwiQWRkIGV2ZW50XCJcbiAgICAgICAgICAgICAgICBldmVudExpc3RpbmdUaXRsZS5vbihcImNsaWNrXCIsIFwiLmdseXBoaWNvbi1wbHVzXCIsIGZ1bmN0aW9uKCl7XG4gICAgICAgICAgICAgICAgICAgIG1vZGFsLmZpbmQoXCJmb3JtXCIpLmdldCgwKS5yZXNldCgpO1xuICAgICAgICAgICAgICAgICAgICBtb2RhbC5maW5kKFwiLm1vZGFsLXRpdGxlXCIpLnRleHQoXCJBZGQgZXZlbnRcIik7XG5cbiAgICAgICAgICAgICAgICAgICAgaWYoJCh0aGlzKS5wYXJlbnQoKS5oYXNDbGFzcyhcImRheS10aXRsZVwiKSl7XG4gICAgICAgICAgICAgICAgICAgICAgICBkYXRldGltZXBpY2tlck9wdGlvbnMudmFsdWUgPSAoZnVuY3Rpb24oKXtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB2YXIgdGltZSA9IFwiIFwiICsgbW9tZW50KCkuZm9ybWF0KFwiSEg6bW1cIik7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdmFyIGVsID0gJChjbG5kci5lbGVtZW50KS5maW5kKFwiLnNlbGVjdGVkXCIpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmKGVsLmxlbmd0aCA+IDApXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBlbC5hdHRyKFwiZGF0YS1kYXRlXCIpICsgdGltZTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBlbHNlXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiAkKGNsbmRyLmVsZW1lbnQpLmZpbmQoXCJ0b2RheVwiKS5hdHRyKFwiZGF0YS1kYXRlXCIpICsgdGltZTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH0pKCk7XG4gICAgICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgICAgICBkYXRldGltZVBpY2tlckluaXQoZGF0ZXRpbWVwaWNrZXJPcHRpb25zKTtcbiAgICAgICAgICAgICAgICAgICAgbW9kYWwuZmluZChcIi5zYXZlLWNoYW5nZXNcIikub2ZmKFwiY2xpY2tcIikub24oJ2NsaWNrJywgc2F2ZUNoYW5nZXMuYmluZChudWxsLCQodGhpcykuYXR0cignZGF0YS1kYXRlJykpKTtcbiAgICAgICAgICAgICAgICB9KTtcblxuICAgICAgICAgICAgICAgIHZhciBjYWxlbmRhciA9ICQoXCIuY2xuZHJcIik7XG4gICAgICAgICAgICAgICAgY2FsZW5kYXIuaGVpZ2h0KGNhbGVuZGFyLmhlaWdodCgpKTtcblxuXG4gICAgICAgICAgICAgICAgLy9BamF4IHBvc3QgcmVxdWVzdFxuXG4gICAgICAgICAgICB9Ly8hZG9uZVJlbmRlcmluZ1xuICAgICAgICB9KTtcbiAgICB9O1xuXG59KSgpOyJdLCJmaWxlIjoic2NoZWR1bGUuanMiLCJzb3VyY2VSb290IjoiL3NvdXJjZS8ifQ==
