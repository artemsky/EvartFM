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
        { date: currentMonth + '-' + '10 20:00:00', title: 'Persian Kitten Auction', location: 'Center for Beautiful Cats' },
        { date: currentMonth + '-' + '19 21:00:00', title: 'Cat Frisbee', location: 'Jefferson Park' },
        { date: currentMonth + '-' + '23 18:00:00', title: 'Kitten Demonstration', location: 'Center for Beautiful Cats' },
        { date: currentMonth + '-' + '23 18:00:00', title: 'Kitten Demonstration', location: 'Center for Beautiful Cats' },
        { date: currentMonth + '-' + '23 19:00:00', title: 'Kitten Demonstration', location: 'Center for Beautiful Cats' },
        { date: currentMonth + '-' + '23 20:00:00', title: 'Kitten Demonstration', location: 'Center for Beautiful Cats' },
        { date: currentMonth + '-' + '23 21:00:00', title: 'Kitten Demonstration', location: 'Center for Beautiful Cats' },
        { date: currentMonth + '-' + '23 22:00:00', title: 'Kitten Demonstration', location: 'Center for Beautiful Cats' },
        { date: currentMonth + '-' + '23 23:00:00', title: 'Kitten Demonstration', location: 'Center for Beautiful Cats' },
        { date: nextMonth + '-' + '07 17:30:00',    title: 'Small Cat Photo Session', location: 'Center for Cat Photography' }
    ];

    var clndr = {};
    clndr = $('#full-clndr').clndr({
        template: $('#full-clndr-template').html(),
        events: events,
        clickEvents: {
            click: function (target) {
                console.log('Cal-1 clicked: ', target);
            },
            today: function () {
                console.log('Cal-1 today');
            },
            nextMonth: function () {
                console.log('Cal-1 next month');
            },
            previousMonth: function () {
                console.log('Cal-1 previous month');
            },
            onMonthChange: function () {
                console.log('Cal-1 month changed');
            },
            nextYear: function () {
                console.log('Cal-1 next year');
            },
            previousYear: function () {
                console.log('Cal-1 previous year');
            },
            onYearChange: function () {
                console.log('Cal-1 year changed');
            },
            nextInterval: function () {
                console.log('Cal-1 next interval');
            },
            previousInterval: function () {
                console.log('Cal-1 previous interval');
            },
            onIntervalChange: function () {
                console.log('Cal-1 interval changed');
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
        //selectedDate: moment().format("YYYY-MM-DD"),
        daysOfTheWeek: (function(){
            var result = [];
            for (var i = 0; i < 7; i++) {
                result.push(moment().weekday(i).format('ddd'));
            }
            return result;
        })(),
        ready: function(){
            $(".event-items").height($(".clndr-grid").height()).show().mCustomScrollbar();
        }
    });


});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiIiwic291cmNlcyI6WyJzY2hlZHVsZS5qcyJdLCJzb3VyY2VzQ29udGVudCI6WyIkKGZ1bmN0aW9uKCl7XHJcbiAgICBcInVzZSBzdHJpY3RcIjtcclxuXHJcbiAgICBfLnRlbXBsYXRlU2V0dGluZ3MgPSB7XHJcbiAgICAgICAgZXZhbHVhdGUgICAgOiAvXFx7XFx7JShbXFxzXFxTXSs/KSVcXH1cXH0vZyxcclxuICAgICAgICBpbnRlcnBvbGF0ZSA6IC9cXHtcXHslPShbXFxzXFxTXSs/KSVcXH1cXH0vZyxcclxuICAgICAgICBlc2NhcGUgICAgICA6IC9cXHtcXHslLShbXFxzXFxTXSs/KSVcXH1cXH0vZ1xyXG4gICAgfTtcclxuICAgIC8vIENhbGwgdGhpcyBmcm9tIHRoZSBkZXZlbG9wZXIgY29uc29sZSBhbmQgeW91IGNhbiBjb250cm9sIGJvdGggaW5zdGFuY2VzXHJcbiAgICBtb21lbnQubG9jYWxlKFwiZW4tZ2JcIik7XHJcblxyXG4gICAgdmFyIGN1cnJlbnRNb250aCA9IG1vbWVudCgpLmZvcm1hdCgnWVlZWS1NTScpO1xyXG4gICAgdmFyIG5leHRNb250aCAgICA9IG1vbWVudCgpLmFkZCgnbW9udGgnLCAxKS5mb3JtYXQoJ1lZWVktTU0nKTtcclxuICAgIHZhciBldmVudHMgPSBbXHJcbiAgICAgICAgeyBkYXRlOiBjdXJyZW50TW9udGggKyAnLScgKyAnMTAgMjA6MDA6MDAnLCB0aXRsZTogJ1BlcnNpYW4gS2l0dGVuIEF1Y3Rpb24nLCBsb2NhdGlvbjogJ0NlbnRlciBmb3IgQmVhdXRpZnVsIENhdHMnIH0sXHJcbiAgICAgICAgeyBkYXRlOiBjdXJyZW50TW9udGggKyAnLScgKyAnMTkgMjE6MDA6MDAnLCB0aXRsZTogJ0NhdCBGcmlzYmVlJywgbG9jYXRpb246ICdKZWZmZXJzb24gUGFyaycgfSxcclxuICAgICAgICB7IGRhdGU6IGN1cnJlbnRNb250aCArICctJyArICcyMyAxODowMDowMCcsIHRpdGxlOiAnS2l0dGVuIERlbW9uc3RyYXRpb24nLCBsb2NhdGlvbjogJ0NlbnRlciBmb3IgQmVhdXRpZnVsIENhdHMnIH0sXHJcbiAgICAgICAgeyBkYXRlOiBjdXJyZW50TW9udGggKyAnLScgKyAnMjMgMTg6MDA6MDAnLCB0aXRsZTogJ0tpdHRlbiBEZW1vbnN0cmF0aW9uJywgbG9jYXRpb246ICdDZW50ZXIgZm9yIEJlYXV0aWZ1bCBDYXRzJyB9LFxyXG4gICAgICAgIHsgZGF0ZTogY3VycmVudE1vbnRoICsgJy0nICsgJzIzIDE5OjAwOjAwJywgdGl0bGU6ICdLaXR0ZW4gRGVtb25zdHJhdGlvbicsIGxvY2F0aW9uOiAnQ2VudGVyIGZvciBCZWF1dGlmdWwgQ2F0cycgfSxcclxuICAgICAgICB7IGRhdGU6IGN1cnJlbnRNb250aCArICctJyArICcyMyAyMDowMDowMCcsIHRpdGxlOiAnS2l0dGVuIERlbW9uc3RyYXRpb24nLCBsb2NhdGlvbjogJ0NlbnRlciBmb3IgQmVhdXRpZnVsIENhdHMnIH0sXHJcbiAgICAgICAgeyBkYXRlOiBjdXJyZW50TW9udGggKyAnLScgKyAnMjMgMjE6MDA6MDAnLCB0aXRsZTogJ0tpdHRlbiBEZW1vbnN0cmF0aW9uJywgbG9jYXRpb246ICdDZW50ZXIgZm9yIEJlYXV0aWZ1bCBDYXRzJyB9LFxyXG4gICAgICAgIHsgZGF0ZTogY3VycmVudE1vbnRoICsgJy0nICsgJzIzIDIyOjAwOjAwJywgdGl0bGU6ICdLaXR0ZW4gRGVtb25zdHJhdGlvbicsIGxvY2F0aW9uOiAnQ2VudGVyIGZvciBCZWF1dGlmdWwgQ2F0cycgfSxcclxuICAgICAgICB7IGRhdGU6IGN1cnJlbnRNb250aCArICctJyArICcyMyAyMzowMDowMCcsIHRpdGxlOiAnS2l0dGVuIERlbW9uc3RyYXRpb24nLCBsb2NhdGlvbjogJ0NlbnRlciBmb3IgQmVhdXRpZnVsIENhdHMnIH0sXHJcbiAgICAgICAgeyBkYXRlOiBuZXh0TW9udGggKyAnLScgKyAnMDcgMTc6MzA6MDAnLCAgICB0aXRsZTogJ1NtYWxsIENhdCBQaG90byBTZXNzaW9uJywgbG9jYXRpb246ICdDZW50ZXIgZm9yIENhdCBQaG90b2dyYXBoeScgfVxyXG4gICAgXTtcclxuXHJcbiAgICB2YXIgY2xuZHIgPSB7fTtcclxuICAgIGNsbmRyID0gJCgnI2Z1bGwtY2xuZHInKS5jbG5kcih7XHJcbiAgICAgICAgdGVtcGxhdGU6ICQoJyNmdWxsLWNsbmRyLXRlbXBsYXRlJykuaHRtbCgpLFxyXG4gICAgICAgIGV2ZW50czogZXZlbnRzLFxyXG4gICAgICAgIGNsaWNrRXZlbnRzOiB7XHJcbiAgICAgICAgICAgIGNsaWNrOiBmdW5jdGlvbiAodGFyZ2V0KSB7XHJcbiAgICAgICAgICAgICAgICBjb25zb2xlLmxvZygnQ2FsLTEgY2xpY2tlZDogJywgdGFyZ2V0KTtcclxuICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgdG9kYXk6IGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKCdDYWwtMSB0b2RheScpO1xyXG4gICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICBuZXh0TW9udGg6IGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKCdDYWwtMSBuZXh0IG1vbnRoJyk7XHJcbiAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgIHByZXZpb3VzTW9udGg6IGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKCdDYWwtMSBwcmV2aW91cyBtb250aCcpO1xyXG4gICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICBvbk1vbnRoQ2hhbmdlOiBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgICAgICBjb25zb2xlLmxvZygnQ2FsLTEgbW9udGggY2hhbmdlZCcpO1xyXG4gICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICBuZXh0WWVhcjogZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICAgICAgY29uc29sZS5sb2coJ0NhbC0xIG5leHQgeWVhcicpO1xyXG4gICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICBwcmV2aW91c1llYXI6IGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKCdDYWwtMSBwcmV2aW91cyB5ZWFyJyk7XHJcbiAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgIG9uWWVhckNoYW5nZTogZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICAgICAgY29uc29sZS5sb2coJ0NhbC0xIHllYXIgY2hhbmdlZCcpO1xyXG4gICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICBuZXh0SW50ZXJ2YWw6IGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKCdDYWwtMSBuZXh0IGludGVydmFsJyk7XHJcbiAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgIHByZXZpb3VzSW50ZXJ2YWw6IGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKCdDYWwtMSBwcmV2aW91cyBpbnRlcnZhbCcpO1xyXG4gICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICBvbkludGVydmFsQ2hhbmdlOiBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgICAgICBjb25zb2xlLmxvZygnQ2FsLTEgaW50ZXJ2YWwgY2hhbmdlZCcpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfSxcclxuICAgICAgICBmb3JjZVNpeFJvd3M6IHRydWUsXHJcbiAgICAgICAgbXVsdGlEYXlFdmVudHM6IHtcclxuICAgICAgICAgICAgc2luZ2xlRGF5OiAnZGF0ZScsXHJcbiAgICAgICAgICAgIGVuZERhdGU6ICdlbmREYXRlJyxcclxuICAgICAgICAgICAgc3RhcnREYXRlOiAnc3RhcnREYXRlJ1xyXG4gICAgICAgIH0sXHJcbiAgICAgICAgc2hvd0FkamFjZW50TW9udGhzOiB0cnVlLFxyXG4gICAgICAgIGFkamFjZW50RGF5c0NoYW5nZU1vbnRoOiBmYWxzZSxcclxuICAgICAgICB0cmFja1NlbGVjdGVkRGF0ZTogdHJ1ZSxcclxuICAgICAgICAvL3NlbGVjdGVkRGF0ZTogbW9tZW50KCkuZm9ybWF0KFwiWVlZWS1NTS1ERFwiKSxcclxuICAgICAgICBkYXlzT2ZUaGVXZWVrOiAoZnVuY3Rpb24oKXtcclxuICAgICAgICAgICAgdmFyIHJlc3VsdCA9IFtdO1xyXG4gICAgICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IDc7IGkrKykge1xyXG4gICAgICAgICAgICAgICAgcmVzdWx0LnB1c2gobW9tZW50KCkud2Vla2RheShpKS5mb3JtYXQoJ2RkZCcpKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICByZXR1cm4gcmVzdWx0O1xyXG4gICAgICAgIH0pKCksXHJcbiAgICAgICAgcmVhZHk6IGZ1bmN0aW9uKCl7XHJcbiAgICAgICAgICAgICQoXCIuZXZlbnQtaXRlbXNcIikuaGVpZ2h0KCQoXCIuY2xuZHItZ3JpZFwiKS5oZWlnaHQoKSkuc2hvdygpLm1DdXN0b21TY3JvbGxiYXIoKTtcclxuICAgICAgICB9XHJcbiAgICB9KTtcclxuXHJcblxyXG59KTsiXSwiZmlsZSI6InNjaGVkdWxlLmpzIiwic291cmNlUm9vdCI6Ii9zb3VyY2UvIn0=
