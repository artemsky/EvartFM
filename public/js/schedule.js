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
        repeat: function(){
            this.target.repeat = true;
            return this;
        },
        result: function(){
            if(!this.target.repeat)
                return this.target.object;
            var result = [];
            for(var i in this.target.object)
                result.push(this.target.object[i].repeat);
            return result;
        }
    };

    //events
    var events = [];
    var onEventsSuccess = function(response){
            $("#fountainTextG").hide();
            initCalendar(response);
            storage.set('events', events);
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

    //read events template
    var dayEventsTemplate = $('#day-events').html();

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
                        //.slideDown()
                        .html(template({eventsThisDay: target.events}))
                        .height( $(".clndr-grid .days").height() - $(".clndr-grid .days-of-the-week").height() )
                        .mCustomScrollbar({
                            scrollButtons:{enable:true},
                            theme:"minimal-dark"
                        });
                    $(".event-items")//.slideUp();

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

                //Init modal window
                var modal = $("#modal");
                var datetimepickerOptions = {
                    step: 30
                };
                var datetimePickerInit = function(options){
                    var dtPicker = $('#datetimepicker');
                    $('#repeat-day').iCheck('uncheck')
                        .iCheck({
                            checkboxClass: 'icheckbox_square-blue',
                            radioClass: 'iradio_square-blue',
                            increaseArea: '20%', // optional
                        }).on("ifUnchecked", function(){
                        dtPicker
                            .datetimepicker('destroy')
                            .datetimepicker();
                    }).on("ifChecked", function(){
                        dtPicker
                            .datetimepicker('destroy')
                            .datetimepicker({
                                datepicker:false,
                                format:'H:i'
                            });
                    });
                    dtPicker
                        .datetimepicker('destroy')
                        .datetimepicker(options);
                    modal.modal('show');
                };

                //Init modal window "Edit event"
                $(".event-listing").on('click', '.event-item', function(){
                    modal.find("form").get(0).reset();
                    modal.find(".modal-title").text("Edit event");

                    datetimepickerOptions.value = $(this).find(".event-item-time").attr("data-datetime");
                    modal.find("#Title").val($(this).find(".event-item-name").text());
                    modal.find("#Description").val($(this).find(".event-item-location").text());

                    datetimePickerInit(datetimepickerOptions);
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiIiwic291cmNlcyI6WyJzY2hlZHVsZS5qcyJdLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24oKXtcclxuICAgIFwidXNlIHN0cmljdFwiO1xyXG5cclxuICAgIC8vU2V0IHVuZGVyc2NvcmUgdGVtcGxhdGUgc2V0dGluZyBhcyB7eyUlfX0gZm9yIGJldHRlciBjb2RlIHJlYWRpbmdcclxuICAgIF8udGVtcGxhdGVTZXR0aW5ncyA9IHtcclxuICAgICAgICBldmFsdWF0ZSAgICA6IC9cXHtcXHslKFtcXHNcXFNdKz8pJVxcfVxcfS9nLFxyXG4gICAgICAgIGludGVycG9sYXRlIDogL1xce1xceyU9KFtcXHNcXFNdKz8pJVxcfVxcfS9nLFxyXG4gICAgICAgIGVzY2FwZSAgICAgIDogL1xce1xceyUtKFtcXHNcXFNdKz8pJVxcfVxcfS9nXHJcbiAgICB9O1xyXG4gICAgLy9TZXQgbW9tZW50IGxvY2FsZVxyXG4gICAgbW9tZW50LmxvY2FsZShcImVuLWdiXCIpO1xyXG5cclxuICAgIC8vSW5pdCBzdG9yYWdlIGhlbHBlcnNcclxuICAgIHZhciBzdG9yYWdlID0ge1xyXG4gICAgICAgIGRpc2s6IHNlc3Npb25TdG9yYWdlIHx8IGxvY2FsU3RvcmFnZSxcclxuICAgICAgICB0YXJnZXQ6IHtcclxuICAgICAgICAgICAgbmFtZTogbnVsbCxcclxuICAgICAgICAgICAgb2JqZWN0OiBudWxsLFxyXG4gICAgICAgICAgICByZXBlYXQ6IGZhbHNlXHJcbiAgICAgICAgfSxcclxuICAgICAgICAnZ2V0JzogZnVuY3Rpb24oa2V5KXtcclxuICAgICAgICAgICAgaWYoIXRoaXMuZGlzay5nZXRJdGVtKGtleSkpXHJcbiAgICAgICAgICAgICAgcmV0dXJuIG51bGw7XHJcbiAgICAgICAgICAgIHRoaXMudGFyZ2V0Lm9iamVjdCA9IEpTT04ucGFyc2UodGhpcy5kaXNrLmdldEl0ZW0oa2V5KSk7XHJcbiAgICAgICAgICAgIHRoaXMudGFyZ2V0Lm5hbWUgPSBrZXk7XHJcbiAgICAgICAgICAgIHJldHVybiB0aGlzO1xyXG4gICAgICAgIH0sXHJcbiAgICAgICAgJ3NldCc6IGZ1bmN0aW9uKGtleSwgdmFsdWUpe1xyXG4gICAgICAgICAgICB0aGlzLmRpc2suc2V0SXRlbShrZXksIEpTT04uc3RyaW5naWZ5KHZhbHVlKSk7XHJcbiAgICAgICAgICAgIHRoaXMudGFyZ2V0Lm5hbWUgPSBrZXk7XHJcbiAgICAgICAgICAgIHJldHVybiB0aGlzO1xyXG4gICAgICAgIH0sXHJcbiAgICAgICAgd2hlcmVEYXRlOiBmdW5jdGlvbihkYXRlKXtcclxuICAgICAgICAgICAgaWYoIWRhdGUpXHJcbiAgICAgICAgICAgICAgICByZXR1cm4gbnVsbDtcclxuICAgICAgICAgICAgZm9yKHZhciBpIGluIHRoaXMudGFyZ2V0Lm9iamVjdClcclxuICAgICAgICAgICAgICAgIGlmKHRoaXMudGFyZ2V0Lm9iamVjdFtpXS5kYXRlLnN1YnN0cmluZygwLDEwKSA9PSBkYXRlKXtcclxuICAgICAgICAgICAgICAgICAgICB0aGlzLnRhcmdldC5vYmplY3QgPSBbdGhpcy50YXJnZXQub2JqZWN0W2ldXTtcclxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gdGhpcztcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgdGhpcy50YXJnZXQub2JqZWN0ID0gW107XHJcbiAgICAgICAgICAgIHJldHVybiB0aGlzO1xyXG4gICAgICAgIH0sXHJcbiAgICAgICAgcmVwZWF0OiBmdW5jdGlvbigpe1xyXG4gICAgICAgICAgICB0aGlzLnRhcmdldC5yZXBlYXQgPSB0cnVlO1xyXG4gICAgICAgICAgICByZXR1cm4gdGhpcztcclxuICAgICAgICB9LFxyXG4gICAgICAgIHJlc3VsdDogZnVuY3Rpb24oKXtcclxuICAgICAgICAgICAgaWYoIXRoaXMudGFyZ2V0LnJlcGVhdClcclxuICAgICAgICAgICAgICAgIHJldHVybiB0aGlzLnRhcmdldC5vYmplY3Q7XHJcbiAgICAgICAgICAgIHZhciByZXN1bHQgPSBbXTtcclxuICAgICAgICAgICAgZm9yKHZhciBpIGluIHRoaXMudGFyZ2V0Lm9iamVjdClcclxuICAgICAgICAgICAgICAgIHJlc3VsdC5wdXNoKHRoaXMudGFyZ2V0Lm9iamVjdFtpXS5yZXBlYXQpO1xyXG4gICAgICAgICAgICByZXR1cm4gcmVzdWx0O1xyXG4gICAgICAgIH1cclxuICAgIH07XHJcblxyXG4gICAgLy9ldmVudHNcclxuICAgIHZhciBldmVudHMgPSBbXTtcclxuICAgIHZhciBvbkV2ZW50c1N1Y2Nlc3MgPSBmdW5jdGlvbihyZXNwb25zZSl7XHJcbiAgICAgICAgICAgICQoXCIjZm91bnRhaW5UZXh0R1wiKS5oaWRlKCk7XHJcbiAgICAgICAgICAgIGluaXRDYWxlbmRhcihyZXNwb25zZSk7XHJcbiAgICAgICAgICAgIHN0b3JhZ2Uuc2V0KCdldmVudHMnLCBldmVudHMpO1xyXG4gICAgICAgIH0sXHJcbiAgICAgICAgb25FdmVudHNFcnJvciA9IGZ1bmN0aW9uIChyZXNwb25zZSl7XHJcbiAgICAgICAgICAgICQoXCIjZm91bnRhaW5UZXh0R1wiKS5oaWRlKCk7XHJcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKHJlc3BvbnNlKTtcclxuICAgICAgICB9O1xyXG4gICAgdmFyIHJlcXVlc3RPcHRpb25zID0ge1xyXG4gICAgICAgIHR5cGU6IFwiR0VUXCIsXHJcbiAgICAgICAgY2FjaGU6IGZhbHNlLFxyXG4gICAgICAgIHN1Y2Nlc3M6IG9uRXZlbnRzU3VjY2VzcyxcclxuICAgICAgICBlcnJvcjogb25FdmVudHNFcnJvclxyXG4gICAgfTtcclxuICAgICQuYWpheCgnc2NoZWR1bGUvZXZlbnRzJywgcmVxdWVzdE9wdGlvbnMpO1xyXG4gICAgXHJcbiAgICAvLyFldmVudHNcclxuXHJcbiAgICAvL3JlYWQgZXZlbnRzIHRlbXBsYXRlXHJcbiAgICB2YXIgZGF5RXZlbnRzVGVtcGxhdGUgPSAkKCcjZGF5LWV2ZW50cycpLmh0bWwoKTtcclxuXHJcbiAgICAvL0luaXQgY2FsZW5kYXJcclxuICAgIHZhciBpbml0Q2FsZW5kYXIgPSBmdW5jdGlvbihldmVudHMpe1xyXG4gICAgICAgIHZhciBjbG5kciA9ICQoJyNmdWxsLWNsbmRyJykuY2xuZHIoe1xyXG4gICAgICAgICAgICB0ZW1wbGF0ZTogJCgnI2Z1bGwtY2xuZHItdGVtcGxhdGUnKS5odG1sKCksXHJcbiAgICAgICAgICAgIGV2ZW50czogZXZlbnRzLFxyXG4gICAgICAgICAgICBjbGlja0V2ZW50czoge1xyXG4gICAgICAgICAgICAgICAgY2xpY2s6IGZ1bmN0aW9uICh0YXJnZXQpIHtcclxuICAgICAgICAgICAgICAgICAgICB2YXIgdGVtcGxhdGUgPSBfLnRlbXBsYXRlKGRheUV2ZW50c1RlbXBsYXRlKTtcclxuICAgICAgICAgICAgICAgICAgICAkKFwiLmRheS1ldmVudHNcIilcclxuICAgICAgICAgICAgICAgICAgICAgICAgLm1DdXN0b21TY3JvbGxiYXIoXCJkZXN0cm95XCIpXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIC8vLnNsaWRlRG93bigpXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIC5odG1sKHRlbXBsYXRlKHtldmVudHNUaGlzRGF5OiB0YXJnZXQuZXZlbnRzfSkpXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIC5oZWlnaHQoICQoXCIuY2xuZHItZ3JpZCAuZGF5c1wiKS5oZWlnaHQoKSAtICQoXCIuY2xuZHItZ3JpZCAuZGF5cy1vZi10aGUtd2Vla1wiKS5oZWlnaHQoKSApXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIC5tQ3VzdG9tU2Nyb2xsYmFyKHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHNjcm9sbEJ1dHRvbnM6e2VuYWJsZTp0cnVlfSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRoZW1lOlwibWluaW1hbC1kYXJrXCJcclxuICAgICAgICAgICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgICAgICAgICAgJChcIi5ldmVudC1pdGVtc1wiKS8vLnNsaWRlVXAoKTtcclxuXHJcbiAgICAgICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICAgICAgb25Nb250aENoYW5nZTogZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMub3B0aW9ucy5yZWFkeSgpO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICBmb3JjZVNpeFJvd3M6IHRydWUsXHJcbiAgICAgICAgICAgIG11bHRpRGF5RXZlbnRzOiB7XHJcbiAgICAgICAgICAgICAgICBzaW5nbGVEYXk6ICdkYXRlJyxcclxuICAgICAgICAgICAgICAgIGVuZERhdGU6ICdlbmREYXRlJyxcclxuICAgICAgICAgICAgICAgIHN0YXJ0RGF0ZTogJ3N0YXJ0RGF0ZSdcclxuICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgc2hvd0FkamFjZW50TW9udGhzOiB0cnVlLFxyXG4gICAgICAgICAgICBhZGphY2VudERheXNDaGFuZ2VNb250aDogZmFsc2UsXHJcbiAgICAgICAgICAgIHRyYWNrU2VsZWN0ZWREYXRlOiB0cnVlLFxyXG4gICAgICAgICAgICBkYXlzT2ZUaGVXZWVrOiAoZnVuY3Rpb24oKXtcclxuICAgICAgICAgICAgICAgIHZhciByZXN1bHQgPSBbXTtcclxuICAgICAgICAgICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgNzsgaSsrKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgcmVzdWx0LnB1c2gobW9tZW50KCkud2Vla2RheShpKS5mb3JtYXQoJ2RkZCcpKTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIHJldHVybiByZXN1bHQ7XHJcbiAgICAgICAgICAgIH0pKCksXHJcbiAgICAgICAgICAgIHJlYWR5OiBmdW5jdGlvbigpeyAvL3JlYWR5XHJcbiAgICAgICAgICAgICAgICB2YXIgZXZlbnRMaXN0aW5nVGl0bGUgPSAkKFwiLmV2ZW50LWxpc3RpbmctdGl0bGVcIik7XHJcbiAgICAgICAgICAgICAgICAvL0luaXQgYmxvY2sgT3Blbi9DbG9zZSBldmVudFxyXG4gICAgICAgICAgICAgICAgZXZlbnRMaXN0aW5nVGl0bGUub24oXCJjbGlja1wiLCBcIi5nbHlwaGljb24tY2hldnJvbi11cCwgLmdseXBoaWNvbi1jaGV2cm9uLWRvd25cIiwgZnVuY3Rpb24oKXtcclxuICAgICAgICAgICAgICAgICAgICB2YXIgZWwgPSB7fTtcclxuICAgICAgICAgICAgICAgICAgICB2YXIgYmxvY2sgPSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIG9wZW46IFwiZ2x5cGhpY29uLWNoZXZyb24tdXBcIixcclxuICAgICAgICAgICAgICAgICAgICAgICAgY2xvc2U6IFwiZ2x5cGhpY29uLWNoZXZyb24tZG93blwiXHJcbiAgICAgICAgICAgICAgICAgICAgfTtcclxuICAgICAgICAgICAgICAgICAgICB2YXIgJHRoaXMgPSAkKHRoaXMpO1xyXG4gICAgICAgICAgICAgICAgICAgIGlmKCR0aGlzLnBhcmVudCgpLmhhc0NsYXNzKFwibW9udGgtdGl0bGVcIikpXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGVsID0gJChcIi5kYXktdGl0bGUgW2NsYXNzICo9Z2x5cGhpY29uLWNoZXZyb25dXCIpLmVxKDApO1xyXG4gICAgICAgICAgICAgICAgICAgIGVsc2VcclxuICAgICAgICAgICAgICAgICAgICAgICAgZWwgPSAkKFwiLm1vbnRoLXRpdGxlIFtjbGFzcyAqPWdseXBoaWNvbi1jaGV2cm9uXVwiKS5lcSgwKTtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgaWYoZWwuaGFzQ2xhc3MoYmxvY2sub3BlbikpXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGVsLnJlbW92ZUNsYXNzKGJsb2NrLm9wZW4pLmFkZENsYXNzKGJsb2NrLmNsb3NlKTtcclxuICAgICAgICAgICAgICAgICAgICBlbHNlXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGVsLnJlbW92ZUNsYXNzKGJsb2NrLmNsb3NlKS5hZGRDbGFzcyhibG9jay5vcGVuKTtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgaWYoJHRoaXMuaGFzQ2xhc3MoYmxvY2sub3BlbikpXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICR0aGlzLnJlbW92ZUNsYXNzKGJsb2NrLm9wZW4pLmFkZENsYXNzKGJsb2NrLmNsb3NlKTtcclxuICAgICAgICAgICAgICAgICAgICBlbHNlXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICR0aGlzLnJlbW92ZUNsYXNzKGJsb2NrLmNsb3NlKS5hZGRDbGFzcyhibG9jay5vcGVuKTtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgJChcIi5ldmVudC1pdGVtcywgLmRheS1ldmVudHNcIikuc2xpZGVUb2dnbGUoKTtcclxuXHJcbiAgICAgICAgICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgICAgICAgICAvL0luaXQgbW9kYWwgd2luZG93XHJcbiAgICAgICAgICAgICAgICB2YXIgbW9kYWwgPSAkKFwiI21vZGFsXCIpO1xyXG4gICAgICAgICAgICAgICAgdmFyIGRhdGV0aW1lcGlja2VyT3B0aW9ucyA9IHtcclxuICAgICAgICAgICAgICAgICAgICBzdGVwOiAzMFxyXG4gICAgICAgICAgICAgICAgfTtcclxuICAgICAgICAgICAgICAgIHZhciBkYXRldGltZVBpY2tlckluaXQgPSBmdW5jdGlvbihvcHRpb25zKXtcclxuICAgICAgICAgICAgICAgICAgICB2YXIgZHRQaWNrZXIgPSAkKCcjZGF0ZXRpbWVwaWNrZXInKTtcclxuICAgICAgICAgICAgICAgICAgICAkKCcjcmVwZWF0LWRheScpLmlDaGVjaygndW5jaGVjaycpXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIC5pQ2hlY2soe1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY2hlY2tib3hDbGFzczogJ2ljaGVja2JveF9zcXVhcmUtYmx1ZScsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICByYWRpb0NsYXNzOiAnaXJhZGlvX3NxdWFyZS1ibHVlJyxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGluY3JlYXNlQXJlYTogJzIwJScsIC8vIG9wdGlvbmFsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH0pLm9uKFwiaWZVbmNoZWNrZWRcIiwgZnVuY3Rpb24oKXtcclxuICAgICAgICAgICAgICAgICAgICAgICAgZHRQaWNrZXJcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIC5kYXRldGltZXBpY2tlcignZGVzdHJveScpXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAuZGF0ZXRpbWVwaWNrZXIoKTtcclxuICAgICAgICAgICAgICAgICAgICB9KS5vbihcImlmQ2hlY2tlZFwiLCBmdW5jdGlvbigpe1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBkdFBpY2tlclxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgLmRhdGV0aW1lcGlja2VyKCdkZXN0cm95JylcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIC5kYXRldGltZXBpY2tlcih7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZGF0ZXBpY2tlcjpmYWxzZSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBmb3JtYXQ6J0g6aSdcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICAgICAgICAgIGR0UGlja2VyXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIC5kYXRldGltZXBpY2tlcignZGVzdHJveScpXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIC5kYXRldGltZXBpY2tlcihvcHRpb25zKTtcclxuICAgICAgICAgICAgICAgICAgICBtb2RhbC5tb2RhbCgnc2hvdycpO1xyXG4gICAgICAgICAgICAgICAgfTtcclxuXHJcbiAgICAgICAgICAgICAgICAvL0luaXQgbW9kYWwgd2luZG93IFwiRWRpdCBldmVudFwiXHJcbiAgICAgICAgICAgICAgICAkKFwiLmV2ZW50LWxpc3RpbmdcIikub24oJ2NsaWNrJywgJy5ldmVudC1pdGVtJywgZnVuY3Rpb24oKXtcclxuICAgICAgICAgICAgICAgICAgICBtb2RhbC5maW5kKFwiZm9ybVwiKS5nZXQoMCkucmVzZXQoKTtcclxuICAgICAgICAgICAgICAgICAgICBtb2RhbC5maW5kKFwiLm1vZGFsLXRpdGxlXCIpLnRleHQoXCJFZGl0IGV2ZW50XCIpO1xyXG5cclxuICAgICAgICAgICAgICAgICAgICBkYXRldGltZXBpY2tlck9wdGlvbnMudmFsdWUgPSAkKHRoaXMpLmZpbmQoXCIuZXZlbnQtaXRlbS10aW1lXCIpLmF0dHIoXCJkYXRhLWRhdGV0aW1lXCIpO1xyXG4gICAgICAgICAgICAgICAgICAgIG1vZGFsLmZpbmQoXCIjVGl0bGVcIikudmFsKCQodGhpcykuZmluZChcIi5ldmVudC1pdGVtLW5hbWVcIikudGV4dCgpKTtcclxuICAgICAgICAgICAgICAgICAgICBtb2RhbC5maW5kKFwiI0Rlc2NyaXB0aW9uXCIpLnZhbCgkKHRoaXMpLmZpbmQoXCIuZXZlbnQtaXRlbS1sb2NhdGlvblwiKS50ZXh0KCkpO1xyXG5cclxuICAgICAgICAgICAgICAgICAgICBkYXRldGltZVBpY2tlckluaXQoZGF0ZXRpbWVwaWNrZXJPcHRpb25zKTtcclxuICAgICAgICAgICAgICAgIH0pO1xyXG5cclxuICAgICAgICAgICAgICAgIC8vSW5pdCBtb2RhbCB3aW5kb3cgXCJBZGQgZXZlbnRcIlxyXG4gICAgICAgICAgICAgICAgZXZlbnRMaXN0aW5nVGl0bGUub24oXCJjbGlja1wiLCBcIi5nbHlwaGljb24tcGx1c1wiLCBmdW5jdGlvbigpe1xyXG4gICAgICAgICAgICAgICAgICAgIG1vZGFsLmZpbmQoXCJmb3JtXCIpLmdldCgwKS5yZXNldCgpO1xyXG4gICAgICAgICAgICAgICAgICAgIG1vZGFsLmZpbmQoXCIubW9kYWwtdGl0bGVcIikudGV4dChcIkFkZCBldmVudFwiKTtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgaWYoJCh0aGlzKS5wYXJlbnQoKS5oYXNDbGFzcyhcImRheS10aXRsZVwiKSl7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGRhdGV0aW1lcGlja2VyT3B0aW9ucy52YWx1ZSA9IChmdW5jdGlvbigpe1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdmFyIHRpbWUgPSBcIiBcIiArIG1vbWVudCgpLmZvcm1hdChcIkhIOm1tXCIpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdmFyIGVsID0gJChjbG5kci5lbGVtZW50KS5maW5kKFwiLnNlbGVjdGVkXCIpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYoZWwubGVuZ3RoID4gMClcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gZWwuYXR0cihcImRhdGEtaWRcIikgKyB0aW1lO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZWxzZVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiAkKGNsbmRyLmVsZW1lbnQpLmZpbmQoXCJ0b2RheVwiKS5hdHRyKFwiZGF0YS1pZFwiKSArIHRpbWU7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH0pKCk7XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgICAgICAgICBkYXRldGltZVBpY2tlckluaXQoZGF0ZXRpbWVwaWNrZXJPcHRpb25zKTtcclxuICAgICAgICAgICAgICAgIH0pO1xyXG5cclxuICAgICAgICAgICAgICAgIHZhciBjYWxlbmRhciA9ICQoXCIuY2xuZHJcIik7XHJcbiAgICAgICAgICAgICAgICBjYWxlbmRhci5oZWlnaHQoY2FsZW5kYXIuaGVpZ2h0KCkpO1xyXG5cclxuICAgICAgICAgICAgfSwvLyFyZWFkeVxyXG4gICAgICAgICAgICBkb25lUmVuZGVyaW5nOiBmdW5jdGlvbigpeyAvL2RvbmVSZW5kZXJpbmdcclxuICAgICAgICAgICAgICAgICQoXCIuZGF5LWV2ZW50c1wiKVxyXG4gICAgICAgICAgICAgICAgICAgIC5oZWlnaHQoICQoXCIuY2xuZHItZ3JpZCAuZGF5c1wiKS5oZWlnaHQoKSAtICQoXCIuY2xuZHItZ3JpZCAuZGF5cy1vZi10aGUtd2Vla1wiKS5oZWlnaHQoKSApXHJcbiAgICAgICAgICAgICAgICAgICAgLm1DdXN0b21TY3JvbGxiYXIoe1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBzY3JvbGxCdXR0b25zOntlbmFibGU6dHJ1ZX0sXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoZW1lOlwibWluaW1hbC1kYXJrXCJcclxuICAgICAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgICAgIHZhciBjYWxlbmRhciA9ICQoXCIjZnVsbC1jbG5kclwiKTtcclxuICAgICAgICAgICAgICAgIGlmKGNhbGVuZGFyLmZpbmQoXCIudG9kYXlcIikubGVuZ3RoID4gMClcclxuICAgICAgICAgICAgICAgICAgICBjYWxlbmRhci5maW5kKFwiLnRvZGF5XCIpLmNsaWNrKCk7XHJcbiAgICAgICAgICAgICAgICBlbHNlXHJcbiAgICAgICAgICAgICAgICAgICAgY2FsZW5kYXIuZmluZChcIi5kYXlcIikuZXEoMCkuY2xpY2soKTtcclxuXHJcbiAgICAgICAgICAgIH0vLyFkb25lUmVuZGVyaW5nXHJcbiAgICAgICAgfSk7XHJcbiAgICB9O1xyXG5cclxufSkoKTsiXSwiZmlsZSI6InNjaGVkdWxlLmpzIiwic291cmNlUm9vdCI6Ii9zb3VyY2UvIn0=
