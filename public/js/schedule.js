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
                        var subMenu = $(".event-item-hover");
                        subMenu.css("transform", "translateX(" + subMenu.width() + "px)");


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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiIiwic291cmNlcyI6WyJzY2hlZHVsZS5qcyJdLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24oKXtcbiAgICBcInVzZSBzdHJpY3RcIjtcbiAgICAvL1NldCB1bmRlcnNjb3JlIHRlbXBsYXRlIHNldHRpbmcgYXMge3slJX19IGZvciBiZXR0ZXIgY29kZSByZWFkaW5nXG4gICAgXy50ZW1wbGF0ZVNldHRpbmdzID0ge1xuICAgICAgICBldmFsdWF0ZSAgICA6IC9cXHtcXHslKFtcXHNcXFNdKz8pJVxcfVxcfS9nLFxuICAgICAgICBpbnRlcnBvbGF0ZSA6IC9cXHtcXHslPShbXFxzXFxTXSs/KSVcXH1cXH0vZyxcbiAgICAgICAgZXNjYXBlICAgICAgOiAvXFx7XFx7JS0oW1xcc1xcU10rPyklXFx9XFx9L2dcbiAgICB9O1xuICAgIC8vU2V0IG1vbWVudCBsb2NhbGVcbiAgICBtb21lbnQubG9jYWxlKFwiZW4tZ2JcIik7XG5cbiAgICAvL0luaXQgc3RvcmFnZSBoZWxwZXJzXG4gICAgdmFyIHN0b3JhZ2UgPSB7XG4gICAgICAgIGRpc2s6IHNlc3Npb25TdG9yYWdlIHx8IGxvY2FsU3RvcmFnZSxcbiAgICAgICAgdGFyZ2V0OiB7XG4gICAgICAgICAgICBuYW1lOiBudWxsLFxuICAgICAgICAgICAgb2JqZWN0OiBudWxsLFxuICAgICAgICAgICAgcmVuZGVyZWQ6IG51bGwsXG4gICAgICAgICAgICByZXBlYXQ6IG51bGxcbiAgICAgICAgfSxcbiAgICAgICAgJ2dldCc6IGZ1bmN0aW9uKGtleSl7XG4gICAgICAgICAgICB0aGlzLnRhcmdldC5yZXBlYXQgPSBmYWxzZTtcbiAgICAgICAgICAgIGlmKCF0aGlzLmRpc2suZ2V0SXRlbShrZXkpKVxuICAgICAgICAgICAgICByZXR1cm4gbnVsbDtcbiAgICAgICAgICAgIHRoaXMudGFyZ2V0Lm9iamVjdCA9IEpTT04ucGFyc2UodGhpcy5kaXNrLmdldEl0ZW0oa2V5KSk7XG4gICAgICAgICAgICB0aGlzLnRhcmdldC5uYW1lID0ga2V5O1xuICAgICAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgICAgIH0sXG4gICAgICAgICdzZXQnOiBmdW5jdGlvbihrZXksIHZhbHVlKXtcbiAgICAgICAgICAgIHRoaXMudGFyZ2V0LnJlcGVhdCA9IGZhbHNlO1xuICAgICAgICAgICAgdGhpcy5kaXNrLnNldEl0ZW0oa2V5LCBKU09OLnN0cmluZ2lmeSh2YWx1ZSkpO1xuICAgICAgICAgICAgdGhpcy50YXJnZXQubmFtZSA9IGtleTtcbiAgICAgICAgICAgIHJldHVybiB0aGlzO1xuICAgICAgICB9LFxuICAgICAgICBhZGQ6IGZ1bmN0aW9uKGV2ZW50KXtcbiAgICAgICAgICAgIHZhciBpZGVudGl0eSA9IGV2ZW50LmlkID4gMCA/IGV2ZW50LmlkIDogRGF0ZS5ub3coKTtcbiAgICAgICAgICAgIHZhciByZXN1bHQgPSB7XG4gICAgICAgICAgICAgICAgaWQ6IGlkZW50aXR5LFxuICAgICAgICAgICAgICAgIHRpdGxlOiBldmVudC50aXRsZSxcbiAgICAgICAgICAgICAgICBkZXNjcmlwdGlvbjogZXZlbnQuZGVzY3JpcHRpb24sXG4gICAgICAgICAgICAgICAgZGF0ZTogZXZlbnQuZGF0ZSxcbiAgICAgICAgICAgICAgICBwbGF5bGlzdDogZXZlbnQucGxheWxpc3QsXG4gICAgICAgICAgICAgICAgcmVwZWF0OiB7XG4gICAgICAgICAgICAgICAgICAgIGV2ZW50X2lkOiBpZGVudGl0eSxcbiAgICAgICAgICAgICAgICAgICAgZXZlcnlEYXk6IGV2ZW50LmV2ZXJ5RGF5ID8gMSA6IDAsXG4gICAgICAgICAgICAgICAgICAgIGV2ZXJ5V2VlazogZXZlbnQuZXZlcnlXZWVrID8gMSA6IDAsXG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfTtcbiAgICAgICAgICAgIGlmKGV2ZW50LmRheXMpe1xuICAgICAgICAgICAgICAgIHZhciBkYXlLZXlzID0gT2JqZWN0LmtleXMoZXZlbnQuZGF5cyk7XG4gICAgICAgICAgICAgICAgZm9yKHZhciBpID0gZGF5S2V5cy5sZW5ndGg7IGktLTspe1xuICAgICAgICAgICAgICAgICAgICB2YXIga2V5ID0gZGF5S2V5c1tpXTtcbiAgICAgICAgICAgICAgICAgICAgcmVzdWx0LnJlcGVhdFtrZXldID0gZXZlbnQuZGF5c1trZXldO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHZhciBpc0V4aXN0cyA9IGZhbHNlO1xuICAgICAgICAgICAgdGhpcy50YXJnZXQub2JqZWN0LmZvckVhY2goZnVuY3Rpb24odmFsdWUsIGksIGFycil7XG4gICAgICAgICAgICAgICAgaWYodmFsdWUuaWQgPT0gcmVzdWx0LmlkKXtcbiAgICAgICAgICAgICAgICAgICAgaXNFeGlzdHMgPSB0cnVlO1xuICAgICAgICAgICAgICAgICAgICBhcnJbaV0gPSByZXN1bHQ7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICBpZighaXNFeGlzdHMpe1xuICAgICAgICAgICAgICAgIHRoaXMudGFyZ2V0Lm9iamVjdC5wdXNoKHJlc3VsdCk7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIHJldHVybiB0aGlzO1xuICAgICAgICB9LFxuICAgICAgICBkZWw6IGZ1bmN0aW9uKGlkKXtcbiAgICAgICAgICAgIGZvcih2YXIgaSBpbiB0aGlzLnRhcmdldC5vYmplY3Qpe1xuICAgICAgICAgICAgICAgIGlmKHRoaXMudGFyZ2V0Lm9iamVjdFtpXS5pZCA9PSBpZClcbiAgICAgICAgICAgICAgICAgICAgZGVsZXRlIHRoaXMudGFyZ2V0Lm9iamVjdFtpXTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJldHVybiB0aGlzO1xuICAgICAgICB9LFxuICAgICAgICBzYXZlOiBmdW5jdGlvbigpe1xuICAgICAgICAgICAgdGhpcy5zZXQoJ2V2ZW50cycsIHRoaXMudGFyZ2V0Lm9iamVjdCk7XG4gICAgICAgICAgICB0aGlzLmFqYXhVcGRhdGUoKTtcbiAgICAgICAgfSxcbiAgICAgICAgd2hlcmVEYXRlOiBmdW5jdGlvbihkYXRlKXtcbiAgICAgICAgICAgIGlmKCFkYXRlKVxuICAgICAgICAgICAgICAgIHJldHVybiBudWxsO1xuICAgICAgICAgICAgZm9yKHZhciBpIGluIHRoaXMudGFyZ2V0Lm9iamVjdClcbiAgICAgICAgICAgICAgICBpZih0aGlzLnRhcmdldC5vYmplY3RbaV0uZGF0ZS5zdWJzdHJpbmcoMCwxMCkgPT0gZGF0ZSl7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMudGFyZ2V0Lm9iamVjdCA9IFt0aGlzLnRhcmdldC5vYmplY3RbaV1dO1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gdGhpcztcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB0aGlzLnRhcmdldC5vYmplY3QgPSBbXTtcbiAgICAgICAgICAgIHJldHVybiB0aGlzO1xuICAgICAgICB9LFxuICAgICAgICB3aGVyZUlkOiBmdW5jdGlvbihpZCl7XG4gICAgICAgICAgICBpZighaWQpXG4gICAgICAgICAgICAgICAgcmV0dXJuIG51bGw7XG4gICAgICAgICAgICBmb3IodmFyIGkgaW4gdGhpcy50YXJnZXQub2JqZWN0KVxuICAgICAgICAgICAgICAgIGlmKHRoaXMudGFyZ2V0Lm9iamVjdFtpXS5pZCA9PSBpZCl7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMudGFyZ2V0Lm9iamVjdCA9IFt0aGlzLnRhcmdldC5vYmplY3RbaV1dO1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gdGhpcztcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB0aGlzLnRhcmdldC5vYmplY3QgPSBbXTtcbiAgICAgICAgICAgIHJldHVybiB0aGlzO1xuICAgICAgICB9LFxuICAgICAgICByZXBlYXQ6IGZ1bmN0aW9uKCl7XG4gICAgICAgICAgICB0aGlzLnRhcmdldC5yZXBlYXQgPSB0cnVlO1xuICAgICAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgICAgIH0sXG4gICAgICAgIGdldFJlbmRlcmVkOiBmdW5jdGlvbihyYW5nZSl7XG4gICAgICAgICAgICB2YXIgZGF0ZUZvcm1hdCA9ICdZWVlZLU1NLUREIEhIOm1tJztcbiAgICAgICAgICAgIHRoaXMudGFyZ2V0LnJlbmRlcmQgPSBbXTtcbiAgICAgICAgICAgIHJhbmdlIC89IDI7XG5cbiAgICAgICAgICAgIHRoaXMudGFyZ2V0Lm9iamVjdC5mb3JFYWNoKGZ1bmN0aW9uKHZhbHVlKXtcbiAgICAgICAgICAgICAgICB2YXIgZmxhZyA9IHtcbiAgICAgICAgICAgICAgICAgICAgZXZlcnlEYXk6IGZhbHNlLFxuICAgICAgICAgICAgICAgICAgICBldmVyeVdlZWs6IGZhbHNlXG4gICAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgICAgICBpZih2YWx1ZS5yZXBlYXQuZXZlcnlEYXkpe1xuICAgICAgICAgICAgICAgICAgICBmbGFnLmV2ZXJ5RGF5ID0gdHJ1ZTtcbiAgICAgICAgICAgICAgICAgICAgdmFyIGRheU5vdyA9IG1vbWVudCh2YWx1ZS5kYXRlKTtcbiAgICAgICAgICAgICAgICAgICAgZm9yKHZhciBpID0gLXJhbmdlOyBpIDwgcmFuZ2U7IGkrKyl7XG4gICAgICAgICAgICAgICAgICAgICAgICB2YWx1ZS5kYXRlID0gbW9tZW50KGRheU5vdykuYWRkKGksICdkYXlzJykuZm9ybWF0KGRhdGVGb3JtYXQpO1xuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy50YXJnZXQucmVuZGVyZC5wdXNoKCQuZXh0ZW5kKHRydWUsIHt9LCB2YWx1ZSkpO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGVsc2UgaWYodmFsdWUucmVwZWF0LmV2ZXJ5V2Vlayl7XG4gICAgICAgICAgICAgICAgICAgIGZsYWcuZXZlcnlXZWVrID0gdHJ1ZTtcbiAgICAgICAgICAgICAgICAgICAgdmFyIHdlZWtSYW5nZSA9IE1hdGguZmxvb3IocmFuZ2UgLyA3KTtcbiAgICAgICAgICAgICAgICAgICAgdmFyIHdlZWtOb3cgPSBtb21lbnQoKS53ZWVrKCk7XG4gICAgICAgICAgICAgICAgICAgIGZvcih2YXIgaSA9IC13ZWVrUmFuZ2U7IGkgPCB3ZWVrUmFuZ2U7IGkrKyl7XG4gICAgICAgICAgICAgICAgICAgICAgICB2YXIgd2VlayA9IG1vbWVudCh2YWx1ZS5kYXRlKS53ZWVrKHdlZWtOb3cgKyBpKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGZvcih2YXIgZGF5IGluIHZhbHVlLnJlcGVhdClcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBzd2l0Y2goZGF5KXtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY2FzZSBcIm1vblwiOlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjYXNlIFwidHVlXCI6XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNhc2UgXCJ3ZWRcIjpcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY2FzZSBcInRodVwiOlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjYXNlIFwiZnJpXCI6XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNhc2UgXCJzYXRcIjpcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY2FzZSBcInN1blwiOlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYodmFsdWUucmVwZWF0W2RheV0pe1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHZhbHVlLmRhdGUgPSB3ZWVrLmRheShkYXkpLmZvcm1hdChkYXRlRm9ybWF0KTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aGlzLnRhcmdldC5yZW5kZXJkLnB1c2goJC5leHRlbmQodHJ1ZSwge30sIHZhbHVlKSk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgaWYoIWZsYWcuZXZlcnlEYXkgJiYgIWZsYWcuZXZlcnlXZWVrKXtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy50YXJnZXQucmVuZGVyZC5wdXNoKCQuZXh0ZW5kKHRydWUsIHt9LCB2YWx1ZSkpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICB9LmJpbmQodGhpcykpO1xuICAgICAgICAgICAgcmV0dXJuIHRoaXMudGFyZ2V0LnJlbmRlcmQ7XG4gICAgICAgIH0sXG4gICAgICAgIHJlc3VsdDogZnVuY3Rpb24oKXtcbiAgICAgICAgICAgIGlmKCF0aGlzLnRhcmdldC5yZXBlYXQpXG4gICAgICAgICAgICAgICAgcmV0dXJuIHRoaXMudGFyZ2V0Lm9iamVjdDtcbiAgICAgICAgICAgIHZhciByZXN1bHQgPSBbXTtcbiAgICAgICAgICAgIGZvcih2YXIgaSBpbiB0aGlzLnRhcmdldC5vYmplY3Qpe1xuICAgICAgICAgICAgICAgIHZhciByZXBlYXRLZXlzID0gT2JqZWN0LmtleXModGhpcy50YXJnZXQub2JqZWN0W2ldLnJlcGVhdCksXG4gICAgICAgICAgICAgICAgICAgIGRheXMgPSB7fSxcbiAgICAgICAgICAgICAgICAgICAgcmVwZWF0ID0ge30sXG4gICAgICAgICAgICAgICAgICAgIGtleSA9ICcnO1xuICAgICAgICAgICAgICAgIGZvcih2YXIgciA9IHJlcGVhdEtleXMubGVuZ3RoOyByLS07KXtcbiAgICAgICAgICAgICAgICAgICAga2V5ID0gcmVwZWF0S2V5c1tyXTtcbiAgICAgICAgICAgICAgICAgICAgc3dpdGNoKGtleSl7XG4gICAgICAgICAgICAgICAgICAgICAgICBjYXNlIFwibW9uXCI6XG4gICAgICAgICAgICAgICAgICAgICAgICBjYXNlIFwidHVlXCI6XG4gICAgICAgICAgICAgICAgICAgICAgICBjYXNlIFwid2VkXCI6XG4gICAgICAgICAgICAgICAgICAgICAgICBjYXNlIFwidGh1XCI6XG4gICAgICAgICAgICAgICAgICAgICAgICBjYXNlIFwiZnJpXCI6XG4gICAgICAgICAgICAgICAgICAgICAgICBjYXNlIFwic2F0XCI6XG4gICAgICAgICAgICAgICAgICAgICAgICBjYXNlIFwic3VuXCI6XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZGF5c1trZXldID0gdGhpcy50YXJnZXQub2JqZWN0W2ldLnJlcGVhdFtrZXldO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgICAgICAgICAgZGVmYXVsdDpcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXBlYXRba2V5XSA9IHRoaXMudGFyZ2V0Lm9iamVjdFtpXS5yZXBlYXRba2V5XTtcbiAgICAgICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIHJlcGVhdC5kYXlzID0gZGF5cztcbiAgICAgICAgICAgICAgICByZXN1bHQucHVzaChyZXBlYXQpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmV0dXJuIHJlc3VsdDtcbiAgICAgICAgfSxcbiAgICAgICAgYWpheFVwZGF0ZTogZnVuY3Rpb24oKXtcbiAgICAgICAgICAgIHZhciBhamF4T3B0aW9ucyA9IHtcbiAgICAgICAgICAgICAgICB0eXBlOiBcIlBPU1RcIixcbiAgICAgICAgICAgICAgICBjYWNoZTogZmFsc2UsXG4gICAgICAgICAgICAgICAgaGVhZGVyczoge1xuICAgICAgICAgICAgICAgICAgICAnWC1DU1JGLVRPS0VOJzogJCgnbWV0YVtuYW1lPVwiY3NyZi10b2tlblwiXScpLmF0dHIoJ2NvbnRlbnQnKVxuICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgc3VjY2VzczogZnVuY3Rpb24ocmVzcG9uc2Upe1xuICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmxvZygnc3VjY2VzcycsIHJlc3BvbnNlKTtcbiAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgIGVycm9yOiBmdW5jdGlvbihyZXNwb25zZSl7XG4gICAgICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKCdlcnJvcicsIHJlc3BvbnNlKTtcblxuICAgICAgICAgICAgICAgICAgICAkKFwiYm9keVwiKS5odG1sKHJlc3BvbnNlLnJlc3BvbnNlVGV4dClcbiAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgIGRhdGE6IHtcbiAgICAgICAgICAgICAgICAgICAgZXZlbnRzOiB0aGlzLmdldCgnZXZlbnRzJykudGFyZ2V0Lm9iamVjdFxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH07XG5cbiAgICAgICAgICAgICQuYWpheCgnc2NoZWR1bGUvZXZlbnRzL3VwZGF0ZScsIGFqYXhPcHRpb25zKTtcblxuICAgICAgICB9XG4gICAgfTtcblxuICAgIC8vZXZlbnRzXG4gICAgdmFyIG9uRXZlbnRzU3VjY2VzcyA9IGZ1bmN0aW9uKHJlc3BvbnNlKXtcbiAgICAgICAgICAgICQoXCIjZm91bnRhaW5UZXh0R1wiKS5oaWRlKCk7XG4gICAgICAgICAgICBzdG9yYWdlLnNldCgnZXZlbnRzJywgcmVzcG9uc2UuZXZlbnRzKTtcbiAgICAgICAgICAgIHN0b3JhZ2Uuc2V0KCdwbGF5bGlzdHMnLCByZXNwb25zZS5wbGF5bGlzdHMpO1xuICAgICAgICAgICAgdmFyIGV2ZW50cyA9IHN0b3JhZ2UuZ2V0KCdldmVudHMnKS5nZXRSZW5kZXJlZCg2MCk7XG4gICAgICAgICAgICB2YXIgcGxheWxpc3RzID0gc3RvcmFnZS5nZXQoJ3BsYXlsaXN0cycpLnJlc3VsdCgpO1xuICAgICAgICAgICAgaW5pdENhbGVuZGFyKGV2ZW50cyk7XG4gICAgICAgICAgICBpbml0UGxheWxpc3QocGxheWxpc3RzKTtcbiAgICAgICAgfSxcbiAgICAgICAgb25FdmVudHNFcnJvciA9IGZ1bmN0aW9uIChyZXNwb25zZSl7XG4gICAgICAgICAgICAkKFwiI2ZvdW50YWluVGV4dEdcIikuaGlkZSgpO1xuICAgICAgICAgICAgY29uc29sZS5sb2cocmVzcG9uc2UpO1xuICAgICAgICB9O1xuICAgIHZhciByZXF1ZXN0T3B0aW9ucyA9IHtcbiAgICAgICAgdHlwZTogXCJHRVRcIixcbiAgICAgICAgY2FjaGU6IGZhbHNlLFxuICAgICAgICBzdWNjZXNzOiBvbkV2ZW50c1N1Y2Nlc3MsXG4gICAgICAgIGVycm9yOiBvbkV2ZW50c0Vycm9yXG4gICAgfTtcbiAgICAkLmFqYXgoJ3NjaGVkdWxlL2V2ZW50cycsIHJlcXVlc3RPcHRpb25zKTtcbiAgICAvLyFldmVudHNcblxuICAgIC8vaW5pdCB2YXJpYWJsZXNcbiAgICB2YXIgY2xuZHIgPSB7fTtcbiAgICB2YXIgZGF5RXZlbnRzVGVtcGxhdGUgPSAkKCcjZGF5LWV2ZW50cycpLmh0bWwoKTtcblxuICAgIHZhciBtb2RhbCA9ICQoXCIjbW9kYWxcIik7XG4gICAgdmFyIGRhdGV0aW1lUGlja2VySW5pdCA9IGZ1bmN0aW9uKG9wdGlvbnMsIGlkKXtcbiAgICAgICAgLy9EYXRlIGluaXRcbiAgICAgICAgdmFyIGR0UGlja2VyID0gJCgnI2RhdGV0aW1lcGlja2VyJyksXG4gICAgICAgICAgICBjaGVja09wdGlvbnMgPSB7XG4gICAgICAgICAgICAgICAgY2hlY2tib3hDbGFzczogJ2ljaGVja2JveF9zcXVhcmUtYmx1ZScsXG4gICAgICAgICAgICAgICAgcmFkaW9DbGFzczogJ2lyYWRpb19zcXVhcmUtYmx1ZScsXG4gICAgICAgICAgICAgICAgaW5jcmVhc2VBcmVhOiAnMjAlJyxcbiAgICAgICAgICAgIH07XG4gICAgICAgICQoJyNyZXBlYXQtZGF5JykuaUNoZWNrKCd1bmNoZWNrJylcbiAgICAgICAgICAgIC5pQ2hlY2soY2hlY2tPcHRpb25zKS5vbihcImlmVW5jaGVja2VkXCIsIGZ1bmN0aW9uKCl7XG4gICAgICAgICAgICAgICAgZHRQaWNrZXJcbiAgICAgICAgICAgICAgICAgICAgLmRhdGV0aW1lcGlja2VyKCdkZXN0cm95JylcbiAgICAgICAgICAgICAgICAgICAgLmRhdGV0aW1lcGlja2VyKCk7XG4gICAgICAgICAgICAgICAgJChcIiNyZXBlYXQtbW9udGhcIikuaUNoZWNrKCdlbmFibGUnKTtcbiAgICAgICAgICAgICAgICByZXBlYXRPbi5pQ2hlY2soJ2VuYWJsZScpO1xuICAgICAgICAgICAgfSkub24oXCJpZkNoZWNrZWRcIiwgZnVuY3Rpb24oKXtcbiAgICAgICAgICAgICAgICBkdFBpY2tlclxuICAgICAgICAgICAgICAgICAgICAuZGF0ZXRpbWVwaWNrZXIoJ2Rlc3Ryb3knKVxuICAgICAgICAgICAgICAgICAgICAuZGF0ZXRpbWVwaWNrZXIoe1xuICAgICAgICAgICAgICAgICAgICAgICAgZGF0ZXBpY2tlcjpmYWxzZSxcbiAgICAgICAgICAgICAgICAgICAgICAgIGZvcm1hdDonSDppJ1xuICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICAkKFwiI3JlcGVhdC1tb250aFwiKS5pQ2hlY2soJ2Rpc2FibGUnKTtcbiAgICAgICAgICAgICAgICByZXBlYXRPbi5pQ2hlY2soJ2Rpc2FibGUnKTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICBkdFBpY2tlclxuICAgICAgICAgICAgLmRhdGV0aW1lcGlja2VyKCdkZXN0cm95JylcbiAgICAgICAgICAgIC5kYXRldGltZXBpY2tlcihvcHRpb25zKTtcblxuICAgICAgICAvL1JlcGVhdCBpbml0XG4gICAgICAgIHZhciByZXBlYXRPbiA9ICQoXCIjcmVwZWF0LW9uXCIpO1xuICAgICAgICByZXBlYXRPbi5oaWRlKCk7XG4gICAgICAgICQoJyNyZXBlYXQtbW9udGgnKS5pQ2hlY2soJ3VuY2hlY2snKVxuICAgICAgICAgICAgLmlDaGVjayhjaGVja09wdGlvbnMpXG4gICAgICAgICAgICAub24oXCJpZlVuY2hlY2tlZFwiLCBmdW5jdGlvbigpe1xuICAgICAgICAgICAgICAgIHJlcGVhdE9uLmhpZGUoKTtcbiAgICAgICAgICAgIH0pXG4gICAgICAgICAgICAub24oXCJpZkNoZWNrZWRcIiwgZnVuY3Rpb24oKXtcbiAgICAgICAgICAgICAgICAkKFwiW2lkKj0ncmVwZWF0LW9uLSddXCIpXG4gICAgICAgICAgICAgICAgICAgIC5pQ2hlY2soY2hlY2tPcHRpb25zKTtcbiAgICAgICAgICAgICAgICByZXBlYXRPbi5zaG93KCk7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgLy9TZXQgY2hlY2tlZCBkYXlzXG4gICAgICAgIGlmKGlkKXtcbiAgICAgICAgICAgIChmdW5jdGlvbigpe1xuICAgICAgICAgICAgICAgIHZhciByZXBlYXRzID0gc3RvcmFnZS5nZXQoJ2V2ZW50cycpLndoZXJlSWQoaWQpLnJlcGVhdCgpLnJlc3VsdCgpWzBdO1xuICAgICAgICAgICAgICAgIGlmKHJlcGVhdHMuZXZlcnlXZWVrKXtcbiAgICAgICAgICAgICAgICAgICAgJCgnI3JlcGVhdC1tb250aCcpLmlDaGVjaygnY2hlY2snKTtcbiAgICAgICAgICAgICAgICAgICAgZm9yKHZhciBpIGluIHJlcGVhdHMuZGF5cyl7XG4gICAgICAgICAgICAgICAgICAgICAgICAkKFwiI3JlcGVhdC1vbi1cIiArIGkpLmlDaGVjayhyZXBlYXRzLmRheXNbaV0gPyAnY2hlY2snOiAndW5jaGVjaycpXG4gICAgICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBpZihyZXBlYXRzLmV2ZXJ5RGF5KXtcbiAgICAgICAgICAgICAgICAgICAgJCgnI3JlcGVhdC1kYXknKS5pQ2hlY2soJ2NoZWNrJyk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSkoKTtcbiAgICAgICAgfVxuICAgICAgICAvLyFjaGVja2VkIGRheXNcbiAgICAgICAgbW9kYWwubW9kYWwoJ3Nob3cnKTtcbiAgICB9O1xuICAgIC8vb24gU2F2aW5nIGNoYW5nZXNcbiAgICB2YXIgc2F2ZUNoYW5nZXMgPSBmdW5jdGlvbihpZCl7XG4gICAgICAgIHZhciB0aXRsZSA9ICQudHJpbSgkKFwiI1RpdGxlXCIpLnZhbCgpKSxcbiAgICAgICAgICAgIGRlc2NyaXB0aW9uID0gJC50cmltKCQoXCIjRGVzY3JpcHRpb25cIikudmFsKCkpLFxuICAgICAgICAgICAgaXNEYXlSZXBlYXQgPSAkKFwiI3JlcGVhdC1kYXlcIikucHJvcChcImNoZWNrZWRcIiksXG4gICAgICAgICAgICBkYXRlVGltZSA9ICQoXCIjZGF0ZXRpbWVwaWNrZXJcIikudmFsKCk7XG5cbiAgICAgICAgaWYoIXRpdGxlKXtcbiAgICAgICAgICAgICQoXCIjVGl0bGVcIikudG9vbHRpcCh7XG4gICAgICAgICAgICAgICAgdHJpZ2dlcjonbWFudWFsJ1xuICAgICAgICAgICAgfSkudG9vbHRpcCgnc2hvdycpO1xuICAgICAgICAgICAgc2V0VGltZW91dChmdW5jdGlvbigpe1xuICAgICAgICAgICAgICAgICQoXCIjVGl0bGVcIikudG9vbHRpcCgnZGVzdHJveScpO1xuICAgICAgICAgICAgfSwgMjAwMCk7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cbiAgICAgICAgaWYoIWlzRGF5UmVwZWF0KXtcbiAgICAgICAgICAgIHZhciBpc1dlZWtSZXBlYXQgPSAgJChcIiNyZXBlYXQtbW9udGhcIikucHJvcChcImNoZWNrZWRcIik7XG4gICAgICAgICAgICBpZihpc1dlZWtSZXBlYXQpe1xuICAgICAgICAgICAgICAgIHZhciBkYXlzUmVwZWF0ID0ge307XG4gICAgICAgICAgICAgICAgJChcIltpZCo9J3JlcGVhdC1vbi0nXVwiKS5lYWNoKGZ1bmN0aW9uIChpLCBvYmopIHtcbiAgICAgICAgICAgICAgICAgICAgZGF5c1JlcGVhdFskKG9iaikuYXR0cignaWQnKS5zdWJzdHJpbmcoMTApXSA9ICQob2JqKS5wcm9wKFwiY2hlY2tlZFwiKSA/IDEgOiAwO1xuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgc3RvcmFnZS5nZXQoJ2V2ZW50cycpLmFkZCh7XG4gICAgICAgICAgICBpZDogaWQgfHwgLTEsXG4gICAgICAgICAgICB0aXRsZTogdGl0bGUsXG4gICAgICAgICAgICBkYXRlIDogaXNEYXlSZXBlYXQgPyBtb21lbnQoZGF0ZVRpbWUsIFwiSEg6bW1cIikuZm9ybWF0KFwiWVlZWS1NTS1ERCBISDptbVwiKSA6IGRhdGVUaW1lLFxuICAgICAgICAgICAgcGxheWxpc3Q6ICQoXCIjcGxheWxpc3Qgb3B0aW9uOnNlbGVjdGVkXCIpLnZhbCgpLFxuICAgICAgICAgICAgZGVzY3JpcHRpb246IGRlc2NyaXB0aW9uLFxuICAgICAgICAgICAgZXZlcnlEYXk6IGlzRGF5UmVwZWF0LFxuICAgICAgICAgICAgZXZlcnlXZWVrOiBpc1dlZWtSZXBlYXQsXG4gICAgICAgICAgICBkYXlzOiBkYXlzUmVwZWF0XG4gICAgICAgIH0pLnNhdmUoKTtcbiAgICAgICAgXG4gICAgICAgIGNsbmRyLnNldEV2ZW50cyhzdG9yYWdlLmdldCgnZXZlbnRzJykuZ2V0UmVuZGVyZWQoNjApKTtcbiAgICAgICAgbW9kYWwubW9kYWwoJ2hpZGUnKTtcbiAgICB9O1xuXG4gICAgLy9Jbml0IHBsYXlsaXN0XG4gICAgdmFyIGluaXRQbGF5bGlzdCA9IGZ1bmN0aW9uIChwbGF5bGlzdCl7XG4gICAgICAgIHZhciBsaXN0ID0gJChcIiNwbGF5bGlzdFwiKTtcbiAgICAgICAgcGxheWxpc3QuZm9yRWFjaChmdW5jdGlvbih2YWwpe1xuICAgICAgICAgICAgbGlzdC5hcHBlbmQoXCI8b3B0aW9uIHZhbHVlPSdcIit2YWwuaWQrXCInPlwiK3ZhbC5uYW1lK1wiPC9vcHRpb24+XCIpO1xuICAgICAgICB9KTtcbiAgICAgICAgbGlzdC5zZWxlY3RwaWNrZXIoJ3JlZnJlc2gnKTtcbiAgICB9O1xuICAgIC8vSW5pdCBjYWxlbmRhclxuICAgIHZhciBpbml0Q2FsZW5kYXIgPSBmdW5jdGlvbihldmVudHMpe1xuICAgICAgICBjbG5kciA9ICQoJyNmdWxsLWNsbmRyJykuY2xuZHIoe1xuICAgICAgICAgICAgdGVtcGxhdGU6ICQoJyNmdWxsLWNsbmRyLXRlbXBsYXRlJykuaHRtbCgpLFxuICAgICAgICAgICAgZXZlbnRzOiBldmVudHMsXG4gICAgICAgICAgICBjbGlja0V2ZW50czoge1xuICAgICAgICAgICAgICAgIGNsaWNrOiBmdW5jdGlvbiAodGFyZ2V0KSB7XG4gICAgICAgICAgICAgICAgICAgIHZhciB0ZW1wbGF0ZSA9IF8udGVtcGxhdGUoZGF5RXZlbnRzVGVtcGxhdGUpO1xuICAgICAgICAgICAgICAgICAgICAkKFwiLmRheS1ldmVudHNcIilcbiAgICAgICAgICAgICAgICAgICAgICAgIC5tQ3VzdG9tU2Nyb2xsYmFyKFwiZGVzdHJveVwiKVxuICAgICAgICAgICAgICAgICAgICAgICAgLmh0bWwodGVtcGxhdGUoe2V2ZW50c1RoaXNEYXk6IHRhcmdldC5ldmVudHN9KSlcbiAgICAgICAgICAgICAgICAgICAgICAgIC5oZWlnaHQoICQoXCIuY2xuZHItZ3JpZCAuZGF5c1wiKS5oZWlnaHQoKSAtICQoXCIuY2xuZHItZ3JpZCAuZGF5cy1vZi10aGUtd2Vla1wiKS5oZWlnaHQoKSApXG4gICAgICAgICAgICAgICAgICAgICAgICAubUN1c3RvbVNjcm9sbGJhcih7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgc2Nyb2xsQnV0dG9uczp7ZW5hYmxlOnRydWV9LFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRoZW1lOlwibWluaW1hbC1kYXJrXCJcbiAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgICAgICAgICAgICAgICAvL1RyYW5zbGF0ZVggaXRlbSBob3ZlciBtZW51XG4gICAgICAgICAgICAgICAgICAgICAgICB2YXIgc3ViTWVudSA9ICQoXCIuZXZlbnQtaXRlbS1ob3ZlclwiKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIHN1Yk1lbnUuY3NzKFwidHJhbnNmb3JtXCIsIFwidHJhbnNsYXRlWChcIiArIHN1Yk1lbnUud2lkdGgoKSArIFwicHgpXCIpO1xuXG5cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgZm9yY2VTaXhSb3dzOiB0cnVlLFxuICAgICAgICAgICAgbXVsdGlEYXlFdmVudHM6IHtcbiAgICAgICAgICAgICAgICBzaW5nbGVEYXk6ICdkYXRlJyxcbiAgICAgICAgICAgICAgICBlbmREYXRlOiAnZW5kRGF0ZScsXG4gICAgICAgICAgICAgICAgc3RhcnREYXRlOiAnc3RhcnREYXRlJ1xuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIHNob3dBZGphY2VudE1vbnRoczogdHJ1ZSxcbiAgICAgICAgICAgIGFkamFjZW50RGF5c0NoYW5nZU1vbnRoOiBmYWxzZSxcbiAgICAgICAgICAgIHRyYWNrU2VsZWN0ZWREYXRlOiB0cnVlLFxuICAgICAgICAgICAgZGF5c09mVGhlV2VlazogKGZ1bmN0aW9uKCl7XG4gICAgICAgICAgICAgICAgdmFyIHJlc3VsdCA9IFtdO1xuICAgICAgICAgICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgNzsgaSsrKSB7XG4gICAgICAgICAgICAgICAgICAgIHJlc3VsdC5wdXNoKG1vbWVudCgpLndlZWtkYXkoaSkuZm9ybWF0KCdkZGQnKSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIHJldHVybiByZXN1bHQ7XG4gICAgICAgICAgICB9KSgpLFxuICAgICAgICAgICAgZG9uZVJlbmRlcmluZzogZnVuY3Rpb24oKXsgLy9kb25lUmVuZGVyaW5nXG4gICAgICAgICAgICAgICAgJChcIi5ldmVudC1pdGVtc1wiKVxuICAgICAgICAgICAgICAgICAgICAuaGVpZ2h0KCAkKFwiLmNsbmRyLWdyaWQgLmRheXNcIikuaGVpZ2h0KCkgLSAkKFwiLmNsbmRyLWdyaWQgLmRheXMtb2YtdGhlLXdlZWtcIikuaGVpZ2h0KCkgKVxuICAgICAgICAgICAgICAgICAgICAubUN1c3RvbVNjcm9sbGJhcih7XG4gICAgICAgICAgICAgICAgICAgICAgICBzY3JvbGxCdXR0b25zOntlbmFibGU6dHJ1ZX0sXG4gICAgICAgICAgICAgICAgICAgICAgICB0aGVtZTpcIm1pbmltYWwtZGFya1wiXG4gICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgIHZhciBjYWxlbmRhciA9ICQoXCIjZnVsbC1jbG5kclwiKTtcbiAgICAgICAgICAgICAgICBpZihjYWxlbmRhci5maW5kKFwiLnRvZGF5XCIpLmxlbmd0aCA+IDApXG4gICAgICAgICAgICAgICAgICAgIGNhbGVuZGFyLmZpbmQoXCIudG9kYXlcIikuY2xpY2soKTtcbiAgICAgICAgICAgICAgICBlbHNlXG4gICAgICAgICAgICAgICAgICAgIGNhbGVuZGFyLmZpbmQoXCIuZGF5XCIpLmVxKDApLmNsaWNrKCk7XG5cbiAgICAgICAgICAgICAgICB2YXIgZXZlbnRMaXN0aW5nVGl0bGUgPSAkKFwiLmV2ZW50LWxpc3RpbmctdGl0bGVcIik7XG4gICAgICAgICAgICAgICAgLy9Jbml0IGJsb2NrIE9wZW4vQ2xvc2UgZXZlbnRcbiAgICAgICAgICAgICAgICBldmVudExpc3RpbmdUaXRsZS5vbihcImNsaWNrXCIsIFwiLmdseXBoaWNvbi1jaGV2cm9uLXVwLCAuZ2x5cGhpY29uLWNoZXZyb24tZG93blwiLCBmdW5jdGlvbigpe1xuICAgICAgICAgICAgICAgICAgICB2YXIgZWwgPSB7fTtcbiAgICAgICAgICAgICAgICAgICAgdmFyIGJsb2NrID0ge1xuICAgICAgICAgICAgICAgICAgICAgICAgb3BlbjogXCJnbHlwaGljb24tY2hldnJvbi11cFwiLFxuICAgICAgICAgICAgICAgICAgICAgICAgY2xvc2U6IFwiZ2x5cGhpY29uLWNoZXZyb24tZG93blwiXG4gICAgICAgICAgICAgICAgICAgIH07XG4gICAgICAgICAgICAgICAgICAgIHZhciAkdGhpcyA9ICQodGhpcyk7XG4gICAgICAgICAgICAgICAgICAgIGlmKCR0aGlzLnBhcmVudCgpLmhhc0NsYXNzKFwibW9udGgtdGl0bGVcIikpXG4gICAgICAgICAgICAgICAgICAgICAgICBlbCA9ICQoXCIuZGF5LXRpdGxlIFtjbGFzcyAqPWdseXBoaWNvbi1jaGV2cm9uXVwiKS5lcSgwKTtcbiAgICAgICAgICAgICAgICAgICAgZWxzZVxuICAgICAgICAgICAgICAgICAgICAgICAgZWwgPSAkKFwiLm1vbnRoLXRpdGxlIFtjbGFzcyAqPWdseXBoaWNvbi1jaGV2cm9uXVwiKS5lcSgwKTtcblxuICAgICAgICAgICAgICAgICAgICBpZihlbC5oYXNDbGFzcyhibG9jay5vcGVuKSlcbiAgICAgICAgICAgICAgICAgICAgICAgIGVsLnJlbW92ZUNsYXNzKGJsb2NrLm9wZW4pLmFkZENsYXNzKGJsb2NrLmNsb3NlKTtcbiAgICAgICAgICAgICAgICAgICAgZWxzZVxuICAgICAgICAgICAgICAgICAgICAgICAgZWwucmVtb3ZlQ2xhc3MoYmxvY2suY2xvc2UpLmFkZENsYXNzKGJsb2NrLm9wZW4pO1xuXG4gICAgICAgICAgICAgICAgICAgIGlmKCR0aGlzLmhhc0NsYXNzKGJsb2NrLm9wZW4pKVxuICAgICAgICAgICAgICAgICAgICAgICAgJHRoaXMucmVtb3ZlQ2xhc3MoYmxvY2sub3BlbikuYWRkQ2xhc3MoYmxvY2suY2xvc2UpO1xuICAgICAgICAgICAgICAgICAgICBlbHNlXG4gICAgICAgICAgICAgICAgICAgICAgICAkdGhpcy5yZW1vdmVDbGFzcyhibG9jay5jbG9zZSkuYWRkQ2xhc3MoYmxvY2sub3Blbik7XG5cbiAgICAgICAgICAgICAgICAgICAgJChcIi5ldmVudC1pdGVtcywgLmRheS1ldmVudHNcIikuc2xpZGVUb2dnbGUoKTtcblxuICAgICAgICAgICAgICAgIH0pO1xuXG5cbiAgICAgICAgICAgICAgICB2YXIgZGF0ZXRpbWVwaWNrZXJPcHRpb25zID0ge1xuICAgICAgICAgICAgICAgICAgICBzdGVwOiAzMFxuICAgICAgICAgICAgICAgIH07XG4gICAgICAgICAgICAgICAgdmFyIGlzVGlwT3BlbiA9IGZhbHNlO1xuICAgICAgICAgICAgICAgICQoXCIuZXZlbnQtbGlzdGluZ1wiKS5vbignY2xpY2snLCAnLmV2ZW50LWl0ZW0nLCBmdW5jdGlvbihlKXtcbiAgICAgICAgICAgICAgICAgICAgZS5zdG9wUHJvcGFnYXRpb24oKTtcbiAgICAgICAgICAgICAgICAgICAgdmFyIGhvdmVyID0gJCh0aGlzKS5maW5kKFwiLmV2ZW50LWl0ZW0taG92ZXJcIik7XG4gICAgICAgICAgICAgICAgICAgIGlmKGlzVGlwT3BlbilcbiAgICAgICAgICAgICAgICAgICAgICAgIGhvdmVyLmNzcygndHJhbnNmb3JtJywgJ3RyYW5zbGF0ZVgoJysgaG92ZXIud2lkdGgoKSArJ3B4KScpO1xuICAgICAgICAgICAgICAgICAgICBlbHNlXG4gICAgICAgICAgICAgICAgICAgICAgICBob3Zlci5jc3MoJ3RyYW5zZm9ybScsICd0cmFuc2xhdGVYKDBweCknKTtcbiAgICAgICAgICAgICAgICAgICAgaXNUaXBPcGVuID0gIWlzVGlwT3BlbjtcbiAgICAgICAgICAgICAgICB9KVxuICAgICAgICAgICAgICAgIC8vSW5pdCBtb2RhbCB3aW5kb3cgXCJFZGl0IGV2ZW50XCJcbiAgICAgICAgICAgICAgICAgICAgLm9uKCdjbGljaycsICcuZXZlbnQtaXRlbSBzcGFuOmZpcnN0LWNoaWxkJywgZnVuY3Rpb24oZSl7XG4gICAgICAgICAgICAgICAgICAgICAgICBlLnN0b3BQcm9wYWdhdGlvbigpO1xuICAgICAgICAgICAgICAgICAgICAgICAgdmFyICR0aGlzID0gJCh0aGlzKS5wYXJlbnQoKS5wYXJlbnQoKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIG1vZGFsLmZpbmQoXCJmb3JtXCIpLmdldCgwKS5yZXNldCgpO1xuICAgICAgICAgICAgICAgICAgICAgICAgbW9kYWwuZmluZChcIi5tb2RhbC10aXRsZVwiKS50ZXh0KFwiRWRpdCBldmVudFwiKTtcblxuICAgICAgICAgICAgICAgICAgICAgICAgZGF0ZXRpbWVwaWNrZXJPcHRpb25zLnZhbHVlID0gJHRoaXMuZmluZChcIi5ldmVudC1pdGVtLXRpbWVcIikuYXR0cihcImRhdGEtZGF0ZXRpbWVcIik7XG4gICAgICAgICAgICAgICAgICAgICAgICBtb2RhbC5maW5kKFwiI1RpdGxlXCIpLnZhbCgkdGhpcy5maW5kKFwiLmV2ZW50LWl0ZW0tbmFtZVwiKS50ZXh0KCkpO1xuICAgICAgICAgICAgICAgICAgICAgICAgbW9kYWwuZmluZChcIiNEZXNjcmlwdGlvblwiKS52YWwoJHRoaXMuZmluZChcIi5ldmVudC1pdGVtLWxvY2F0aW9uXCIpLnRleHQoKSk7XG5cbiAgICAgICAgICAgICAgICAgICAgICAgIGRhdGV0aW1lUGlja2VySW5pdChkYXRldGltZXBpY2tlck9wdGlvbnMsICR0aGlzLmF0dHIoJ2RhdGEtaWQnKSk7XG4gICAgICAgICAgICAgICAgICAgICAgICBtb2RhbC5maW5kKFwiLnNhdmUtY2hhbmdlc1wiKS5vZmYoXCJjbGlja1wiKS5vbignY2xpY2snLCBzYXZlQ2hhbmdlcy5iaW5kKG51bGwsJHRoaXMuYXR0cignZGF0YS1pZCcpKSk7XG4gICAgICAgICAgICAgICAgICAgICAgICBtb2RhbC5maW5kKFwiLmRlbGV0ZS1ldmVudFwiKS5vZmYoXCJjbGlja1wiKS5vbignY2xpY2snLCBmdW5jdGlvbigpe1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICQuZ2V0KFwic2NoZWR1bGUvZXZlbnRzL2RlbGV0ZS9cIiArICR0aGlzLmF0dHIoJ2RhdGEtaWQnKSkuZG9uZShmdW5jdGlvbigpe1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjbG5kci5zZXRFdmVudHMoc3RvcmFnZS5nZXQoXCJldmVudHNcIikuZGVsKHBhcnNlSW50KCR0aGlzLmF0dHIoJ2RhdGEtaWQnKSkpLmdldFJlbmRlcmVkKDYwKSk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG1vZGFsLm1vZGFsKFwiaGlkZVwiKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgICAgICAgICAgbW9kYWwuZmluZChcIi5kZWxldGUtZXZlbnRcIikuc2hvdygpO1xuICAgICAgICAgICAgICAgICAgICAgICAgJChcIiNwbGF5bGlzdFwiKS5zZWxlY3RwaWNrZXIoXCJ2YWxcIiwgJHRoaXMuYXR0cihcImRhdGEtcGxheWxpc3RcIikgfHwgMCk7XG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgJChcIi5ldmVudC1saXN0aW5nXCIpLm9uKCdjbGljaycsICcuZXZlbnQtaXRlbSAuZXZlbnQtaXRlbS1ob3ZlciBzcGFuOmxhc3QtY2hpbGQnLCBmdW5jdGlvbihlKXtcbiAgICAgICAgICAgICAgICAgICAgZS5zdG9wUHJvcGFnYXRpb24oKTtcbiAgICAgICAgICAgICAgICAgICAgJCh0aGlzKS50b2dnbGVDbGFzcygndGV4dC1pbmZvJyk7XG4gICAgICAgICAgICAgICAgICAgIHZhciAkdGhpcyA9ICQodGhpcykucGFyZW50KCkucGFyZW50KCk7XG4gICAgICAgICAgICAgICAgICAgIHZhciBpZCA9ICR0aGlzLmF0dHIoJ2RhdGEtaWQnKTtcbiAgICAgICAgICAgICAgICAgICAgdmFyIG1hdGNoID0gJCgnLmRheXMgW2RhdGEtaWQqPVwiJysgaWQgKydcIl0nKTtcbiAgICAgICAgICAgICAgICAgICAgaWYoISQodGhpcykuaGFzQ2xhc3MoJ3RleHQtaW5mbycpKXtcbiAgICAgICAgICAgICAgICAgICAgICAgIG1hdGNoLmNzcyhcImJhY2tncm91bmQtY29sb3JcIiwgXCIjZWVlXCIpO1xuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIHZhciBjb2xvciA9IChmdW5jdGlvbigpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHZhciBsZXR0ZXJzID0gJ0JDREVGJy5zcGxpdCgnJyk7XG4gICAgICAgICAgICAgICAgICAgICAgICB2YXIgY29sb3IgPSAnIyc7XG4gICAgICAgICAgICAgICAgICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IDY7IGkrKyApIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb2xvciArPSBsZXR0ZXJzW01hdGguZmxvb3IoTWF0aC5yYW5kb20oKSAqIGxldHRlcnMubGVuZ3RoKV07XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gY29sb3I7XG4gICAgICAgICAgICAgICAgICAgIH0pKCk7XG4gICAgICAgICAgICAgICAgICAgIG1hdGNoLmNzcyhcImJhY2tncm91bmQtY29sb3JcIiwgY29sb3IpO1xuICAgICAgICAgICAgICAgIH0pO1xuXG5cblxuICAgICAgICAgICAgICAgIC8vSW5pdCBtb2RhbCB3aW5kb3cgXCJBZGQgZXZlbnRcIlxuICAgICAgICAgICAgICAgIGV2ZW50TGlzdGluZ1RpdGxlLm9uKFwiY2xpY2tcIiwgXCIuZ2x5cGhpY29uLXBsdXNcIiwgZnVuY3Rpb24oKXtcbiAgICAgICAgICAgICAgICAgICAgbW9kYWwuZmluZChcImZvcm1cIikuZ2V0KDApLnJlc2V0KCk7XG4gICAgICAgICAgICAgICAgICAgIG1vZGFsLmZpbmQoXCIubW9kYWwtdGl0bGVcIikudGV4dChcIkFkZCBldmVudFwiKTtcblxuICAgICAgICAgICAgICAgICAgICBpZigkKHRoaXMpLnBhcmVudCgpLmhhc0NsYXNzKFwiZGF5LXRpdGxlXCIpKXtcbiAgICAgICAgICAgICAgICAgICAgICAgIGRhdGV0aW1lcGlja2VyT3B0aW9ucy52YWx1ZSA9IChmdW5jdGlvbigpe1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHZhciB0aW1lID0gXCIgXCIgKyBtb21lbnQoKS5mb3JtYXQoXCJISDptbVwiKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB2YXIgZWwgPSAkKGNsbmRyLmVsZW1lbnQpLmZpbmQoXCIuc2VsZWN0ZWRcIik7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYoZWwubGVuZ3RoID4gMClcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGVsLmF0dHIoXCJkYXRhLWRhdGVcIikgKyB0aW1lO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuICQoY2xuZHIuZWxlbWVudCkuZmluZChcInRvZGF5XCIpLmF0dHIoXCJkYXRhLWRhdGVcIikgKyB0aW1lO1xuICAgICAgICAgICAgICAgICAgICAgICAgfSkoKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgICAgIGRhdGV0aW1lUGlja2VySW5pdChkYXRldGltZXBpY2tlck9wdGlvbnMpO1xuICAgICAgICAgICAgICAgICAgICBtb2RhbC5maW5kKFwiLmRlbGV0ZS1ldmVudFwiKS5oaWRlKCk7XG4gICAgICAgICAgICAgICAgICAgIG1vZGFsLmZpbmQoXCIuc2F2ZS1jaGFuZ2VzXCIpLm9mZihcImNsaWNrXCIpLm9uKCdjbGljaycsIHNhdmVDaGFuZ2VzLmJpbmQobnVsbCwkKHRoaXMpLmF0dHIoJ2RhdGEtZGF0ZScpKSk7XG4gICAgICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgICAgICAgICAvLyB2YXIgY2FsZW5kYXIgPSAkKFwiLmNsbmRyXCIpO1xuICAgICAgICAgICAgICAgIGNhbGVuZGFyLmhlaWdodChjYWxlbmRhci5oZWlnaHQoKSk7XG5cblxuICAgICAgICAgICAgICAgIC8vQWpheCBwb3N0IHJlcXVlc3RcblxuICAgICAgICAgICAgfS8vIWRvbmVSZW5kZXJpbmdcbiAgICAgICAgfSk7XG4gICAgfTtcblxufSkoKTsiXSwiZmlsZSI6InNjaGVkdWxlLmpzIiwic291cmNlUm9vdCI6Ii9zb3VyY2UvIn0=
