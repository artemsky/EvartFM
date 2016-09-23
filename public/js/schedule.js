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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiIiwic291cmNlcyI6WyJzY2hlZHVsZS5qcyJdLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24oKXtcbiAgICBcInVzZSBzdHJpY3RcIjtcbiAgICAvL1NldCB1bmRlcnNjb3JlIHRlbXBsYXRlIHNldHRpbmcgYXMge3slJX19IGZvciBiZXR0ZXIgY29kZSByZWFkaW5nXG4gICAgXy50ZW1wbGF0ZVNldHRpbmdzID0ge1xuICAgICAgICBldmFsdWF0ZSAgICA6IC9cXHtcXHslKFtcXHNcXFNdKz8pJVxcfVxcfS9nLFxuICAgICAgICBpbnRlcnBvbGF0ZSA6IC9cXHtcXHslPShbXFxzXFxTXSs/KSVcXH1cXH0vZyxcbiAgICAgICAgZXNjYXBlICAgICAgOiAvXFx7XFx7JS0oW1xcc1xcU10rPyklXFx9XFx9L2dcbiAgICB9O1xuICAgIC8vU2V0IG1vbWVudCBsb2NhbGVcbiAgICBzd2l0Y2goJCgnbWV0YVtuYW1lPVwibGFuZ1wiXScpLmF0dHIoJ2NvbnRlbnQnKSl7XG4gICAgICAgIGNhc2UgJ3J1JzpcbiAgICAgICAgICAgIG1vbWVudC5sb2NhbGUoXCJydVwiKTtcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICBkZWZhdWx0OlxuICAgICAgICAgICAgbW9tZW50LmxvY2FsZShcImVuLWdiXCIpO1xuICAgIH1cblxuXG4gICAgLy9Jbml0IHN0b3JhZ2UgaGVscGVyc1xuICAgIHZhciBzdG9yYWdlID0ge1xuICAgICAgICBkaXNrOiBzZXNzaW9uU3RvcmFnZSB8fCBsb2NhbFN0b3JhZ2UsXG4gICAgICAgIHRhcmdldDoge1xuICAgICAgICAgICAgbmFtZTogbnVsbCxcbiAgICAgICAgICAgIG9iamVjdDogbnVsbCxcbiAgICAgICAgICAgIHJlbmRlcmVkOiBudWxsLFxuICAgICAgICAgICAgcmVwZWF0OiBudWxsXG4gICAgICAgIH0sXG4gICAgICAgICdnZXQnOiBmdW5jdGlvbihrZXkpe1xuICAgICAgICAgICAgdGhpcy50YXJnZXQucmVwZWF0ID0gZmFsc2U7XG4gICAgICAgICAgICBpZighdGhpcy5kaXNrLmdldEl0ZW0oa2V5KSlcbiAgICAgICAgICAgICAgcmV0dXJuIG51bGw7XG4gICAgICAgICAgICB0aGlzLnRhcmdldC5vYmplY3QgPSBKU09OLnBhcnNlKHRoaXMuZGlzay5nZXRJdGVtKGtleSkpO1xuICAgICAgICAgICAgdGhpcy50YXJnZXQubmFtZSA9IGtleTtcbiAgICAgICAgICAgIHJldHVybiB0aGlzO1xuICAgICAgICB9LFxuICAgICAgICAnc2V0JzogZnVuY3Rpb24oa2V5LCB2YWx1ZSl7XG4gICAgICAgICAgICB0aGlzLnRhcmdldC5yZXBlYXQgPSBmYWxzZTtcbiAgICAgICAgICAgIHRoaXMuZGlzay5zZXRJdGVtKGtleSwgSlNPTi5zdHJpbmdpZnkodmFsdWUpKTtcbiAgICAgICAgICAgIHRoaXMudGFyZ2V0Lm5hbWUgPSBrZXk7XG4gICAgICAgICAgICByZXR1cm4gdGhpcztcbiAgICAgICAgfSxcbiAgICAgICAgYWRkOiBmdW5jdGlvbihldmVudCl7XG4gICAgICAgICAgICB2YXIgaWRlbnRpdHkgPSBldmVudC5pZCA+IDAgPyBldmVudC5pZCA6IERhdGUubm93KCk7XG4gICAgICAgICAgICB2YXIgcmVzdWx0ID0ge1xuICAgICAgICAgICAgICAgIGlkOiBpZGVudGl0eSxcbiAgICAgICAgICAgICAgICB0aXRsZTogZXZlbnQudGl0bGUsXG4gICAgICAgICAgICAgICAgZGVzY3JpcHRpb246IGV2ZW50LmRlc2NyaXB0aW9uLFxuICAgICAgICAgICAgICAgIGRhdGU6IGV2ZW50LmRhdGUsXG4gICAgICAgICAgICAgICAgcGxheWxpc3Q6IGV2ZW50LnBsYXlsaXN0LFxuICAgICAgICAgICAgICAgIHJlcGVhdDoge1xuICAgICAgICAgICAgICAgICAgICBldmVudF9pZDogaWRlbnRpdHksXG4gICAgICAgICAgICAgICAgICAgIGV2ZXJ5RGF5OiBldmVudC5ldmVyeURheSA/IDEgOiAwLFxuICAgICAgICAgICAgICAgICAgICBldmVyeVdlZWs6IGV2ZW50LmV2ZXJ5V2VlayA/IDEgOiAwLFxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH07XG4gICAgICAgICAgICBpZihldmVudC5kYXlzKXtcbiAgICAgICAgICAgICAgICB2YXIgZGF5S2V5cyA9IE9iamVjdC5rZXlzKGV2ZW50LmRheXMpO1xuICAgICAgICAgICAgICAgIGZvcih2YXIgaSA9IGRheUtleXMubGVuZ3RoOyBpLS07KXtcbiAgICAgICAgICAgICAgICAgICAgdmFyIGtleSA9IGRheUtleXNbaV07XG4gICAgICAgICAgICAgICAgICAgIHJlc3VsdC5yZXBlYXRba2V5XSA9IGV2ZW50LmRheXNba2V5XTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICB2YXIgaXNFeGlzdHMgPSBmYWxzZTtcbiAgICAgICAgICAgIHRoaXMudGFyZ2V0Lm9iamVjdC5mb3JFYWNoKGZ1bmN0aW9uKHZhbHVlLCBpLCBhcnIpe1xuICAgICAgICAgICAgICAgIGlmKHZhbHVlLmlkID09IHJlc3VsdC5pZCl7XG4gICAgICAgICAgICAgICAgICAgIGlzRXhpc3RzID0gdHJ1ZTtcbiAgICAgICAgICAgICAgICAgICAgYXJyW2ldID0gcmVzdWx0O1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgaWYoIWlzRXhpc3RzKXtcbiAgICAgICAgICAgICAgICB0aGlzLnRhcmdldC5vYmplY3QucHVzaChyZXN1bHQpO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICByZXR1cm4gdGhpcztcbiAgICAgICAgfSxcbiAgICAgICAgZGVsOiBmdW5jdGlvbihpZCl7XG4gICAgICAgICAgICBmb3IodmFyIGkgaW4gdGhpcy50YXJnZXQub2JqZWN0KXtcbiAgICAgICAgICAgICAgICBpZih0aGlzLnRhcmdldC5vYmplY3RbaV0uaWQgPT0gaWQpXG4gICAgICAgICAgICAgICAgICAgIGRlbGV0ZSB0aGlzLnRhcmdldC5vYmplY3RbaV07XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXR1cm4gdGhpcztcbiAgICAgICAgfSxcbiAgICAgICAgc2F2ZTogZnVuY3Rpb24oKXtcbiAgICAgICAgICAgIHRoaXMuc2V0KCdldmVudHMnLCB0aGlzLnRhcmdldC5vYmplY3QpO1xuICAgICAgICAgICAgdGhpcy5hamF4VXBkYXRlKCk7XG4gICAgICAgIH0sXG4gICAgICAgIHdoZXJlRGF0ZTogZnVuY3Rpb24oZGF0ZSl7XG4gICAgICAgICAgICBpZighZGF0ZSlcbiAgICAgICAgICAgICAgICByZXR1cm4gbnVsbDtcbiAgICAgICAgICAgIGZvcih2YXIgaSBpbiB0aGlzLnRhcmdldC5vYmplY3QpXG4gICAgICAgICAgICAgICAgaWYodGhpcy50YXJnZXQub2JqZWN0W2ldLmRhdGUuc3Vic3RyaW5nKDAsMTApID09IGRhdGUpe1xuICAgICAgICAgICAgICAgICAgICB0aGlzLnRhcmdldC5vYmplY3QgPSBbdGhpcy50YXJnZXQub2JqZWN0W2ldXTtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgdGhpcy50YXJnZXQub2JqZWN0ID0gW107XG4gICAgICAgICAgICByZXR1cm4gdGhpcztcbiAgICAgICAgfSxcbiAgICAgICAgd2hlcmVJZDogZnVuY3Rpb24oaWQpe1xuICAgICAgICAgICAgaWYoIWlkKVxuICAgICAgICAgICAgICAgIHJldHVybiBudWxsO1xuICAgICAgICAgICAgZm9yKHZhciBpIGluIHRoaXMudGFyZ2V0Lm9iamVjdClcbiAgICAgICAgICAgICAgICBpZih0aGlzLnRhcmdldC5vYmplY3RbaV0uaWQgPT0gaWQpe1xuICAgICAgICAgICAgICAgICAgICB0aGlzLnRhcmdldC5vYmplY3QgPSBbdGhpcy50YXJnZXQub2JqZWN0W2ldXTtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgdGhpcy50YXJnZXQub2JqZWN0ID0gW107XG4gICAgICAgICAgICByZXR1cm4gdGhpcztcbiAgICAgICAgfSxcbiAgICAgICAgcmVwZWF0OiBmdW5jdGlvbigpe1xuICAgICAgICAgICAgdGhpcy50YXJnZXQucmVwZWF0ID0gdHJ1ZTtcbiAgICAgICAgICAgIHJldHVybiB0aGlzO1xuICAgICAgICB9LFxuICAgICAgICBnZXRSZW5kZXJlZDogZnVuY3Rpb24ocmFuZ2Upe1xuICAgICAgICAgICAgdmFyIGRhdGVGb3JtYXQgPSAnWVlZWS1NTS1ERCBISDptbSc7XG4gICAgICAgICAgICB0aGlzLnRhcmdldC5yZW5kZXJkID0gW107XG4gICAgICAgICAgICByYW5nZSAvPSAyO1xuXG4gICAgICAgICAgICB0aGlzLnRhcmdldC5vYmplY3QuZm9yRWFjaChmdW5jdGlvbih2YWx1ZSl7XG4gICAgICAgICAgICAgICAgdmFyIGZsYWcgPSB7XG4gICAgICAgICAgICAgICAgICAgIGV2ZXJ5RGF5OiBmYWxzZSxcbiAgICAgICAgICAgICAgICAgICAgZXZlcnlXZWVrOiBmYWxzZVxuICAgICAgICAgICAgICAgIH07XG4gICAgICAgICAgICAgICAgaWYodmFsdWUucmVwZWF0LmV2ZXJ5RGF5KXtcbiAgICAgICAgICAgICAgICAgICAgZmxhZy5ldmVyeURheSA9IHRydWU7XG4gICAgICAgICAgICAgICAgICAgIHZhciBkYXlOb3cgPSBtb21lbnQodmFsdWUuZGF0ZSk7XG4gICAgICAgICAgICAgICAgICAgIGZvcih2YXIgaSA9IC1yYW5nZTsgaSA8IHJhbmdlOyBpKyspe1xuICAgICAgICAgICAgICAgICAgICAgICAgdmFsdWUuZGF0ZSA9IG1vbWVudChkYXlOb3cpLmFkZChpLCAnZGF5cycpLmZvcm1hdChkYXRlRm9ybWF0KTtcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMudGFyZ2V0LnJlbmRlcmQucHVzaCgkLmV4dGVuZCh0cnVlLCB7fSwgdmFsdWUpKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBlbHNlIGlmKHZhbHVlLnJlcGVhdC5ldmVyeVdlZWspe1xuICAgICAgICAgICAgICAgICAgICBmbGFnLmV2ZXJ5V2VlayA9IHRydWU7XG4gICAgICAgICAgICAgICAgICAgIHZhciB3ZWVrUmFuZ2UgPSBNYXRoLmZsb29yKHJhbmdlIC8gNyk7XG4gICAgICAgICAgICAgICAgICAgIHZhciB3ZWVrTm93ID0gbW9tZW50KCkud2VlaygpO1xuICAgICAgICAgICAgICAgICAgICBmb3IodmFyIGkgPSAtd2Vla1JhbmdlOyBpIDwgd2Vla1JhbmdlOyBpKyspe1xuICAgICAgICAgICAgICAgICAgICAgICAgdmFyIHdlZWsgPSBtb21lbnQodmFsdWUuZGF0ZSkud2Vlayh3ZWVrTm93ICsgaSk7XG4gICAgICAgICAgICAgICAgICAgICAgICBmb3IodmFyIGRheSBpbiB2YWx1ZS5yZXBlYXQpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgc3dpdGNoKGRheSl7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNhc2UgXCJtb25cIjpcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY2FzZSBcInR1ZVwiOlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjYXNlIFwid2VkXCI6XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNhc2UgXCJ0aHVcIjpcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY2FzZSBcImZyaVwiOlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjYXNlIFwic2F0XCI6XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNhc2UgXCJzdW5cIjpcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmKHZhbHVlLnJlcGVhdFtkYXldKXtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB2YWx1ZS5kYXRlID0gd2Vlay5kYXkoZGF5KS5mb3JtYXQoZGF0ZUZvcm1hdCk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy50YXJnZXQucmVuZGVyZC5wdXNoKCQuZXh0ZW5kKHRydWUsIHt9LCB2YWx1ZSkpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGlmKCFmbGFnLmV2ZXJ5RGF5ICYmICFmbGFnLmV2ZXJ5V2Vlayl7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMudGFyZ2V0LnJlbmRlcmQucHVzaCgkLmV4dGVuZCh0cnVlLCB7fSwgdmFsdWUpKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgfS5iaW5kKHRoaXMpKTtcbiAgICAgICAgICAgIHJldHVybiB0aGlzLnRhcmdldC5yZW5kZXJkO1xuICAgICAgICB9LFxuICAgICAgICByZXN1bHQ6IGZ1bmN0aW9uKCl7XG4gICAgICAgICAgICBpZighdGhpcy50YXJnZXQucmVwZWF0KVxuICAgICAgICAgICAgICAgIHJldHVybiB0aGlzLnRhcmdldC5vYmplY3Q7XG4gICAgICAgICAgICB2YXIgcmVzdWx0ID0gW107XG4gICAgICAgICAgICBmb3IodmFyIGkgaW4gdGhpcy50YXJnZXQub2JqZWN0KXtcbiAgICAgICAgICAgICAgICB2YXIgcmVwZWF0S2V5cyA9IE9iamVjdC5rZXlzKHRoaXMudGFyZ2V0Lm9iamVjdFtpXS5yZXBlYXQpLFxuICAgICAgICAgICAgICAgICAgICBkYXlzID0ge30sXG4gICAgICAgICAgICAgICAgICAgIHJlcGVhdCA9IHt9LFxuICAgICAgICAgICAgICAgICAgICBrZXkgPSAnJztcbiAgICAgICAgICAgICAgICBmb3IodmFyIHIgPSByZXBlYXRLZXlzLmxlbmd0aDsgci0tOyl7XG4gICAgICAgICAgICAgICAgICAgIGtleSA9IHJlcGVhdEtleXNbcl07XG4gICAgICAgICAgICAgICAgICAgIHN3aXRjaChrZXkpe1xuICAgICAgICAgICAgICAgICAgICAgICAgY2FzZSBcIm1vblwiOlxuICAgICAgICAgICAgICAgICAgICAgICAgY2FzZSBcInR1ZVwiOlxuICAgICAgICAgICAgICAgICAgICAgICAgY2FzZSBcIndlZFwiOlxuICAgICAgICAgICAgICAgICAgICAgICAgY2FzZSBcInRodVwiOlxuICAgICAgICAgICAgICAgICAgICAgICAgY2FzZSBcImZyaVwiOlxuICAgICAgICAgICAgICAgICAgICAgICAgY2FzZSBcInNhdFwiOlxuICAgICAgICAgICAgICAgICAgICAgICAgY2FzZSBcInN1blwiOlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRheXNba2V5XSA9IHRoaXMudGFyZ2V0Lm9iamVjdFtpXS5yZXBlYXRba2V5XTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICAgICAgICAgIGRlZmF1bHQ6XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcmVwZWF0W2tleV0gPSB0aGlzLnRhcmdldC5vYmplY3RbaV0ucmVwZWF0W2tleV07XG4gICAgICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICByZXBlYXQuZGF5cyA9IGRheXM7XG4gICAgICAgICAgICAgICAgcmVzdWx0LnB1c2gocmVwZWF0KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJldHVybiByZXN1bHQ7XG4gICAgICAgIH0sXG4gICAgICAgIGFqYXhVcGRhdGU6IGZ1bmN0aW9uKCl7XG4gICAgICAgICAgICB2YXIgYWpheE9wdGlvbnMgPSB7XG4gICAgICAgICAgICAgICAgdHlwZTogXCJQT1NUXCIsXG4gICAgICAgICAgICAgICAgY2FjaGU6IGZhbHNlLFxuICAgICAgICAgICAgICAgIGhlYWRlcnM6IHtcbiAgICAgICAgICAgICAgICAgICAgJ1gtQ1NSRi1UT0tFTic6ICQoJ21ldGFbbmFtZT1cImNzcmYtdG9rZW5cIl0nKS5hdHRyKCdjb250ZW50JylcbiAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgIHN1Y2Nlc3M6IGZ1bmN0aW9uKHJlc3BvbnNlKXtcbiAgICAgICAgICAgICAgICAgICAgY29uc29sZS5sb2coJ3N1Y2Nlc3MnLCByZXNwb25zZSk7XG4gICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICBlcnJvcjogZnVuY3Rpb24ocmVzcG9uc2Upe1xuICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmxvZygnZXJyb3InLCByZXNwb25zZSk7XG5cbiAgICAgICAgICAgICAgICAgICAgJChcImJvZHlcIikuaHRtbChyZXNwb25zZS5yZXNwb25zZVRleHQpXG4gICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICBkYXRhOiB7XG4gICAgICAgICAgICAgICAgICAgIGV2ZW50czogdGhpcy5nZXQoJ2V2ZW50cycpLnRhcmdldC5vYmplY3RcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9O1xuXG4gICAgICAgICAgICAkLmFqYXgoJ3NjaGVkdWxlL2V2ZW50cy91cGRhdGUnLCBhamF4T3B0aW9ucyk7XG5cbiAgICAgICAgfVxuICAgIH07XG5cbiAgICAvL2V2ZW50c1xuICAgIHZhciBvbkV2ZW50c1N1Y2Nlc3MgPSBmdW5jdGlvbihyZXNwb25zZSl7XG4gICAgICAgICAgICAkKFwiI2ZvdW50YWluVGV4dEdcIikuaGlkZSgpO1xuICAgICAgICAgICAgc3RvcmFnZS5zZXQoJ2V2ZW50cycsIHJlc3BvbnNlLmV2ZW50cyk7XG4gICAgICAgICAgICBzdG9yYWdlLnNldCgncGxheWxpc3RzJywgcmVzcG9uc2UucGxheWxpc3RzKTtcbiAgICAgICAgICAgIHZhciBldmVudHMgPSBzdG9yYWdlLmdldCgnZXZlbnRzJykuZ2V0UmVuZGVyZWQoNjApO1xuICAgICAgICAgICAgdmFyIHBsYXlsaXN0cyA9IHN0b3JhZ2UuZ2V0KCdwbGF5bGlzdHMnKS5yZXN1bHQoKTtcbiAgICAgICAgICAgIGluaXRDYWxlbmRhcihldmVudHMpO1xuICAgICAgICAgICAgaW5pdFBsYXlsaXN0KHBsYXlsaXN0cyk7XG4gICAgICAgIH0sXG4gICAgICAgIG9uRXZlbnRzRXJyb3IgPSBmdW5jdGlvbiAocmVzcG9uc2Upe1xuICAgICAgICAgICAgJChcIiNmb3VudGFpblRleHRHXCIpLmhpZGUoKTtcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKHJlc3BvbnNlKTtcbiAgICAgICAgfTtcbiAgICB2YXIgcmVxdWVzdE9wdGlvbnMgPSB7XG4gICAgICAgIHR5cGU6IFwiR0VUXCIsXG4gICAgICAgIGNhY2hlOiBmYWxzZSxcbiAgICAgICAgc3VjY2Vzczogb25FdmVudHNTdWNjZXNzLFxuICAgICAgICBlcnJvcjogb25FdmVudHNFcnJvclxuICAgIH07XG4gICAgJC5hamF4KCdzY2hlZHVsZS9ldmVudHMnLCByZXF1ZXN0T3B0aW9ucyk7XG4gICAgLy8hZXZlbnRzXG5cbiAgICAvL2luaXQgdmFyaWFibGVzXG4gICAgdmFyIGNsbmRyID0ge307XG4gICAgdmFyIGRheUV2ZW50c1RlbXBsYXRlID0gJCgnI2RheS1ldmVudHMnKS5odG1sKCk7XG5cbiAgICB2YXIgbW9kYWwgPSAkKFwiI21vZGFsXCIpO1xuICAgIHZhciBkYXRldGltZVBpY2tlckluaXQgPSBmdW5jdGlvbihvcHRpb25zLCBpZCl7XG4gICAgICAgIC8vRGF0ZSBpbml0XG4gICAgICAgIHZhciBkdFBpY2tlciA9ICQoJyNkYXRldGltZXBpY2tlcicpLFxuICAgICAgICAgICAgY2hlY2tPcHRpb25zID0ge1xuICAgICAgICAgICAgICAgIGNoZWNrYm94Q2xhc3M6ICdpY2hlY2tib3hfc3F1YXJlLWJsdWUnLFxuICAgICAgICAgICAgICAgIHJhZGlvQ2xhc3M6ICdpcmFkaW9fc3F1YXJlLWJsdWUnLFxuICAgICAgICAgICAgICAgIGluY3JlYXNlQXJlYTogJzIwJScsXG4gICAgICAgICAgICB9O1xuICAgICAgICAkKCcjcmVwZWF0LWRheScpLmlDaGVjaygndW5jaGVjaycpXG4gICAgICAgICAgICAuaUNoZWNrKGNoZWNrT3B0aW9ucykub24oXCJpZlVuY2hlY2tlZFwiLCBmdW5jdGlvbigpe1xuICAgICAgICAgICAgICAgIGR0UGlja2VyXG4gICAgICAgICAgICAgICAgICAgIC5kYXRldGltZXBpY2tlcignZGVzdHJveScpXG4gICAgICAgICAgICAgICAgICAgIC5kYXRldGltZXBpY2tlcigpO1xuICAgICAgICAgICAgICAgICQoXCIjcmVwZWF0LW1vbnRoXCIpLmlDaGVjaygnZW5hYmxlJyk7XG4gICAgICAgICAgICAgICAgcmVwZWF0T24uaUNoZWNrKCdlbmFibGUnKTtcbiAgICAgICAgICAgIH0pLm9uKFwiaWZDaGVja2VkXCIsIGZ1bmN0aW9uKCl7XG4gICAgICAgICAgICAgICAgZHRQaWNrZXJcbiAgICAgICAgICAgICAgICAgICAgLmRhdGV0aW1lcGlja2VyKCdkZXN0cm95JylcbiAgICAgICAgICAgICAgICAgICAgLmRhdGV0aW1lcGlja2VyKHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGRhdGVwaWNrZXI6ZmFsc2UsXG4gICAgICAgICAgICAgICAgICAgICAgICBmb3JtYXQ6J0g6aSdcbiAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgJChcIiNyZXBlYXQtbW9udGhcIikuaUNoZWNrKCdkaXNhYmxlJyk7XG4gICAgICAgICAgICAgICAgcmVwZWF0T24uaUNoZWNrKCdkaXNhYmxlJyk7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgZHRQaWNrZXJcbiAgICAgICAgICAgIC5kYXRldGltZXBpY2tlcignZGVzdHJveScpXG4gICAgICAgICAgICAuZGF0ZXRpbWVwaWNrZXIob3B0aW9ucyk7XG5cbiAgICAgICAgLy9SZXBlYXQgaW5pdFxuICAgICAgICB2YXIgcmVwZWF0T24gPSAkKFwiI3JlcGVhdC1vblwiKTtcbiAgICAgICAgcmVwZWF0T24uaGlkZSgpO1xuICAgICAgICAkKCcjcmVwZWF0LW1vbnRoJykuaUNoZWNrKCd1bmNoZWNrJylcbiAgICAgICAgICAgIC5pQ2hlY2soY2hlY2tPcHRpb25zKVxuICAgICAgICAgICAgLm9uKFwiaWZVbmNoZWNrZWRcIiwgZnVuY3Rpb24oKXtcbiAgICAgICAgICAgICAgICByZXBlYXRPbi5oaWRlKCk7XG4gICAgICAgICAgICB9KVxuICAgICAgICAgICAgLm9uKFwiaWZDaGVja2VkXCIsIGZ1bmN0aW9uKCl7XG4gICAgICAgICAgICAgICAgJChcIltpZCo9J3JlcGVhdC1vbi0nXVwiKVxuICAgICAgICAgICAgICAgICAgICAuaUNoZWNrKGNoZWNrT3B0aW9ucyk7XG4gICAgICAgICAgICAgICAgcmVwZWF0T24uc2hvdygpO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgIC8vU2V0IGNoZWNrZWQgZGF5c1xuICAgICAgICBpZihpZCl7XG4gICAgICAgICAgICAoZnVuY3Rpb24oKXtcbiAgICAgICAgICAgICAgICB2YXIgcmVwZWF0cyA9IHN0b3JhZ2UuZ2V0KCdldmVudHMnKS53aGVyZUlkKGlkKS5yZXBlYXQoKS5yZXN1bHQoKVswXTtcbiAgICAgICAgICAgICAgICBpZihyZXBlYXRzLmV2ZXJ5V2Vlayl7XG4gICAgICAgICAgICAgICAgICAgICQoJyNyZXBlYXQtbW9udGgnKS5pQ2hlY2soJ2NoZWNrJyk7XG4gICAgICAgICAgICAgICAgICAgIGZvcih2YXIgaSBpbiByZXBlYXRzLmRheXMpe1xuICAgICAgICAgICAgICAgICAgICAgICAgJChcIiNyZXBlYXQtb24tXCIgKyBpKS5pQ2hlY2socmVwZWF0cy5kYXlzW2ldID8gJ2NoZWNrJzogJ3VuY2hlY2snKVxuICAgICAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgaWYocmVwZWF0cy5ldmVyeURheSl7XG4gICAgICAgICAgICAgICAgICAgICQoJyNyZXBlYXQtZGF5JykuaUNoZWNrKCdjaGVjaycpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0pKCk7XG4gICAgICAgIH1cbiAgICAgICAgLy8hY2hlY2tlZCBkYXlzXG4gICAgICAgIG1vZGFsLm1vZGFsKCdzaG93Jyk7XG4gICAgfTtcbiAgICAvL29uIFNhdmluZyBjaGFuZ2VzXG4gICAgdmFyIHNhdmVDaGFuZ2VzID0gZnVuY3Rpb24oaWQpe1xuICAgICAgICB2YXIgdGl0bGUgPSAkLnRyaW0oJChcIiNUaXRsZVwiKS52YWwoKSksXG4gICAgICAgICAgICBkZXNjcmlwdGlvbiA9ICQudHJpbSgkKFwiI0Rlc2NyaXB0aW9uXCIpLnZhbCgpKSxcbiAgICAgICAgICAgIGlzRGF5UmVwZWF0ID0gJChcIiNyZXBlYXQtZGF5XCIpLnByb3AoXCJjaGVja2VkXCIpLFxuICAgICAgICAgICAgZGF0ZVRpbWUgPSAkKFwiI2RhdGV0aW1lcGlja2VyXCIpLnZhbCgpO1xuXG4gICAgICAgIGlmKCF0aXRsZSl7XG4gICAgICAgICAgICAkKFwiI1RpdGxlXCIpLnRvb2x0aXAoe1xuICAgICAgICAgICAgICAgIHRyaWdnZXI6J21hbnVhbCdcbiAgICAgICAgICAgIH0pLnRvb2x0aXAoJ3Nob3cnKTtcbiAgICAgICAgICAgIHNldFRpbWVvdXQoZnVuY3Rpb24oKXtcbiAgICAgICAgICAgICAgICAkKFwiI1RpdGxlXCIpLnRvb2x0aXAoJ2Rlc3Ryb3knKTtcbiAgICAgICAgICAgIH0sIDIwMDApO1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG4gICAgICAgIGlmKCFpc0RheVJlcGVhdCl7XG4gICAgICAgICAgICB2YXIgaXNXZWVrUmVwZWF0ID0gICQoXCIjcmVwZWF0LW1vbnRoXCIpLnByb3AoXCJjaGVja2VkXCIpO1xuICAgICAgICAgICAgaWYoaXNXZWVrUmVwZWF0KXtcbiAgICAgICAgICAgICAgICB2YXIgZGF5c1JlcGVhdCA9IHt9O1xuICAgICAgICAgICAgICAgICQoXCJbaWQqPSdyZXBlYXQtb24tJ11cIikuZWFjaChmdW5jdGlvbiAoaSwgb2JqKSB7XG4gICAgICAgICAgICAgICAgICAgIGRheXNSZXBlYXRbJChvYmopLmF0dHIoJ2lkJykuc3Vic3RyaW5nKDEwKV0gPSAkKG9iaikucHJvcChcImNoZWNrZWRcIikgPyAxIDogMDtcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIHN0b3JhZ2UuZ2V0KCdldmVudHMnKS5hZGQoe1xuICAgICAgICAgICAgaWQ6IGlkIHx8IC0xLFxuICAgICAgICAgICAgdGl0bGU6IHRpdGxlLFxuICAgICAgICAgICAgZGF0ZSA6IGlzRGF5UmVwZWF0ID8gbW9tZW50KGRhdGVUaW1lLCBcIkhIOm1tXCIpLmZvcm1hdChcIllZWVktTU0tREQgSEg6bW1cIikgOiBkYXRlVGltZSxcbiAgICAgICAgICAgIHBsYXlsaXN0OiAkKFwiI3BsYXlsaXN0IG9wdGlvbjpzZWxlY3RlZFwiKS52YWwoKSxcbiAgICAgICAgICAgIGRlc2NyaXB0aW9uOiBkZXNjcmlwdGlvbixcbiAgICAgICAgICAgIGV2ZXJ5RGF5OiBpc0RheVJlcGVhdCxcbiAgICAgICAgICAgIGV2ZXJ5V2VlazogaXNXZWVrUmVwZWF0LFxuICAgICAgICAgICAgZGF5czogZGF5c1JlcGVhdFxuICAgICAgICB9KS5zYXZlKCk7XG4gICAgICAgIFxuICAgICAgICBjbG5kci5zZXRFdmVudHMoc3RvcmFnZS5nZXQoJ2V2ZW50cycpLmdldFJlbmRlcmVkKDYwKSk7XG4gICAgICAgIG1vZGFsLm1vZGFsKCdoaWRlJyk7XG4gICAgfTtcblxuICAgIC8vSW5pdCBwbGF5bGlzdFxuICAgIHZhciBpbml0UGxheWxpc3QgPSBmdW5jdGlvbiAocGxheWxpc3Qpe1xuICAgICAgICB2YXIgbGlzdCA9ICQoXCIjcGxheWxpc3RcIik7XG4gICAgICAgIHBsYXlsaXN0LmZvckVhY2goZnVuY3Rpb24odmFsKXtcbiAgICAgICAgICAgIGxpc3QuYXBwZW5kKFwiPG9wdGlvbiB2YWx1ZT0nXCIrdmFsLmlkK1wiJz5cIit2YWwubmFtZStcIjwvb3B0aW9uPlwiKTtcbiAgICAgICAgfSk7XG4gICAgICAgIGxpc3Quc2VsZWN0cGlja2VyKCdyZWZyZXNoJyk7XG4gICAgfTtcbiAgICAvL0luaXQgY2FsZW5kYXJcbiAgICB2YXIgaW5pdENhbGVuZGFyID0gZnVuY3Rpb24oZXZlbnRzKXtcbiAgICAgICAgY2xuZHIgPSAkKCcjZnVsbC1jbG5kcicpLmNsbmRyKHtcbiAgICAgICAgICAgIHRlbXBsYXRlOiAkKCcjZnVsbC1jbG5kci10ZW1wbGF0ZScpLmh0bWwoKSxcbiAgICAgICAgICAgIGV2ZW50czogZXZlbnRzLFxuICAgICAgICAgICAgY2xpY2tFdmVudHM6IHtcbiAgICAgICAgICAgICAgICBjbGljazogZnVuY3Rpb24gKHRhcmdldCkge1xuICAgICAgICAgICAgICAgICAgICB2YXIgdGVtcGxhdGUgPSBfLnRlbXBsYXRlKGRheUV2ZW50c1RlbXBsYXRlKTtcbiAgICAgICAgICAgICAgICAgICAgJChcIi5kYXktZXZlbnRzXCIpXG4gICAgICAgICAgICAgICAgICAgICAgICAubUN1c3RvbVNjcm9sbGJhcihcImRlc3Ryb3lcIilcbiAgICAgICAgICAgICAgICAgICAgICAgIC5odG1sKHRlbXBsYXRlKHtldmVudHNUaGlzRGF5OiB0YXJnZXQuZXZlbnRzfSkpXG4gICAgICAgICAgICAgICAgICAgICAgICAuaGVpZ2h0KCAkKFwiLmNsbmRyLWdyaWQgLmRheXNcIikuaGVpZ2h0KCkgLSAkKFwiLmNsbmRyLWdyaWQgLmRheXMtb2YtdGhlLXdlZWtcIikuaGVpZ2h0KCkgKVxuICAgICAgICAgICAgICAgICAgICAgICAgLm1DdXN0b21TY3JvbGxiYXIoe1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHNjcm9sbEJ1dHRvbnM6e2VuYWJsZTp0cnVlfSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aGVtZTpcIm1pbmltYWwtZGFya1wiXG4gICAgICAgICAgICAgICAgICAgICAgICB9KTtcblxuICAgICAgICAgICAgICAgICAgICAgICAgLy9UcmFuc2xhdGVYIGl0ZW0gaG92ZXIgbWVudVxuICAgICAgICAgICAgICAgICAgICAgICAgJChcIi5ldmVudC1pdGVtLWhvdmVyXCIpLmVhY2goZnVuY3Rpb24oaSwgb2JqKXtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAkKG9iaikuY3NzKFwidHJhbnNmb3JtXCIsIFwidHJhbnNsYXRlWChcIiArICQob2JqKS53aWR0aCgpICsgXCJweClcIik7XG4gICAgICAgICAgICAgICAgICAgICAgICB9KTtcblxuXG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIGZvcmNlU2l4Um93czogdHJ1ZSxcbiAgICAgICAgICAgIG11bHRpRGF5RXZlbnRzOiB7XG4gICAgICAgICAgICAgICAgc2luZ2xlRGF5OiAnZGF0ZScsXG4gICAgICAgICAgICAgICAgZW5kRGF0ZTogJ2VuZERhdGUnLFxuICAgICAgICAgICAgICAgIHN0YXJ0RGF0ZTogJ3N0YXJ0RGF0ZSdcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICBzaG93QWRqYWNlbnRNb250aHM6IHRydWUsXG4gICAgICAgICAgICBhZGphY2VudERheXNDaGFuZ2VNb250aDogZmFsc2UsXG4gICAgICAgICAgICB0cmFja1NlbGVjdGVkRGF0ZTogdHJ1ZSxcbiAgICAgICAgICAgIGRheXNPZlRoZVdlZWs6IChmdW5jdGlvbigpe1xuICAgICAgICAgICAgICAgIHZhciByZXN1bHQgPSBbXTtcbiAgICAgICAgICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IDc7IGkrKykge1xuICAgICAgICAgICAgICAgICAgICByZXN1bHQucHVzaChtb21lbnQoKS53ZWVrZGF5KGkpLmZvcm1hdCgnZGRkJykpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICByZXR1cm4gcmVzdWx0O1xuICAgICAgICAgICAgfSkoKSxcbiAgICAgICAgICAgIGRvbmVSZW5kZXJpbmc6IGZ1bmN0aW9uKCl7IC8vZG9uZVJlbmRlcmluZ1xuICAgICAgICAgICAgICAgICQoXCIuZXZlbnQtaXRlbXNcIilcbiAgICAgICAgICAgICAgICAgICAgLmhlaWdodCggJChcIi5jbG5kci1ncmlkIC5kYXlzXCIpLmhlaWdodCgpIC0gJChcIi5jbG5kci1ncmlkIC5kYXlzLW9mLXRoZS13ZWVrXCIpLmhlaWdodCgpIClcbiAgICAgICAgICAgICAgICAgICAgLm1DdXN0b21TY3JvbGxiYXIoe1xuICAgICAgICAgICAgICAgICAgICAgICAgc2Nyb2xsQnV0dG9uczp7ZW5hYmxlOnRydWV9LFxuICAgICAgICAgICAgICAgICAgICAgICAgdGhlbWU6XCJtaW5pbWFsLWRhcmtcIlxuICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICB2YXIgY2FsZW5kYXIgPSAkKFwiI2Z1bGwtY2xuZHJcIik7XG4gICAgICAgICAgICAgICAgaWYoY2FsZW5kYXIuZmluZChcIi50b2RheVwiKS5sZW5ndGggPiAwKVxuICAgICAgICAgICAgICAgICAgICBjYWxlbmRhci5maW5kKFwiLnRvZGF5XCIpLmNsaWNrKCk7XG4gICAgICAgICAgICAgICAgZWxzZVxuICAgICAgICAgICAgICAgICAgICBjYWxlbmRhci5maW5kKFwiLmRheVwiKS5lcSgwKS5jbGljaygpO1xuXG4gICAgICAgICAgICAgICAgdmFyIGV2ZW50TGlzdGluZ1RpdGxlID0gJChcIi5ldmVudC1saXN0aW5nLXRpdGxlXCIpO1xuICAgICAgICAgICAgICAgIC8vSW5pdCBibG9jayBPcGVuL0Nsb3NlIGV2ZW50XG4gICAgICAgICAgICAgICAgZXZlbnRMaXN0aW5nVGl0bGUub24oXCJjbGlja1wiLCBcIi5nbHlwaGljb24tY2hldnJvbi11cCwgLmdseXBoaWNvbi1jaGV2cm9uLWRvd25cIiwgZnVuY3Rpb24oKXtcbiAgICAgICAgICAgICAgICAgICAgdmFyIGVsID0ge307XG4gICAgICAgICAgICAgICAgICAgIHZhciBibG9jayA9IHtcbiAgICAgICAgICAgICAgICAgICAgICAgIG9wZW46IFwiZ2x5cGhpY29uLWNoZXZyb24tdXBcIixcbiAgICAgICAgICAgICAgICAgICAgICAgIGNsb3NlOiBcImdseXBoaWNvbi1jaGV2cm9uLWRvd25cIlxuICAgICAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgICAgICAgICB2YXIgJHRoaXMgPSAkKHRoaXMpO1xuICAgICAgICAgICAgICAgICAgICBpZigkdGhpcy5wYXJlbnQoKS5oYXNDbGFzcyhcIm1vbnRoLXRpdGxlXCIpKVxuICAgICAgICAgICAgICAgICAgICAgICAgZWwgPSAkKFwiLmRheS10aXRsZSBbY2xhc3MgKj1nbHlwaGljb24tY2hldnJvbl1cIikuZXEoMCk7XG4gICAgICAgICAgICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgICAgICAgICAgICAgIGVsID0gJChcIi5tb250aC10aXRsZSBbY2xhc3MgKj1nbHlwaGljb24tY2hldnJvbl1cIikuZXEoMCk7XG5cbiAgICAgICAgICAgICAgICAgICAgaWYoZWwuaGFzQ2xhc3MoYmxvY2sub3BlbikpXG4gICAgICAgICAgICAgICAgICAgICAgICBlbC5yZW1vdmVDbGFzcyhibG9jay5vcGVuKS5hZGRDbGFzcyhibG9jay5jbG9zZSk7XG4gICAgICAgICAgICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgICAgICAgICAgICAgIGVsLnJlbW92ZUNsYXNzKGJsb2NrLmNsb3NlKS5hZGRDbGFzcyhibG9jay5vcGVuKTtcblxuICAgICAgICAgICAgICAgICAgICBpZigkdGhpcy5oYXNDbGFzcyhibG9jay5vcGVuKSlcbiAgICAgICAgICAgICAgICAgICAgICAgICR0aGlzLnJlbW92ZUNsYXNzKGJsb2NrLm9wZW4pLmFkZENsYXNzKGJsb2NrLmNsb3NlKTtcbiAgICAgICAgICAgICAgICAgICAgZWxzZVxuICAgICAgICAgICAgICAgICAgICAgICAgJHRoaXMucmVtb3ZlQ2xhc3MoYmxvY2suY2xvc2UpLmFkZENsYXNzKGJsb2NrLm9wZW4pO1xuXG4gICAgICAgICAgICAgICAgICAgICQoXCIuZXZlbnQtaXRlbXMsIC5kYXktZXZlbnRzXCIpLnNsaWRlVG9nZ2xlKCk7XG5cbiAgICAgICAgICAgICAgICAgICAgJChcIi5ldmVudC1pdGVtLWhvdmVyXCIpLmVhY2goZnVuY3Rpb24oaSwgb2JqKXtcbiAgICAgICAgICAgICAgICAgICAgICAgICQob2JqKS5jc3MoXCJ0cmFuc2Zvcm1cIiwgXCJ0cmFuc2xhdGVYKFwiICsgJChvYmopLndpZHRoKCkgKyBcInB4KVwiKTtcbiAgICAgICAgICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgICAgICAgICB9KTtcblxuXG4gICAgICAgICAgICAgICAgdmFyIGRhdGV0aW1lcGlja2VyT3B0aW9ucyA9IHtcbiAgICAgICAgICAgICAgICAgICAgc3RlcDogMzBcbiAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgICAgIHZhciBpc1RpcE9wZW4gPSBmYWxzZTtcbiAgICAgICAgICAgICAgICAkKFwiLmV2ZW50LWxpc3RpbmdcIikub24oJ2NsaWNrJywgJy5ldmVudC1pdGVtJywgZnVuY3Rpb24oZSl7XG4gICAgICAgICAgICAgICAgICAgIGUuc3RvcFByb3BhZ2F0aW9uKCk7XG4gICAgICAgICAgICAgICAgICAgIHZhciBob3ZlciA9ICQodGhpcykuZmluZChcIi5ldmVudC1pdGVtLWhvdmVyXCIpO1xuICAgICAgICAgICAgICAgICAgICBpZihpc1RpcE9wZW4pXG4gICAgICAgICAgICAgICAgICAgICAgICBob3Zlci5jc3MoJ3RyYW5zZm9ybScsICd0cmFuc2xhdGVYKCcrIGhvdmVyLndpZHRoKCkgKydweCknKTtcbiAgICAgICAgICAgICAgICAgICAgZWxzZVxuICAgICAgICAgICAgICAgICAgICAgICAgaG92ZXIuY3NzKCd0cmFuc2Zvcm0nLCAndHJhbnNsYXRlWCgwcHgpJyk7XG4gICAgICAgICAgICAgICAgICAgIGlzVGlwT3BlbiA9ICFpc1RpcE9wZW47XG4gICAgICAgICAgICAgICAgfSlcbiAgICAgICAgICAgICAgICAvL0luaXQgbW9kYWwgd2luZG93IFwiRWRpdCBldmVudFwiXG4gICAgICAgICAgICAgICAgICAgIC5vbignY2xpY2snLCAnLmV2ZW50LWl0ZW0gc3BhbjpmaXJzdC1jaGlsZCcsIGZ1bmN0aW9uKGUpe1xuICAgICAgICAgICAgICAgICAgICAgICAgZS5zdG9wUHJvcGFnYXRpb24oKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIHZhciAkdGhpcyA9ICQodGhpcykucGFyZW50KCkucGFyZW50KCk7XG4gICAgICAgICAgICAgICAgICAgICAgICBtb2RhbC5maW5kKFwiZm9ybVwiKS5nZXQoMCkucmVzZXQoKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIG1vZGFsLmZpbmQoXCIubW9kYWwtdGl0bGVcIikudGV4dChcIkVkaXQgZXZlbnRcIik7XG5cbiAgICAgICAgICAgICAgICAgICAgICAgIGRhdGV0aW1lcGlja2VyT3B0aW9ucy52YWx1ZSA9ICR0aGlzLmZpbmQoXCIuZXZlbnQtaXRlbS10aW1lXCIpLmF0dHIoXCJkYXRhLWRhdGV0aW1lXCIpO1xuICAgICAgICAgICAgICAgICAgICAgICAgbW9kYWwuZmluZChcIiNUaXRsZVwiKS52YWwoJHRoaXMuZmluZChcIi5ldmVudC1pdGVtLW5hbWVcIikudGV4dCgpKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIG1vZGFsLmZpbmQoXCIjRGVzY3JpcHRpb25cIikudmFsKCR0aGlzLmZpbmQoXCIuZXZlbnQtaXRlbS1sb2NhdGlvblwiKS50ZXh0KCkpO1xuXG4gICAgICAgICAgICAgICAgICAgICAgICBkYXRldGltZVBpY2tlckluaXQoZGF0ZXRpbWVwaWNrZXJPcHRpb25zLCAkdGhpcy5hdHRyKCdkYXRhLWlkJykpO1xuICAgICAgICAgICAgICAgICAgICAgICAgbW9kYWwuZmluZChcIi5zYXZlLWNoYW5nZXNcIikub2ZmKFwiY2xpY2tcIikub24oJ2NsaWNrJywgc2F2ZUNoYW5nZXMuYmluZChudWxsLCR0aGlzLmF0dHIoJ2RhdGEtaWQnKSkpO1xuICAgICAgICAgICAgICAgICAgICAgICAgbW9kYWwuZmluZChcIi5kZWxldGUtZXZlbnRcIikub2ZmKFwiY2xpY2tcIikub24oJ2NsaWNrJywgZnVuY3Rpb24oKXtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAkLmdldChcInNjaGVkdWxlL2V2ZW50cy9kZWxldGUvXCIgKyAkdGhpcy5hdHRyKCdkYXRhLWlkJykpLmRvbmUoZnVuY3Rpb24oKXtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY2xuZHIuc2V0RXZlbnRzKHN0b3JhZ2UuZ2V0KFwiZXZlbnRzXCIpLmRlbChwYXJzZUludCgkdGhpcy5hdHRyKCdkYXRhLWlkJykpKS5nZXRSZW5kZXJlZCg2MCkpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBtb2RhbC5tb2RhbChcImhpZGVcIik7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICAgICAgICAgIG1vZGFsLmZpbmQoXCIuZGVsZXRlLWV2ZW50XCIpLnNob3coKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICQoXCIjcGxheWxpc3RcIikuc2VsZWN0cGlja2VyKFwidmFsXCIsICR0aGlzLmF0dHIoXCJkYXRhLXBsYXlsaXN0XCIpIHx8IDApO1xuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgICQoXCIuZXZlbnQtbGlzdGluZ1wiKS5vbignY2xpY2snLCAnLmV2ZW50LWl0ZW0gLmV2ZW50LWl0ZW0taG92ZXIgc3BhbjpsYXN0LWNoaWxkJywgZnVuY3Rpb24oZSl7XG4gICAgICAgICAgICAgICAgICAgIGUuc3RvcFByb3BhZ2F0aW9uKCk7XG4gICAgICAgICAgICAgICAgICAgICQodGhpcykudG9nZ2xlQ2xhc3MoJ3RleHQtaW5mbycpO1xuICAgICAgICAgICAgICAgICAgICB2YXIgJHRoaXMgPSAkKHRoaXMpLnBhcmVudCgpLnBhcmVudCgpO1xuICAgICAgICAgICAgICAgICAgICB2YXIgaWQgPSAkdGhpcy5hdHRyKCdkYXRhLWlkJyk7XG4gICAgICAgICAgICAgICAgICAgIHZhciBtYXRjaCA9ICQoJy5kYXlzIFtkYXRhLWlkKj1cIicrIGlkICsnXCJdJyk7XG4gICAgICAgICAgICAgICAgICAgIGlmKCEkKHRoaXMpLmhhc0NsYXNzKCd0ZXh0LWluZm8nKSl7XG4gICAgICAgICAgICAgICAgICAgICAgICBtYXRjaC5jc3MoXCJiYWNrZ3JvdW5kLWNvbG9yXCIsIFwiI2VlZVwiKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICB2YXIgY29sb3IgPSAoZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICB2YXIgbGV0dGVycyA9ICdCQ0RFRicuc3BsaXQoJycpO1xuICAgICAgICAgICAgICAgICAgICAgICAgdmFyIGNvbG9yID0gJyMnO1xuICAgICAgICAgICAgICAgICAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCA2OyBpKysgKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY29sb3IgKz0gbGV0dGVyc1tNYXRoLmZsb29yKE1hdGgucmFuZG9tKCkgKiBsZXR0ZXJzLmxlbmd0aCldO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGNvbG9yO1xuICAgICAgICAgICAgICAgICAgICB9KSgpO1xuICAgICAgICAgICAgICAgICAgICBtYXRjaC5jc3MoXCJiYWNrZ3JvdW5kLWNvbG9yXCIsIGNvbG9yKTtcbiAgICAgICAgICAgICAgICB9KTtcblxuXG5cbiAgICAgICAgICAgICAgICAvL0luaXQgbW9kYWwgd2luZG93IFwiQWRkIGV2ZW50XCJcbiAgICAgICAgICAgICAgICBldmVudExpc3RpbmdUaXRsZS5vbihcImNsaWNrXCIsIFwiLmdseXBoaWNvbi1wbHVzXCIsIGZ1bmN0aW9uKCl7XG4gICAgICAgICAgICAgICAgICAgIG1vZGFsLmZpbmQoXCJmb3JtXCIpLmdldCgwKS5yZXNldCgpO1xuICAgICAgICAgICAgICAgICAgICBtb2RhbC5maW5kKFwiLm1vZGFsLXRpdGxlXCIpLnRleHQoXCJBZGQgZXZlbnRcIik7XG5cbiAgICAgICAgICAgICAgICAgICAgaWYoJCh0aGlzKS5wYXJlbnQoKS5oYXNDbGFzcyhcImRheS10aXRsZVwiKSl7XG4gICAgICAgICAgICAgICAgICAgICAgICBkYXRldGltZXBpY2tlck9wdGlvbnMudmFsdWUgPSAoZnVuY3Rpb24oKXtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB2YXIgdGltZSA9IFwiIFwiICsgbW9tZW50KCkuZm9ybWF0KFwiSEg6bW1cIik7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdmFyIGVsID0gJChjbG5kci5lbGVtZW50KS5maW5kKFwiLnNlbGVjdGVkXCIpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmKGVsLmxlbmd0aCA+IDApXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBlbC5hdHRyKFwiZGF0YS1kYXRlXCIpICsgdGltZTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBlbHNlXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiAkKGNsbmRyLmVsZW1lbnQpLmZpbmQoXCJ0b2RheVwiKS5hdHRyKFwiZGF0YS1kYXRlXCIpICsgdGltZTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH0pKCk7XG4gICAgICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgICAgICBkYXRldGltZVBpY2tlckluaXQoZGF0ZXRpbWVwaWNrZXJPcHRpb25zKTtcbiAgICAgICAgICAgICAgICAgICAgbW9kYWwuZmluZChcIi5kZWxldGUtZXZlbnRcIikuaGlkZSgpO1xuICAgICAgICAgICAgICAgICAgICBtb2RhbC5maW5kKFwiLnNhdmUtY2hhbmdlc1wiKS5vZmYoXCJjbGlja1wiKS5vbignY2xpY2snLCBzYXZlQ2hhbmdlcy5iaW5kKG51bGwsJCh0aGlzKS5hdHRyKCdkYXRhLWRhdGUnKSkpO1xuICAgICAgICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgICAgICAgLy8gdmFyIGNhbGVuZGFyID0gJChcIi5jbG5kclwiKTtcbiAgICAgICAgICAgICAgICBjYWxlbmRhci5oZWlnaHQoY2FsZW5kYXIuaGVpZ2h0KCkpO1xuXG5cbiAgICAgICAgICAgICAgICAvL0FqYXggcG9zdCByZXF1ZXN0XG5cbiAgICAgICAgICAgIH0vLyFkb25lUmVuZGVyaW5nXG4gICAgICAgIH0pO1xuICAgIH07XG5cbn0pKCk7Il0sImZpbGUiOiJzY2hlZHVsZS5qcyIsInNvdXJjZVJvb3QiOiIvc291cmNlLyJ9
