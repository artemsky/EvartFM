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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiIiwic291cmNlcyI6WyJzY2hlZHVsZS5qcyJdLCJzb3VyY2VzQ29udGVudCI6WyJ2YXIgY2xuZHIgPSB7fTtcclxuJChmdW5jdGlvbigpe1xyXG4gICAgXCJ1c2Ugc3RyaWN0XCI7XHJcblxyXG4gICAgXy50ZW1wbGF0ZVNldHRpbmdzID0ge1xyXG4gICAgICAgIGV2YWx1YXRlICAgIDogL1xce1xceyUoW1xcc1xcU10rPyklXFx9XFx9L2csXHJcbiAgICAgICAgaW50ZXJwb2xhdGUgOiAvXFx7XFx7JT0oW1xcc1xcU10rPyklXFx9XFx9L2csXHJcbiAgICAgICAgZXNjYXBlICAgICAgOiAvXFx7XFx7JS0oW1xcc1xcU10rPyklXFx9XFx9L2dcclxuICAgIH07XHJcbiAgICAvLyBDYWxsIHRoaXMgZnJvbSB0aGUgZGV2ZWxvcGVyIGNvbnNvbGUgYW5kIHlvdSBjYW4gY29udHJvbCBib3RoIGluc3RhbmNlc1xyXG4gICAgbW9tZW50LmxvY2FsZShcImVuLWdiXCIpO1xyXG4gICAgdmFyIGN1cnJlbnRNb250aCA9IG1vbWVudCgpLmZvcm1hdCgnWVlZWS1NTScpO1xyXG4gICAgdmFyIG5leHRNb250aCAgICA9IG1vbWVudCgpLmFkZCgnbW9udGgnLCAxKS5mb3JtYXQoJ1lZWVktTU0nKTtcclxuICAgIHZhciBldmVudHMgPSBbXHJcbiAgICAgICAgeyBkYXRlOiBjdXJyZW50TW9udGggKyAnLScgKyAnMTAgMjA6MDA6MDAnLCB0aXRsZTogJ1BlcnNpYW4gS2l0dGVuIEF1Y3Rpb24nLCBsb2NhdGlvbjogJ0NlbnRlciBmb3IgQmVhdXRpZnVsIENhdHMnLCBpZDogNDIgfSxcclxuICAgICAgICB7IGRhdGU6IGN1cnJlbnRNb250aCArICctJyArICcxOSAyMTowMDowMCcsIHRpdGxlOiAnQ2F0IEZyaXNiZWUnLCBsb2NhdGlvbjogJ0plZmZlcnNvbiBQYXJrJywgaWQ6IDQzIH0sXHJcbiAgICAgICAgeyBkYXRlOiBjdXJyZW50TW9udGggKyAnLScgKyAnMjMgMTg6MDA6MDAnLCB0aXRsZTogJ0tpdHRlbiBEZW1vbnN0cmF0aW9uJywgbG9jYXRpb246ICdDZW50ZXIgZm9yIEJlYXV0aWZ1bCBDYXRzJywgaWQ6IDQ0IH0sXHJcbiAgICAgICAgeyBkYXRlOiBjdXJyZW50TW9udGggKyAnLScgKyAnMjMgMTg6MDA6MDAnLCB0aXRsZTogJ0tpdHRlbiBEZW1vbnN0cmF0aW9uJywgbG9jYXRpb246ICdDZW50ZXIgZm9yIEJlYXV0aWZ1bCBDYXRzJywgaWQ6IDQ1IH0sXHJcbiAgICAgICAgeyBkYXRlOiBjdXJyZW50TW9udGggKyAnLScgKyAnMjMgMTk6MDA6MDAnLCB0aXRsZTogJ0tpdHRlbiBEZW1vbnN0cmF0aW9uJywgbG9jYXRpb246ICdDZW50ZXIgZm9yIEJlYXV0aWZ1bCBDYXRzJywgaWQ6IDQ2IH0sXHJcbiAgICAgICAgeyBkYXRlOiBjdXJyZW50TW9udGggKyAnLScgKyAnMjMgMjA6MDA6MDAnLCB0aXRsZTogJ0tpdHRlbiBEZW1vbnN0cmF0aW9uJywgbG9jYXRpb246ICdDZW50ZXIgZm9yIEJlYXV0aWZ1bCBDYXRzJywgaWQ6IDQ3IH0sXHJcbiAgICAgICAgeyBkYXRlOiBjdXJyZW50TW9udGggKyAnLScgKyAnMjMgMjE6MDA6MDAnLCB0aXRsZTogJ0tpdHRlbiBEZW1vbnN0cmF0aW9uJywgbG9jYXRpb246ICdDZW50ZXIgZm9yIEJlYXV0aWZ1bCBDYXRzJywgaWQ6IDQ4IH0sXHJcbiAgICAgICAgeyBkYXRlOiBjdXJyZW50TW9udGggKyAnLScgKyAnMjMgMjI6MDA6MDAnLCB0aXRsZTogJ0tpdHRlbiBEZW1vbnN0cmF0aW9uJywgbG9jYXRpb246ICdDZW50ZXIgZm9yIEJlYXV0aWZ1bCBDYXRzJywgaWQ6IDQ5IH0sXHJcbiAgICAgICAgeyBkYXRlOiBjdXJyZW50TW9udGggKyAnLScgKyAnMjMgMjM6MDA6MDAnLCB0aXRsZTogJ0tpdHRlbiBEZW1vbnN0cmF0aW9uJywgbG9jYXRpb246ICdDZW50ZXIgZm9yIEJlYXV0aWZ1bCBDYXRzJywgaWQ6IDUwIH0sXHJcbiAgICAgICAgeyBkYXRlOiBuZXh0TW9udGggKyAnLScgKyAnMDcgMTc6MzA6MDAnLCAgICB0aXRsZTogJ1NtYWxsIENhdCBQaG90byBTZXNzaW9uJywgbG9jYXRpb246ICdDZW50ZXIgZm9yIENhdCBQaG90b2dyYXBoeScsIGlkOiA1MSB9LFxyXG4gICAgICAgIHsgZGF0ZTogY3VycmVudE1vbnRoICsgJy0nICsgJzIwIDE3OjMwOjAwJywgICAgdGl0bGU6ICdTbWFsbCBDYXQgUGhvdG8gU2Vzc2lvbicsIGxvY2F0aW9uOiAnQ2VudGVyIGZvciBDYXQgUGhvdG9ncmFwaHknLCBpZDogNTIgfVxyXG4gICAgXTtcclxuXHJcbiAgICB2YXIgZGF5RXZlbnRzVGVtcGxhdGUgPSAkKCcjZGF5LWV2ZW50cycpLmh0bWwoKTtcclxuICAgIGNsbmRyID0gJCgnI2Z1bGwtY2xuZHInKS5jbG5kcih7IC8vU3RhcnQgY2xuZHJcclxuICAgICAgICB0ZW1wbGF0ZTogJCgnI2Z1bGwtY2xuZHItdGVtcGxhdGUnKS5odG1sKCksXHJcbiAgICAgICAgZXZlbnRzOiBldmVudHMsXHJcbiAgICAgICAgY2xpY2tFdmVudHM6IHtcclxuICAgICAgICAgICAgY2xpY2s6IGZ1bmN0aW9uICh0YXJnZXQpIHtcclxuICAgICAgICAgICAgICAgICQoXCIuZGF5LWV2ZW50c1wiKS5tQ3VzdG9tU2Nyb2xsYmFyKFwiZGVzdHJveVwiKTtcclxuICAgICAgICAgICAgICAgICQoXCIuZXZlbnQtaXRlbXNcIikuc2xpZGVVcCgpO1xyXG4gICAgICAgICAgICAgICAgJChcIi5kYXktZXZlbnRzXCIpLnNsaWRlRG93bigpO1xyXG4gICAgICAgICAgICAgICAgdmFyIHRlbXBsYXRlID0gXy50ZW1wbGF0ZShkYXlFdmVudHNUZW1wbGF0ZSk7XHJcbiAgICAgICAgICAgICAgICAkKFwiLmRheS1ldmVudHNcIikuaHRtbCh0ZW1wbGF0ZSh7ZXZlbnRzVGhpc0RheTogdGFyZ2V0LmV2ZW50c30pKVxyXG4gICAgICAgICAgICAgICAgICAgIC5oZWlnaHQoICQoXCIuY2xuZHItZ3JpZCAuZGF5c1wiKS5oZWlnaHQoKSAtICQoXCIuY2xuZHItZ3JpZCAuZGF5cy1vZi10aGUtd2Vla1wiKS5oZWlnaHQoKSApO1xyXG4gICAgICAgICAgICAgICAgICAgICQoXCIuZGF5LWV2ZW50c1wiKS5tQ3VzdG9tU2Nyb2xsYmFyKFwiZGVzdHJveVwiKS5tQ3VzdG9tU2Nyb2xsYmFyKHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgc2Nyb2xsQnV0dG9uczp7ZW5hYmxlOnRydWV9LFxyXG4gICAgICAgICAgICAgICAgICAgICAgICB0aGVtZTpcIm1pbmltYWwtZGFya1wiXHJcbiAgICAgICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9LFxyXG4gICAgICAgIGZvcmNlU2l4Um93czogdHJ1ZSxcclxuICAgICAgICBtdWx0aURheUV2ZW50czoge1xyXG4gICAgICAgICAgICBzaW5nbGVEYXk6ICdkYXRlJyxcclxuICAgICAgICAgICAgZW5kRGF0ZTogJ2VuZERhdGUnLFxyXG4gICAgICAgICAgICBzdGFydERhdGU6ICdzdGFydERhdGUnXHJcbiAgICAgICAgfSxcclxuICAgICAgICBzaG93QWRqYWNlbnRNb250aHM6IHRydWUsXHJcbiAgICAgICAgYWRqYWNlbnREYXlzQ2hhbmdlTW9udGg6IGZhbHNlLFxyXG4gICAgICAgIHRyYWNrU2VsZWN0ZWREYXRlOiB0cnVlLFxyXG4gICAgICAgIGRheXNPZlRoZVdlZWs6IChmdW5jdGlvbigpe1xyXG4gICAgICAgICAgICB2YXIgcmVzdWx0ID0gW107XHJcbiAgICAgICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgNzsgaSsrKSB7XHJcbiAgICAgICAgICAgICAgICByZXN1bHQucHVzaChtb21lbnQoKS53ZWVrZGF5KGkpLmZvcm1hdCgnZGRkJykpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIHJldHVybiByZXN1bHQ7XHJcbiAgICAgICAgfSkoKSxcclxuICAgICAgICByZWFkeTogZnVuY3Rpb24oKXtcclxuICAgICAgICAgICAgJChcIi5ldmVudC1saXN0aW5nLXRpdGxlXCIpLm9uKFwiY2xpY2tcIiwgXCIuZ2x5cGhpY29uLWNoZXZyb24tdXAsIC5nbHlwaGljb24tY2hldnJvbi1kb3duXCIsIGZ1bmN0aW9uKCl7XHJcbiAgICAgICAgICAgICAgICB2YXIgZWwgPSB7fTtcclxuICAgICAgICAgICAgICAgIGlmKCQodGhpcykucGFyZW50KCkuaGFzQ2xhc3MoXCJtb250aC10aXRsZVwiKSlcclxuICAgICAgICAgICAgICAgICAgICBlbCA9ICQoXCIuZGF5LXRpdGxlIFtjbGFzcyAqPWdseXBoaWNvbi1jaGV2cm9uXVwiKS5lcSgwKTtcclxuICAgICAgICAgICAgICAgICBlbHNlXHJcbiAgICAgICAgICAgICAgICAgICAgZWwgPSAkKFwiLm1vbnRoLXRpdGxlIFtjbGFzcyAqPWdseXBoaWNvbi1jaGV2cm9uXVwiKS5lcSgwKTtcclxuXHJcbiAgICAgICAgICAgICAgICBpZihlbC5oYXNDbGFzcyhcImdseXBoaWNvbi1jaGV2cm9uLXVwXCIpKVxyXG4gICAgICAgICAgICAgICAgICAgIGVsLnJlbW92ZUNsYXNzKFwiZ2x5cGhpY29uLWNoZXZyb24tdXBcIilcclxuICAgICAgICAgICAgICAgICAgICAgICAgLmFkZENsYXNzKFwiZ2x5cGhpY29uLWNoZXZyb24tZG93blwiKVxyXG4gICAgICAgICAgICAgICAgZWxzZVxyXG4gICAgICAgICAgICAgICAgICAgIGVsLnJlbW92ZUNsYXNzKFwiZ2x5cGhpY29uLWNoZXZyb24tZG93blwiKVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAuYWRkQ2xhc3MoXCJnbHlwaGljb24tY2hldnJvbi11cFwiKTtcclxuXHJcbiAgICAgICAgICAgICAgICBpZigkKHRoaXMpLmhhc0NsYXNzKFwiZ2x5cGhpY29uLWNoZXZyb24tdXBcIikpXHJcbiAgICAgICAgICAgICAgICAgICAgJCh0aGlzKS5yZW1vdmVDbGFzcyhcImdseXBoaWNvbi1jaGV2cm9uLXVwXCIpLmFkZENsYXNzKFwiZ2x5cGhpY29uLWNoZXZyb24tZG93blwiKTtcclxuICAgICAgICAgICAgICAgIGVsc2VcclxuICAgICAgICAgICAgICAgICAgICAkKHRoaXMpLnJlbW92ZUNsYXNzKFwiZ2x5cGhpY29uLWNoZXZyb24tZG93blwiKS5hZGRDbGFzcyhcImdseXBoaWNvbi1jaGV2cm9uLXVwXCIpO1xyXG4gICAgICAgICAgICAgICAgJChcIi5ldmVudC1pdGVtcywgLmRheS1ldmVudHNcIikuc2xpZGVUb2dnbGUoKTtcclxuXHJcbiAgICAgICAgICAgIH0pO1xyXG5cclxuICAgICAgICAgICAgdmFyIG1vZGFsID0gJChcIiNtb2RhbFwiKTtcclxuICAgICAgICAgICAgJChcIi5ldmVudC1saXN0aW5nLXRpdGxlXCIpLm9uKFwiY2xpY2tcIiwgXCIuZ2x5cGhpY29uLXBsdXNcIiwgZnVuY3Rpb24oKXtcclxuICAgICAgICAgICAgICAgIG1vZGFsLmZpbmQoXCJmb3JtXCIpLmdldCgwKS5yZXNldCgpO1xyXG4gICAgICAgICAgICAgICAgdmFyIGRhdGV0aW1lcGlja2VyT3B0aW9ucyA9IHtcclxuICAgICAgICAgICAgICAgICAgICBzdGVwOiAzMFxyXG4gICAgICAgICAgICAgICAgfTtcclxuICAgICAgICAgICAgICAgIGlmKCQodGhpcykucGFyZW50KCkuaGFzQ2xhc3MoXCJkYXktdGl0bGVcIikpe1xyXG4gICAgICAgICAgICAgICAgICAgIGRhdGV0aW1lcGlja2VyT3B0aW9ucy52YWx1ZSA9IChmdW5jdGlvbigpe1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB2YXIgdGltZSA9IFwiIFwiICsgbW9tZW50KCkuZm9ybWF0KFwiSEg6bW1cIik7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHZhciBlbCA9ICQoY2xuZHIuZWxlbWVudCkuZmluZChcIi5zZWxlY3RlZFwiKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgdmFyIHJlc3VsdCA9IFwiXCI7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgICAgICBpZihlbC5sZW5ndGggPiAwKVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcmVzdWx0ID0gIGVsLmF0dHIoXCJkYXRhLWlkXCIpICsgdGltZTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgZWxzZVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcmVzdWx0ID0gICQoY2xuZHIuZWxlbWVudCkuZmluZChcInRvZGF5XCIpLmF0dHIoXCJkYXRhLWlkXCIpICsgdGltZTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgJCgnI2RhdGV0aW1lcGlja2VyJykudmFsKHJlc3VsdCk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiByZXN1bHQ7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgIH0pKCk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAkKCcjcmVwZWF0LWRheScpLmlDaGVjaygndW5jaGVjaycpXHJcbiAgICAgICAgICAgICAgICAgICAgLmlDaGVjayh7XHJcbiAgICAgICAgICAgICAgICAgICAgY2hlY2tib3hDbGFzczogJ2ljaGVja2JveF9zcXVhcmUtYmx1ZScsXHJcbiAgICAgICAgICAgICAgICAgICAgcmFkaW9DbGFzczogJ2lyYWRpb19zcXVhcmUtYmx1ZScsXHJcbiAgICAgICAgICAgICAgICAgICAgaW5jcmVhc2VBcmVhOiAnMjAlJywgLy8gb3B0aW9uYWxcclxuICAgICAgICAgICAgICAgIH0pLm9uKFwiaWZVbmNoZWNrZWRcIiwgZnVuY3Rpb24oKXtcclxuICAgICAgICAgICAgICAgICAgICAkKCcjZGF0ZXRpbWVwaWNrZXInKVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAuZGF0ZXRpbWVwaWNrZXIoJ2Rlc3Ryb3knKVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAuZGF0ZXRpbWVwaWNrZXIoKTtcclxuICAgICAgICAgICAgICAgIH0pLm9uKFwiaWZDaGVja2VkXCIsIGZ1bmN0aW9uKCl7XHJcbiAgICAgICAgICAgICAgICAgICAgJCgnI2RhdGV0aW1lcGlja2VyJylcclxuICAgICAgICAgICAgICAgICAgICAgICAgLmRhdGV0aW1lcGlja2VyKCdkZXN0cm95JylcclxuICAgICAgICAgICAgICAgICAgICAgICAgLmRhdGV0aW1lcGlja2VyKHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRhdGVwaWNrZXI6ZmFsc2UsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBmb3JtYXQ6J0g6aSdcclxuICAgICAgICAgICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgICAgICQoJyNkYXRldGltZXBpY2tlcicpXHJcbiAgICAgICAgICAgICAgICAgICAgLmRhdGV0aW1lcGlja2VyKCdkZXN0cm95JylcclxuICAgICAgICAgICAgICAgICAgICAuZGF0ZXRpbWVwaWNrZXIoZGF0ZXRpbWVwaWNrZXJPcHRpb25zKTtcclxuXHJcbiAgICAgICAgICAgICAgICBtb2RhbC5tb2RhbCgnc2hvdycpO1xyXG4gICAgICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgICAgICQoXCIuY2xuZHJcIilcclxuICAgICAgICAgICAgICAgIC5oZWlnaHQoJChcIi5jbG5kclwiKS5oZWlnaHQoKSk7XHJcbiAgICAgICAgICAgIHRoaXMudG9kYXkoKTtcclxuXHJcbiAgICAgICAgfSxcclxuICAgICAgICBkb25lUmVuZGVyaW5nOiBmdW5jdGlvbigpe1xyXG4gICAgICAgICAgICBjb25zb2xlLmxvZyhcIlJlbmRlclwiKTtcclxuICAgICAgICAgICAgJChcIi5ldmVudC1pdGVtc1wiKVxyXG4gICAgICAgICAgICAgICAgLmhlaWdodCggJChcIi5jbG5kci1ncmlkIC5kYXlzXCIpLmhlaWdodCgpIC0gJChcIi5jbG5kci1ncmlkIC5kYXlzLW9mLXRoZS13ZWVrXCIpLmhlaWdodCgpIClcclxuICAgICAgICAgICAgICAgIC5tQ3VzdG9tU2Nyb2xsYmFyKHtcclxuICAgICAgICAgICAgICAgIHNjcm9sbEJ1dHRvbnM6e2VuYWJsZTp0cnVlfSxcclxuICAgICAgICAgICAgICAgIHRoZW1lOlwibWluaW1hbC1kYXJrXCJcclxuICAgICAgICAgICAgfSlcclxuICAgICAgICB9XHJcbiAgICB9KTsvL0VuZCBjbG5kclxyXG5cclxuXHJcbn0pOyJdLCJmaWxlIjoic2NoZWR1bGUuanMiLCJzb3VyY2VSb290IjoiL3NvdXJjZS8ifQ==
