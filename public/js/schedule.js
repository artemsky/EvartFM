$(function(){
    "use strict";

    _.templateSettings = {
        evaluate    : /\{\{%([\s\S]+?)%\}\}/g,
        interpolate : /\{\{%=([\s\S]+?)%\}\}/g,
        escape      : /\{\{%-([\s\S]+?)%\}\}/g
    };
    // Call this from the developer console and you can control both instances
    moment.locale("en-gb");

    // Assuming you've got the appropriate language files,
    // clndr will respect whatever moment's language is set to.
    // moment.locale('ru');

    // Here's some magic to make sure the dates are happening this month.
    var thisMonth = moment().format('YYYY-MM');
    // Events to load into calendar
    var eventArray = [
        {
            title: 'Multi-Day Event',
            endDate: thisMonth + '-14',
            startDate: thisMonth + '-10'
        }, {
            endDate: thisMonth + '-23',
            startDate: thisMonth + '-21',
            title: 'Another Multi-Day Event'
        }, {
            date: thisMonth + '-27',
            title: 'Single Day Event'
        }
    ];
    var currentMonth = moment().format('YYYY-MM');
    var nextMonth    = moment().add('month', 1).format('YYYY-MM');
    var events = [
        { date: currentMonth + '-' + '10', title: 'Persian Kitten Auction', location: 'Center for Beautiful Cats' },
        { date: currentMonth + '-' + '19', title: 'Cat Frisbee', location: 'Jefferson Park' },
        { date: currentMonth + '-' + '23', title: 'Kitten Demonstration', location: 'Center for Beautiful Cats' },
        { date: nextMonth + '-' + '07',    title: 'Small Cat Photo Session', location: 'Center for Cat Photography' }
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
        daysOfTheWeek: (function(){
            var result = [];
            for (var i = 0; i < 7; i++) {
                result.push(moment().weekday(i).format('ddd'));
            }
            return result;
        })()
    });


});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiIiwic291cmNlcyI6WyJzY2hlZHVsZS5qcyJdLCJzb3VyY2VzQ29udGVudCI6WyIkKGZ1bmN0aW9uKCl7XHJcbiAgICBcInVzZSBzdHJpY3RcIjtcclxuXHJcbiAgICBfLnRlbXBsYXRlU2V0dGluZ3MgPSB7XHJcbiAgICAgICAgZXZhbHVhdGUgICAgOiAvXFx7XFx7JShbXFxzXFxTXSs/KSVcXH1cXH0vZyxcclxuICAgICAgICBpbnRlcnBvbGF0ZSA6IC9cXHtcXHslPShbXFxzXFxTXSs/KSVcXH1cXH0vZyxcclxuICAgICAgICBlc2NhcGUgICAgICA6IC9cXHtcXHslLShbXFxzXFxTXSs/KSVcXH1cXH0vZ1xyXG4gICAgfTtcclxuICAgIC8vIENhbGwgdGhpcyBmcm9tIHRoZSBkZXZlbG9wZXIgY29uc29sZSBhbmQgeW91IGNhbiBjb250cm9sIGJvdGggaW5zdGFuY2VzXHJcbiAgICBtb21lbnQubG9jYWxlKFwiZW4tZ2JcIik7XHJcblxyXG4gICAgLy8gQXNzdW1pbmcgeW91J3ZlIGdvdCB0aGUgYXBwcm9wcmlhdGUgbGFuZ3VhZ2UgZmlsZXMsXHJcbiAgICAvLyBjbG5kciB3aWxsIHJlc3BlY3Qgd2hhdGV2ZXIgbW9tZW50J3MgbGFuZ3VhZ2UgaXMgc2V0IHRvLlxyXG4gICAgLy8gbW9tZW50LmxvY2FsZSgncnUnKTtcclxuXHJcbiAgICAvLyBIZXJlJ3Mgc29tZSBtYWdpYyB0byBtYWtlIHN1cmUgdGhlIGRhdGVzIGFyZSBoYXBwZW5pbmcgdGhpcyBtb250aC5cclxuICAgIHZhciB0aGlzTW9udGggPSBtb21lbnQoKS5mb3JtYXQoJ1lZWVktTU0nKTtcclxuICAgIC8vIEV2ZW50cyB0byBsb2FkIGludG8gY2FsZW5kYXJcclxuICAgIHZhciBldmVudEFycmF5ID0gW1xyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgdGl0bGU6ICdNdWx0aS1EYXkgRXZlbnQnLFxyXG4gICAgICAgICAgICBlbmREYXRlOiB0aGlzTW9udGggKyAnLTE0JyxcclxuICAgICAgICAgICAgc3RhcnREYXRlOiB0aGlzTW9udGggKyAnLTEwJ1xyXG4gICAgICAgIH0sIHtcclxuICAgICAgICAgICAgZW5kRGF0ZTogdGhpc01vbnRoICsgJy0yMycsXHJcbiAgICAgICAgICAgIHN0YXJ0RGF0ZTogdGhpc01vbnRoICsgJy0yMScsXHJcbiAgICAgICAgICAgIHRpdGxlOiAnQW5vdGhlciBNdWx0aS1EYXkgRXZlbnQnXHJcbiAgICAgICAgfSwge1xyXG4gICAgICAgICAgICBkYXRlOiB0aGlzTW9udGggKyAnLTI3JyxcclxuICAgICAgICAgICAgdGl0bGU6ICdTaW5nbGUgRGF5IEV2ZW50J1xyXG4gICAgICAgIH1cclxuICAgIF07XHJcbiAgICB2YXIgY3VycmVudE1vbnRoID0gbW9tZW50KCkuZm9ybWF0KCdZWVlZLU1NJyk7XHJcbiAgICB2YXIgbmV4dE1vbnRoICAgID0gbW9tZW50KCkuYWRkKCdtb250aCcsIDEpLmZvcm1hdCgnWVlZWS1NTScpO1xyXG4gICAgdmFyIGV2ZW50cyA9IFtcclxuICAgICAgICB7IGRhdGU6IGN1cnJlbnRNb250aCArICctJyArICcxMCcsIHRpdGxlOiAnUGVyc2lhbiBLaXR0ZW4gQXVjdGlvbicsIGxvY2F0aW9uOiAnQ2VudGVyIGZvciBCZWF1dGlmdWwgQ2F0cycgfSxcclxuICAgICAgICB7IGRhdGU6IGN1cnJlbnRNb250aCArICctJyArICcxOScsIHRpdGxlOiAnQ2F0IEZyaXNiZWUnLCBsb2NhdGlvbjogJ0plZmZlcnNvbiBQYXJrJyB9LFxyXG4gICAgICAgIHsgZGF0ZTogY3VycmVudE1vbnRoICsgJy0nICsgJzIzJywgdGl0bGU6ICdLaXR0ZW4gRGVtb25zdHJhdGlvbicsIGxvY2F0aW9uOiAnQ2VudGVyIGZvciBCZWF1dGlmdWwgQ2F0cycgfSxcclxuICAgICAgICB7IGRhdGU6IG5leHRNb250aCArICctJyArICcwNycsICAgIHRpdGxlOiAnU21hbGwgQ2F0IFBob3RvIFNlc3Npb24nLCBsb2NhdGlvbjogJ0NlbnRlciBmb3IgQ2F0IFBob3RvZ3JhcGh5JyB9XHJcbiAgICBdO1xyXG5cclxuICAgIHZhciBjbG5kciA9IHt9O1xyXG4gICAgY2xuZHIgPSAkKCcjZnVsbC1jbG5kcicpLmNsbmRyKHtcclxuICAgICAgICB0ZW1wbGF0ZTogJCgnI2Z1bGwtY2xuZHItdGVtcGxhdGUnKS5odG1sKCksXHJcbiAgICAgICAgZXZlbnRzOiBldmVudHMsXHJcbiAgICAgICAgY2xpY2tFdmVudHM6IHtcclxuICAgICAgICAgICAgY2xpY2s6IGZ1bmN0aW9uICh0YXJnZXQpIHtcclxuICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKCdDYWwtMSBjbGlja2VkOiAnLCB0YXJnZXQpO1xyXG4gICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICB0b2RheTogZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICAgICAgY29uc29sZS5sb2coJ0NhbC0xIHRvZGF5Jyk7XHJcbiAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgIG5leHRNb250aDogZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICAgICAgY29uc29sZS5sb2coJ0NhbC0xIG5leHQgbW9udGgnKTtcclxuICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgcHJldmlvdXNNb250aDogZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICAgICAgY29uc29sZS5sb2coJ0NhbC0xIHByZXZpb3VzIG1vbnRoJyk7XHJcbiAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgIG9uTW9udGhDaGFuZ2U6IGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKCdDYWwtMSBtb250aCBjaGFuZ2VkJyk7XHJcbiAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgIG5leHRZZWFyOiBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgICAgICBjb25zb2xlLmxvZygnQ2FsLTEgbmV4dCB5ZWFyJyk7XHJcbiAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgIHByZXZpb3VzWWVhcjogZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICAgICAgY29uc29sZS5sb2coJ0NhbC0xIHByZXZpb3VzIHllYXInKTtcclxuICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgb25ZZWFyQ2hhbmdlOiBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgICAgICBjb25zb2xlLmxvZygnQ2FsLTEgeWVhciBjaGFuZ2VkJyk7XHJcbiAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgIG5leHRJbnRlcnZhbDogZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICAgICAgY29uc29sZS5sb2coJ0NhbC0xIG5leHQgaW50ZXJ2YWwnKTtcclxuICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgcHJldmlvdXNJbnRlcnZhbDogZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICAgICAgY29uc29sZS5sb2coJ0NhbC0xIHByZXZpb3VzIGludGVydmFsJyk7XHJcbiAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgIG9uSW50ZXJ2YWxDaGFuZ2U6IGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKCdDYWwtMSBpbnRlcnZhbCBjaGFuZ2VkJyk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9LFxyXG4gICAgICAgIGZvcmNlU2l4Um93czogdHJ1ZSxcclxuICAgICAgICBtdWx0aURheUV2ZW50czoge1xyXG4gICAgICAgICAgICBzaW5nbGVEYXk6ICdkYXRlJyxcclxuICAgICAgICAgICAgZW5kRGF0ZTogJ2VuZERhdGUnLFxyXG4gICAgICAgICAgICBzdGFydERhdGU6ICdzdGFydERhdGUnXHJcbiAgICAgICAgfSxcclxuICAgICAgICBzaG93QWRqYWNlbnRNb250aHM6IHRydWUsXHJcbiAgICAgICAgYWRqYWNlbnREYXlzQ2hhbmdlTW9udGg6IGZhbHNlLFxyXG4gICAgICAgIGRheXNPZlRoZVdlZWs6IChmdW5jdGlvbigpe1xyXG4gICAgICAgICAgICB2YXIgcmVzdWx0ID0gW107XHJcbiAgICAgICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgNzsgaSsrKSB7XHJcbiAgICAgICAgICAgICAgICByZXN1bHQucHVzaChtb21lbnQoKS53ZWVrZGF5KGkpLmZvcm1hdCgnZGRkJykpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIHJldHVybiByZXN1bHQ7XHJcbiAgICAgICAgfSkoKVxyXG4gICAgfSk7XHJcblxyXG5cclxufSk7Il0sImZpbGUiOiJzY2hlZHVsZS5qcyIsInNvdXJjZVJvb3QiOiIvc291cmNlLyJ9
