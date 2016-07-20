var clndr = {};
$(function(){
    "use strict";

    _.templateSettings = {
        evaluate    : /\{\{%([\s\S]+?)%\}\}/g,
        interpolate : /\{\{%=([\s\S]+?)%\}\}/g,
        escape      : /\{\{%-([\s\S]+?)%\}\}/g
    };
    // Call this from the developer console and you can control both instances
    moment.locale("en-gb");
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

    var dayEventsTemplate = $('#day-events').html();
    clndr = $('#full-clndr').clndr({ //Start clndr
        template: $('#full-clndr-template').html(),
        events: events,
        clickEvents: {
            click: function (target) {
                $(".day-events").mCustomScrollbar("destroy");
                $(".event-items").slideUp();
                $(".day-events").slideDown();
                var template = _.template(dayEventsTemplate);
                $(".day-events").html(template({eventsThisDay: target.events}))
                    .height( $(".clndr-grid .days").height() - $(".clndr-grid .days-of-the-week").height() );
                    $(".day-events").mCustomScrollbar("destroy").mCustomScrollbar({
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
        ready: function(){
            $(".event-listing-title").on("click", ".glyphicon-chevron-up, .glyphicon-chevron-down", function(){
                var el = {};
                if($(this).parent().hasClass("month-title"))
                    el = $(".day-title [class *=glyphicon-chevron]").eq(0);
                 else
                    el = $(".month-title [class *=glyphicon-chevron]").eq(0);

                if(el.hasClass("glyphicon-chevron-up"))
                    el.removeClass("glyphicon-chevron-up")
                        .addClass("glyphicon-chevron-down")
                else
                    el.removeClass("glyphicon-chevron-down")
                        .addClass("glyphicon-chevron-up");

                if($(this).hasClass("glyphicon-chevron-up"))
                    $(this).removeClass("glyphicon-chevron-up").addClass("glyphicon-chevron-down");
                else
                    $(this).removeClass("glyphicon-chevron-down").addClass("glyphicon-chevron-up");
                $(".event-items, .day-events").slideToggle();

            });

            var modal = $("#modal");
            $(".event-listing-title").on("click", ".glyphicon-plus", function(){
                modal.find("form").get(0).reset();
                var datetimepickerOptions = {
                    step: 30
                };
                if($(this).parent().hasClass("day-title")){
                    datetimepickerOptions.value = (function(){
                        var time = " " + moment().format("HH:mm");
                        var el = $(clndr.element).find(".selected");
                        var result = "";

                        if(el.length > 0)
                            result =  el.attr("data-id") + time;
                        else
                            result =  $(clndr.element).find("today").attr("data-id") + time;
                        $('#datetimepicker').val(result);
                        return result;

                    })();
                }
                $('#repeat-day').iCheck('uncheck')
                    .iCheck({
                    checkboxClass: 'icheckbox_square-blue',
                    radioClass: 'iradio_square-blue',
                    increaseArea: '20%', // optional
                }).on("ifUnchecked", function(){
                    $('#datetimepicker')
                        .datetimepicker('destroy')
                        .datetimepicker();
                }).on("ifChecked", function(){
                    $('#datetimepicker')
                        .datetimepicker('destroy')
                        .datetimepicker({
                            datepicker:false,
                            format:'H:i'
                        });
                });
                $('#datetimepicker')
                    .datetimepicker('destroy')
                    .datetimepicker(datetimepickerOptions);

                modal.modal('show');
            });

            $(".clndr")
                .height($(".clndr").height());
            this.today();

        },
        doneRendering: function(){
            console.log("Render");
            $(".event-items")
                .height( $(".clndr-grid .days").height() - $(".clndr-grid .days-of-the-week").height() )
                .mCustomScrollbar({
                scrollButtons:{enable:true},
                theme:"minimal-dark"
            })
        }
    });//End clndr


});