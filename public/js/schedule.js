
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
    var events = [];
    var onEventsSuccess = function(response){
            $("#fountainTextG").hide();
            initCalendar(response);
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
    };

});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiIiwic291cmNlcyI6WyJzY2hlZHVsZS5qcyJdLCJzb3VyY2VzQ29udGVudCI6WyJcclxuJChmdW5jdGlvbigpe1xyXG4gICAgXCJ1c2Ugc3RyaWN0XCI7XHJcblxyXG4gICAgLy9TZXQgdW5kZXJzY29yZSB0ZW1wbGF0ZSBzZXR0aW5nIGFzIHt7JSV9fSBmb3IgYmV0dGVyIGNvZGUgcmVhZGluZ1xyXG4gICAgXy50ZW1wbGF0ZVNldHRpbmdzID0ge1xyXG4gICAgICAgIGV2YWx1YXRlICAgIDogL1xce1xceyUoW1xcc1xcU10rPyklXFx9XFx9L2csXHJcbiAgICAgICAgaW50ZXJwb2xhdGUgOiAvXFx7XFx7JT0oW1xcc1xcU10rPyklXFx9XFx9L2csXHJcbiAgICAgICAgZXNjYXBlICAgICAgOiAvXFx7XFx7JS0oW1xcc1xcU10rPyklXFx9XFx9L2dcclxuICAgIH07XHJcbiAgICAvL1NldCBtb21lbnQgbG9jYWxlXHJcbiAgICBtb21lbnQubG9jYWxlKFwiZW4tZ2JcIik7XHJcblxyXG4gICAgLy9ldmVudHNcclxuICAgIHZhciBldmVudHMgPSBbXTtcclxuICAgIHZhciBvbkV2ZW50c1N1Y2Nlc3MgPSBmdW5jdGlvbihyZXNwb25zZSl7XHJcbiAgICAgICAgICAgICQoXCIjZm91bnRhaW5UZXh0R1wiKS5oaWRlKCk7XHJcbiAgICAgICAgICAgIGluaXRDYWxlbmRhcihyZXNwb25zZSk7XHJcbiAgICAgICAgfSxcclxuICAgICAgICBvbkV2ZW50c0Vycm9yID0gZnVuY3Rpb24gKHJlc3BvbnNlKXtcclxuICAgICAgICAgICAgJChcIiNmb3VudGFpblRleHRHXCIpLmhpZGUoKTtcclxuICAgICAgICAgICAgY29uc29sZS5sb2cocmVzcG9uc2UpO1xyXG4gICAgICAgIH07XHJcbiAgICB2YXIgcmVxdWVzdE9wdGlvbnMgPSB7XHJcbiAgICAgICAgdHlwZTogXCJHRVRcIixcclxuICAgICAgICBjYWNoZTogZmFsc2UsXHJcbiAgICAgICAgc3VjY2Vzczogb25FdmVudHNTdWNjZXNzLFxyXG4gICAgICAgIGVycm9yOiBvbkV2ZW50c0Vycm9yXHJcbiAgICB9O1xyXG4gICAgJC5hamF4KCdzY2hlZHVsZS9ldmVudHMnLCByZXF1ZXN0T3B0aW9ucyk7XHJcbiAgICAvLyFldmVudHNcclxuXHJcbiAgICAvL3JlYWQgZXZlbnRzIHRlbXBsYXRlXHJcbiAgICB2YXIgZGF5RXZlbnRzVGVtcGxhdGUgPSAkKCcjZGF5LWV2ZW50cycpLmh0bWwoKTtcclxuXHJcbiAgICAvL0luaXQgY2FsZW5kYXJcclxuICAgIHZhciBpbml0Q2FsZW5kYXIgPSBmdW5jdGlvbihldmVudHMpe1xyXG4gICAgICAgIHZhciBjbG5kciA9ICQoJyNmdWxsLWNsbmRyJykuY2xuZHIoe1xyXG4gICAgICAgICAgICB0ZW1wbGF0ZTogJCgnI2Z1bGwtY2xuZHItdGVtcGxhdGUnKS5odG1sKCksXHJcbiAgICAgICAgICAgIGV2ZW50czogZXZlbnRzLFxyXG4gICAgICAgICAgICBjbGlja0V2ZW50czoge1xyXG4gICAgICAgICAgICAgICAgY2xpY2s6IGZ1bmN0aW9uICh0YXJnZXQpIHtcclxuICAgICAgICAgICAgICAgICAgICB2YXIgdGVtcGxhdGUgPSBfLnRlbXBsYXRlKGRheUV2ZW50c1RlbXBsYXRlKTtcclxuICAgICAgICAgICAgICAgICAgICAkKFwiLmRheS1ldmVudHNcIilcclxuICAgICAgICAgICAgICAgICAgICAgICAgLm1DdXN0b21TY3JvbGxiYXIoXCJkZXN0cm95XCIpXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIC5zbGlkZURvd24oKVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAuaHRtbCh0ZW1wbGF0ZSh7ZXZlbnRzVGhpc0RheTogdGFyZ2V0LmV2ZW50c30pKVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAuaGVpZ2h0KCAkKFwiLmNsbmRyLWdyaWQgLmRheXNcIikuaGVpZ2h0KCkgLSAkKFwiLmNsbmRyLWdyaWQgLmRheXMtb2YtdGhlLXdlZWtcIikuaGVpZ2h0KCkgKVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAubUN1c3RvbVNjcm9sbGJhcih7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBzY3JvbGxCdXR0b25zOntlbmFibGU6dHJ1ZX0sXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aGVtZTpcIm1pbmltYWwtZGFya1wiXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICAgICAgICAgICQoXCIuZXZlbnQtaXRlbXNcIikuc2xpZGVVcCgpO1xyXG5cclxuICAgICAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgICAgICBvbk1vbnRoQ2hhbmdlOiBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5vcHRpb25zLnJlYWR5KCk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgIGZvcmNlU2l4Um93czogdHJ1ZSxcclxuICAgICAgICAgICAgbXVsdGlEYXlFdmVudHM6IHtcclxuICAgICAgICAgICAgICAgIHNpbmdsZURheTogJ2RhdGUnLFxyXG4gICAgICAgICAgICAgICAgZW5kRGF0ZTogJ2VuZERhdGUnLFxyXG4gICAgICAgICAgICAgICAgc3RhcnREYXRlOiAnc3RhcnREYXRlJ1xyXG4gICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICBzaG93QWRqYWNlbnRNb250aHM6IHRydWUsXHJcbiAgICAgICAgICAgIGFkamFjZW50RGF5c0NoYW5nZU1vbnRoOiBmYWxzZSxcclxuICAgICAgICAgICAgdHJhY2tTZWxlY3RlZERhdGU6IHRydWUsXHJcbiAgICAgICAgICAgIGRheXNPZlRoZVdlZWs6IChmdW5jdGlvbigpe1xyXG4gICAgICAgICAgICAgICAgdmFyIHJlc3VsdCA9IFtdO1xyXG4gICAgICAgICAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCA3OyBpKyspIHtcclxuICAgICAgICAgICAgICAgICAgICByZXN1bHQucHVzaChtb21lbnQoKS53ZWVrZGF5KGkpLmZvcm1hdCgnZGRkJykpO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgcmV0dXJuIHJlc3VsdDtcclxuICAgICAgICAgICAgfSkoKSxcclxuICAgICAgICAgICAgcmVhZHk6IGZ1bmN0aW9uKCl7IC8vcmVhZHlcclxuICAgICAgICAgICAgICAgIHZhciBldmVudExpc3RpbmdUaXRsZSA9ICQoXCIuZXZlbnQtbGlzdGluZy10aXRsZVwiKTtcclxuICAgICAgICAgICAgICAgIC8vSW5pdCBibG9jayBPcGVuL0Nsb3NlIGV2ZW50XHJcbiAgICAgICAgICAgICAgICBldmVudExpc3RpbmdUaXRsZS5vbihcImNsaWNrXCIsIFwiLmdseXBoaWNvbi1jaGV2cm9uLXVwLCAuZ2x5cGhpY29uLWNoZXZyb24tZG93blwiLCBmdW5jdGlvbigpe1xyXG4gICAgICAgICAgICAgICAgICAgIHZhciBlbCA9IHt9O1xyXG4gICAgICAgICAgICAgICAgICAgIHZhciBibG9jayA9IHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgb3BlbjogXCJnbHlwaGljb24tY2hldnJvbi11cFwiLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBjbG9zZTogXCJnbHlwaGljb24tY2hldnJvbi1kb3duXCJcclxuICAgICAgICAgICAgICAgICAgICB9O1xyXG4gICAgICAgICAgICAgICAgICAgIHZhciAkdGhpcyA9ICQodGhpcyk7XHJcbiAgICAgICAgICAgICAgICAgICAgaWYoJHRoaXMucGFyZW50KCkuaGFzQ2xhc3MoXCJtb250aC10aXRsZVwiKSlcclxuICAgICAgICAgICAgICAgICAgICAgICAgZWwgPSAkKFwiLmRheS10aXRsZSBbY2xhc3MgKj1nbHlwaGljb24tY2hldnJvbl1cIikuZXEoMCk7XHJcbiAgICAgICAgICAgICAgICAgICAgZWxzZVxyXG4gICAgICAgICAgICAgICAgICAgICAgICBlbCA9ICQoXCIubW9udGgtdGl0bGUgW2NsYXNzICo9Z2x5cGhpY29uLWNoZXZyb25dXCIpLmVxKDApO1xyXG5cclxuICAgICAgICAgICAgICAgICAgICBpZihlbC5oYXNDbGFzcyhibG9jay5vcGVuKSlcclxuICAgICAgICAgICAgICAgICAgICAgICAgZWwucmVtb3ZlQ2xhc3MoYmxvY2sub3BlbikuYWRkQ2xhc3MoYmxvY2suY2xvc2UpO1xyXG4gICAgICAgICAgICAgICAgICAgIGVsc2VcclxuICAgICAgICAgICAgICAgICAgICAgICAgZWwucmVtb3ZlQ2xhc3MoYmxvY2suY2xvc2UpLmFkZENsYXNzKGJsb2NrLm9wZW4pO1xyXG5cclxuICAgICAgICAgICAgICAgICAgICBpZigkdGhpcy5oYXNDbGFzcyhibG9jay5vcGVuKSlcclxuICAgICAgICAgICAgICAgICAgICAgICAgJHRoaXMucmVtb3ZlQ2xhc3MoYmxvY2sub3BlbikuYWRkQ2xhc3MoYmxvY2suY2xvc2UpO1xyXG4gICAgICAgICAgICAgICAgICAgIGVsc2VcclxuICAgICAgICAgICAgICAgICAgICAgICAgJHRoaXMucmVtb3ZlQ2xhc3MoYmxvY2suY2xvc2UpLmFkZENsYXNzKGJsb2NrLm9wZW4pO1xyXG5cclxuICAgICAgICAgICAgICAgICAgICAkKFwiLmV2ZW50LWl0ZW1zLCAuZGF5LWV2ZW50c1wiKS5zbGlkZVRvZ2dsZSgpO1xyXG5cclxuICAgICAgICAgICAgICAgIH0pO1xyXG5cclxuICAgICAgICAgICAgICAgIC8vSW5pdCBtb2RhbCB3aW5kb3dcclxuICAgICAgICAgICAgICAgIHZhciBtb2RhbCA9ICQoXCIjbW9kYWxcIik7XHJcbiAgICAgICAgICAgICAgICB2YXIgZGF0ZXRpbWVwaWNrZXJPcHRpb25zID0ge1xyXG4gICAgICAgICAgICAgICAgICAgIHN0ZXA6IDMwXHJcbiAgICAgICAgICAgICAgICB9O1xyXG4gICAgICAgICAgICAgICAgdmFyIGRhdGV0aW1lUGlja2VySW5pdCA9IGZ1bmN0aW9uKG9wdGlvbnMpe1xyXG4gICAgICAgICAgICAgICAgICAgIHZhciBkdFBpY2tlciA9ICQoJyNkYXRldGltZXBpY2tlcicpO1xyXG4gICAgICAgICAgICAgICAgICAgICQoJyNyZXBlYXQtZGF5JykuaUNoZWNrKCd1bmNoZWNrJylcclxuICAgICAgICAgICAgICAgICAgICAgICAgLmlDaGVjayh7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjaGVja2JveENsYXNzOiAnaWNoZWNrYm94X3NxdWFyZS1ibHVlJyxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJhZGlvQ2xhc3M6ICdpcmFkaW9fc3F1YXJlLWJsdWUnLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaW5jcmVhc2VBcmVhOiAnMjAlJywgLy8gb3B0aW9uYWxcclxuICAgICAgICAgICAgICAgICAgICAgICAgfSkub24oXCJpZlVuY2hlY2tlZFwiLCBmdW5jdGlvbigpe1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBkdFBpY2tlclxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgLmRhdGV0aW1lcGlja2VyKCdkZXN0cm95JylcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIC5kYXRldGltZXBpY2tlcigpO1xyXG4gICAgICAgICAgICAgICAgICAgIH0pLm9uKFwiaWZDaGVja2VkXCIsIGZ1bmN0aW9uKCl7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGR0UGlja2VyXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAuZGF0ZXRpbWVwaWNrZXIoJ2Rlc3Ryb3knKVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgLmRhdGV0aW1lcGlja2VyKHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBkYXRlcGlja2VyOmZhbHNlLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGZvcm1hdDonSDppJ1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgICAgICAgICAgZHRQaWNrZXJcclxuICAgICAgICAgICAgICAgICAgICAgICAgLmRhdGV0aW1lcGlja2VyKCdkZXN0cm95JylcclxuICAgICAgICAgICAgICAgICAgICAgICAgLmRhdGV0aW1lcGlja2VyKG9wdGlvbnMpO1xyXG4gICAgICAgICAgICAgICAgICAgIG1vZGFsLm1vZGFsKCdzaG93Jyk7XHJcbiAgICAgICAgICAgICAgICB9O1xyXG5cclxuICAgICAgICAgICAgICAgIC8vSW5pdCBtb2RhbCB3aW5kb3cgXCJFZGl0IGV2ZW50XCJcclxuICAgICAgICAgICAgICAgICQoXCIuZXZlbnQtbGlzdGluZ1wiKS5vbignY2xpY2snLCAnLmV2ZW50LWl0ZW0nLCBmdW5jdGlvbigpe1xyXG4gICAgICAgICAgICAgICAgICAgIG1vZGFsLmZpbmQoXCJmb3JtXCIpLmdldCgwKS5yZXNldCgpO1xyXG4gICAgICAgICAgICAgICAgICAgIG1vZGFsLmZpbmQoXCIubW9kYWwtdGl0bGVcIikudGV4dChcIkVkaXQgZXZlbnRcIik7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgIGRhdGV0aW1lcGlja2VyT3B0aW9ucy52YWx1ZSA9ICQodGhpcykuZmluZChcIi5ldmVudC1pdGVtLXRpbWVcIikuYXR0cihcImRhdGEtZGF0ZXRpbWVcIik7XHJcbiAgICAgICAgICAgICAgICAgICAgbW9kYWwuZmluZChcIiNUaXRsZVwiKS52YWwoJCh0aGlzKS5maW5kKFwiLmV2ZW50LWl0ZW0tbmFtZVwiKS50ZXh0KCkpO1xyXG4gICAgICAgICAgICAgICAgICAgIG1vZGFsLmZpbmQoXCIjRGVzY3JpcHRpb25cIikudmFsKCQodGhpcykuZmluZChcIi5ldmVudC1pdGVtLWxvY2F0aW9uXCIpLnRleHQoKSk7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgIGRhdGV0aW1lUGlja2VySW5pdChkYXRldGltZXBpY2tlck9wdGlvbnMpO1xyXG4gICAgICAgICAgICAgICAgfSk7XHJcblxyXG4gICAgICAgICAgICAgICAgLy9Jbml0IG1vZGFsIHdpbmRvdyBcIkFkZCBldmVudFwiXHJcbiAgICAgICAgICAgICAgICBldmVudExpc3RpbmdUaXRsZS5vbihcImNsaWNrXCIsIFwiLmdseXBoaWNvbi1wbHVzXCIsIGZ1bmN0aW9uKCl7XHJcbiAgICAgICAgICAgICAgICAgICAgbW9kYWwuZmluZChcImZvcm1cIikuZ2V0KDApLnJlc2V0KCk7XHJcbiAgICAgICAgICAgICAgICAgICAgbW9kYWwuZmluZChcIi5tb2RhbC10aXRsZVwiKS50ZXh0KFwiQWRkIGV2ZW50XCIpO1xyXG5cclxuICAgICAgICAgICAgICAgICAgICBpZigkKHRoaXMpLnBhcmVudCgpLmhhc0NsYXNzKFwiZGF5LXRpdGxlXCIpKXtcclxuICAgICAgICAgICAgICAgICAgICAgICAgZGF0ZXRpbWVwaWNrZXJPcHRpb25zLnZhbHVlID0gKGZ1bmN0aW9uKCl7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB2YXIgdGltZSA9IFwiIFwiICsgbW9tZW50KCkuZm9ybWF0KFwiSEg6bW1cIik7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB2YXIgZWwgPSAkKGNsbmRyLmVsZW1lbnQpLmZpbmQoXCIuc2VsZWN0ZWRcIik7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZihlbC5sZW5ndGggPiAwKVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBlbC5hdHRyKFwiZGF0YS1pZFwiKSArIHRpbWU7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBlbHNlXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuICQoY2xuZHIuZWxlbWVudCkuZmluZChcInRvZGF5XCIpLmF0dHIoXCJkYXRhLWlkXCIpICsgdGltZTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgfSkoKTtcclxuICAgICAgICAgICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAgICAgICAgIGRhdGV0aW1lUGlja2VySW5pdChkYXRldGltZXBpY2tlck9wdGlvbnMpO1xyXG4gICAgICAgICAgICAgICAgfSk7XHJcblxyXG4gICAgICAgICAgICAgICAgdmFyIGNhbGVuZGFyID0gJChcIi5jbG5kclwiKTtcclxuICAgICAgICAgICAgICAgIGNhbGVuZGFyLmhlaWdodChjYWxlbmRhci5oZWlnaHQoKSk7XHJcblxyXG4gICAgICAgICAgICB9LC8vIXJlYWR5XHJcbiAgICAgICAgICAgIGRvbmVSZW5kZXJpbmc6IGZ1bmN0aW9uKCl7IC8vZG9uZVJlbmRlcmluZ1xyXG4gICAgICAgICAgICAgICAgJChcIi5ldmVudC1pdGVtc1wiKVxyXG4gICAgICAgICAgICAgICAgICAgIC5oZWlnaHQoICQoXCIuY2xuZHItZ3JpZCAuZGF5c1wiKS5oZWlnaHQoKSAtICQoXCIuY2xuZHItZ3JpZCAuZGF5cy1vZi10aGUtd2Vla1wiKS5oZWlnaHQoKSApXHJcbiAgICAgICAgICAgICAgICAgICAgLm1DdXN0b21TY3JvbGxiYXIoe1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBzY3JvbGxCdXR0b25zOntlbmFibGU6dHJ1ZX0sXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoZW1lOlwibWluaW1hbC1kYXJrXCJcclxuICAgICAgICAgICAgICAgICAgICB9KVxyXG4gICAgICAgICAgICB9Ly8hZG9uZVJlbmRlcmluZ1xyXG4gICAgICAgIH0pO1xyXG4gICAgfTtcclxuXHJcbn0pOyJdLCJmaWxlIjoic2NoZWR1bGUuanMiLCJzb3VyY2VSb290IjoiL3NvdXJjZS8ifQ==
