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
        save: function(callback){
            this.set('events', this.target.object);
            this.ajaxUpdate(callback);
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
        ajaxUpdate: function(callback){
            var ajaxOptions = {
                type: "POST",
                cache: false,
                headers: {
                    'X-CSRF-TOKEN': $('meta[name="csrf-token"]').attr('content')
                },
                success: function(response){
                    $.notify('Successfully saved', "success");
                    callback(response);
                },
                error: function(response){
                    var w = window.open('', ':Error Message', 'menubar=no, location=no');
                    w.document.write(response.responseText);
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
        }).save(function(response){
           storage.set('events', (function(){
               return storage.get('events').result().map(function(event){
                   response.forEach(function(processedId){
                       event.id = event.id == processedId.old ? processedId.new : event.id;
                   });
                   return event;
               });
           })());
            console.log( storage.get('events').result());
            clndr.setEvents(storage.get('events').getRendered(60));
            modal.modal('hide');
        });


        

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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiIiwic291cmNlcyI6WyJkYXNoYm9hcmQvc2NoZWR1bGUuanMiXSwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uKCl7XG4gICAgXCJ1c2Ugc3RyaWN0XCI7XG4gICAgLy9TZXQgdW5kZXJzY29yZSB0ZW1wbGF0ZSBzZXR0aW5nIGFzIHt7JSV9fSBmb3IgYmV0dGVyIGNvZGUgcmVhZGluZ1xuICAgIF8udGVtcGxhdGVTZXR0aW5ncyA9IHtcbiAgICAgICAgZXZhbHVhdGUgICAgOiAvXFx7XFx7JShbXFxzXFxTXSs/KSVcXH1cXH0vZyxcbiAgICAgICAgaW50ZXJwb2xhdGUgOiAvXFx7XFx7JT0oW1xcc1xcU10rPyklXFx9XFx9L2csXG4gICAgICAgIGVzY2FwZSAgICAgIDogL1xce1xceyUtKFtcXHNcXFNdKz8pJVxcfVxcfS9nXG4gICAgfTtcbiAgICAvL1NldCBtb21lbnQgbG9jYWxlXG4gICAgc3dpdGNoKCQoJ21ldGFbbmFtZT1cImxhbmdcIl0nKS5hdHRyKCdjb250ZW50Jykpe1xuICAgICAgICBjYXNlICdydSc6XG4gICAgICAgICAgICBtb21lbnQubG9jYWxlKFwicnVcIik7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgZGVmYXVsdDpcbiAgICAgICAgICAgIG1vbWVudC5sb2NhbGUoXCJlbi1nYlwiKTtcbiAgICB9XG5cblxuICAgIC8vSW5pdCBzdG9yYWdlIGhlbHBlcnNcbiAgICB2YXIgc3RvcmFnZSA9IHtcbiAgICAgICAgZGlzazogc2Vzc2lvblN0b3JhZ2UgfHwgbG9jYWxTdG9yYWdlLFxuICAgICAgICB0YXJnZXQ6IHtcbiAgICAgICAgICAgIG5hbWU6IG51bGwsXG4gICAgICAgICAgICBvYmplY3Q6IG51bGwsXG4gICAgICAgICAgICByZW5kZXJlZDogbnVsbCxcbiAgICAgICAgICAgIHJlcGVhdDogbnVsbFxuICAgICAgICB9LFxuICAgICAgICAnZ2V0JzogZnVuY3Rpb24oa2V5KXtcbiAgICAgICAgICAgIHRoaXMudGFyZ2V0LnJlcGVhdCA9IGZhbHNlO1xuICAgICAgICAgICAgaWYoIXRoaXMuZGlzay5nZXRJdGVtKGtleSkpXG4gICAgICAgICAgICAgIHJldHVybiBudWxsO1xuICAgICAgICAgICAgdGhpcy50YXJnZXQub2JqZWN0ID0gSlNPTi5wYXJzZSh0aGlzLmRpc2suZ2V0SXRlbShrZXkpKTtcbiAgICAgICAgICAgIHRoaXMudGFyZ2V0Lm5hbWUgPSBrZXk7XG4gICAgICAgICAgICByZXR1cm4gdGhpcztcbiAgICAgICAgfSxcbiAgICAgICAgJ3NldCc6IGZ1bmN0aW9uKGtleSwgdmFsdWUpe1xuICAgICAgICAgICAgdGhpcy50YXJnZXQucmVwZWF0ID0gZmFsc2U7XG4gICAgICAgICAgICB0aGlzLmRpc2suc2V0SXRlbShrZXksIEpTT04uc3RyaW5naWZ5KHZhbHVlKSk7XG4gICAgICAgICAgICB0aGlzLnRhcmdldC5uYW1lID0ga2V5O1xuICAgICAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgICAgIH0sXG4gICAgICAgIGFkZDogZnVuY3Rpb24oZXZlbnQpe1xuICAgICAgICAgICAgdmFyIGlkZW50aXR5ID0gZXZlbnQuaWQgPiAwID8gZXZlbnQuaWQgOiBEYXRlLm5vdygpO1xuICAgICAgICAgICAgdmFyIHJlc3VsdCA9IHtcbiAgICAgICAgICAgICAgICBpZDogaWRlbnRpdHksXG4gICAgICAgICAgICAgICAgdGl0bGU6IGV2ZW50LnRpdGxlLFxuICAgICAgICAgICAgICAgIGRlc2NyaXB0aW9uOiBldmVudC5kZXNjcmlwdGlvbixcbiAgICAgICAgICAgICAgICBkYXRlOiBldmVudC5kYXRlLFxuICAgICAgICAgICAgICAgIHBsYXlsaXN0OiBldmVudC5wbGF5bGlzdCxcbiAgICAgICAgICAgICAgICByZXBlYXQ6IHtcbiAgICAgICAgICAgICAgICAgICAgZXZlbnRfaWQ6IGlkZW50aXR5LFxuICAgICAgICAgICAgICAgICAgICBldmVyeURheTogZXZlbnQuZXZlcnlEYXkgPyAxIDogMCxcbiAgICAgICAgICAgICAgICAgICAgZXZlcnlXZWVrOiBldmVudC5ldmVyeVdlZWsgPyAxIDogMCxcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9O1xuICAgICAgICAgICAgaWYoZXZlbnQuZGF5cyl7XG4gICAgICAgICAgICAgICAgdmFyIGRheUtleXMgPSBPYmplY3Qua2V5cyhldmVudC5kYXlzKTtcbiAgICAgICAgICAgICAgICBmb3IodmFyIGkgPSBkYXlLZXlzLmxlbmd0aDsgaS0tOyl7XG4gICAgICAgICAgICAgICAgICAgIHZhciBrZXkgPSBkYXlLZXlzW2ldO1xuICAgICAgICAgICAgICAgICAgICByZXN1bHQucmVwZWF0W2tleV0gPSBldmVudC5kYXlzW2tleV07XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgdmFyIGlzRXhpc3RzID0gZmFsc2U7XG4gICAgICAgICAgICB0aGlzLnRhcmdldC5vYmplY3QuZm9yRWFjaChmdW5jdGlvbih2YWx1ZSwgaSwgYXJyKXtcbiAgICAgICAgICAgICAgICBpZih2YWx1ZS5pZCA9PSByZXN1bHQuaWQpe1xuICAgICAgICAgICAgICAgICAgICBpc0V4aXN0cyA9IHRydWU7XG4gICAgICAgICAgICAgICAgICAgIGFycltpXSA9IHJlc3VsdDtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIGlmKCFpc0V4aXN0cyl7XG4gICAgICAgICAgICAgICAgdGhpcy50YXJnZXQub2JqZWN0LnB1c2gocmVzdWx0KTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgICAgIH0sXG4gICAgICAgIGRlbDogZnVuY3Rpb24oaWQpe1xuICAgICAgICAgICAgZm9yKHZhciBpIGluIHRoaXMudGFyZ2V0Lm9iamVjdCl7XG4gICAgICAgICAgICAgICAgaWYodGhpcy50YXJnZXQub2JqZWN0W2ldLmlkID09IGlkKVxuICAgICAgICAgICAgICAgICAgICBkZWxldGUgdGhpcy50YXJnZXQub2JqZWN0W2ldO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgICAgIH0sXG4gICAgICAgIHNhdmU6IGZ1bmN0aW9uKGNhbGxiYWNrKXtcbiAgICAgICAgICAgIHRoaXMuc2V0KCdldmVudHMnLCB0aGlzLnRhcmdldC5vYmplY3QpO1xuICAgICAgICAgICAgdGhpcy5hamF4VXBkYXRlKGNhbGxiYWNrKTtcbiAgICAgICAgfSxcbiAgICAgICAgd2hlcmVEYXRlOiBmdW5jdGlvbihkYXRlKXtcbiAgICAgICAgICAgIGlmKCFkYXRlKVxuICAgICAgICAgICAgICAgIHJldHVybiBudWxsO1xuICAgICAgICAgICAgZm9yKHZhciBpIGluIHRoaXMudGFyZ2V0Lm9iamVjdClcbiAgICAgICAgICAgICAgICBpZih0aGlzLnRhcmdldC5vYmplY3RbaV0uZGF0ZS5zdWJzdHJpbmcoMCwxMCkgPT0gZGF0ZSl7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMudGFyZ2V0Lm9iamVjdCA9IFt0aGlzLnRhcmdldC5vYmplY3RbaV1dO1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gdGhpcztcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB0aGlzLnRhcmdldC5vYmplY3QgPSBbXTtcbiAgICAgICAgICAgIHJldHVybiB0aGlzO1xuICAgICAgICB9LFxuICAgICAgICB3aGVyZUlkOiBmdW5jdGlvbihpZCl7XG4gICAgICAgICAgICBpZighaWQpXG4gICAgICAgICAgICAgICAgcmV0dXJuIG51bGw7XG4gICAgICAgICAgICBmb3IodmFyIGkgaW4gdGhpcy50YXJnZXQub2JqZWN0KVxuICAgICAgICAgICAgICAgIGlmKHRoaXMudGFyZ2V0Lm9iamVjdFtpXS5pZCA9PSBpZCl7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMudGFyZ2V0Lm9iamVjdCA9IFt0aGlzLnRhcmdldC5vYmplY3RbaV1dO1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gdGhpcztcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB0aGlzLnRhcmdldC5vYmplY3QgPSBbXTtcbiAgICAgICAgICAgIHJldHVybiB0aGlzO1xuICAgICAgICB9LFxuICAgICAgICByZXBlYXQ6IGZ1bmN0aW9uKCl7XG4gICAgICAgICAgICB0aGlzLnRhcmdldC5yZXBlYXQgPSB0cnVlO1xuICAgICAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgICAgIH0sXG4gICAgICAgIGdldFJlbmRlcmVkOiBmdW5jdGlvbihyYW5nZSl7XG4gICAgICAgICAgICB2YXIgZGF0ZUZvcm1hdCA9ICdZWVlZLU1NLUREIEhIOm1tJztcbiAgICAgICAgICAgIHRoaXMudGFyZ2V0LnJlbmRlcmQgPSBbXTtcbiAgICAgICAgICAgIHJhbmdlIC89IDI7XG5cbiAgICAgICAgICAgIHRoaXMudGFyZ2V0Lm9iamVjdC5mb3JFYWNoKGZ1bmN0aW9uKHZhbHVlKXtcbiAgICAgICAgICAgICAgICB2YXIgZmxhZyA9IHtcbiAgICAgICAgICAgICAgICAgICAgZXZlcnlEYXk6IGZhbHNlLFxuICAgICAgICAgICAgICAgICAgICBldmVyeVdlZWs6IGZhbHNlXG4gICAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgICAgICBpZih2YWx1ZS5yZXBlYXQuZXZlcnlEYXkpe1xuICAgICAgICAgICAgICAgICAgICBmbGFnLmV2ZXJ5RGF5ID0gdHJ1ZTtcbiAgICAgICAgICAgICAgICAgICAgdmFyIGRheU5vdyA9IG1vbWVudCh2YWx1ZS5kYXRlKTtcbiAgICAgICAgICAgICAgICAgICAgZm9yKHZhciBpID0gLXJhbmdlOyBpIDwgcmFuZ2U7IGkrKyl7XG4gICAgICAgICAgICAgICAgICAgICAgICB2YWx1ZS5kYXRlID0gbW9tZW50KGRheU5vdykuYWRkKGksICdkYXlzJykuZm9ybWF0KGRhdGVGb3JtYXQpO1xuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy50YXJnZXQucmVuZGVyZC5wdXNoKCQuZXh0ZW5kKHRydWUsIHt9LCB2YWx1ZSkpO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGVsc2UgaWYodmFsdWUucmVwZWF0LmV2ZXJ5V2Vlayl7XG4gICAgICAgICAgICAgICAgICAgIGZsYWcuZXZlcnlXZWVrID0gdHJ1ZTtcbiAgICAgICAgICAgICAgICAgICAgdmFyIHdlZWtSYW5nZSA9IE1hdGguZmxvb3IocmFuZ2UgLyA3KTtcbiAgICAgICAgICAgICAgICAgICAgdmFyIHdlZWtOb3cgPSBtb21lbnQoKS53ZWVrKCk7XG4gICAgICAgICAgICAgICAgICAgIGZvcih2YXIgaSA9IC13ZWVrUmFuZ2U7IGkgPCB3ZWVrUmFuZ2U7IGkrKyl7XG4gICAgICAgICAgICAgICAgICAgICAgICB2YXIgd2VlayA9IG1vbWVudCh2YWx1ZS5kYXRlKS53ZWVrKHdlZWtOb3cgKyBpKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGZvcih2YXIgZGF5IGluIHZhbHVlLnJlcGVhdClcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBzd2l0Y2goZGF5KXtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY2FzZSBcIm1vblwiOlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjYXNlIFwidHVlXCI6XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNhc2UgXCJ3ZWRcIjpcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY2FzZSBcInRodVwiOlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjYXNlIFwiZnJpXCI6XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNhc2UgXCJzYXRcIjpcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY2FzZSBcInN1blwiOlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYodmFsdWUucmVwZWF0W2RheV0pe1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHZhbHVlLmRhdGUgPSB3ZWVrLmRheShkYXkpLmZvcm1hdChkYXRlRm9ybWF0KTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aGlzLnRhcmdldC5yZW5kZXJkLnB1c2goJC5leHRlbmQodHJ1ZSwge30sIHZhbHVlKSk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgaWYoIWZsYWcuZXZlcnlEYXkgJiYgIWZsYWcuZXZlcnlXZWVrKXtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy50YXJnZXQucmVuZGVyZC5wdXNoKCQuZXh0ZW5kKHRydWUsIHt9LCB2YWx1ZSkpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICB9LmJpbmQodGhpcykpO1xuICAgICAgICAgICAgcmV0dXJuIHRoaXMudGFyZ2V0LnJlbmRlcmQ7XG4gICAgICAgIH0sXG4gICAgICAgIHJlc3VsdDogZnVuY3Rpb24oKXtcbiAgICAgICAgICAgIGlmKCF0aGlzLnRhcmdldC5yZXBlYXQpXG4gICAgICAgICAgICAgICAgcmV0dXJuIHRoaXMudGFyZ2V0Lm9iamVjdDtcbiAgICAgICAgICAgIHZhciByZXN1bHQgPSBbXTtcbiAgICAgICAgICAgIGZvcih2YXIgaSBpbiB0aGlzLnRhcmdldC5vYmplY3Qpe1xuICAgICAgICAgICAgICAgIHZhciByZXBlYXRLZXlzID0gT2JqZWN0LmtleXModGhpcy50YXJnZXQub2JqZWN0W2ldLnJlcGVhdCksXG4gICAgICAgICAgICAgICAgICAgIGRheXMgPSB7fSxcbiAgICAgICAgICAgICAgICAgICAgcmVwZWF0ID0ge30sXG4gICAgICAgICAgICAgICAgICAgIGtleSA9ICcnO1xuICAgICAgICAgICAgICAgIGZvcih2YXIgciA9IHJlcGVhdEtleXMubGVuZ3RoOyByLS07KXtcbiAgICAgICAgICAgICAgICAgICAga2V5ID0gcmVwZWF0S2V5c1tyXTtcbiAgICAgICAgICAgICAgICAgICAgc3dpdGNoKGtleSl7XG4gICAgICAgICAgICAgICAgICAgICAgICBjYXNlIFwibW9uXCI6XG4gICAgICAgICAgICAgICAgICAgICAgICBjYXNlIFwidHVlXCI6XG4gICAgICAgICAgICAgICAgICAgICAgICBjYXNlIFwid2VkXCI6XG4gICAgICAgICAgICAgICAgICAgICAgICBjYXNlIFwidGh1XCI6XG4gICAgICAgICAgICAgICAgICAgICAgICBjYXNlIFwiZnJpXCI6XG4gICAgICAgICAgICAgICAgICAgICAgICBjYXNlIFwic2F0XCI6XG4gICAgICAgICAgICAgICAgICAgICAgICBjYXNlIFwic3VuXCI6XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZGF5c1trZXldID0gdGhpcy50YXJnZXQub2JqZWN0W2ldLnJlcGVhdFtrZXldO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgICAgICAgICAgZGVmYXVsdDpcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXBlYXRba2V5XSA9IHRoaXMudGFyZ2V0Lm9iamVjdFtpXS5yZXBlYXRba2V5XTtcbiAgICAgICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIHJlcGVhdC5kYXlzID0gZGF5cztcbiAgICAgICAgICAgICAgICByZXN1bHQucHVzaChyZXBlYXQpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmV0dXJuIHJlc3VsdDtcbiAgICAgICAgfSxcbiAgICAgICAgYWpheFVwZGF0ZTogZnVuY3Rpb24oY2FsbGJhY2spe1xuICAgICAgICAgICAgdmFyIGFqYXhPcHRpb25zID0ge1xuICAgICAgICAgICAgICAgIHR5cGU6IFwiUE9TVFwiLFxuICAgICAgICAgICAgICAgIGNhY2hlOiBmYWxzZSxcbiAgICAgICAgICAgICAgICBoZWFkZXJzOiB7XG4gICAgICAgICAgICAgICAgICAgICdYLUNTUkYtVE9LRU4nOiAkKCdtZXRhW25hbWU9XCJjc3JmLXRva2VuXCJdJykuYXR0cignY29udGVudCcpXG4gICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICBzdWNjZXNzOiBmdW5jdGlvbihyZXNwb25zZSl7XG4gICAgICAgICAgICAgICAgICAgICQubm90aWZ5KCdTdWNjZXNzZnVsbHkgc2F2ZWQnLCBcInN1Y2Nlc3NcIik7XG4gICAgICAgICAgICAgICAgICAgIGNhbGxiYWNrKHJlc3BvbnNlKTtcbiAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgIGVycm9yOiBmdW5jdGlvbihyZXNwb25zZSl7XG4gICAgICAgICAgICAgICAgICAgIHZhciB3ID0gd2luZG93Lm9wZW4oJycsICc6RXJyb3IgTWVzc2FnZScsICdtZW51YmFyPW5vLCBsb2NhdGlvbj1ubycpO1xuICAgICAgICAgICAgICAgICAgICB3LmRvY3VtZW50LndyaXRlKHJlc3BvbnNlLnJlc3BvbnNlVGV4dCk7XG4gICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICBkYXRhOiB7XG4gICAgICAgICAgICAgICAgICAgIGV2ZW50czogdGhpcy5nZXQoJ2V2ZW50cycpLnRhcmdldC5vYmplY3RcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9O1xuXG4gICAgICAgICAgICAkLmFqYXgoJ3NjaGVkdWxlL2V2ZW50cy91cGRhdGUnLCBhamF4T3B0aW9ucyk7XG5cbiAgICAgICAgfVxuICAgIH07XG5cbiAgICAvL2V2ZW50c1xuICAgIHZhciBvbkV2ZW50c1N1Y2Nlc3MgPSBmdW5jdGlvbihyZXNwb25zZSl7XG4gICAgICAgICAgICAkKFwiI2ZvdW50YWluVGV4dEdcIikuaGlkZSgpO1xuICAgICAgICAgICAgc3RvcmFnZS5zZXQoJ2V2ZW50cycsIHJlc3BvbnNlLmV2ZW50cyk7XG4gICAgICAgICAgICBzdG9yYWdlLnNldCgncGxheWxpc3RzJywgcmVzcG9uc2UucGxheWxpc3RzKTtcbiAgICAgICAgICAgIHZhciBldmVudHMgPSBzdG9yYWdlLmdldCgnZXZlbnRzJykuZ2V0UmVuZGVyZWQoNjApO1xuICAgICAgICAgICAgdmFyIHBsYXlsaXN0cyA9IHN0b3JhZ2UuZ2V0KCdwbGF5bGlzdHMnKS5yZXN1bHQoKTtcbiAgICAgICAgICAgIGluaXRDYWxlbmRhcihldmVudHMpO1xuICAgICAgICAgICAgaW5pdFBsYXlsaXN0KHBsYXlsaXN0cyk7XG4gICAgICAgIH0sXG4gICAgICAgIG9uRXZlbnRzRXJyb3IgPSBmdW5jdGlvbiAocmVzcG9uc2Upe1xuICAgICAgICAgICAgJChcIiNmb3VudGFpblRleHRHXCIpLmhpZGUoKTtcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKHJlc3BvbnNlKTtcbiAgICAgICAgfTtcbiAgICB2YXIgcmVxdWVzdE9wdGlvbnMgPSB7XG4gICAgICAgIHR5cGU6IFwiR0VUXCIsXG4gICAgICAgIGNhY2hlOiBmYWxzZSxcbiAgICAgICAgc3VjY2Vzczogb25FdmVudHNTdWNjZXNzLFxuICAgICAgICBlcnJvcjogb25FdmVudHNFcnJvclxuICAgIH07XG4gICAgJC5hamF4KCdzY2hlZHVsZS9ldmVudHMnLCByZXF1ZXN0T3B0aW9ucyk7XG4gICAgLy8hZXZlbnRzXG5cbiAgICAvL2luaXQgdmFyaWFibGVzXG4gICAgdmFyIGNsbmRyID0ge307XG4gICAgdmFyIGRheUV2ZW50c1RlbXBsYXRlID0gJCgnI2RheS1ldmVudHMnKS5odG1sKCk7XG5cbiAgICB2YXIgbW9kYWwgPSAkKFwiI21vZGFsXCIpO1xuICAgIHZhciBkYXRldGltZVBpY2tlckluaXQgPSBmdW5jdGlvbihvcHRpb25zLCBpZCl7XG4gICAgICAgIC8vRGF0ZSBpbml0XG4gICAgICAgIHZhciBkdFBpY2tlciA9ICQoJyNkYXRldGltZXBpY2tlcicpLFxuICAgICAgICAgICAgY2hlY2tPcHRpb25zID0ge1xuICAgICAgICAgICAgICAgIGNoZWNrYm94Q2xhc3M6ICdpY2hlY2tib3hfc3F1YXJlLWJsdWUnLFxuICAgICAgICAgICAgICAgIHJhZGlvQ2xhc3M6ICdpcmFkaW9fc3F1YXJlLWJsdWUnLFxuICAgICAgICAgICAgICAgIGluY3JlYXNlQXJlYTogJzIwJScsXG4gICAgICAgICAgICB9O1xuICAgICAgICAkKCcjcmVwZWF0LWRheScpLmlDaGVjaygndW5jaGVjaycpXG4gICAgICAgICAgICAuaUNoZWNrKGNoZWNrT3B0aW9ucykub24oXCJpZlVuY2hlY2tlZFwiLCBmdW5jdGlvbigpe1xuICAgICAgICAgICAgICAgIGR0UGlja2VyXG4gICAgICAgICAgICAgICAgICAgIC5kYXRldGltZXBpY2tlcignZGVzdHJveScpXG4gICAgICAgICAgICAgICAgICAgIC5kYXRldGltZXBpY2tlcigpO1xuICAgICAgICAgICAgICAgICQoXCIjcmVwZWF0LW1vbnRoXCIpLmlDaGVjaygnZW5hYmxlJyk7XG4gICAgICAgICAgICAgICAgcmVwZWF0T24uaUNoZWNrKCdlbmFibGUnKTtcbiAgICAgICAgICAgIH0pLm9uKFwiaWZDaGVja2VkXCIsIGZ1bmN0aW9uKCl7XG4gICAgICAgICAgICAgICAgZHRQaWNrZXJcbiAgICAgICAgICAgICAgICAgICAgLmRhdGV0aW1lcGlja2VyKCdkZXN0cm95JylcbiAgICAgICAgICAgICAgICAgICAgLmRhdGV0aW1lcGlja2VyKHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGRhdGVwaWNrZXI6ZmFsc2UsXG4gICAgICAgICAgICAgICAgICAgICAgICBmb3JtYXQ6J0g6aSdcbiAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgJChcIiNyZXBlYXQtbW9udGhcIikuaUNoZWNrKCdkaXNhYmxlJyk7XG4gICAgICAgICAgICAgICAgcmVwZWF0T24uaUNoZWNrKCdkaXNhYmxlJyk7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgZHRQaWNrZXJcbiAgICAgICAgICAgIC5kYXRldGltZXBpY2tlcignZGVzdHJveScpXG4gICAgICAgICAgICAuZGF0ZXRpbWVwaWNrZXIob3B0aW9ucyk7XG5cbiAgICAgICAgLy9SZXBlYXQgaW5pdFxuICAgICAgICB2YXIgcmVwZWF0T24gPSAkKFwiI3JlcGVhdC1vblwiKTtcbiAgICAgICAgcmVwZWF0T24uaGlkZSgpO1xuICAgICAgICAkKCcjcmVwZWF0LW1vbnRoJykuaUNoZWNrKCd1bmNoZWNrJylcbiAgICAgICAgICAgIC5pQ2hlY2soY2hlY2tPcHRpb25zKVxuICAgICAgICAgICAgLm9uKFwiaWZVbmNoZWNrZWRcIiwgZnVuY3Rpb24oKXtcbiAgICAgICAgICAgICAgICByZXBlYXRPbi5oaWRlKCk7XG4gICAgICAgICAgICB9KVxuICAgICAgICAgICAgLm9uKFwiaWZDaGVja2VkXCIsIGZ1bmN0aW9uKCl7XG4gICAgICAgICAgICAgICAgJChcIltpZCo9J3JlcGVhdC1vbi0nXVwiKVxuICAgICAgICAgICAgICAgICAgICAuaUNoZWNrKGNoZWNrT3B0aW9ucyk7XG4gICAgICAgICAgICAgICAgcmVwZWF0T24uc2hvdygpO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgIC8vU2V0IGNoZWNrZWQgZGF5c1xuICAgICAgICBpZihpZCl7XG4gICAgICAgICAgICAoZnVuY3Rpb24oKXtcbiAgICAgICAgICAgICAgICB2YXIgcmVwZWF0cyA9IHN0b3JhZ2UuZ2V0KCdldmVudHMnKS53aGVyZUlkKGlkKS5yZXBlYXQoKS5yZXN1bHQoKVswXTtcbiAgICAgICAgICAgICAgICBpZihyZXBlYXRzLmV2ZXJ5V2Vlayl7XG4gICAgICAgICAgICAgICAgICAgICQoJyNyZXBlYXQtbW9udGgnKS5pQ2hlY2soJ2NoZWNrJyk7XG4gICAgICAgICAgICAgICAgICAgIGZvcih2YXIgaSBpbiByZXBlYXRzLmRheXMpe1xuICAgICAgICAgICAgICAgICAgICAgICAgJChcIiNyZXBlYXQtb24tXCIgKyBpKS5pQ2hlY2socmVwZWF0cy5kYXlzW2ldID8gJ2NoZWNrJzogJ3VuY2hlY2snKVxuICAgICAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgaWYocmVwZWF0cy5ldmVyeURheSl7XG4gICAgICAgICAgICAgICAgICAgICQoJyNyZXBlYXQtZGF5JykuaUNoZWNrKCdjaGVjaycpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0pKCk7XG4gICAgICAgIH1cbiAgICAgICAgLy8hY2hlY2tlZCBkYXlzXG4gICAgICAgIG1vZGFsLm1vZGFsKCdzaG93Jyk7XG4gICAgfTtcbiAgICAvL29uIFNhdmluZyBjaGFuZ2VzXG4gICAgdmFyIHNhdmVDaGFuZ2VzID0gZnVuY3Rpb24oaWQpe1xuICAgICAgICB2YXIgdGl0bGUgPSAkLnRyaW0oJChcIiNUaXRsZVwiKS52YWwoKSksXG4gICAgICAgICAgICBkZXNjcmlwdGlvbiA9ICQudHJpbSgkKFwiI0Rlc2NyaXB0aW9uXCIpLnZhbCgpKSxcbiAgICAgICAgICAgIGlzRGF5UmVwZWF0ID0gJChcIiNyZXBlYXQtZGF5XCIpLnByb3AoXCJjaGVja2VkXCIpLFxuICAgICAgICAgICAgZGF0ZVRpbWUgPSAkKFwiI2RhdGV0aW1lcGlja2VyXCIpLnZhbCgpO1xuXG4gICAgICAgIGlmKCF0aXRsZSl7XG4gICAgICAgICAgICAkKFwiI1RpdGxlXCIpLnRvb2x0aXAoe1xuICAgICAgICAgICAgICAgIHRyaWdnZXI6J21hbnVhbCdcbiAgICAgICAgICAgIH0pLnRvb2x0aXAoJ3Nob3cnKTtcbiAgICAgICAgICAgIHNldFRpbWVvdXQoZnVuY3Rpb24oKXtcbiAgICAgICAgICAgICAgICAkKFwiI1RpdGxlXCIpLnRvb2x0aXAoJ2Rlc3Ryb3knKTtcbiAgICAgICAgICAgIH0sIDIwMDApO1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG4gICAgICAgIGlmKCFpc0RheVJlcGVhdCl7XG4gICAgICAgICAgICB2YXIgaXNXZWVrUmVwZWF0ID0gICQoXCIjcmVwZWF0LW1vbnRoXCIpLnByb3AoXCJjaGVja2VkXCIpO1xuICAgICAgICAgICAgaWYoaXNXZWVrUmVwZWF0KXtcbiAgICAgICAgICAgICAgICB2YXIgZGF5c1JlcGVhdCA9IHt9O1xuICAgICAgICAgICAgICAgICQoXCJbaWQqPSdyZXBlYXQtb24tJ11cIikuZWFjaChmdW5jdGlvbiAoaSwgb2JqKSB7XG4gICAgICAgICAgICAgICAgICAgIGRheXNSZXBlYXRbJChvYmopLmF0dHIoJ2lkJykuc3Vic3RyaW5nKDEwKV0gPSAkKG9iaikucHJvcChcImNoZWNrZWRcIikgPyAxIDogMDtcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIHN0b3JhZ2UuZ2V0KCdldmVudHMnKS5hZGQoe1xuICAgICAgICAgICAgaWQ6IGlkIHx8IC0xLFxuICAgICAgICAgICAgdGl0bGU6IHRpdGxlLFxuICAgICAgICAgICAgZGF0ZSA6IGlzRGF5UmVwZWF0ID8gbW9tZW50KGRhdGVUaW1lLCBcIkhIOm1tXCIpLmZvcm1hdChcIllZWVktTU0tREQgSEg6bW1cIikgOiBkYXRlVGltZSxcbiAgICAgICAgICAgIHBsYXlsaXN0OiAkKFwiI3BsYXlsaXN0IG9wdGlvbjpzZWxlY3RlZFwiKS52YWwoKSxcbiAgICAgICAgICAgIGRlc2NyaXB0aW9uOiBkZXNjcmlwdGlvbixcbiAgICAgICAgICAgIGV2ZXJ5RGF5OiBpc0RheVJlcGVhdCxcbiAgICAgICAgICAgIGV2ZXJ5V2VlazogaXNXZWVrUmVwZWF0LFxuICAgICAgICAgICAgZGF5czogZGF5c1JlcGVhdFxuICAgICAgICB9KS5zYXZlKGZ1bmN0aW9uKHJlc3BvbnNlKXtcbiAgICAgICAgICAgc3RvcmFnZS5zZXQoJ2V2ZW50cycsIChmdW5jdGlvbigpe1xuICAgICAgICAgICAgICAgcmV0dXJuIHN0b3JhZ2UuZ2V0KCdldmVudHMnKS5yZXN1bHQoKS5tYXAoZnVuY3Rpb24oZXZlbnQpe1xuICAgICAgICAgICAgICAgICAgIHJlc3BvbnNlLmZvckVhY2goZnVuY3Rpb24ocHJvY2Vzc2VkSWQpe1xuICAgICAgICAgICAgICAgICAgICAgICBldmVudC5pZCA9IGV2ZW50LmlkID09IHByb2Nlc3NlZElkLm9sZCA/IHByb2Nlc3NlZElkLm5ldyA6IGV2ZW50LmlkO1xuICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgICAgIHJldHVybiBldmVudDtcbiAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICB9KSgpKTtcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKCBzdG9yYWdlLmdldCgnZXZlbnRzJykucmVzdWx0KCkpO1xuICAgICAgICAgICAgY2xuZHIuc2V0RXZlbnRzKHN0b3JhZ2UuZ2V0KCdldmVudHMnKS5nZXRSZW5kZXJlZCg2MCkpO1xuICAgICAgICAgICAgbW9kYWwubW9kYWwoJ2hpZGUnKTtcbiAgICAgICAgfSk7XG5cblxuICAgICAgICBcblxuICAgIH07XG5cbiAgICAvL0luaXQgcGxheWxpc3RcbiAgICB2YXIgaW5pdFBsYXlsaXN0ID0gZnVuY3Rpb24gKHBsYXlsaXN0KXtcbiAgICAgICAgdmFyIGxpc3QgPSAkKFwiI3BsYXlsaXN0XCIpO1xuICAgICAgICBwbGF5bGlzdC5mb3JFYWNoKGZ1bmN0aW9uKHZhbCl7XG4gICAgICAgICAgICBsaXN0LmFwcGVuZChcIjxvcHRpb24gdmFsdWU9J1wiK3ZhbC5pZCtcIic+XCIrdmFsLm5hbWUrXCI8L29wdGlvbj5cIik7XG4gICAgICAgIH0pO1xuICAgICAgICBsaXN0LnNlbGVjdHBpY2tlcigncmVmcmVzaCcpO1xuICAgIH07XG4gICAgLy9Jbml0IGNhbGVuZGFyXG4gICAgdmFyIGluaXRDYWxlbmRhciA9IGZ1bmN0aW9uKGV2ZW50cyl7XG4gICAgICAgIGNsbmRyID0gJCgnI2Z1bGwtY2xuZHInKS5jbG5kcih7XG4gICAgICAgICAgICB0ZW1wbGF0ZTogJCgnI2Z1bGwtY2xuZHItdGVtcGxhdGUnKS5odG1sKCksXG4gICAgICAgICAgICBldmVudHM6IGV2ZW50cyxcbiAgICAgICAgICAgIGNsaWNrRXZlbnRzOiB7XG4gICAgICAgICAgICAgICAgY2xpY2s6IGZ1bmN0aW9uICh0YXJnZXQpIHtcbiAgICAgICAgICAgICAgICAgICAgdmFyIHRlbXBsYXRlID0gXy50ZW1wbGF0ZShkYXlFdmVudHNUZW1wbGF0ZSk7XG4gICAgICAgICAgICAgICAgICAgICQoXCIuZGF5LWV2ZW50c1wiKVxuICAgICAgICAgICAgICAgICAgICAgICAgLm1DdXN0b21TY3JvbGxiYXIoXCJkZXN0cm95XCIpXG4gICAgICAgICAgICAgICAgICAgICAgICAuaHRtbCh0ZW1wbGF0ZSh7ZXZlbnRzVGhpc0RheTogdGFyZ2V0LmV2ZW50c30pKVxuICAgICAgICAgICAgICAgICAgICAgICAgLmhlaWdodCggJChcIi5jbG5kci1ncmlkIC5kYXlzXCIpLmhlaWdodCgpIC0gJChcIi5jbG5kci1ncmlkIC5kYXlzLW9mLXRoZS13ZWVrXCIpLmhlaWdodCgpIClcbiAgICAgICAgICAgICAgICAgICAgICAgIC5tQ3VzdG9tU2Nyb2xsYmFyKHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBzY3JvbGxCdXR0b25zOntlbmFibGU6dHJ1ZX0sXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdGhlbWU6XCJtaW5pbWFsLWRhcmtcIlxuICAgICAgICAgICAgICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgICAgICAgICAgICAgICAgIC8vVHJhbnNsYXRlWCBpdGVtIGhvdmVyIG1lbnVcbiAgICAgICAgICAgICAgICAgICAgICAgICQoXCIuZXZlbnQtaXRlbS1ob3ZlclwiKS5lYWNoKGZ1bmN0aW9uKGksIG9iail7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgJChvYmopLmNzcyhcInRyYW5zZm9ybVwiLCBcInRyYW5zbGF0ZVgoXCIgKyAkKG9iaikud2lkdGgoKSArIFwicHgpXCIpO1xuICAgICAgICAgICAgICAgICAgICAgICAgfSk7XG5cblxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICBmb3JjZVNpeFJvd3M6IHRydWUsXG4gICAgICAgICAgICBtdWx0aURheUV2ZW50czoge1xuICAgICAgICAgICAgICAgIHNpbmdsZURheTogJ2RhdGUnLFxuICAgICAgICAgICAgICAgIGVuZERhdGU6ICdlbmREYXRlJyxcbiAgICAgICAgICAgICAgICBzdGFydERhdGU6ICdzdGFydERhdGUnXG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgc2hvd0FkamFjZW50TW9udGhzOiB0cnVlLFxuICAgICAgICAgICAgYWRqYWNlbnREYXlzQ2hhbmdlTW9udGg6IGZhbHNlLFxuICAgICAgICAgICAgdHJhY2tTZWxlY3RlZERhdGU6IHRydWUsXG4gICAgICAgICAgICBkYXlzT2ZUaGVXZWVrOiAoZnVuY3Rpb24oKXtcbiAgICAgICAgICAgICAgICB2YXIgcmVzdWx0ID0gW107XG4gICAgICAgICAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCA3OyBpKyspIHtcbiAgICAgICAgICAgICAgICAgICAgcmVzdWx0LnB1c2gobW9tZW50KCkud2Vla2RheShpKS5mb3JtYXQoJ2RkZCcpKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgcmV0dXJuIHJlc3VsdDtcbiAgICAgICAgICAgIH0pKCksXG4gICAgICAgICAgICBkb25lUmVuZGVyaW5nOiBmdW5jdGlvbigpeyAvL2RvbmVSZW5kZXJpbmdcbiAgICAgICAgICAgICAgICAkKFwiLmV2ZW50LWl0ZW1zXCIpXG4gICAgICAgICAgICAgICAgICAgIC5oZWlnaHQoICQoXCIuY2xuZHItZ3JpZCAuZGF5c1wiKS5oZWlnaHQoKSAtICQoXCIuY2xuZHItZ3JpZCAuZGF5cy1vZi10aGUtd2Vla1wiKS5oZWlnaHQoKSApXG4gICAgICAgICAgICAgICAgICAgIC5tQ3VzdG9tU2Nyb2xsYmFyKHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHNjcm9sbEJ1dHRvbnM6e2VuYWJsZTp0cnVlfSxcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoZW1lOlwibWluaW1hbC1kYXJrXCJcbiAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgdmFyIGNhbGVuZGFyID0gJChcIiNmdWxsLWNsbmRyXCIpO1xuICAgICAgICAgICAgICAgIGlmKGNhbGVuZGFyLmZpbmQoXCIudG9kYXlcIikubGVuZ3RoID4gMClcbiAgICAgICAgICAgICAgICAgICAgY2FsZW5kYXIuZmluZChcIi50b2RheVwiKS5jbGljaygpO1xuICAgICAgICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgICAgICAgICAgY2FsZW5kYXIuZmluZChcIi5kYXlcIikuZXEoMCkuY2xpY2soKTtcblxuICAgICAgICAgICAgICAgIHZhciBldmVudExpc3RpbmdUaXRsZSA9ICQoXCIuZXZlbnQtbGlzdGluZy10aXRsZVwiKTtcbiAgICAgICAgICAgICAgICAvL0luaXQgYmxvY2sgT3Blbi9DbG9zZSBldmVudFxuICAgICAgICAgICAgICAgIGV2ZW50TGlzdGluZ1RpdGxlLm9uKFwiY2xpY2tcIiwgXCIuZ2x5cGhpY29uLWNoZXZyb24tdXAsIC5nbHlwaGljb24tY2hldnJvbi1kb3duXCIsIGZ1bmN0aW9uKCl7XG4gICAgICAgICAgICAgICAgICAgIHZhciBlbCA9IHt9O1xuICAgICAgICAgICAgICAgICAgICB2YXIgYmxvY2sgPSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBvcGVuOiBcImdseXBoaWNvbi1jaGV2cm9uLXVwXCIsXG4gICAgICAgICAgICAgICAgICAgICAgICBjbG9zZTogXCJnbHlwaGljb24tY2hldnJvbi1kb3duXCJcbiAgICAgICAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgICAgICAgICAgdmFyICR0aGlzID0gJCh0aGlzKTtcbiAgICAgICAgICAgICAgICAgICAgaWYoJHRoaXMucGFyZW50KCkuaGFzQ2xhc3MoXCJtb250aC10aXRsZVwiKSlcbiAgICAgICAgICAgICAgICAgICAgICAgIGVsID0gJChcIi5kYXktdGl0bGUgW2NsYXNzICo9Z2x5cGhpY29uLWNoZXZyb25dXCIpLmVxKDApO1xuICAgICAgICAgICAgICAgICAgICBlbHNlXG4gICAgICAgICAgICAgICAgICAgICAgICBlbCA9ICQoXCIubW9udGgtdGl0bGUgW2NsYXNzICo9Z2x5cGhpY29uLWNoZXZyb25dXCIpLmVxKDApO1xuXG4gICAgICAgICAgICAgICAgICAgIGlmKGVsLmhhc0NsYXNzKGJsb2NrLm9wZW4pKVxuICAgICAgICAgICAgICAgICAgICAgICAgZWwucmVtb3ZlQ2xhc3MoYmxvY2sub3BlbikuYWRkQ2xhc3MoYmxvY2suY2xvc2UpO1xuICAgICAgICAgICAgICAgICAgICBlbHNlXG4gICAgICAgICAgICAgICAgICAgICAgICBlbC5yZW1vdmVDbGFzcyhibG9jay5jbG9zZSkuYWRkQ2xhc3MoYmxvY2sub3Blbik7XG5cbiAgICAgICAgICAgICAgICAgICAgaWYoJHRoaXMuaGFzQ2xhc3MoYmxvY2sub3BlbikpXG4gICAgICAgICAgICAgICAgICAgICAgICAkdGhpcy5yZW1vdmVDbGFzcyhibG9jay5vcGVuKS5hZGRDbGFzcyhibG9jay5jbG9zZSk7XG4gICAgICAgICAgICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgICAgICAgICAgICAgICR0aGlzLnJlbW92ZUNsYXNzKGJsb2NrLmNsb3NlKS5hZGRDbGFzcyhibG9jay5vcGVuKTtcblxuICAgICAgICAgICAgICAgICAgICAkKFwiLmV2ZW50LWl0ZW1zLCAuZGF5LWV2ZW50c1wiKS5zbGlkZVRvZ2dsZSgpO1xuXG4gICAgICAgICAgICAgICAgICAgICQoXCIuZXZlbnQtaXRlbS1ob3ZlclwiKS5lYWNoKGZ1bmN0aW9uKGksIG9iail7XG4gICAgICAgICAgICAgICAgICAgICAgICAkKG9iaikuY3NzKFwidHJhbnNmb3JtXCIsIFwidHJhbnNsYXRlWChcIiArICQob2JqKS53aWR0aCgpICsgXCJweClcIik7XG4gICAgICAgICAgICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgICAgICAgfSk7XG5cblxuICAgICAgICAgICAgICAgIHZhciBkYXRldGltZXBpY2tlck9wdGlvbnMgPSB7XG4gICAgICAgICAgICAgICAgICAgIHN0ZXA6IDMwXG4gICAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgICAgICB2YXIgaXNUaXBPcGVuID0gZmFsc2U7XG4gICAgICAgICAgICAgICAgJChcIi5ldmVudC1saXN0aW5nXCIpLm9uKCdjbGljaycsICcuZXZlbnQtaXRlbScsIGZ1bmN0aW9uKGUpe1xuICAgICAgICAgICAgICAgICAgICBlLnN0b3BQcm9wYWdhdGlvbigpO1xuICAgICAgICAgICAgICAgICAgICB2YXIgaG92ZXIgPSAkKHRoaXMpLmZpbmQoXCIuZXZlbnQtaXRlbS1ob3ZlclwiKTtcbiAgICAgICAgICAgICAgICAgICAgaWYoaXNUaXBPcGVuKVxuICAgICAgICAgICAgICAgICAgICAgICAgaG92ZXIuY3NzKCd0cmFuc2Zvcm0nLCAndHJhbnNsYXRlWCgnKyBob3Zlci53aWR0aCgpICsncHgpJyk7XG4gICAgICAgICAgICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgICAgICAgICAgICAgIGhvdmVyLmNzcygndHJhbnNmb3JtJywgJ3RyYW5zbGF0ZVgoMHB4KScpO1xuICAgICAgICAgICAgICAgICAgICBpc1RpcE9wZW4gPSAhaXNUaXBPcGVuO1xuICAgICAgICAgICAgICAgIH0pXG4gICAgICAgICAgICAgICAgLy9Jbml0IG1vZGFsIHdpbmRvdyBcIkVkaXQgZXZlbnRcIlxuICAgICAgICAgICAgICAgICAgICAub24oJ2NsaWNrJywgJy5ldmVudC1pdGVtIHNwYW46Zmlyc3QtY2hpbGQnLCBmdW5jdGlvbihlKXtcbiAgICAgICAgICAgICAgICAgICAgICAgIGUuc3RvcFByb3BhZ2F0aW9uKCk7XG4gICAgICAgICAgICAgICAgICAgICAgICB2YXIgJHRoaXMgPSAkKHRoaXMpLnBhcmVudCgpLnBhcmVudCgpO1xuICAgICAgICAgICAgICAgICAgICAgICAgbW9kYWwuZmluZChcImZvcm1cIikuZ2V0KDApLnJlc2V0KCk7XG4gICAgICAgICAgICAgICAgICAgICAgICBtb2RhbC5maW5kKFwiLm1vZGFsLXRpdGxlXCIpLnRleHQoXCJFZGl0IGV2ZW50XCIpO1xuXG4gICAgICAgICAgICAgICAgICAgICAgICBkYXRldGltZXBpY2tlck9wdGlvbnMudmFsdWUgPSAkdGhpcy5maW5kKFwiLmV2ZW50LWl0ZW0tdGltZVwiKS5hdHRyKFwiZGF0YS1kYXRldGltZVwiKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIG1vZGFsLmZpbmQoXCIjVGl0bGVcIikudmFsKCR0aGlzLmZpbmQoXCIuZXZlbnQtaXRlbS1uYW1lXCIpLnRleHQoKSk7XG4gICAgICAgICAgICAgICAgICAgICAgICBtb2RhbC5maW5kKFwiI0Rlc2NyaXB0aW9uXCIpLnZhbCgkdGhpcy5maW5kKFwiLmV2ZW50LWl0ZW0tbG9jYXRpb25cIikudGV4dCgpKTtcblxuICAgICAgICAgICAgICAgICAgICAgICAgZGF0ZXRpbWVQaWNrZXJJbml0KGRhdGV0aW1lcGlja2VyT3B0aW9ucywgJHRoaXMuYXR0cignZGF0YS1pZCcpKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIG1vZGFsLmZpbmQoXCIuc2F2ZS1jaGFuZ2VzXCIpLm9mZihcImNsaWNrXCIpLm9uKCdjbGljaycsIHNhdmVDaGFuZ2VzLmJpbmQobnVsbCwkdGhpcy5hdHRyKCdkYXRhLWlkJykpKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIG1vZGFsLmZpbmQoXCIuZGVsZXRlLWV2ZW50XCIpLm9mZihcImNsaWNrXCIpLm9uKCdjbGljaycsIGZ1bmN0aW9uKCl7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgJC5nZXQoXCJzY2hlZHVsZS9ldmVudHMvZGVsZXRlL1wiICsgJHRoaXMuYXR0cignZGF0YS1pZCcpKS5kb25lKGZ1bmN0aW9uKCl7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNsbmRyLnNldEV2ZW50cyhzdG9yYWdlLmdldChcImV2ZW50c1wiKS5kZWwocGFyc2VJbnQoJHRoaXMuYXR0cignZGF0YS1pZCcpKSkuZ2V0UmVuZGVyZWQoNjApKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbW9kYWwubW9kYWwoXCJoaWRlXCIpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgICAgICAgICBtb2RhbC5maW5kKFwiLmRlbGV0ZS1ldmVudFwiKS5zaG93KCk7XG4gICAgICAgICAgICAgICAgICAgICAgICAkKFwiI3BsYXlsaXN0XCIpLnNlbGVjdHBpY2tlcihcInZhbFwiLCAkdGhpcy5hdHRyKFwiZGF0YS1wbGF5bGlzdFwiKSB8fCAwKTtcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICAkKFwiLmV2ZW50LWxpc3RpbmdcIikub24oJ2NsaWNrJywgJy5ldmVudC1pdGVtIC5ldmVudC1pdGVtLWhvdmVyIHNwYW46bGFzdC1jaGlsZCcsIGZ1bmN0aW9uKGUpe1xuICAgICAgICAgICAgICAgICAgICBlLnN0b3BQcm9wYWdhdGlvbigpO1xuICAgICAgICAgICAgICAgICAgICAkKHRoaXMpLnRvZ2dsZUNsYXNzKCd0ZXh0LWluZm8nKTtcbiAgICAgICAgICAgICAgICAgICAgdmFyICR0aGlzID0gJCh0aGlzKS5wYXJlbnQoKS5wYXJlbnQoKTtcbiAgICAgICAgICAgICAgICAgICAgdmFyIGlkID0gJHRoaXMuYXR0cignZGF0YS1pZCcpO1xuICAgICAgICAgICAgICAgICAgICB2YXIgbWF0Y2ggPSAkKCcuZGF5cyBbZGF0YS1pZCo9XCInKyBpZCArJ1wiXScpO1xuICAgICAgICAgICAgICAgICAgICBpZighJCh0aGlzKS5oYXNDbGFzcygndGV4dC1pbmZvJykpe1xuICAgICAgICAgICAgICAgICAgICAgICAgbWF0Y2guY3NzKFwiYmFja2dyb3VuZC1jb2xvclwiLCBcIiNlZWVcIik7XG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgdmFyIGNvbG9yID0gKGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgdmFyIGxldHRlcnMgPSAnQkNERUYnLnNwbGl0KCcnKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIHZhciBjb2xvciA9ICcjJztcbiAgICAgICAgICAgICAgICAgICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgNjsgaSsrICkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbG9yICs9IGxldHRlcnNbTWF0aC5mbG9vcihNYXRoLnJhbmRvbSgpICogbGV0dGVycy5sZW5ndGgpXTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBjb2xvcjtcbiAgICAgICAgICAgICAgICAgICAgfSkoKTtcbiAgICAgICAgICAgICAgICAgICAgbWF0Y2guY3NzKFwiYmFja2dyb3VuZC1jb2xvclwiLCBjb2xvcik7XG4gICAgICAgICAgICAgICAgfSk7XG5cblxuXG4gICAgICAgICAgICAgICAgLy9Jbml0IG1vZGFsIHdpbmRvdyBcIkFkZCBldmVudFwiXG4gICAgICAgICAgICAgICAgZXZlbnRMaXN0aW5nVGl0bGUub24oXCJjbGlja1wiLCBcIi5nbHlwaGljb24tcGx1c1wiLCBmdW5jdGlvbigpe1xuICAgICAgICAgICAgICAgICAgICBtb2RhbC5maW5kKFwiZm9ybVwiKS5nZXQoMCkucmVzZXQoKTtcbiAgICAgICAgICAgICAgICAgICAgbW9kYWwuZmluZChcIi5tb2RhbC10aXRsZVwiKS50ZXh0KFwiQWRkIGV2ZW50XCIpO1xuXG4gICAgICAgICAgICAgICAgICAgIGlmKCQodGhpcykucGFyZW50KCkuaGFzQ2xhc3MoXCJkYXktdGl0bGVcIikpe1xuICAgICAgICAgICAgICAgICAgICAgICAgZGF0ZXRpbWVwaWNrZXJPcHRpb25zLnZhbHVlID0gKGZ1bmN0aW9uKCl7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdmFyIHRpbWUgPSBcIiBcIiArIG1vbWVudCgpLmZvcm1hdChcIkhIOm1tXCIpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHZhciBlbCA9ICQoY2xuZHIuZWxlbWVudCkuZmluZChcIi5zZWxlY3RlZFwiKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZihlbC5sZW5ndGggPiAwKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gZWwuYXR0cihcImRhdGEtZGF0ZVwiKSArIHRpbWU7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZWxzZVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gJChjbG5kci5lbGVtZW50KS5maW5kKFwidG9kYXlcIikuYXR0cihcImRhdGEtZGF0ZVwiKSArIHRpbWU7XG4gICAgICAgICAgICAgICAgICAgICAgICB9KSgpO1xuICAgICAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICAgICAgZGF0ZXRpbWVQaWNrZXJJbml0KGRhdGV0aW1lcGlja2VyT3B0aW9ucyk7XG4gICAgICAgICAgICAgICAgICAgIG1vZGFsLmZpbmQoXCIuZGVsZXRlLWV2ZW50XCIpLmhpZGUoKTtcbiAgICAgICAgICAgICAgICAgICAgbW9kYWwuZmluZChcIi5zYXZlLWNoYW5nZXNcIikub2ZmKFwiY2xpY2tcIikub24oJ2NsaWNrJywgc2F2ZUNoYW5nZXMuYmluZChudWxsLCQodGhpcykuYXR0cignZGF0YS1kYXRlJykpKTtcbiAgICAgICAgICAgICAgICB9KTtcblxuICAgICAgICAgICAgICAgIC8vIHZhciBjYWxlbmRhciA9ICQoXCIuY2xuZHJcIik7XG4gICAgICAgICAgICAgICAgY2FsZW5kYXIuaGVpZ2h0KGNhbGVuZGFyLmhlaWdodCgpKTtcblxuXG4gICAgICAgICAgICAgICAgLy9BamF4IHBvc3QgcmVxdWVzdFxuXG4gICAgICAgICAgICB9Ly8hZG9uZVJlbmRlcmluZ1xuICAgICAgICB9KTtcbiAgICB9O1xuXG59KSgpOyJdLCJmaWxlIjoiZGFzaGJvYXJkL3NjaGVkdWxlLmpzIiwic291cmNlUm9vdCI6Ii9zb3VyY2UvIn0=
