
$(function(){
    "use strict";

    //Set underscore template setting as {{%%}} for better code reading
    _.templateSettings = {
        evaluate    : /\{\{%([\s\S]+?)%\}\}/g,
        interpolate : /\{\{%=([\s\S]+?)%\}\}/g,
        escape      : /\{\{%-([\s\S]+?)%\}\}/g
    };
    //Set moment locale
    moment.locale("en-gb");

    //events
    var currentMonth = moment().format('YYYY-MM');
    var nextMonth    = moment().add('month', 1).format('YYYY-MM');
    var events = [
        { date: currentMonth + '-' + '10 20:00:00', title: 'Persian Kitten Auction', location: 'Center for Beautiful Cats', id: 42 },
        { date: currentMonth + '-' + '19 21:00:00', title: 'Cat Frisbee', location: 'Jefferson Park', id: 43 },
        { date: currentMonth + '-' + '23 18:00:00', title: 'Kitten Demonstration', location: 'Center for Beautiful Cats', id: 44 },
        { date: currentMonth + '-' + '23 18:00:00', title: 'Kitten Demonstration', location: 'Center for Beautiful Cats', id: 45 },
        { date: currentMonth + '-' + '23 19:00:00', title: 'Kitten Demonstration', location: 'Center for Beautiful Cats', id: 46 },
        { date: currentMonth + '-' + '23 20:00:00', title: 'Kitten Demonstration', location: 'Center for Beautiful Cats', id: 47 },
        { date: currentMonth + '-' + '23 21:00:00', title: 'Kitten Demonstration', location: 'Center for Beautiful Cats', id: 48 },
        { date: currentMonth + '-' + '23 22:00:00', title: 'Kitten Demonstration', location: 'Center for Beautiful Cats', id: 49 },
        { date: currentMonth + '-' + '23 23:00:00', title: 'Kitten Demonstration', location: 'Center for Beautiful Cats', id: 50 },
        { date: nextMonth + '-' + '07 17:30:00',    title: 'Small Cat Photo Session', location: 'Center for Cat Photography', id: 51 },
        { date: currentMonth + '-' + '20 17:30:00',    title: 'Small Cat Photo Session', location: 'Center for Cat Photography', id: 52 }
    ];
    //!events

    //read events template
    var dayEventsTemplate = $('#day-events').html();

    //Init calendar
    var clndr = $('#full-clndr').clndr({
        template: $('#full-clndr-template').html(),
        events: events,
        clickEvents: {
            click: function (target) {
                var template = _.template(dayEventsTemplate);
                $(".day-events")
                    .mCustomScrollbar("destroy")
                    .slideDown()
                    .html(template({eventsThisDay: target.events}))
                    .height( $(".clndr-grid .days").height() - $(".clndr-grid .days-of-the-week").height() )
                    .mCustomScrollbar({
                        scrollButtons:{enable:true},
                        theme:"minimal-dark"
                    });
                $(".event-items").slideUp();

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
            $(".event-items")
                .height( $(".clndr-grid .days").height() - $(".clndr-grid .days-of-the-week").height() )
                .mCustomScrollbar({
                scrollButtons:{enable:true},
                theme:"minimal-dark"
            })
        }//!doneRendering
    });
});