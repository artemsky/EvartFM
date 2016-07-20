
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiIiwic291cmNlcyI6WyJzY2hlZHVsZS5qcyJdLCJzb3VyY2VzQ29udGVudCI6WyJcclxuJChmdW5jdGlvbigpe1xyXG4gICAgXCJ1c2Ugc3RyaWN0XCI7XHJcblxyXG4gICAgLy9TZXQgdW5kZXJzY29yZSB0ZW1wbGF0ZSBzZXR0aW5nIGFzIHt7JSV9fSBmb3IgYmV0dGVyIGNvZGUgcmVhZGluZ1xyXG4gICAgXy50ZW1wbGF0ZVNldHRpbmdzID0ge1xyXG4gICAgICAgIGV2YWx1YXRlICAgIDogL1xce1xceyUoW1xcc1xcU10rPyklXFx9XFx9L2csXHJcbiAgICAgICAgaW50ZXJwb2xhdGUgOiAvXFx7XFx7JT0oW1xcc1xcU10rPyklXFx9XFx9L2csXHJcbiAgICAgICAgZXNjYXBlICAgICAgOiAvXFx7XFx7JS0oW1xcc1xcU10rPyklXFx9XFx9L2dcclxuICAgIH07XHJcbiAgICAvL1NldCBtb21lbnQgbG9jYWxlXHJcbiAgICBtb21lbnQubG9jYWxlKFwiZW4tZ2JcIik7XHJcblxyXG4gICAgLy9ldmVudHNcclxuICAgIHZhciBjdXJyZW50TW9udGggPSBtb21lbnQoKS5mb3JtYXQoJ1lZWVktTU0nKTtcclxuICAgIHZhciBuZXh0TW9udGggICAgPSBtb21lbnQoKS5hZGQoJ21vbnRoJywgMSkuZm9ybWF0KCdZWVlZLU1NJyk7XHJcbiAgICB2YXIgZXZlbnRzID0gW1xyXG4gICAgICAgIHsgZGF0ZTogY3VycmVudE1vbnRoICsgJy0nICsgJzEwIDIwOjAwOjAwJywgdGl0bGU6ICdQZXJzaWFuIEtpdHRlbiBBdWN0aW9uJywgbG9jYXRpb246ICdDZW50ZXIgZm9yIEJlYXV0aWZ1bCBDYXRzJywgaWQ6IDQyIH0sXHJcbiAgICAgICAgeyBkYXRlOiBjdXJyZW50TW9udGggKyAnLScgKyAnMTkgMjE6MDA6MDAnLCB0aXRsZTogJ0NhdCBGcmlzYmVlJywgbG9jYXRpb246ICdKZWZmZXJzb24gUGFyaycsIGlkOiA0MyB9LFxyXG4gICAgICAgIHsgZGF0ZTogY3VycmVudE1vbnRoICsgJy0nICsgJzIzIDE4OjAwOjAwJywgdGl0bGU6ICdLaXR0ZW4gRGVtb25zdHJhdGlvbicsIGxvY2F0aW9uOiAnQ2VudGVyIGZvciBCZWF1dGlmdWwgQ2F0cycsIGlkOiA0NCB9LFxyXG4gICAgICAgIHsgZGF0ZTogY3VycmVudE1vbnRoICsgJy0nICsgJzIzIDE4OjAwOjAwJywgdGl0bGU6ICdLaXR0ZW4gRGVtb25zdHJhdGlvbicsIGxvY2F0aW9uOiAnQ2VudGVyIGZvciBCZWF1dGlmdWwgQ2F0cycsIGlkOiA0NSB9LFxyXG4gICAgICAgIHsgZGF0ZTogY3VycmVudE1vbnRoICsgJy0nICsgJzIzIDE5OjAwOjAwJywgdGl0bGU6ICdLaXR0ZW4gRGVtb25zdHJhdGlvbicsIGxvY2F0aW9uOiAnQ2VudGVyIGZvciBCZWF1dGlmdWwgQ2F0cycsIGlkOiA0NiB9LFxyXG4gICAgICAgIHsgZGF0ZTogY3VycmVudE1vbnRoICsgJy0nICsgJzIzIDIwOjAwOjAwJywgdGl0bGU6ICdLaXR0ZW4gRGVtb25zdHJhdGlvbicsIGxvY2F0aW9uOiAnQ2VudGVyIGZvciBCZWF1dGlmdWwgQ2F0cycsIGlkOiA0NyB9LFxyXG4gICAgICAgIHsgZGF0ZTogY3VycmVudE1vbnRoICsgJy0nICsgJzIzIDIxOjAwOjAwJywgdGl0bGU6ICdLaXR0ZW4gRGVtb25zdHJhdGlvbicsIGxvY2F0aW9uOiAnQ2VudGVyIGZvciBCZWF1dGlmdWwgQ2F0cycsIGlkOiA0OCB9LFxyXG4gICAgICAgIHsgZGF0ZTogY3VycmVudE1vbnRoICsgJy0nICsgJzIzIDIyOjAwOjAwJywgdGl0bGU6ICdLaXR0ZW4gRGVtb25zdHJhdGlvbicsIGxvY2F0aW9uOiAnQ2VudGVyIGZvciBCZWF1dGlmdWwgQ2F0cycsIGlkOiA0OSB9LFxyXG4gICAgICAgIHsgZGF0ZTogY3VycmVudE1vbnRoICsgJy0nICsgJzIzIDIzOjAwOjAwJywgdGl0bGU6ICdLaXR0ZW4gRGVtb25zdHJhdGlvbicsIGxvY2F0aW9uOiAnQ2VudGVyIGZvciBCZWF1dGlmdWwgQ2F0cycsIGlkOiA1MCB9LFxyXG4gICAgICAgIHsgZGF0ZTogbmV4dE1vbnRoICsgJy0nICsgJzA3IDE3OjMwOjAwJywgICAgdGl0bGU6ICdTbWFsbCBDYXQgUGhvdG8gU2Vzc2lvbicsIGxvY2F0aW9uOiAnQ2VudGVyIGZvciBDYXQgUGhvdG9ncmFwaHknLCBpZDogNTEgfSxcclxuICAgICAgICB7IGRhdGU6IGN1cnJlbnRNb250aCArICctJyArICcyMCAxNzozMDowMCcsICAgIHRpdGxlOiAnU21hbGwgQ2F0IFBob3RvIFNlc3Npb24nLCBsb2NhdGlvbjogJ0NlbnRlciBmb3IgQ2F0IFBob3RvZ3JhcGh5JywgaWQ6IDUyIH1cclxuICAgIF07XHJcbiAgICAvLyFldmVudHNcclxuXHJcbiAgICAvL3JlYWQgZXZlbnRzIHRlbXBsYXRlXHJcbiAgICB2YXIgZGF5RXZlbnRzVGVtcGxhdGUgPSAkKCcjZGF5LWV2ZW50cycpLmh0bWwoKTtcclxuXHJcbiAgICAvL0luaXQgY2FsZW5kYXJcclxuICAgIHZhciBjbG5kciA9ICQoJyNmdWxsLWNsbmRyJykuY2xuZHIoe1xyXG4gICAgICAgIHRlbXBsYXRlOiAkKCcjZnVsbC1jbG5kci10ZW1wbGF0ZScpLmh0bWwoKSxcclxuICAgICAgICBldmVudHM6IGV2ZW50cyxcclxuICAgICAgICBjbGlja0V2ZW50czoge1xyXG4gICAgICAgICAgICBjbGljazogZnVuY3Rpb24gKHRhcmdldCkge1xyXG4gICAgICAgICAgICAgICAgdmFyIHRlbXBsYXRlID0gXy50ZW1wbGF0ZShkYXlFdmVudHNUZW1wbGF0ZSk7XHJcbiAgICAgICAgICAgICAgICAkKFwiLmRheS1ldmVudHNcIilcclxuICAgICAgICAgICAgICAgICAgICAubUN1c3RvbVNjcm9sbGJhcihcImRlc3Ryb3lcIilcclxuICAgICAgICAgICAgICAgICAgICAuc2xpZGVEb3duKClcclxuICAgICAgICAgICAgICAgICAgICAuaHRtbCh0ZW1wbGF0ZSh7ZXZlbnRzVGhpc0RheTogdGFyZ2V0LmV2ZW50c30pKVxyXG4gICAgICAgICAgICAgICAgICAgIC5oZWlnaHQoICQoXCIuY2xuZHItZ3JpZCAuZGF5c1wiKS5oZWlnaHQoKSAtICQoXCIuY2xuZHItZ3JpZCAuZGF5cy1vZi10aGUtd2Vla1wiKS5oZWlnaHQoKSApXHJcbiAgICAgICAgICAgICAgICAgICAgLm1DdXN0b21TY3JvbGxiYXIoe1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBzY3JvbGxCdXR0b25zOntlbmFibGU6dHJ1ZX0sXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoZW1lOlwibWluaW1hbC1kYXJrXCJcclxuICAgICAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgICAgICQoXCIuZXZlbnQtaXRlbXNcIikuc2xpZGVVcCgpO1xyXG5cclxuICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgb25Nb250aENoYW5nZTogZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5vcHRpb25zLnJlYWR5KCk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9LFxyXG4gICAgICAgIGZvcmNlU2l4Um93czogdHJ1ZSxcclxuICAgICAgICBtdWx0aURheUV2ZW50czoge1xyXG4gICAgICAgICAgICBzaW5nbGVEYXk6ICdkYXRlJyxcclxuICAgICAgICAgICAgZW5kRGF0ZTogJ2VuZERhdGUnLFxyXG4gICAgICAgICAgICBzdGFydERhdGU6ICdzdGFydERhdGUnXHJcbiAgICAgICAgfSxcclxuICAgICAgICBzaG93QWRqYWNlbnRNb250aHM6IHRydWUsXHJcbiAgICAgICAgYWRqYWNlbnREYXlzQ2hhbmdlTW9udGg6IGZhbHNlLFxyXG4gICAgICAgIHRyYWNrU2VsZWN0ZWREYXRlOiB0cnVlLFxyXG4gICAgICAgIGRheXNPZlRoZVdlZWs6IChmdW5jdGlvbigpe1xyXG4gICAgICAgICAgICB2YXIgcmVzdWx0ID0gW107XHJcbiAgICAgICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgNzsgaSsrKSB7XHJcbiAgICAgICAgICAgICAgICByZXN1bHQucHVzaChtb21lbnQoKS53ZWVrZGF5KGkpLmZvcm1hdCgnZGRkJykpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIHJldHVybiByZXN1bHQ7XHJcbiAgICAgICAgfSkoKSxcclxuICAgICAgICByZWFkeTogZnVuY3Rpb24oKXsgLy9yZWFkeVxyXG4gICAgICAgICAgICB2YXIgZXZlbnRMaXN0aW5nVGl0bGUgPSAkKFwiLmV2ZW50LWxpc3RpbmctdGl0bGVcIik7XHJcbiAgICAgICAgICAgIC8vSW5pdCBibG9jayBPcGVuL0Nsb3NlIGV2ZW50XHJcbiAgICAgICAgICAgIGV2ZW50TGlzdGluZ1RpdGxlLm9uKFwiY2xpY2tcIiwgXCIuZ2x5cGhpY29uLWNoZXZyb24tdXAsIC5nbHlwaGljb24tY2hldnJvbi1kb3duXCIsIGZ1bmN0aW9uKCl7XHJcbiAgICAgICAgICAgICAgICB2YXIgZWwgPSB7fTtcclxuICAgICAgICAgICAgICAgIHZhciBibG9jayA9IHtcclxuICAgICAgICAgICAgICAgICAgICBvcGVuOiBcImdseXBoaWNvbi1jaGV2cm9uLXVwXCIsXHJcbiAgICAgICAgICAgICAgICAgICAgY2xvc2U6IFwiZ2x5cGhpY29uLWNoZXZyb24tZG93blwiXHJcbiAgICAgICAgICAgICAgICB9O1xyXG4gICAgICAgICAgICAgICAgdmFyICR0aGlzID0gJCh0aGlzKTtcclxuICAgICAgICAgICAgICAgIGlmKCR0aGlzLnBhcmVudCgpLmhhc0NsYXNzKFwibW9udGgtdGl0bGVcIikpXHJcbiAgICAgICAgICAgICAgICAgICAgZWwgPSAkKFwiLmRheS10aXRsZSBbY2xhc3MgKj1nbHlwaGljb24tY2hldnJvbl1cIikuZXEoMCk7XHJcbiAgICAgICAgICAgICAgICAgZWxzZVxyXG4gICAgICAgICAgICAgICAgICAgIGVsID0gJChcIi5tb250aC10aXRsZSBbY2xhc3MgKj1nbHlwaGljb24tY2hldnJvbl1cIikuZXEoMCk7XHJcblxyXG4gICAgICAgICAgICAgICAgaWYoZWwuaGFzQ2xhc3MoYmxvY2sub3BlbikpXHJcbiAgICAgICAgICAgICAgICAgICAgZWwucmVtb3ZlQ2xhc3MoYmxvY2sub3BlbikuYWRkQ2xhc3MoYmxvY2suY2xvc2UpO1xyXG4gICAgICAgICAgICAgICAgZWxzZVxyXG4gICAgICAgICAgICAgICAgICAgIGVsLnJlbW92ZUNsYXNzKGJsb2NrLmNsb3NlKS5hZGRDbGFzcyhibG9jay5vcGVuKTtcclxuXHJcbiAgICAgICAgICAgICAgICBpZigkdGhpcy5oYXNDbGFzcyhibG9jay5vcGVuKSlcclxuICAgICAgICAgICAgICAgICAgICAkdGhpcy5yZW1vdmVDbGFzcyhibG9jay5vcGVuKS5hZGRDbGFzcyhibG9jay5jbG9zZSk7XHJcbiAgICAgICAgICAgICAgICBlbHNlXHJcbiAgICAgICAgICAgICAgICAgICAgJHRoaXMucmVtb3ZlQ2xhc3MoYmxvY2suY2xvc2UpLmFkZENsYXNzKGJsb2NrLm9wZW4pO1xyXG5cclxuICAgICAgICAgICAgICAgICQoXCIuZXZlbnQtaXRlbXMsIC5kYXktZXZlbnRzXCIpLnNsaWRlVG9nZ2xlKCk7XHJcblxyXG4gICAgICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgICAgIC8vSW5pdCBtb2RhbCB3aW5kb3dcclxuICAgICAgICAgICAgdmFyIG1vZGFsID0gJChcIiNtb2RhbFwiKTtcclxuICAgICAgICAgICAgdmFyIGRhdGV0aW1lcGlja2VyT3B0aW9ucyA9IHtcclxuICAgICAgICAgICAgICAgIHN0ZXA6IDMwXHJcbiAgICAgICAgICAgIH07XHJcbiAgICAgICAgICAgIHZhciBkYXRldGltZVBpY2tlckluaXQgPSBmdW5jdGlvbihvcHRpb25zKXtcclxuICAgICAgICAgICAgICAgIHZhciBkdFBpY2tlciA9ICQoJyNkYXRldGltZXBpY2tlcicpO1xyXG4gICAgICAgICAgICAgICAgJCgnI3JlcGVhdC1kYXknKS5pQ2hlY2soJ3VuY2hlY2snKVxyXG4gICAgICAgICAgICAgICAgICAgIC5pQ2hlY2soe1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBjaGVja2JveENsYXNzOiAnaWNoZWNrYm94X3NxdWFyZS1ibHVlJyxcclxuICAgICAgICAgICAgICAgICAgICAgICAgcmFkaW9DbGFzczogJ2lyYWRpb19zcXVhcmUtYmx1ZScsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGluY3JlYXNlQXJlYTogJzIwJScsIC8vIG9wdGlvbmFsXHJcbiAgICAgICAgICAgICAgICAgICAgfSkub24oXCJpZlVuY2hlY2tlZFwiLCBmdW5jdGlvbigpe1xyXG4gICAgICAgICAgICAgICAgICAgIGR0UGlja2VyXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIC5kYXRldGltZXBpY2tlcignZGVzdHJveScpXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIC5kYXRldGltZXBpY2tlcigpO1xyXG4gICAgICAgICAgICAgICAgfSkub24oXCJpZkNoZWNrZWRcIiwgZnVuY3Rpb24oKXtcclxuICAgICAgICAgICAgICAgICAgICBkdFBpY2tlclxyXG4gICAgICAgICAgICAgICAgICAgICAgICAuZGF0ZXRpbWVwaWNrZXIoJ2Rlc3Ryb3knKVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAuZGF0ZXRpbWVwaWNrZXIoe1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZGF0ZXBpY2tlcjpmYWxzZSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGZvcm1hdDonSDppJ1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICAgICAgZHRQaWNrZXJcclxuICAgICAgICAgICAgICAgICAgICAuZGF0ZXRpbWVwaWNrZXIoJ2Rlc3Ryb3knKVxyXG4gICAgICAgICAgICAgICAgICAgIC5kYXRldGltZXBpY2tlcihvcHRpb25zKTtcclxuICAgICAgICAgICAgICAgIG1vZGFsLm1vZGFsKCdzaG93Jyk7XHJcbiAgICAgICAgICAgIH07XHJcblxyXG4gICAgICAgICAgICAvL0luaXQgbW9kYWwgd2luZG93IFwiRWRpdCBldmVudFwiXHJcbiAgICAgICAgICAgICQoXCIuZXZlbnQtbGlzdGluZ1wiKS5vbignY2xpY2snLCAnLmV2ZW50LWl0ZW0nLCBmdW5jdGlvbigpe1xyXG4gICAgICAgICAgICAgICAgbW9kYWwuZmluZChcImZvcm1cIikuZ2V0KDApLnJlc2V0KCk7XHJcbiAgICAgICAgICAgICAgICBtb2RhbC5maW5kKFwiLm1vZGFsLXRpdGxlXCIpLnRleHQoXCJFZGl0IGV2ZW50XCIpO1xyXG5cclxuICAgICAgICAgICAgICAgIGRhdGV0aW1lcGlja2VyT3B0aW9ucy52YWx1ZSA9ICQodGhpcykuZmluZChcIi5ldmVudC1pdGVtLXRpbWVcIikuYXR0cihcImRhdGEtZGF0ZXRpbWVcIik7XHJcbiAgICAgICAgICAgICAgICBtb2RhbC5maW5kKFwiI1RpdGxlXCIpLnZhbCgkKHRoaXMpLmZpbmQoXCIuZXZlbnQtaXRlbS1uYW1lXCIpLnRleHQoKSk7XHJcbiAgICAgICAgICAgICAgICBtb2RhbC5maW5kKFwiI0Rlc2NyaXB0aW9uXCIpLnZhbCgkKHRoaXMpLmZpbmQoXCIuZXZlbnQtaXRlbS1sb2NhdGlvblwiKS50ZXh0KCkpO1xyXG5cclxuICAgICAgICAgICAgICAgIGRhdGV0aW1lUGlja2VySW5pdChkYXRldGltZXBpY2tlck9wdGlvbnMpO1xyXG4gICAgICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgICAgIC8vSW5pdCBtb2RhbCB3aW5kb3cgXCJBZGQgZXZlbnRcIlxyXG4gICAgICAgICAgICBldmVudExpc3RpbmdUaXRsZS5vbihcImNsaWNrXCIsIFwiLmdseXBoaWNvbi1wbHVzXCIsIGZ1bmN0aW9uKCl7XHJcbiAgICAgICAgICAgICAgICBtb2RhbC5maW5kKFwiZm9ybVwiKS5nZXQoMCkucmVzZXQoKTtcclxuICAgICAgICAgICAgICAgIG1vZGFsLmZpbmQoXCIubW9kYWwtdGl0bGVcIikudGV4dChcIkFkZCBldmVudFwiKTtcclxuXHJcbiAgICAgICAgICAgICAgICBpZigkKHRoaXMpLnBhcmVudCgpLmhhc0NsYXNzKFwiZGF5LXRpdGxlXCIpKXtcclxuICAgICAgICAgICAgICAgICAgICBkYXRldGltZXBpY2tlck9wdGlvbnMudmFsdWUgPSAoZnVuY3Rpb24oKXtcclxuICAgICAgICAgICAgICAgICAgICAgICAgdmFyIHRpbWUgPSBcIiBcIiArIG1vbWVudCgpLmZvcm1hdChcIkhIOm1tXCIpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB2YXIgZWwgPSAkKGNsbmRyLmVsZW1lbnQpLmZpbmQoXCIuc2VsZWN0ZWRcIik7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmKGVsLmxlbmd0aCA+IDApXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gZWwuYXR0cihcImRhdGEtaWRcIikgKyB0aW1lO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBlbHNlXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gJChjbG5kci5lbGVtZW50KS5maW5kKFwidG9kYXlcIikuYXR0cihcImRhdGEtaWRcIikgKyB0aW1lO1xyXG4gICAgICAgICAgICAgICAgICAgIH0pKCk7XHJcbiAgICAgICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAgICAgZGF0ZXRpbWVQaWNrZXJJbml0KGRhdGV0aW1lcGlja2VyT3B0aW9ucyk7XHJcbiAgICAgICAgICAgIH0pO1xyXG5cclxuICAgICAgICAgICAgdmFyIGNhbGVuZGFyID0gJChcIi5jbG5kclwiKTtcclxuICAgICAgICAgICAgY2FsZW5kYXIuaGVpZ2h0KGNhbGVuZGFyLmhlaWdodCgpKTtcclxuXHJcbiAgICAgICAgfSwvLyFyZWFkeVxyXG4gICAgICAgIGRvbmVSZW5kZXJpbmc6IGZ1bmN0aW9uKCl7IC8vZG9uZVJlbmRlcmluZ1xyXG4gICAgICAgICAgICAkKFwiLmV2ZW50LWl0ZW1zXCIpXHJcbiAgICAgICAgICAgICAgICAuaGVpZ2h0KCAkKFwiLmNsbmRyLWdyaWQgLmRheXNcIikuaGVpZ2h0KCkgLSAkKFwiLmNsbmRyLWdyaWQgLmRheXMtb2YtdGhlLXdlZWtcIikuaGVpZ2h0KCkgKVxyXG4gICAgICAgICAgICAgICAgLm1DdXN0b21TY3JvbGxiYXIoe1xyXG4gICAgICAgICAgICAgICAgc2Nyb2xsQnV0dG9uczp7ZW5hYmxlOnRydWV9LFxyXG4gICAgICAgICAgICAgICAgdGhlbWU6XCJtaW5pbWFsLWRhcmtcIlxyXG4gICAgICAgICAgICB9KVxyXG4gICAgICAgIH0vLyFkb25lUmVuZGVyaW5nXHJcbiAgICB9KTtcclxufSk7Il0sImZpbGUiOiJzY2hlZHVsZS5qcyIsInNvdXJjZVJvb3QiOiIvc291cmNlLyJ9
