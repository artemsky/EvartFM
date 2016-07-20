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