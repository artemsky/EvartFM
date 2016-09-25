(function(){
    "use strict";
    //Set underscore template setting as {{%%}} for better code reading
    _.templateSettings = {
        evaluate    : /\{\{%([\s\S]+?)%\}\}/g,
        interpolate : /\{\{%=([\s\S]+?)%\}\}/g,
        escape      : /\{\{%-([\s\S]+?)%\}\}/g
    };
    //Set moment locale
    switch($('meta[name="lang"]').attr('content')){
        case 'ru':
            moment.locale("ru");
            break;
        default:
            moment.locale("en-gb");
    }


    //Init storage helpers
    var storage = {
        disk: sessionStorage || localStorage,
        target: {
            name: null,
            object: null,
            rendered: null,
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
                playlist: event.playlist,
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
        del: function(id){
            for(var i in this.target.object){
                if(this.target.object[i].id == id)
                    delete this.target.object[i];
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
            var dateFormat = 'YYYY-MM-DD HH:mm';
            this.target.renderd = [];
            range /= 2;

            this.target.object.forEach(function(value){
                var flag = {
                    everyDay: false,
                    everyWeek: false
                };
                if(value.repeat.everyDay){
                    flag.everyDay = true;
                    var dayNow = moment(value.date);
                    for(var i = -range; i < range; i++){
                        value.date = moment(dayNow).add(i, 'days').format(dateFormat);
                        this.target.renderd.push($.extend(true, {}, value));
                    }
                }
                else if(value.repeat.everyWeek){
                    flag.everyWeek = true;
                    var weekRange = Math.floor(range / 7);
                    var weekNow = moment().week();
                    for(var i = -weekRange; i < weekRange; i++){
                        var week = moment(value.date).week(weekNow + i);
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
            storage.set('events', response.events);
            storage.set('playlists', response.playlists);
            var events = storage.get('events').getRendered(60);
            var playlists = storage.get('playlists').result();
            initCalendar(events);
            initPlaylist(playlists);
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
            date : isDayRepeat ? moment(dateTime, "HH:mm").format("YYYY-MM-DD HH:mm") : dateTime,
            playlist: $("#playlist option:selected").val(),
            description: description,
            everyDay: isDayRepeat,
            everyWeek: isWeekRepeat,
            days: daysRepeat
        }).save();
        
        clndr.setEvents(storage.get('events').getRendered(60));
        modal.modal('hide');
    };

    //Init playlist
    var initPlaylist = function (playlist){
        var list = $("#playlist");
        playlist.forEach(function(val){
            list.append("<option value='"+val.id+"'>"+val.name+"</option>");
        });
        list.selectpicker('refresh');
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

                        //TranslateX item hover menu
                        $(".event-item-hover").each(function(i, obj){
                            $(obj).css("transform", "translateX(" + $(obj).width() + "px)");
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

                    $(".event-item-hover").each(function(i, obj){
                        $(obj).css("transform", "translateX(" + $(obj).width() + "px)");
                    });

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
                        modal.find(".delete-event").off("click").on('click', function(){
                            $.get("schedule/events/delete/" + $this.attr('data-id')).done(function(){
                                clndr.setEvents(storage.get("events").del(parseInt($this.attr('data-id'))).getRendered(60));
                                modal.modal("hide");
                            });
                        });
                        modal.find(".delete-event").show();
                        $("#playlist").selectpicker("val", $this.attr("data-playlist") || 0);
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
                    modal.find(".delete-event").hide();
                    modal.find(".save-changes").off("click").on('click', saveChanges.bind(null,$(this).attr('data-date')));
                });

                // var calendar = $(".clndr");
                calendar.height(calendar.height());


                //Ajax post request

            }//!doneRendering
        });
    };

})();
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiIiwic291cmNlcyI6WyJkYXNoYm9hcmQvc2NoZWR1bGUuanMiXSwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uKCl7XG4gICAgXCJ1c2Ugc3RyaWN0XCI7XG4gICAgLy9TZXQgdW5kZXJzY29yZSB0ZW1wbGF0ZSBzZXR0aW5nIGFzIHt7JSV9fSBmb3IgYmV0dGVyIGNvZGUgcmVhZGluZ1xuICAgIF8udGVtcGxhdGVTZXR0aW5ncyA9IHtcbiAgICAgICAgZXZhbHVhdGUgICAgOiAvXFx7XFx7JShbXFxzXFxTXSs/KSVcXH1cXH0vZyxcbiAgICAgICAgaW50ZXJwb2xhdGUgOiAvXFx7XFx7JT0oW1xcc1xcU10rPyklXFx9XFx9L2csXG4gICAgICAgIGVzY2FwZSAgICAgIDogL1xce1xceyUtKFtcXHNcXFNdKz8pJVxcfVxcfS9nXG4gICAgfTtcbiAgICAvL1NldCBtb21lbnQgbG9jYWxlXG4gICAgc3dpdGNoKCQoJ21ldGFbbmFtZT1cImxhbmdcIl0nKS5hdHRyKCdjb250ZW50Jykpe1xuICAgICAgICBjYXNlICdydSc6XG4gICAgICAgICAgICBtb21lbnQubG9jYWxlKFwicnVcIik7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgZGVmYXVsdDpcbiAgICAgICAgICAgIG1vbWVudC5sb2NhbGUoXCJlbi1nYlwiKTtcbiAgICB9XG5cblxuICAgIC8vSW5pdCBzdG9yYWdlIGhlbHBlcnNcbiAgICB2YXIgc3RvcmFnZSA9IHtcbiAgICAgICAgZGlzazogc2Vzc2lvblN0b3JhZ2UgfHwgbG9jYWxTdG9yYWdlLFxuICAgICAgICB0YXJnZXQ6IHtcbiAgICAgICAgICAgIG5hbWU6IG51bGwsXG4gICAgICAgICAgICBvYmplY3Q6IG51bGwsXG4gICAgICAgICAgICByZW5kZXJlZDogbnVsbCxcbiAgICAgICAgICAgIHJlcGVhdDogbnVsbFxuICAgICAgICB9LFxuICAgICAgICAnZ2V0JzogZnVuY3Rpb24oa2V5KXtcbiAgICAgICAgICAgIHRoaXMudGFyZ2V0LnJlcGVhdCA9IGZhbHNlO1xuICAgICAgICAgICAgaWYoIXRoaXMuZGlzay5nZXRJdGVtKGtleSkpXG4gICAgICAgICAgICAgIHJldHVybiBudWxsO1xuICAgICAgICAgICAgdGhpcy50YXJnZXQub2JqZWN0ID0gSlNPTi5wYXJzZSh0aGlzLmRpc2suZ2V0SXRlbShrZXkpKTtcbiAgICAgICAgICAgIHRoaXMudGFyZ2V0Lm5hbWUgPSBrZXk7XG4gICAgICAgICAgICByZXR1cm4gdGhpcztcbiAgICAgICAgfSxcbiAgICAgICAgJ3NldCc6IGZ1bmN0aW9uKGtleSwgdmFsdWUpe1xuICAgICAgICAgICAgdGhpcy50YXJnZXQucmVwZWF0ID0gZmFsc2U7XG4gICAgICAgICAgICB0aGlzLmRpc2suc2V0SXRlbShrZXksIEpTT04uc3RyaW5naWZ5KHZhbHVlKSk7XG4gICAgICAgICAgICB0aGlzLnRhcmdldC5uYW1lID0ga2V5O1xuICAgICAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgICAgIH0sXG4gICAgICAgIGFkZDogZnVuY3Rpb24oZXZlbnQpe1xuICAgICAgICAgICAgdmFyIGlkZW50aXR5ID0gZXZlbnQuaWQgPiAwID8gZXZlbnQuaWQgOiBEYXRlLm5vdygpO1xuICAgICAgICAgICAgdmFyIHJlc3VsdCA9IHtcbiAgICAgICAgICAgICAgICBpZDogaWRlbnRpdHksXG4gICAgICAgICAgICAgICAgdGl0bGU6IGV2ZW50LnRpdGxlLFxuICAgICAgICAgICAgICAgIGRlc2NyaXB0aW9uOiBldmVudC5kZXNjcmlwdGlvbixcbiAgICAgICAgICAgICAgICBkYXRlOiBldmVudC5kYXRlLFxuICAgICAgICAgICAgICAgIHBsYXlsaXN0OiBldmVudC5wbGF5bGlzdCxcbiAgICAgICAgICAgICAgICByZXBlYXQ6IHtcbiAgICAgICAgICAgICAgICAgICAgZXZlbnRfaWQ6IGlkZW50aXR5LFxuICAgICAgICAgICAgICAgICAgICBldmVyeURheTogZXZlbnQuZXZlcnlEYXkgPyAxIDogMCxcbiAgICAgICAgICAgICAgICAgICAgZXZlcnlXZWVrOiBldmVudC5ldmVyeVdlZWsgPyAxIDogMCxcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9O1xuICAgICAgICAgICAgaWYoZXZlbnQuZGF5cyl7XG4gICAgICAgICAgICAgICAgdmFyIGRheUtleXMgPSBPYmplY3Qua2V5cyhldmVudC5kYXlzKTtcbiAgICAgICAgICAgICAgICBmb3IodmFyIGkgPSBkYXlLZXlzLmxlbmd0aDsgaS0tOyl7XG4gICAgICAgICAgICAgICAgICAgIHZhciBrZXkgPSBkYXlLZXlzW2ldO1xuICAgICAgICAgICAgICAgICAgICByZXN1bHQucmVwZWF0W2tleV0gPSBldmVudC5kYXlzW2tleV07XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgdmFyIGlzRXhpc3RzID0gZmFsc2U7XG4gICAgICAgICAgICB0aGlzLnRhcmdldC5vYmplY3QuZm9yRWFjaChmdW5jdGlvbih2YWx1ZSwgaSwgYXJyKXtcbiAgICAgICAgICAgICAgICBpZih2YWx1ZS5pZCA9PSByZXN1bHQuaWQpe1xuICAgICAgICAgICAgICAgICAgICBpc0V4aXN0cyA9IHRydWU7XG4gICAgICAgICAgICAgICAgICAgIGFycltpXSA9IHJlc3VsdDtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIGlmKCFpc0V4aXN0cyl7XG4gICAgICAgICAgICAgICAgdGhpcy50YXJnZXQub2JqZWN0LnB1c2gocmVzdWx0KTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgICAgIH0sXG4gICAgICAgIGRlbDogZnVuY3Rpb24oaWQpe1xuICAgICAgICAgICAgZm9yKHZhciBpIGluIHRoaXMudGFyZ2V0Lm9iamVjdCl7XG4gICAgICAgICAgICAgICAgaWYodGhpcy50YXJnZXQub2JqZWN0W2ldLmlkID09IGlkKVxuICAgICAgICAgICAgICAgICAgICBkZWxldGUgdGhpcy50YXJnZXQub2JqZWN0W2ldO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgICAgIH0sXG4gICAgICAgIHNhdmU6IGZ1bmN0aW9uKCl7XG4gICAgICAgICAgICB0aGlzLnNldCgnZXZlbnRzJywgdGhpcy50YXJnZXQub2JqZWN0KTtcbiAgICAgICAgICAgIHRoaXMuYWpheFVwZGF0ZSgpO1xuICAgICAgICB9LFxuICAgICAgICB3aGVyZURhdGU6IGZ1bmN0aW9uKGRhdGUpe1xuICAgICAgICAgICAgaWYoIWRhdGUpXG4gICAgICAgICAgICAgICAgcmV0dXJuIG51bGw7XG4gICAgICAgICAgICBmb3IodmFyIGkgaW4gdGhpcy50YXJnZXQub2JqZWN0KVxuICAgICAgICAgICAgICAgIGlmKHRoaXMudGFyZ2V0Lm9iamVjdFtpXS5kYXRlLnN1YnN0cmluZygwLDEwKSA9PSBkYXRlKXtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy50YXJnZXQub2JqZWN0ID0gW3RoaXMudGFyZ2V0Lm9iamVjdFtpXV07XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiB0aGlzO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHRoaXMudGFyZ2V0Lm9iamVjdCA9IFtdO1xuICAgICAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgICAgIH0sXG4gICAgICAgIHdoZXJlSWQ6IGZ1bmN0aW9uKGlkKXtcbiAgICAgICAgICAgIGlmKCFpZClcbiAgICAgICAgICAgICAgICByZXR1cm4gbnVsbDtcbiAgICAgICAgICAgIGZvcih2YXIgaSBpbiB0aGlzLnRhcmdldC5vYmplY3QpXG4gICAgICAgICAgICAgICAgaWYodGhpcy50YXJnZXQub2JqZWN0W2ldLmlkID09IGlkKXtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy50YXJnZXQub2JqZWN0ID0gW3RoaXMudGFyZ2V0Lm9iamVjdFtpXV07XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiB0aGlzO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHRoaXMudGFyZ2V0Lm9iamVjdCA9IFtdO1xuICAgICAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgICAgIH0sXG4gICAgICAgIHJlcGVhdDogZnVuY3Rpb24oKXtcbiAgICAgICAgICAgIHRoaXMudGFyZ2V0LnJlcGVhdCA9IHRydWU7XG4gICAgICAgICAgICByZXR1cm4gdGhpcztcbiAgICAgICAgfSxcbiAgICAgICAgZ2V0UmVuZGVyZWQ6IGZ1bmN0aW9uKHJhbmdlKXtcbiAgICAgICAgICAgIHZhciBkYXRlRm9ybWF0ID0gJ1lZWVktTU0tREQgSEg6bW0nO1xuICAgICAgICAgICAgdGhpcy50YXJnZXQucmVuZGVyZCA9IFtdO1xuICAgICAgICAgICAgcmFuZ2UgLz0gMjtcblxuICAgICAgICAgICAgdGhpcy50YXJnZXQub2JqZWN0LmZvckVhY2goZnVuY3Rpb24odmFsdWUpe1xuICAgICAgICAgICAgICAgIHZhciBmbGFnID0ge1xuICAgICAgICAgICAgICAgICAgICBldmVyeURheTogZmFsc2UsXG4gICAgICAgICAgICAgICAgICAgIGV2ZXJ5V2VlazogZmFsc2VcbiAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgICAgIGlmKHZhbHVlLnJlcGVhdC5ldmVyeURheSl7XG4gICAgICAgICAgICAgICAgICAgIGZsYWcuZXZlcnlEYXkgPSB0cnVlO1xuICAgICAgICAgICAgICAgICAgICB2YXIgZGF5Tm93ID0gbW9tZW50KHZhbHVlLmRhdGUpO1xuICAgICAgICAgICAgICAgICAgICBmb3IodmFyIGkgPSAtcmFuZ2U7IGkgPCByYW5nZTsgaSsrKXtcbiAgICAgICAgICAgICAgICAgICAgICAgIHZhbHVlLmRhdGUgPSBtb21lbnQoZGF5Tm93KS5hZGQoaSwgJ2RheXMnKS5mb3JtYXQoZGF0ZUZvcm1hdCk7XG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLnRhcmdldC5yZW5kZXJkLnB1c2goJC5leHRlbmQodHJ1ZSwge30sIHZhbHVlKSk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgZWxzZSBpZih2YWx1ZS5yZXBlYXQuZXZlcnlXZWVrKXtcbiAgICAgICAgICAgICAgICAgICAgZmxhZy5ldmVyeVdlZWsgPSB0cnVlO1xuICAgICAgICAgICAgICAgICAgICB2YXIgd2Vla1JhbmdlID0gTWF0aC5mbG9vcihyYW5nZSAvIDcpO1xuICAgICAgICAgICAgICAgICAgICB2YXIgd2Vla05vdyA9IG1vbWVudCgpLndlZWsoKTtcbiAgICAgICAgICAgICAgICAgICAgZm9yKHZhciBpID0gLXdlZWtSYW5nZTsgaSA8IHdlZWtSYW5nZTsgaSsrKXtcbiAgICAgICAgICAgICAgICAgICAgICAgIHZhciB3ZWVrID0gbW9tZW50KHZhbHVlLmRhdGUpLndlZWsod2Vla05vdyArIGkpO1xuICAgICAgICAgICAgICAgICAgICAgICAgZm9yKHZhciBkYXkgaW4gdmFsdWUucmVwZWF0KVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHN3aXRjaChkYXkpe1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjYXNlIFwibW9uXCI6XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNhc2UgXCJ0dWVcIjpcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY2FzZSBcIndlZFwiOlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjYXNlIFwidGh1XCI6XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNhc2UgXCJmcmlcIjpcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY2FzZSBcInNhdFwiOlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjYXNlIFwic3VuXCI6XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZih2YWx1ZS5yZXBlYXRbZGF5XSl7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdmFsdWUuZGF0ZSA9IHdlZWsuZGF5KGRheSkuZm9ybWF0KGRhdGVGb3JtYXQpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMudGFyZ2V0LnJlbmRlcmQucHVzaCgkLmV4dGVuZCh0cnVlLCB7fSwgdmFsdWUpKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBpZighZmxhZy5ldmVyeURheSAmJiAhZmxhZy5ldmVyeVdlZWspe1xuICAgICAgICAgICAgICAgICAgICB0aGlzLnRhcmdldC5yZW5kZXJkLnB1c2goJC5leHRlbmQodHJ1ZSwge30sIHZhbHVlKSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgIH0uYmluZCh0aGlzKSk7XG4gICAgICAgICAgICByZXR1cm4gdGhpcy50YXJnZXQucmVuZGVyZDtcbiAgICAgICAgfSxcbiAgICAgICAgcmVzdWx0OiBmdW5jdGlvbigpe1xuICAgICAgICAgICAgaWYoIXRoaXMudGFyZ2V0LnJlcGVhdClcbiAgICAgICAgICAgICAgICByZXR1cm4gdGhpcy50YXJnZXQub2JqZWN0O1xuICAgICAgICAgICAgdmFyIHJlc3VsdCA9IFtdO1xuICAgICAgICAgICAgZm9yKHZhciBpIGluIHRoaXMudGFyZ2V0Lm9iamVjdCl7XG4gICAgICAgICAgICAgICAgdmFyIHJlcGVhdEtleXMgPSBPYmplY3Qua2V5cyh0aGlzLnRhcmdldC5vYmplY3RbaV0ucmVwZWF0KSxcbiAgICAgICAgICAgICAgICAgICAgZGF5cyA9IHt9LFxuICAgICAgICAgICAgICAgICAgICByZXBlYXQgPSB7fSxcbiAgICAgICAgICAgICAgICAgICAga2V5ID0gJyc7XG4gICAgICAgICAgICAgICAgZm9yKHZhciByID0gcmVwZWF0S2V5cy5sZW5ndGg7IHItLTspe1xuICAgICAgICAgICAgICAgICAgICBrZXkgPSByZXBlYXRLZXlzW3JdO1xuICAgICAgICAgICAgICAgICAgICBzd2l0Y2goa2V5KXtcbiAgICAgICAgICAgICAgICAgICAgICAgIGNhc2UgXCJtb25cIjpcbiAgICAgICAgICAgICAgICAgICAgICAgIGNhc2UgXCJ0dWVcIjpcbiAgICAgICAgICAgICAgICAgICAgICAgIGNhc2UgXCJ3ZWRcIjpcbiAgICAgICAgICAgICAgICAgICAgICAgIGNhc2UgXCJ0aHVcIjpcbiAgICAgICAgICAgICAgICAgICAgICAgIGNhc2UgXCJmcmlcIjpcbiAgICAgICAgICAgICAgICAgICAgICAgIGNhc2UgXCJzYXRcIjpcbiAgICAgICAgICAgICAgICAgICAgICAgIGNhc2UgXCJzdW5cIjpcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBkYXlzW2tleV0gPSB0aGlzLnRhcmdldC5vYmplY3RbaV0ucmVwZWF0W2tleV07XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgICAgICAgICBkZWZhdWx0OlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJlcGVhdFtrZXldID0gdGhpcy50YXJnZXQub2JqZWN0W2ldLnJlcGVhdFtrZXldO1xuICAgICAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgcmVwZWF0LmRheXMgPSBkYXlzO1xuICAgICAgICAgICAgICAgIHJlc3VsdC5wdXNoKHJlcGVhdCk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXR1cm4gcmVzdWx0O1xuICAgICAgICB9LFxuICAgICAgICBhamF4VXBkYXRlOiBmdW5jdGlvbigpe1xuICAgICAgICAgICAgdmFyIGFqYXhPcHRpb25zID0ge1xuICAgICAgICAgICAgICAgIHR5cGU6IFwiUE9TVFwiLFxuICAgICAgICAgICAgICAgIGNhY2hlOiBmYWxzZSxcbiAgICAgICAgICAgICAgICBoZWFkZXJzOiB7XG4gICAgICAgICAgICAgICAgICAgICdYLUNTUkYtVE9LRU4nOiAkKCdtZXRhW25hbWU9XCJjc3JmLXRva2VuXCJdJykuYXR0cignY29udGVudCcpXG4gICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICBzdWNjZXNzOiBmdW5jdGlvbihyZXNwb25zZSl7XG4gICAgICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKCdzdWNjZXNzJywgcmVzcG9uc2UpO1xuICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgZXJyb3I6IGZ1bmN0aW9uKHJlc3BvbnNlKXtcbiAgICAgICAgICAgICAgICAgICAgY29uc29sZS5sb2coJ2Vycm9yJywgcmVzcG9uc2UpO1xuXG4gICAgICAgICAgICAgICAgICAgICQoXCJib2R5XCIpLmh0bWwocmVzcG9uc2UucmVzcG9uc2VUZXh0KVxuICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgZGF0YToge1xuICAgICAgICAgICAgICAgICAgICBldmVudHM6IHRoaXMuZ2V0KCdldmVudHMnKS50YXJnZXQub2JqZWN0XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfTtcblxuICAgICAgICAgICAgJC5hamF4KCdzY2hlZHVsZS9ldmVudHMvdXBkYXRlJywgYWpheE9wdGlvbnMpO1xuXG4gICAgICAgIH1cbiAgICB9O1xuXG4gICAgLy9ldmVudHNcbiAgICB2YXIgb25FdmVudHNTdWNjZXNzID0gZnVuY3Rpb24ocmVzcG9uc2Upe1xuICAgICAgICAgICAgJChcIiNmb3VudGFpblRleHRHXCIpLmhpZGUoKTtcbiAgICAgICAgICAgIHN0b3JhZ2Uuc2V0KCdldmVudHMnLCByZXNwb25zZS5ldmVudHMpO1xuICAgICAgICAgICAgc3RvcmFnZS5zZXQoJ3BsYXlsaXN0cycsIHJlc3BvbnNlLnBsYXlsaXN0cyk7XG4gICAgICAgICAgICB2YXIgZXZlbnRzID0gc3RvcmFnZS5nZXQoJ2V2ZW50cycpLmdldFJlbmRlcmVkKDYwKTtcbiAgICAgICAgICAgIHZhciBwbGF5bGlzdHMgPSBzdG9yYWdlLmdldCgncGxheWxpc3RzJykucmVzdWx0KCk7XG4gICAgICAgICAgICBpbml0Q2FsZW5kYXIoZXZlbnRzKTtcbiAgICAgICAgICAgIGluaXRQbGF5bGlzdChwbGF5bGlzdHMpO1xuICAgICAgICB9LFxuICAgICAgICBvbkV2ZW50c0Vycm9yID0gZnVuY3Rpb24gKHJlc3BvbnNlKXtcbiAgICAgICAgICAgICQoXCIjZm91bnRhaW5UZXh0R1wiKS5oaWRlKCk7XG4gICAgICAgICAgICBjb25zb2xlLmxvZyhyZXNwb25zZSk7XG4gICAgICAgIH07XG4gICAgdmFyIHJlcXVlc3RPcHRpb25zID0ge1xuICAgICAgICB0eXBlOiBcIkdFVFwiLFxuICAgICAgICBjYWNoZTogZmFsc2UsXG4gICAgICAgIHN1Y2Nlc3M6IG9uRXZlbnRzU3VjY2VzcyxcbiAgICAgICAgZXJyb3I6IG9uRXZlbnRzRXJyb3JcbiAgICB9O1xuICAgICQuYWpheCgnc2NoZWR1bGUvZXZlbnRzJywgcmVxdWVzdE9wdGlvbnMpO1xuICAgIC8vIWV2ZW50c1xuXG4gICAgLy9pbml0IHZhcmlhYmxlc1xuICAgIHZhciBjbG5kciA9IHt9O1xuICAgIHZhciBkYXlFdmVudHNUZW1wbGF0ZSA9ICQoJyNkYXktZXZlbnRzJykuaHRtbCgpO1xuXG4gICAgdmFyIG1vZGFsID0gJChcIiNtb2RhbFwiKTtcbiAgICB2YXIgZGF0ZXRpbWVQaWNrZXJJbml0ID0gZnVuY3Rpb24ob3B0aW9ucywgaWQpe1xuICAgICAgICAvL0RhdGUgaW5pdFxuICAgICAgICB2YXIgZHRQaWNrZXIgPSAkKCcjZGF0ZXRpbWVwaWNrZXInKSxcbiAgICAgICAgICAgIGNoZWNrT3B0aW9ucyA9IHtcbiAgICAgICAgICAgICAgICBjaGVja2JveENsYXNzOiAnaWNoZWNrYm94X3NxdWFyZS1ibHVlJyxcbiAgICAgICAgICAgICAgICByYWRpb0NsYXNzOiAnaXJhZGlvX3NxdWFyZS1ibHVlJyxcbiAgICAgICAgICAgICAgICBpbmNyZWFzZUFyZWE6ICcyMCUnLFxuICAgICAgICAgICAgfTtcbiAgICAgICAgJCgnI3JlcGVhdC1kYXknKS5pQ2hlY2soJ3VuY2hlY2snKVxuICAgICAgICAgICAgLmlDaGVjayhjaGVja09wdGlvbnMpLm9uKFwiaWZVbmNoZWNrZWRcIiwgZnVuY3Rpb24oKXtcbiAgICAgICAgICAgICAgICBkdFBpY2tlclxuICAgICAgICAgICAgICAgICAgICAuZGF0ZXRpbWVwaWNrZXIoJ2Rlc3Ryb3knKVxuICAgICAgICAgICAgICAgICAgICAuZGF0ZXRpbWVwaWNrZXIoKTtcbiAgICAgICAgICAgICAgICAkKFwiI3JlcGVhdC1tb250aFwiKS5pQ2hlY2soJ2VuYWJsZScpO1xuICAgICAgICAgICAgICAgIHJlcGVhdE9uLmlDaGVjaygnZW5hYmxlJyk7XG4gICAgICAgICAgICB9KS5vbihcImlmQ2hlY2tlZFwiLCBmdW5jdGlvbigpe1xuICAgICAgICAgICAgICAgIGR0UGlja2VyXG4gICAgICAgICAgICAgICAgICAgIC5kYXRldGltZXBpY2tlcignZGVzdHJveScpXG4gICAgICAgICAgICAgICAgICAgIC5kYXRldGltZXBpY2tlcih7XG4gICAgICAgICAgICAgICAgICAgICAgICBkYXRlcGlja2VyOmZhbHNlLFxuICAgICAgICAgICAgICAgICAgICAgICAgZm9ybWF0OidIOmknXG4gICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgICQoXCIjcmVwZWF0LW1vbnRoXCIpLmlDaGVjaygnZGlzYWJsZScpO1xuICAgICAgICAgICAgICAgIHJlcGVhdE9uLmlDaGVjaygnZGlzYWJsZScpO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgIGR0UGlja2VyXG4gICAgICAgICAgICAuZGF0ZXRpbWVwaWNrZXIoJ2Rlc3Ryb3knKVxuICAgICAgICAgICAgLmRhdGV0aW1lcGlja2VyKG9wdGlvbnMpO1xuXG4gICAgICAgIC8vUmVwZWF0IGluaXRcbiAgICAgICAgdmFyIHJlcGVhdE9uID0gJChcIiNyZXBlYXQtb25cIik7XG4gICAgICAgIHJlcGVhdE9uLmhpZGUoKTtcbiAgICAgICAgJCgnI3JlcGVhdC1tb250aCcpLmlDaGVjaygndW5jaGVjaycpXG4gICAgICAgICAgICAuaUNoZWNrKGNoZWNrT3B0aW9ucylcbiAgICAgICAgICAgIC5vbihcImlmVW5jaGVja2VkXCIsIGZ1bmN0aW9uKCl7XG4gICAgICAgICAgICAgICAgcmVwZWF0T24uaGlkZSgpO1xuICAgICAgICAgICAgfSlcbiAgICAgICAgICAgIC5vbihcImlmQ2hlY2tlZFwiLCBmdW5jdGlvbigpe1xuICAgICAgICAgICAgICAgICQoXCJbaWQqPSdyZXBlYXQtb24tJ11cIilcbiAgICAgICAgICAgICAgICAgICAgLmlDaGVjayhjaGVja09wdGlvbnMpO1xuICAgICAgICAgICAgICAgIHJlcGVhdE9uLnNob3coKTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAvL1NldCBjaGVja2VkIGRheXNcbiAgICAgICAgaWYoaWQpe1xuICAgICAgICAgICAgKGZ1bmN0aW9uKCl7XG4gICAgICAgICAgICAgICAgdmFyIHJlcGVhdHMgPSBzdG9yYWdlLmdldCgnZXZlbnRzJykud2hlcmVJZChpZCkucmVwZWF0KCkucmVzdWx0KClbMF07XG4gICAgICAgICAgICAgICAgaWYocmVwZWF0cy5ldmVyeVdlZWspe1xuICAgICAgICAgICAgICAgICAgICAkKCcjcmVwZWF0LW1vbnRoJykuaUNoZWNrKCdjaGVjaycpO1xuICAgICAgICAgICAgICAgICAgICBmb3IodmFyIGkgaW4gcmVwZWF0cy5kYXlzKXtcbiAgICAgICAgICAgICAgICAgICAgICAgICQoXCIjcmVwZWF0LW9uLVwiICsgaSkuaUNoZWNrKHJlcGVhdHMuZGF5c1tpXSA/ICdjaGVjayc6ICd1bmNoZWNrJylcbiAgICAgICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGlmKHJlcGVhdHMuZXZlcnlEYXkpe1xuICAgICAgICAgICAgICAgICAgICAkKCcjcmVwZWF0LWRheScpLmlDaGVjaygnY2hlY2snKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9KSgpO1xuICAgICAgICB9XG4gICAgICAgIC8vIWNoZWNrZWQgZGF5c1xuICAgICAgICBtb2RhbC5tb2RhbCgnc2hvdycpO1xuICAgIH07XG4gICAgLy9vbiBTYXZpbmcgY2hhbmdlc1xuICAgIHZhciBzYXZlQ2hhbmdlcyA9IGZ1bmN0aW9uKGlkKXtcbiAgICAgICAgdmFyIHRpdGxlID0gJC50cmltKCQoXCIjVGl0bGVcIikudmFsKCkpLFxuICAgICAgICAgICAgZGVzY3JpcHRpb24gPSAkLnRyaW0oJChcIiNEZXNjcmlwdGlvblwiKS52YWwoKSksXG4gICAgICAgICAgICBpc0RheVJlcGVhdCA9ICQoXCIjcmVwZWF0LWRheVwiKS5wcm9wKFwiY2hlY2tlZFwiKSxcbiAgICAgICAgICAgIGRhdGVUaW1lID0gJChcIiNkYXRldGltZXBpY2tlclwiKS52YWwoKTtcblxuICAgICAgICBpZighdGl0bGUpe1xuICAgICAgICAgICAgJChcIiNUaXRsZVwiKS50b29sdGlwKHtcbiAgICAgICAgICAgICAgICB0cmlnZ2VyOidtYW51YWwnXG4gICAgICAgICAgICB9KS50b29sdGlwKCdzaG93Jyk7XG4gICAgICAgICAgICBzZXRUaW1lb3V0KGZ1bmN0aW9uKCl7XG4gICAgICAgICAgICAgICAgJChcIiNUaXRsZVwiKS50b29sdGlwKCdkZXN0cm95Jyk7XG4gICAgICAgICAgICB9LCAyMDAwKTtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuICAgICAgICBpZighaXNEYXlSZXBlYXQpe1xuICAgICAgICAgICAgdmFyIGlzV2Vla1JlcGVhdCA9ICAkKFwiI3JlcGVhdC1tb250aFwiKS5wcm9wKFwiY2hlY2tlZFwiKTtcbiAgICAgICAgICAgIGlmKGlzV2Vla1JlcGVhdCl7XG4gICAgICAgICAgICAgICAgdmFyIGRheXNSZXBlYXQgPSB7fTtcbiAgICAgICAgICAgICAgICAkKFwiW2lkKj0ncmVwZWF0LW9uLSddXCIpLmVhY2goZnVuY3Rpb24gKGksIG9iaikge1xuICAgICAgICAgICAgICAgICAgICBkYXlzUmVwZWF0WyQob2JqKS5hdHRyKCdpZCcpLnN1YnN0cmluZygxMCldID0gJChvYmopLnByb3AoXCJjaGVja2VkXCIpID8gMSA6IDA7XG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICBzdG9yYWdlLmdldCgnZXZlbnRzJykuYWRkKHtcbiAgICAgICAgICAgIGlkOiBpZCB8fCAtMSxcbiAgICAgICAgICAgIHRpdGxlOiB0aXRsZSxcbiAgICAgICAgICAgIGRhdGUgOiBpc0RheVJlcGVhdCA/IG1vbWVudChkYXRlVGltZSwgXCJISDptbVwiKS5mb3JtYXQoXCJZWVlZLU1NLUREIEhIOm1tXCIpIDogZGF0ZVRpbWUsXG4gICAgICAgICAgICBwbGF5bGlzdDogJChcIiNwbGF5bGlzdCBvcHRpb246c2VsZWN0ZWRcIikudmFsKCksXG4gICAgICAgICAgICBkZXNjcmlwdGlvbjogZGVzY3JpcHRpb24sXG4gICAgICAgICAgICBldmVyeURheTogaXNEYXlSZXBlYXQsXG4gICAgICAgICAgICBldmVyeVdlZWs6IGlzV2Vla1JlcGVhdCxcbiAgICAgICAgICAgIGRheXM6IGRheXNSZXBlYXRcbiAgICAgICAgfSkuc2F2ZSgpO1xuICAgICAgICBcbiAgICAgICAgY2xuZHIuc2V0RXZlbnRzKHN0b3JhZ2UuZ2V0KCdldmVudHMnKS5nZXRSZW5kZXJlZCg2MCkpO1xuICAgICAgICBtb2RhbC5tb2RhbCgnaGlkZScpO1xuICAgIH07XG5cbiAgICAvL0luaXQgcGxheWxpc3RcbiAgICB2YXIgaW5pdFBsYXlsaXN0ID0gZnVuY3Rpb24gKHBsYXlsaXN0KXtcbiAgICAgICAgdmFyIGxpc3QgPSAkKFwiI3BsYXlsaXN0XCIpO1xuICAgICAgICBwbGF5bGlzdC5mb3JFYWNoKGZ1bmN0aW9uKHZhbCl7XG4gICAgICAgICAgICBsaXN0LmFwcGVuZChcIjxvcHRpb24gdmFsdWU9J1wiK3ZhbC5pZCtcIic+XCIrdmFsLm5hbWUrXCI8L29wdGlvbj5cIik7XG4gICAgICAgIH0pO1xuICAgICAgICBsaXN0LnNlbGVjdHBpY2tlcigncmVmcmVzaCcpO1xuICAgIH07XG4gICAgLy9Jbml0IGNhbGVuZGFyXG4gICAgdmFyIGluaXRDYWxlbmRhciA9IGZ1bmN0aW9uKGV2ZW50cyl7XG4gICAgICAgIGNsbmRyID0gJCgnI2Z1bGwtY2xuZHInKS5jbG5kcih7XG4gICAgICAgICAgICB0ZW1wbGF0ZTogJCgnI2Z1bGwtY2xuZHItdGVtcGxhdGUnKS5odG1sKCksXG4gICAgICAgICAgICBldmVudHM6IGV2ZW50cyxcbiAgICAgICAgICAgIGNsaWNrRXZlbnRzOiB7XG4gICAgICAgICAgICAgICAgY2xpY2s6IGZ1bmN0aW9uICh0YXJnZXQpIHtcbiAgICAgICAgICAgICAgICAgICAgdmFyIHRlbXBsYXRlID0gXy50ZW1wbGF0ZShkYXlFdmVudHNUZW1wbGF0ZSk7XG4gICAgICAgICAgICAgICAgICAgICQoXCIuZGF5LWV2ZW50c1wiKVxuICAgICAgICAgICAgICAgICAgICAgICAgLm1DdXN0b21TY3JvbGxiYXIoXCJkZXN0cm95XCIpXG4gICAgICAgICAgICAgICAgICAgICAgICAuaHRtbCh0ZW1wbGF0ZSh7ZXZlbnRzVGhpc0RheTogdGFyZ2V0LmV2ZW50c30pKVxuICAgICAgICAgICAgICAgICAgICAgICAgLmhlaWdodCggJChcIi5jbG5kci1ncmlkIC5kYXlzXCIpLmhlaWdodCgpIC0gJChcIi5jbG5kci1ncmlkIC5kYXlzLW9mLXRoZS13ZWVrXCIpLmhlaWdodCgpIClcbiAgICAgICAgICAgICAgICAgICAgICAgIC5tQ3VzdG9tU2Nyb2xsYmFyKHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBzY3JvbGxCdXR0b25zOntlbmFibGU6dHJ1ZX0sXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdGhlbWU6XCJtaW5pbWFsLWRhcmtcIlxuICAgICAgICAgICAgICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgICAgICAgICAgICAgICAgIC8vVHJhbnNsYXRlWCBpdGVtIGhvdmVyIG1lbnVcbiAgICAgICAgICAgICAgICAgICAgICAgICQoXCIuZXZlbnQtaXRlbS1ob3ZlclwiKS5lYWNoKGZ1bmN0aW9uKGksIG9iail7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgJChvYmopLmNzcyhcInRyYW5zZm9ybVwiLCBcInRyYW5zbGF0ZVgoXCIgKyAkKG9iaikud2lkdGgoKSArIFwicHgpXCIpO1xuICAgICAgICAgICAgICAgICAgICAgICAgfSk7XG5cblxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICBmb3JjZVNpeFJvd3M6IHRydWUsXG4gICAgICAgICAgICBtdWx0aURheUV2ZW50czoge1xuICAgICAgICAgICAgICAgIHNpbmdsZURheTogJ2RhdGUnLFxuICAgICAgICAgICAgICAgIGVuZERhdGU6ICdlbmREYXRlJyxcbiAgICAgICAgICAgICAgICBzdGFydERhdGU6ICdzdGFydERhdGUnXG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgc2hvd0FkamFjZW50TW9udGhzOiB0cnVlLFxuICAgICAgICAgICAgYWRqYWNlbnREYXlzQ2hhbmdlTW9udGg6IGZhbHNlLFxuICAgICAgICAgICAgdHJhY2tTZWxlY3RlZERhdGU6IHRydWUsXG4gICAgICAgICAgICBkYXlzT2ZUaGVXZWVrOiAoZnVuY3Rpb24oKXtcbiAgICAgICAgICAgICAgICB2YXIgcmVzdWx0ID0gW107XG4gICAgICAgICAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCA3OyBpKyspIHtcbiAgICAgICAgICAgICAgICAgICAgcmVzdWx0LnB1c2gobW9tZW50KCkud2Vla2RheShpKS5mb3JtYXQoJ2RkZCcpKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgcmV0dXJuIHJlc3VsdDtcbiAgICAgICAgICAgIH0pKCksXG4gICAgICAgICAgICBkb25lUmVuZGVyaW5nOiBmdW5jdGlvbigpeyAvL2RvbmVSZW5kZXJpbmdcbiAgICAgICAgICAgICAgICAkKFwiLmV2ZW50LWl0ZW1zXCIpXG4gICAgICAgICAgICAgICAgICAgIC5oZWlnaHQoICQoXCIuY2xuZHItZ3JpZCAuZGF5c1wiKS5oZWlnaHQoKSAtICQoXCIuY2xuZHItZ3JpZCAuZGF5cy1vZi10aGUtd2Vla1wiKS5oZWlnaHQoKSApXG4gICAgICAgICAgICAgICAgICAgIC5tQ3VzdG9tU2Nyb2xsYmFyKHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHNjcm9sbEJ1dHRvbnM6e2VuYWJsZTp0cnVlfSxcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoZW1lOlwibWluaW1hbC1kYXJrXCJcbiAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgdmFyIGNhbGVuZGFyID0gJChcIiNmdWxsLWNsbmRyXCIpO1xuICAgICAgICAgICAgICAgIGlmKGNhbGVuZGFyLmZpbmQoXCIudG9kYXlcIikubGVuZ3RoID4gMClcbiAgICAgICAgICAgICAgICAgICAgY2FsZW5kYXIuZmluZChcIi50b2RheVwiKS5jbGljaygpO1xuICAgICAgICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgICAgICAgICAgY2FsZW5kYXIuZmluZChcIi5kYXlcIikuZXEoMCkuY2xpY2soKTtcblxuICAgICAgICAgICAgICAgIHZhciBldmVudExpc3RpbmdUaXRsZSA9ICQoXCIuZXZlbnQtbGlzdGluZy10aXRsZVwiKTtcbiAgICAgICAgICAgICAgICAvL0luaXQgYmxvY2sgT3Blbi9DbG9zZSBldmVudFxuICAgICAgICAgICAgICAgIGV2ZW50TGlzdGluZ1RpdGxlLm9uKFwiY2xpY2tcIiwgXCIuZ2x5cGhpY29uLWNoZXZyb24tdXAsIC5nbHlwaGljb24tY2hldnJvbi1kb3duXCIsIGZ1bmN0aW9uKCl7XG4gICAgICAgICAgICAgICAgICAgIHZhciBlbCA9IHt9O1xuICAgICAgICAgICAgICAgICAgICB2YXIgYmxvY2sgPSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBvcGVuOiBcImdseXBoaWNvbi1jaGV2cm9uLXVwXCIsXG4gICAgICAgICAgICAgICAgICAgICAgICBjbG9zZTogXCJnbHlwaGljb24tY2hldnJvbi1kb3duXCJcbiAgICAgICAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgICAgICAgICAgdmFyICR0aGlzID0gJCh0aGlzKTtcbiAgICAgICAgICAgICAgICAgICAgaWYoJHRoaXMucGFyZW50KCkuaGFzQ2xhc3MoXCJtb250aC10aXRsZVwiKSlcbiAgICAgICAgICAgICAgICAgICAgICAgIGVsID0gJChcIi5kYXktdGl0bGUgW2NsYXNzICo9Z2x5cGhpY29uLWNoZXZyb25dXCIpLmVxKDApO1xuICAgICAgICAgICAgICAgICAgICBlbHNlXG4gICAgICAgICAgICAgICAgICAgICAgICBlbCA9ICQoXCIubW9udGgtdGl0bGUgW2NsYXNzICo9Z2x5cGhpY29uLWNoZXZyb25dXCIpLmVxKDApO1xuXG4gICAgICAgICAgICAgICAgICAgIGlmKGVsLmhhc0NsYXNzKGJsb2NrLm9wZW4pKVxuICAgICAgICAgICAgICAgICAgICAgICAgZWwucmVtb3ZlQ2xhc3MoYmxvY2sub3BlbikuYWRkQ2xhc3MoYmxvY2suY2xvc2UpO1xuICAgICAgICAgICAgICAgICAgICBlbHNlXG4gICAgICAgICAgICAgICAgICAgICAgICBlbC5yZW1vdmVDbGFzcyhibG9jay5jbG9zZSkuYWRkQ2xhc3MoYmxvY2sub3Blbik7XG5cbiAgICAgICAgICAgICAgICAgICAgaWYoJHRoaXMuaGFzQ2xhc3MoYmxvY2sub3BlbikpXG4gICAgICAgICAgICAgICAgICAgICAgICAkdGhpcy5yZW1vdmVDbGFzcyhibG9jay5vcGVuKS5hZGRDbGFzcyhibG9jay5jbG9zZSk7XG4gICAgICAgICAgICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgICAgICAgICAgICAgICR0aGlzLnJlbW92ZUNsYXNzKGJsb2NrLmNsb3NlKS5hZGRDbGFzcyhibG9jay5vcGVuKTtcblxuICAgICAgICAgICAgICAgICAgICAkKFwiLmV2ZW50LWl0ZW1zLCAuZGF5LWV2ZW50c1wiKS5zbGlkZVRvZ2dsZSgpO1xuXG4gICAgICAgICAgICAgICAgICAgICQoXCIuZXZlbnQtaXRlbS1ob3ZlclwiKS5lYWNoKGZ1bmN0aW9uKGksIG9iail7XG4gICAgICAgICAgICAgICAgICAgICAgICAkKG9iaikuY3NzKFwidHJhbnNmb3JtXCIsIFwidHJhbnNsYXRlWChcIiArICQob2JqKS53aWR0aCgpICsgXCJweClcIik7XG4gICAgICAgICAgICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgICAgICAgfSk7XG5cblxuICAgICAgICAgICAgICAgIHZhciBkYXRldGltZXBpY2tlck9wdGlvbnMgPSB7XG4gICAgICAgICAgICAgICAgICAgIHN0ZXA6IDMwXG4gICAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgICAgICB2YXIgaXNUaXBPcGVuID0gZmFsc2U7XG4gICAgICAgICAgICAgICAgJChcIi5ldmVudC1saXN0aW5nXCIpLm9uKCdjbGljaycsICcuZXZlbnQtaXRlbScsIGZ1bmN0aW9uKGUpe1xuICAgICAgICAgICAgICAgICAgICBlLnN0b3BQcm9wYWdhdGlvbigpO1xuICAgICAgICAgICAgICAgICAgICB2YXIgaG92ZXIgPSAkKHRoaXMpLmZpbmQoXCIuZXZlbnQtaXRlbS1ob3ZlclwiKTtcbiAgICAgICAgICAgICAgICAgICAgaWYoaXNUaXBPcGVuKVxuICAgICAgICAgICAgICAgICAgICAgICAgaG92ZXIuY3NzKCd0cmFuc2Zvcm0nLCAndHJhbnNsYXRlWCgnKyBob3Zlci53aWR0aCgpICsncHgpJyk7XG4gICAgICAgICAgICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgICAgICAgICAgICAgIGhvdmVyLmNzcygndHJhbnNmb3JtJywgJ3RyYW5zbGF0ZVgoMHB4KScpO1xuICAgICAgICAgICAgICAgICAgICBpc1RpcE9wZW4gPSAhaXNUaXBPcGVuO1xuICAgICAgICAgICAgICAgIH0pXG4gICAgICAgICAgICAgICAgLy9Jbml0IG1vZGFsIHdpbmRvdyBcIkVkaXQgZXZlbnRcIlxuICAgICAgICAgICAgICAgICAgICAub24oJ2NsaWNrJywgJy5ldmVudC1pdGVtIHNwYW46Zmlyc3QtY2hpbGQnLCBmdW5jdGlvbihlKXtcbiAgICAgICAgICAgICAgICAgICAgICAgIGUuc3RvcFByb3BhZ2F0aW9uKCk7XG4gICAgICAgICAgICAgICAgICAgICAgICB2YXIgJHRoaXMgPSAkKHRoaXMpLnBhcmVudCgpLnBhcmVudCgpO1xuICAgICAgICAgICAgICAgICAgICAgICAgbW9kYWwuZmluZChcImZvcm1cIikuZ2V0KDApLnJlc2V0KCk7XG4gICAgICAgICAgICAgICAgICAgICAgICBtb2RhbC5maW5kKFwiLm1vZGFsLXRpdGxlXCIpLnRleHQoXCJFZGl0IGV2ZW50XCIpO1xuXG4gICAgICAgICAgICAgICAgICAgICAgICBkYXRldGltZXBpY2tlck9wdGlvbnMudmFsdWUgPSAkdGhpcy5maW5kKFwiLmV2ZW50LWl0ZW0tdGltZVwiKS5hdHRyKFwiZGF0YS1kYXRldGltZVwiKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIG1vZGFsLmZpbmQoXCIjVGl0bGVcIikudmFsKCR0aGlzLmZpbmQoXCIuZXZlbnQtaXRlbS1uYW1lXCIpLnRleHQoKSk7XG4gICAgICAgICAgICAgICAgICAgICAgICBtb2RhbC5maW5kKFwiI0Rlc2NyaXB0aW9uXCIpLnZhbCgkdGhpcy5maW5kKFwiLmV2ZW50LWl0ZW0tbG9jYXRpb25cIikudGV4dCgpKTtcblxuICAgICAgICAgICAgICAgICAgICAgICAgZGF0ZXRpbWVQaWNrZXJJbml0KGRhdGV0aW1lcGlja2VyT3B0aW9ucywgJHRoaXMuYXR0cignZGF0YS1pZCcpKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIG1vZGFsLmZpbmQoXCIuc2F2ZS1jaGFuZ2VzXCIpLm9mZihcImNsaWNrXCIpLm9uKCdjbGljaycsIHNhdmVDaGFuZ2VzLmJpbmQobnVsbCwkdGhpcy5hdHRyKCdkYXRhLWlkJykpKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIG1vZGFsLmZpbmQoXCIuZGVsZXRlLWV2ZW50XCIpLm9mZihcImNsaWNrXCIpLm9uKCdjbGljaycsIGZ1bmN0aW9uKCl7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgJC5nZXQoXCJzY2hlZHVsZS9ldmVudHMvZGVsZXRlL1wiICsgJHRoaXMuYXR0cignZGF0YS1pZCcpKS5kb25lKGZ1bmN0aW9uKCl7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNsbmRyLnNldEV2ZW50cyhzdG9yYWdlLmdldChcImV2ZW50c1wiKS5kZWwocGFyc2VJbnQoJHRoaXMuYXR0cignZGF0YS1pZCcpKSkuZ2V0UmVuZGVyZWQoNjApKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbW9kYWwubW9kYWwoXCJoaWRlXCIpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgICAgICAgICBtb2RhbC5maW5kKFwiLmRlbGV0ZS1ldmVudFwiKS5zaG93KCk7XG4gICAgICAgICAgICAgICAgICAgICAgICAkKFwiI3BsYXlsaXN0XCIpLnNlbGVjdHBpY2tlcihcInZhbFwiLCAkdGhpcy5hdHRyKFwiZGF0YS1wbGF5bGlzdFwiKSB8fCAwKTtcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICAkKFwiLmV2ZW50LWxpc3RpbmdcIikub24oJ2NsaWNrJywgJy5ldmVudC1pdGVtIC5ldmVudC1pdGVtLWhvdmVyIHNwYW46bGFzdC1jaGlsZCcsIGZ1bmN0aW9uKGUpe1xuICAgICAgICAgICAgICAgICAgICBlLnN0b3BQcm9wYWdhdGlvbigpO1xuICAgICAgICAgICAgICAgICAgICAkKHRoaXMpLnRvZ2dsZUNsYXNzKCd0ZXh0LWluZm8nKTtcbiAgICAgICAgICAgICAgICAgICAgdmFyICR0aGlzID0gJCh0aGlzKS5wYXJlbnQoKS5wYXJlbnQoKTtcbiAgICAgICAgICAgICAgICAgICAgdmFyIGlkID0gJHRoaXMuYXR0cignZGF0YS1pZCcpO1xuICAgICAgICAgICAgICAgICAgICB2YXIgbWF0Y2ggPSAkKCcuZGF5cyBbZGF0YS1pZCo9XCInKyBpZCArJ1wiXScpO1xuICAgICAgICAgICAgICAgICAgICBpZighJCh0aGlzKS5oYXNDbGFzcygndGV4dC1pbmZvJykpe1xuICAgICAgICAgICAgICAgICAgICAgICAgbWF0Y2guY3NzKFwiYmFja2dyb3VuZC1jb2xvclwiLCBcIiNlZWVcIik7XG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgdmFyIGNvbG9yID0gKGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgdmFyIGxldHRlcnMgPSAnQkNERUYnLnNwbGl0KCcnKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIHZhciBjb2xvciA9ICcjJztcbiAgICAgICAgICAgICAgICAgICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgNjsgaSsrICkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbG9yICs9IGxldHRlcnNbTWF0aC5mbG9vcihNYXRoLnJhbmRvbSgpICogbGV0dGVycy5sZW5ndGgpXTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBjb2xvcjtcbiAgICAgICAgICAgICAgICAgICAgfSkoKTtcbiAgICAgICAgICAgICAgICAgICAgbWF0Y2guY3NzKFwiYmFja2dyb3VuZC1jb2xvclwiLCBjb2xvcik7XG4gICAgICAgICAgICAgICAgfSk7XG5cblxuXG4gICAgICAgICAgICAgICAgLy9Jbml0IG1vZGFsIHdpbmRvdyBcIkFkZCBldmVudFwiXG4gICAgICAgICAgICAgICAgZXZlbnRMaXN0aW5nVGl0bGUub24oXCJjbGlja1wiLCBcIi5nbHlwaGljb24tcGx1c1wiLCBmdW5jdGlvbigpe1xuICAgICAgICAgICAgICAgICAgICBtb2RhbC5maW5kKFwiZm9ybVwiKS5nZXQoMCkucmVzZXQoKTtcbiAgICAgICAgICAgICAgICAgICAgbW9kYWwuZmluZChcIi5tb2RhbC10aXRsZVwiKS50ZXh0KFwiQWRkIGV2ZW50XCIpO1xuXG4gICAgICAgICAgICAgICAgICAgIGlmKCQodGhpcykucGFyZW50KCkuaGFzQ2xhc3MoXCJkYXktdGl0bGVcIikpe1xuICAgICAgICAgICAgICAgICAgICAgICAgZGF0ZXRpbWVwaWNrZXJPcHRpb25zLnZhbHVlID0gKGZ1bmN0aW9uKCl7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdmFyIHRpbWUgPSBcIiBcIiArIG1vbWVudCgpLmZvcm1hdChcIkhIOm1tXCIpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHZhciBlbCA9ICQoY2xuZHIuZWxlbWVudCkuZmluZChcIi5zZWxlY3RlZFwiKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZihlbC5sZW5ndGggPiAwKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gZWwuYXR0cihcImRhdGEtZGF0ZVwiKSArIHRpbWU7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZWxzZVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gJChjbG5kci5lbGVtZW50KS5maW5kKFwidG9kYXlcIikuYXR0cihcImRhdGEtZGF0ZVwiKSArIHRpbWU7XG4gICAgICAgICAgICAgICAgICAgICAgICB9KSgpO1xuICAgICAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICAgICAgZGF0ZXRpbWVQaWNrZXJJbml0KGRhdGV0aW1lcGlja2VyT3B0aW9ucyk7XG4gICAgICAgICAgICAgICAgICAgIG1vZGFsLmZpbmQoXCIuZGVsZXRlLWV2ZW50XCIpLmhpZGUoKTtcbiAgICAgICAgICAgICAgICAgICAgbW9kYWwuZmluZChcIi5zYXZlLWNoYW5nZXNcIikub2ZmKFwiY2xpY2tcIikub24oJ2NsaWNrJywgc2F2ZUNoYW5nZXMuYmluZChudWxsLCQodGhpcykuYXR0cignZGF0YS1kYXRlJykpKTtcbiAgICAgICAgICAgICAgICB9KTtcblxuICAgICAgICAgICAgICAgIC8vIHZhciBjYWxlbmRhciA9ICQoXCIuY2xuZHJcIik7XG4gICAgICAgICAgICAgICAgY2FsZW5kYXIuaGVpZ2h0KGNhbGVuZGFyLmhlaWdodCgpKTtcblxuXG4gICAgICAgICAgICAgICAgLy9BamF4IHBvc3QgcmVxdWVzdFxuXG4gICAgICAgICAgICB9Ly8hZG9uZVJlbmRlcmluZ1xuICAgICAgICB9KTtcbiAgICB9O1xuXG59KSgpOyJdLCJmaWxlIjoiZGFzaGJvYXJkL3NjaGVkdWxlLmpzIiwic291cmNlUm9vdCI6Ii9zb3VyY2UvIn0=
