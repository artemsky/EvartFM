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
            $(".event-listing").on('click', '.event-item', function(){
                modal.find(".modal-title").text("Edit event");
                modal.find("form").get(0).reset();
                var datetimepickerOptions = {
                    step: 30,
                    value: $(this).find(".event-item-time").attr("data-datetime")
                };
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

                modal.find("#Title").val($(this).find(".event-item-name").text());
                modal.find("#Description").val($(this).find(".event-item-location").text());

                modal.modal('show');
            });


            $(".event-listing-title").on("click", ".glyphicon-plus", function(){
                modal.find("form").get(0).reset();
                modal.find(".modal-title").text("Add event");
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

        },
        doneRendering: function(){
            $(".event-items")
                .height( $(".clndr-grid .days").height() - $(".clndr-grid .days-of-the-week").height() )
                .mCustomScrollbar({
                scrollButtons:{enable:true},
                theme:"minimal-dark"
            })
        }
    });//End clndr


});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiIiwic291cmNlcyI6WyJzY2hlZHVsZS5qcyJdLCJzb3VyY2VzQ29udGVudCI6WyJ2YXIgY2xuZHIgPSB7fTtcclxuJChmdW5jdGlvbigpe1xyXG4gICAgXCJ1c2Ugc3RyaWN0XCI7XHJcblxyXG4gICAgXy50ZW1wbGF0ZVNldHRpbmdzID0ge1xyXG4gICAgICAgIGV2YWx1YXRlICAgIDogL1xce1xceyUoW1xcc1xcU10rPyklXFx9XFx9L2csXHJcbiAgICAgICAgaW50ZXJwb2xhdGUgOiAvXFx7XFx7JT0oW1xcc1xcU10rPyklXFx9XFx9L2csXHJcbiAgICAgICAgZXNjYXBlICAgICAgOiAvXFx7XFx7JS0oW1xcc1xcU10rPyklXFx9XFx9L2dcclxuICAgIH07XHJcbiAgICAvLyBDYWxsIHRoaXMgZnJvbSB0aGUgZGV2ZWxvcGVyIGNvbnNvbGUgYW5kIHlvdSBjYW4gY29udHJvbCBib3RoIGluc3RhbmNlc1xyXG4gICAgbW9tZW50LmxvY2FsZShcImVuLWdiXCIpO1xyXG4gICAgdmFyIGN1cnJlbnRNb250aCA9IG1vbWVudCgpLmZvcm1hdCgnWVlZWS1NTScpO1xyXG4gICAgdmFyIG5leHRNb250aCAgICA9IG1vbWVudCgpLmFkZCgnbW9udGgnLCAxKS5mb3JtYXQoJ1lZWVktTU0nKTtcclxuICAgIHZhciBldmVudHMgPSBbXHJcbiAgICAgICAgeyBkYXRlOiBjdXJyZW50TW9udGggKyAnLScgKyAnMTAgMjA6MDA6MDAnLCB0aXRsZTogJ1BlcnNpYW4gS2l0dGVuIEF1Y3Rpb24nLCBsb2NhdGlvbjogJ0NlbnRlciBmb3IgQmVhdXRpZnVsIENhdHMnLCBpZDogNDIgfSxcclxuICAgICAgICB7IGRhdGU6IGN1cnJlbnRNb250aCArICctJyArICcxOSAyMTowMDowMCcsIHRpdGxlOiAnQ2F0IEZyaXNiZWUnLCBsb2NhdGlvbjogJ0plZmZlcnNvbiBQYXJrJywgaWQ6IDQzIH0sXHJcbiAgICAgICAgeyBkYXRlOiBjdXJyZW50TW9udGggKyAnLScgKyAnMjMgMTg6MDA6MDAnLCB0aXRsZTogJ0tpdHRlbiBEZW1vbnN0cmF0aW9uJywgbG9jYXRpb246ICdDZW50ZXIgZm9yIEJlYXV0aWZ1bCBDYXRzJywgaWQ6IDQ0IH0sXHJcbiAgICAgICAgeyBkYXRlOiBjdXJyZW50TW9udGggKyAnLScgKyAnMjMgMTg6MDA6MDAnLCB0aXRsZTogJ0tpdHRlbiBEZW1vbnN0cmF0aW9uJywgbG9jYXRpb246ICdDZW50ZXIgZm9yIEJlYXV0aWZ1bCBDYXRzJywgaWQ6IDQ1IH0sXHJcbiAgICAgICAgeyBkYXRlOiBjdXJyZW50TW9udGggKyAnLScgKyAnMjMgMTk6MDA6MDAnLCB0aXRsZTogJ0tpdHRlbiBEZW1vbnN0cmF0aW9uJywgbG9jYXRpb246ICdDZW50ZXIgZm9yIEJlYXV0aWZ1bCBDYXRzJywgaWQ6IDQ2IH0sXHJcbiAgICAgICAgeyBkYXRlOiBjdXJyZW50TW9udGggKyAnLScgKyAnMjMgMjA6MDA6MDAnLCB0aXRsZTogJ0tpdHRlbiBEZW1vbnN0cmF0aW9uJywgbG9jYXRpb246ICdDZW50ZXIgZm9yIEJlYXV0aWZ1bCBDYXRzJywgaWQ6IDQ3IH0sXHJcbiAgICAgICAgeyBkYXRlOiBjdXJyZW50TW9udGggKyAnLScgKyAnMjMgMjE6MDA6MDAnLCB0aXRsZTogJ0tpdHRlbiBEZW1vbnN0cmF0aW9uJywgbG9jYXRpb246ICdDZW50ZXIgZm9yIEJlYXV0aWZ1bCBDYXRzJywgaWQ6IDQ4IH0sXHJcbiAgICAgICAgeyBkYXRlOiBjdXJyZW50TW9udGggKyAnLScgKyAnMjMgMjI6MDA6MDAnLCB0aXRsZTogJ0tpdHRlbiBEZW1vbnN0cmF0aW9uJywgbG9jYXRpb246ICdDZW50ZXIgZm9yIEJlYXV0aWZ1bCBDYXRzJywgaWQ6IDQ5IH0sXHJcbiAgICAgICAgeyBkYXRlOiBjdXJyZW50TW9udGggKyAnLScgKyAnMjMgMjM6MDA6MDAnLCB0aXRsZTogJ0tpdHRlbiBEZW1vbnN0cmF0aW9uJywgbG9jYXRpb246ICdDZW50ZXIgZm9yIEJlYXV0aWZ1bCBDYXRzJywgaWQ6IDUwIH0sXHJcbiAgICAgICAgeyBkYXRlOiBuZXh0TW9udGggKyAnLScgKyAnMDcgMTc6MzA6MDAnLCAgICB0aXRsZTogJ1NtYWxsIENhdCBQaG90byBTZXNzaW9uJywgbG9jYXRpb246ICdDZW50ZXIgZm9yIENhdCBQaG90b2dyYXBoeScsIGlkOiA1MSB9LFxyXG4gICAgICAgIHsgZGF0ZTogY3VycmVudE1vbnRoICsgJy0nICsgJzIwIDE3OjMwOjAwJywgICAgdGl0bGU6ICdTbWFsbCBDYXQgUGhvdG8gU2Vzc2lvbicsIGxvY2F0aW9uOiAnQ2VudGVyIGZvciBDYXQgUGhvdG9ncmFwaHknLCBpZDogNTIgfVxyXG4gICAgXTtcclxuXHJcbiAgICB2YXIgZGF5RXZlbnRzVGVtcGxhdGUgPSAkKCcjZGF5LWV2ZW50cycpLmh0bWwoKTtcclxuICAgIGNsbmRyID0gJCgnI2Z1bGwtY2xuZHInKS5jbG5kcih7IC8vU3RhcnQgY2xuZHJcclxuICAgICAgICB0ZW1wbGF0ZTogJCgnI2Z1bGwtY2xuZHItdGVtcGxhdGUnKS5odG1sKCksXHJcbiAgICAgICAgZXZlbnRzOiBldmVudHMsXHJcbiAgICAgICAgY2xpY2tFdmVudHM6IHtcclxuICAgICAgICAgICAgY2xpY2s6IGZ1bmN0aW9uICh0YXJnZXQpIHtcclxuICAgICAgICAgICAgICAgICQoXCIuZGF5LWV2ZW50c1wiKS5tQ3VzdG9tU2Nyb2xsYmFyKFwiZGVzdHJveVwiKTtcclxuICAgICAgICAgICAgICAgICQoXCIuZXZlbnQtaXRlbXNcIikuc2xpZGVVcCgpO1xyXG4gICAgICAgICAgICAgICAgJChcIi5kYXktZXZlbnRzXCIpLnNsaWRlRG93bigpO1xyXG4gICAgICAgICAgICAgICAgdmFyIHRlbXBsYXRlID0gXy50ZW1wbGF0ZShkYXlFdmVudHNUZW1wbGF0ZSk7XHJcbiAgICAgICAgICAgICAgICAkKFwiLmRheS1ldmVudHNcIikuaHRtbCh0ZW1wbGF0ZSh7ZXZlbnRzVGhpc0RheTogdGFyZ2V0LmV2ZW50c30pKVxyXG4gICAgICAgICAgICAgICAgICAgIC5oZWlnaHQoICQoXCIuY2xuZHItZ3JpZCAuZGF5c1wiKS5oZWlnaHQoKSAtICQoXCIuY2xuZHItZ3JpZCAuZGF5cy1vZi10aGUtd2Vla1wiKS5oZWlnaHQoKSApO1xyXG4gICAgICAgICAgICAgICAgICAgICQoXCIuZGF5LWV2ZW50c1wiKS5tQ3VzdG9tU2Nyb2xsYmFyKFwiZGVzdHJveVwiKS5tQ3VzdG9tU2Nyb2xsYmFyKHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgc2Nyb2xsQnV0dG9uczp7ZW5hYmxlOnRydWV9LFxyXG4gICAgICAgICAgICAgICAgICAgICAgICB0aGVtZTpcIm1pbmltYWwtZGFya1wiXHJcbiAgICAgICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgIG9uTW9udGhDaGFuZ2U6IGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgICAgIHRoaXMub3B0aW9ucy5yZWFkeSgpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfSxcclxuICAgICAgICBmb3JjZVNpeFJvd3M6IHRydWUsXHJcbiAgICAgICAgbXVsdGlEYXlFdmVudHM6IHtcclxuICAgICAgICAgICAgc2luZ2xlRGF5OiAnZGF0ZScsXHJcbiAgICAgICAgICAgIGVuZERhdGU6ICdlbmREYXRlJyxcclxuICAgICAgICAgICAgc3RhcnREYXRlOiAnc3RhcnREYXRlJ1xyXG4gICAgICAgIH0sXHJcbiAgICAgICAgc2hvd0FkamFjZW50TW9udGhzOiB0cnVlLFxyXG4gICAgICAgIGFkamFjZW50RGF5c0NoYW5nZU1vbnRoOiBmYWxzZSxcclxuICAgICAgICB0cmFja1NlbGVjdGVkRGF0ZTogdHJ1ZSxcclxuICAgICAgICBkYXlzT2ZUaGVXZWVrOiAoZnVuY3Rpb24oKXtcclxuICAgICAgICAgICAgdmFyIHJlc3VsdCA9IFtdO1xyXG4gICAgICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IDc7IGkrKykge1xyXG4gICAgICAgICAgICAgICAgcmVzdWx0LnB1c2gobW9tZW50KCkud2Vla2RheShpKS5mb3JtYXQoJ2RkZCcpKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICByZXR1cm4gcmVzdWx0O1xyXG4gICAgICAgIH0pKCksXHJcbiAgICAgICAgcmVhZHk6IGZ1bmN0aW9uKCl7XHJcbiAgICAgICAgICAgICQoXCIuZXZlbnQtbGlzdGluZy10aXRsZVwiKS5vbihcImNsaWNrXCIsIFwiLmdseXBoaWNvbi1jaGV2cm9uLXVwLCAuZ2x5cGhpY29uLWNoZXZyb24tZG93blwiLCBmdW5jdGlvbigpe1xyXG4gICAgICAgICAgICAgICAgdmFyIGVsID0ge307XHJcbiAgICAgICAgICAgICAgICBpZigkKHRoaXMpLnBhcmVudCgpLmhhc0NsYXNzKFwibW9udGgtdGl0bGVcIikpXHJcbiAgICAgICAgICAgICAgICAgICAgZWwgPSAkKFwiLmRheS10aXRsZSBbY2xhc3MgKj1nbHlwaGljb24tY2hldnJvbl1cIikuZXEoMCk7XHJcbiAgICAgICAgICAgICAgICAgZWxzZVxyXG4gICAgICAgICAgICAgICAgICAgIGVsID0gJChcIi5tb250aC10aXRsZSBbY2xhc3MgKj1nbHlwaGljb24tY2hldnJvbl1cIikuZXEoMCk7XHJcblxyXG4gICAgICAgICAgICAgICAgaWYoZWwuaGFzQ2xhc3MoXCJnbHlwaGljb24tY2hldnJvbi11cFwiKSlcclxuICAgICAgICAgICAgICAgICAgICBlbC5yZW1vdmVDbGFzcyhcImdseXBoaWNvbi1jaGV2cm9uLXVwXCIpXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIC5hZGRDbGFzcyhcImdseXBoaWNvbi1jaGV2cm9uLWRvd25cIilcclxuICAgICAgICAgICAgICAgIGVsc2VcclxuICAgICAgICAgICAgICAgICAgICBlbC5yZW1vdmVDbGFzcyhcImdseXBoaWNvbi1jaGV2cm9uLWRvd25cIilcclxuICAgICAgICAgICAgICAgICAgICAgICAgLmFkZENsYXNzKFwiZ2x5cGhpY29uLWNoZXZyb24tdXBcIik7XHJcblxyXG4gICAgICAgICAgICAgICAgaWYoJCh0aGlzKS5oYXNDbGFzcyhcImdseXBoaWNvbi1jaGV2cm9uLXVwXCIpKVxyXG4gICAgICAgICAgICAgICAgICAgICQodGhpcykucmVtb3ZlQ2xhc3MoXCJnbHlwaGljb24tY2hldnJvbi11cFwiKS5hZGRDbGFzcyhcImdseXBoaWNvbi1jaGV2cm9uLWRvd25cIik7XHJcbiAgICAgICAgICAgICAgICBlbHNlXHJcbiAgICAgICAgICAgICAgICAgICAgJCh0aGlzKS5yZW1vdmVDbGFzcyhcImdseXBoaWNvbi1jaGV2cm9uLWRvd25cIikuYWRkQ2xhc3MoXCJnbHlwaGljb24tY2hldnJvbi11cFwiKTtcclxuICAgICAgICAgICAgICAgICQoXCIuZXZlbnQtaXRlbXMsIC5kYXktZXZlbnRzXCIpLnNsaWRlVG9nZ2xlKCk7XHJcblxyXG5cclxuXHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICB2YXIgbW9kYWwgPSAkKFwiI21vZGFsXCIpO1xyXG4gICAgICAgICAgICAkKFwiLmV2ZW50LWxpc3RpbmdcIikub24oJ2NsaWNrJywgJy5ldmVudC1pdGVtJywgZnVuY3Rpb24oKXtcclxuICAgICAgICAgICAgICAgIG1vZGFsLmZpbmQoXCIubW9kYWwtdGl0bGVcIikudGV4dChcIkVkaXQgZXZlbnRcIik7XHJcbiAgICAgICAgICAgICAgICBtb2RhbC5maW5kKFwiZm9ybVwiKS5nZXQoMCkucmVzZXQoKTtcclxuICAgICAgICAgICAgICAgIHZhciBkYXRldGltZXBpY2tlck9wdGlvbnMgPSB7XHJcbiAgICAgICAgICAgICAgICAgICAgc3RlcDogMzAsXHJcbiAgICAgICAgICAgICAgICAgICAgdmFsdWU6ICQodGhpcykuZmluZChcIi5ldmVudC1pdGVtLXRpbWVcIikuYXR0cihcImRhdGEtZGF0ZXRpbWVcIilcclxuICAgICAgICAgICAgICAgIH07XHJcbiAgICAgICAgICAgICAgICAkKCcjcmVwZWF0LWRheScpLmlDaGVjaygndW5jaGVjaycpXHJcbiAgICAgICAgICAgICAgICAgICAgLmlDaGVjayh7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGNoZWNrYm94Q2xhc3M6ICdpY2hlY2tib3hfc3F1YXJlLWJsdWUnLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICByYWRpb0NsYXNzOiAnaXJhZGlvX3NxdWFyZS1ibHVlJyxcclxuICAgICAgICAgICAgICAgICAgICAgICAgaW5jcmVhc2VBcmVhOiAnMjAlJywgLy8gb3B0aW9uYWxcclxuICAgICAgICAgICAgICAgICAgICB9KS5vbihcImlmVW5jaGVja2VkXCIsIGZ1bmN0aW9uKCl7XHJcbiAgICAgICAgICAgICAgICAgICAgJCgnI2RhdGV0aW1lcGlja2VyJylcclxuICAgICAgICAgICAgICAgICAgICAgICAgLmRhdGV0aW1lcGlja2VyKCdkZXN0cm95JylcclxuICAgICAgICAgICAgICAgICAgICAgICAgLmRhdGV0aW1lcGlja2VyKCk7XHJcbiAgICAgICAgICAgICAgICB9KS5vbihcImlmQ2hlY2tlZFwiLCBmdW5jdGlvbigpe1xyXG4gICAgICAgICAgICAgICAgICAgICQoJyNkYXRldGltZXBpY2tlcicpXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIC5kYXRldGltZXBpY2tlcignZGVzdHJveScpXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIC5kYXRldGltZXBpY2tlcih7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBkYXRlcGlja2VyOmZhbHNlLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZm9ybWF0OidIOmknXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgICAgICAkKCcjZGF0ZXRpbWVwaWNrZXInKVxyXG4gICAgICAgICAgICAgICAgICAgIC5kYXRldGltZXBpY2tlcignZGVzdHJveScpXHJcbiAgICAgICAgICAgICAgICAgICAgLmRhdGV0aW1lcGlja2VyKGRhdGV0aW1lcGlja2VyT3B0aW9ucyk7XHJcblxyXG4gICAgICAgICAgICAgICAgbW9kYWwuZmluZChcIiNUaXRsZVwiKS52YWwoJCh0aGlzKS5maW5kKFwiLmV2ZW50LWl0ZW0tbmFtZVwiKS50ZXh0KCkpO1xyXG4gICAgICAgICAgICAgICAgbW9kYWwuZmluZChcIiNEZXNjcmlwdGlvblwiKS52YWwoJCh0aGlzKS5maW5kKFwiLmV2ZW50LWl0ZW0tbG9jYXRpb25cIikudGV4dCgpKTtcclxuXHJcbiAgICAgICAgICAgICAgICBtb2RhbC5tb2RhbCgnc2hvdycpO1xyXG4gICAgICAgICAgICB9KTtcclxuXHJcblxyXG4gICAgICAgICAgICAkKFwiLmV2ZW50LWxpc3RpbmctdGl0bGVcIikub24oXCJjbGlja1wiLCBcIi5nbHlwaGljb24tcGx1c1wiLCBmdW5jdGlvbigpe1xyXG4gICAgICAgICAgICAgICAgbW9kYWwuZmluZChcImZvcm1cIikuZ2V0KDApLnJlc2V0KCk7XHJcbiAgICAgICAgICAgICAgICBtb2RhbC5maW5kKFwiLm1vZGFsLXRpdGxlXCIpLnRleHQoXCJBZGQgZXZlbnRcIik7XHJcbiAgICAgICAgICAgICAgICB2YXIgZGF0ZXRpbWVwaWNrZXJPcHRpb25zID0ge1xyXG4gICAgICAgICAgICAgICAgICAgIHN0ZXA6IDMwXHJcbiAgICAgICAgICAgICAgICB9O1xyXG4gICAgICAgICAgICAgICAgaWYoJCh0aGlzKS5wYXJlbnQoKS5oYXNDbGFzcyhcImRheS10aXRsZVwiKSl7XHJcbiAgICAgICAgICAgICAgICAgICAgZGF0ZXRpbWVwaWNrZXJPcHRpb25zLnZhbHVlID0gKGZ1bmN0aW9uKCl7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHZhciB0aW1lID0gXCIgXCIgKyBtb21lbnQoKS5mb3JtYXQoXCJISDptbVwiKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgdmFyIGVsID0gJChjbG5kci5lbGVtZW50KS5maW5kKFwiLnNlbGVjdGVkXCIpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB2YXIgcmVzdWx0ID0gXCJcIjtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmKGVsLmxlbmd0aCA+IDApXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXN1bHQgPSAgZWwuYXR0cihcImRhdGEtaWRcIikgKyB0aW1lO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBlbHNlXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXN1bHQgPSAgJChjbG5kci5lbGVtZW50KS5maW5kKFwidG9kYXlcIikuYXR0cihcImRhdGEtaWRcIikgKyB0aW1lO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAkKCcjZGF0ZXRpbWVwaWNrZXInKS52YWwocmVzdWx0KTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHJlc3VsdDtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgfSkoKTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICQoJyNyZXBlYXQtZGF5JykuaUNoZWNrKCd1bmNoZWNrJylcclxuICAgICAgICAgICAgICAgICAgICAuaUNoZWNrKHtcclxuICAgICAgICAgICAgICAgICAgICBjaGVja2JveENsYXNzOiAnaWNoZWNrYm94X3NxdWFyZS1ibHVlJyxcclxuICAgICAgICAgICAgICAgICAgICByYWRpb0NsYXNzOiAnaXJhZGlvX3NxdWFyZS1ibHVlJyxcclxuICAgICAgICAgICAgICAgICAgICBpbmNyZWFzZUFyZWE6ICcyMCUnLCAvLyBvcHRpb25hbFxyXG4gICAgICAgICAgICAgICAgfSkub24oXCJpZlVuY2hlY2tlZFwiLCBmdW5jdGlvbigpe1xyXG4gICAgICAgICAgICAgICAgICAgICQoJyNkYXRldGltZXBpY2tlcicpXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIC5kYXRldGltZXBpY2tlcignZGVzdHJveScpXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIC5kYXRldGltZXBpY2tlcigpO1xyXG4gICAgICAgICAgICAgICAgfSkub24oXCJpZkNoZWNrZWRcIiwgZnVuY3Rpb24oKXtcclxuICAgICAgICAgICAgICAgICAgICAkKCcjZGF0ZXRpbWVwaWNrZXInKVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAuZGF0ZXRpbWVwaWNrZXIoJ2Rlc3Ryb3knKVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAuZGF0ZXRpbWVwaWNrZXIoe1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZGF0ZXBpY2tlcjpmYWxzZSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGZvcm1hdDonSDppJ1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICAgICAgJCgnI2RhdGV0aW1lcGlja2VyJylcclxuICAgICAgICAgICAgICAgICAgICAuZGF0ZXRpbWVwaWNrZXIoJ2Rlc3Ryb3knKVxyXG4gICAgICAgICAgICAgICAgICAgIC5kYXRldGltZXBpY2tlcihkYXRldGltZXBpY2tlck9wdGlvbnMpO1xyXG5cclxuICAgICAgICAgICAgICAgIG1vZGFsLm1vZGFsKCdzaG93Jyk7XHJcbiAgICAgICAgICAgIH0pO1xyXG5cclxuICAgICAgICAgICAgJChcIi5jbG5kclwiKVxyXG4gICAgICAgICAgICAgICAgLmhlaWdodCgkKFwiLmNsbmRyXCIpLmhlaWdodCgpKTtcclxuXHJcbiAgICAgICAgfSxcclxuICAgICAgICBkb25lUmVuZGVyaW5nOiBmdW5jdGlvbigpe1xyXG4gICAgICAgICAgICAkKFwiLmV2ZW50LWl0ZW1zXCIpXHJcbiAgICAgICAgICAgICAgICAuaGVpZ2h0KCAkKFwiLmNsbmRyLWdyaWQgLmRheXNcIikuaGVpZ2h0KCkgLSAkKFwiLmNsbmRyLWdyaWQgLmRheXMtb2YtdGhlLXdlZWtcIikuaGVpZ2h0KCkgKVxyXG4gICAgICAgICAgICAgICAgLm1DdXN0b21TY3JvbGxiYXIoe1xyXG4gICAgICAgICAgICAgICAgc2Nyb2xsQnV0dG9uczp7ZW5hYmxlOnRydWV9LFxyXG4gICAgICAgICAgICAgICAgdGhlbWU6XCJtaW5pbWFsLWRhcmtcIlxyXG4gICAgICAgICAgICB9KVxyXG4gICAgICAgIH1cclxuICAgIH0pOy8vRW5kIGNsbmRyXHJcblxyXG5cclxufSk7Il0sImZpbGUiOiJzY2hlZHVsZS5qcyIsInNvdXJjZVJvb3QiOiIvc291cmNlLyJ9
