//! moment.js locale configuration
//! locale : English (United Kingdom) [en-gb]
//! author : Chris Gedrim : https://github.com/chrisgedrim

;(function (global, factory) {
    typeof exports === 'object' && typeof module !== 'undefined'
    && typeof require === 'function' ? factory(require('../moment')) :
        typeof define === 'function' && define.amd ? define(['../moment'], factory) :
            factory(global.moment)
}(this, function (moment) { 'use strict';


    var ru = moment.defineLocale('ru', {
        months : 'Январь_Февраль_Март_Апрель_Май_Июнь_Июль_Август_Сентябрь_Октябрь_Ноябрь_Декабрь'.split('_'),
        monthsShort : 'Янв_Фев_Мар_Апр_Май_Июн_Июл_Авг_Сен_Окт_Ноя_Дек'.split('_'),
        weekdays : 'Воскресенье_Понедельник_Вторник_Среда_Четверг_Пятница_Суббота'.split('_'),
        weekdaysShort : 'Вскр_Пон_Втр_Ср_Чтв_Пт_Суб'.split('_'),
        weekdaysMin : 'Вс_Пн_Вт_Ср_Чт_Пт_Сб'.split('_'),
        longDateFormat : {
            LT : 'HH:mm',
            LTS : 'HH:mm:ss',
            L : 'DD/MM/YYYY',
            LL : 'D MMMM YYYY',
            LLL : 'D MMMM YYYY HH:mm',
            LLLL : 'dddd, D MMMM YYYY HH:mm'
        },
        calendar : {
            sameDay: '[Сегодня в] LT',
            nextDay: '[Завтра в] LT',
            lastDay: '[Вчера в] LT',
            nextWeek: function (now) {
                if (now.week() !== this.week()) {
                    switch (this.day()) {
                        case 0:
                            return '[В следующее] dddd [в] LT';
                        case 1:
                        case 2:
                        case 4:
                            return '[В следующий] dddd [в] LT';
                        case 3:
                        case 5:
                        case 6:
                            return '[В следующую] dddd [в] LT';
                    }
                } else {
                    if (this.day() === 2) {
                        return '[Во] dddd [в] LT';
                    } else {
                        return '[В] dddd [в] LT';
                    }
                }
            },
            lastWeek: function (now) {
                if (now.week() !== this.week()) {
                    switch (this.day()) {
                        case 0:
                            return '[В прошлое] dddd [в] LT';
                        case 1:
                        case 2:
                        case 4:
                            return '[В прошлый] dddd [в] LT';
                        case 3:
                        case 5:
                        case 6:
                            return '[В прошлую] dddd [в] LT';
                    }
                } else {
                    if (this.day() === 2) {
                        return '[Во] dddd [в] LT';
                    } else {
                        return '[В] dddd [в] LT';
                    }
                }
            },
            sameElse: 'L'
        },
        relativeTime : {
            future : 'in %s',
            past : '%s ago',
            s : 'a few seconds',
            m : 'a minute',
            mm : '%d minutes',
            h : 'an hour',
            hh : '%d hours',
            d : 'a day',
            dd : '%d days',
            M : 'a month',
            MM : '%d months',
            y : 'a year',
            yy : '%d years'
        },
        ordinalParse: /\d{1,2}-(й|го|я)/,
        ordinal: function (number, period) {
            switch (period) {
                case 'M':
                case 'd':
                case 'DDD':
                    return number + '-й';
                case 'D':
                    return number + '-го';
                case 'w':
                case 'W':
                    return number + '-я';
                default:
                    return number;
            }
        },
        week : {
            dow : 1, // Monday is the first day of the week.
            doy : 7  // The week that contains Jan 4th is the first week of the year.
        }
    });

    return ru;

}));
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiIiwic291cmNlcyI6WyJkYXNoYm9hcmQvbW9tZW50LXJ1LmpzIl0sInNvdXJjZXNDb250ZW50IjpbIi8vISBtb21lbnQuanMgbG9jYWxlIGNvbmZpZ3VyYXRpb25cclxuLy8hIGxvY2FsZSA6IEVuZ2xpc2ggKFVuaXRlZCBLaW5nZG9tKSBbZW4tZ2JdXHJcbi8vISBhdXRob3IgOiBDaHJpcyBHZWRyaW0gOiBodHRwczovL2dpdGh1Yi5jb20vY2hyaXNnZWRyaW1cclxuXHJcbjsoZnVuY3Rpb24gKGdsb2JhbCwgZmFjdG9yeSkge1xyXG4gICAgdHlwZW9mIGV4cG9ydHMgPT09ICdvYmplY3QnICYmIHR5cGVvZiBtb2R1bGUgIT09ICd1bmRlZmluZWQnXHJcbiAgICAmJiB0eXBlb2YgcmVxdWlyZSA9PT0gJ2Z1bmN0aW9uJyA/IGZhY3RvcnkocmVxdWlyZSgnLi4vbW9tZW50JykpIDpcclxuICAgICAgICB0eXBlb2YgZGVmaW5lID09PSAnZnVuY3Rpb24nICYmIGRlZmluZS5hbWQgPyBkZWZpbmUoWycuLi9tb21lbnQnXSwgZmFjdG9yeSkgOlxyXG4gICAgICAgICAgICBmYWN0b3J5KGdsb2JhbC5tb21lbnQpXHJcbn0odGhpcywgZnVuY3Rpb24gKG1vbWVudCkgeyAndXNlIHN0cmljdCc7XHJcblxyXG5cclxuICAgIHZhciBydSA9IG1vbWVudC5kZWZpbmVMb2NhbGUoJ3J1Jywge1xyXG4gICAgICAgIG1vbnRocyA6ICfQr9C90LLQsNGA0Yxf0KTQtdCy0YDQsNC70Yxf0JzQsNGA0YJf0JDQv9GA0LXQu9GMX9Cc0LDQuV/QmNGO0L3RjF/QmNGO0LvRjF/QkNCy0LPRg9GB0YJf0KHQtdC90YLRj9Cx0YDRjF/QntC60YLRj9Cx0YDRjF/QndC+0Y/QsdGA0Yxf0JTQtdC60LDQsdGA0YwnLnNwbGl0KCdfJyksXHJcbiAgICAgICAgbW9udGhzU2hvcnQgOiAn0K/QvdCyX9Ck0LXQsl/QnNCw0YBf0JDQv9GAX9Cc0LDQuV/QmNGO0L1f0JjRjtC7X9CQ0LLQs1/QodC10L1f0J7QutGCX9Cd0L7Rj1/QlNC10LonLnNwbGl0KCdfJyksXHJcbiAgICAgICAgd2Vla2RheXMgOiAn0JLQvtGB0LrRgNC10YHQtdC90YzQtV/Qn9C+0L3QtdC00LXQu9GM0L3QuNC6X9CS0YLQvtGA0L3QuNC6X9Ch0YDQtdC00LBf0KfQtdGC0LLQtdGA0LNf0J/Rj9GC0L3QuNGG0LBf0KHRg9Cx0LHQvtGC0LAnLnNwbGl0KCdfJyksXHJcbiAgICAgICAgd2Vla2RheXNTaG9ydCA6ICfQktGB0LrRgF/Qn9C+0L1f0JLRgtGAX9Ch0YBf0KfRgtCyX9Cf0YJf0KHRg9CxJy5zcGxpdCgnXycpLFxyXG4gICAgICAgIHdlZWtkYXlzTWluIDogJ9CS0YFf0J/QvV/QktGCX9Ch0YBf0KfRgl/Qn9GCX9Ch0LEnLnNwbGl0KCdfJyksXHJcbiAgICAgICAgbG9uZ0RhdGVGb3JtYXQgOiB7XHJcbiAgICAgICAgICAgIExUIDogJ0hIOm1tJyxcclxuICAgICAgICAgICAgTFRTIDogJ0hIOm1tOnNzJyxcclxuICAgICAgICAgICAgTCA6ICdERC9NTS9ZWVlZJyxcclxuICAgICAgICAgICAgTEwgOiAnRCBNTU1NIFlZWVknLFxyXG4gICAgICAgICAgICBMTEwgOiAnRCBNTU1NIFlZWVkgSEg6bW0nLFxyXG4gICAgICAgICAgICBMTExMIDogJ2RkZGQsIEQgTU1NTSBZWVlZIEhIOm1tJ1xyXG4gICAgICAgIH0sXHJcbiAgICAgICAgY2FsZW5kYXIgOiB7XHJcbiAgICAgICAgICAgIHNhbWVEYXk6ICdb0KHQtdCz0L7QtNC90Y8g0LJdIExUJyxcclxuICAgICAgICAgICAgbmV4dERheTogJ1vQl9Cw0LLRgtGA0LAg0LJdIExUJyxcclxuICAgICAgICAgICAgbGFzdERheTogJ1vQktGH0LXRgNCwINCyXSBMVCcsXHJcbiAgICAgICAgICAgIG5leHRXZWVrOiBmdW5jdGlvbiAobm93KSB7XHJcbiAgICAgICAgICAgICAgICBpZiAobm93LndlZWsoKSAhPT0gdGhpcy53ZWVrKCkpIHtcclxuICAgICAgICAgICAgICAgICAgICBzd2l0Y2ggKHRoaXMuZGF5KCkpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgY2FzZSAwOlxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuICdb0JIg0YHQu9C10LTRg9GO0YnQtdC1XSBkZGRkIFvQsl0gTFQnO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBjYXNlIDE6XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGNhc2UgMjpcclxuICAgICAgICAgICAgICAgICAgICAgICAgY2FzZSA0OlxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuICdb0JIg0YHQu9C10LTRg9GO0YnQuNC5XSBkZGRkIFvQsl0gTFQnO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBjYXNlIDM6XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGNhc2UgNTpcclxuICAgICAgICAgICAgICAgICAgICAgICAgY2FzZSA2OlxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuICdb0JIg0YHQu9C10LTRg9GO0YnRg9GOXSBkZGRkIFvQsl0gTFQnO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKHRoaXMuZGF5KCkgPT09IDIpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuICdb0JLQvl0gZGRkZCBb0LJdIExUJztcclxuICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gJ1vQkl0gZGRkZCBb0LJdIExUJztcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgIGxhc3RXZWVrOiBmdW5jdGlvbiAobm93KSB7XHJcbiAgICAgICAgICAgICAgICBpZiAobm93LndlZWsoKSAhPT0gdGhpcy53ZWVrKCkpIHtcclxuICAgICAgICAgICAgICAgICAgICBzd2l0Y2ggKHRoaXMuZGF5KCkpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgY2FzZSAwOlxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuICdb0JIg0L/RgNC+0YjQu9C+0LVdIGRkZGQgW9CyXSBMVCc7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGNhc2UgMTpcclxuICAgICAgICAgICAgICAgICAgICAgICAgY2FzZSAyOlxyXG4gICAgICAgICAgICAgICAgICAgICAgICBjYXNlIDQ6XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gJ1vQkiDQv9GA0L7RiNC70YvQuV0gZGRkZCBb0LJdIExUJztcclxuICAgICAgICAgICAgICAgICAgICAgICAgY2FzZSAzOlxyXG4gICAgICAgICAgICAgICAgICAgICAgICBjYXNlIDU6XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGNhc2UgNjpcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiAnW9CSINC/0YDQvtGI0LvRg9GOXSBkZGRkIFvQsl0gTFQnO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKHRoaXMuZGF5KCkgPT09IDIpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuICdb0JLQvl0gZGRkZCBb0LJdIExUJztcclxuICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gJ1vQkl0gZGRkZCBb0LJdIExUJztcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgIHNhbWVFbHNlOiAnTCdcclxuICAgICAgICB9LFxyXG4gICAgICAgIHJlbGF0aXZlVGltZSA6IHtcclxuICAgICAgICAgICAgZnV0dXJlIDogJ2luICVzJyxcclxuICAgICAgICAgICAgcGFzdCA6ICclcyBhZ28nLFxyXG4gICAgICAgICAgICBzIDogJ2EgZmV3IHNlY29uZHMnLFxyXG4gICAgICAgICAgICBtIDogJ2EgbWludXRlJyxcclxuICAgICAgICAgICAgbW0gOiAnJWQgbWludXRlcycsXHJcbiAgICAgICAgICAgIGggOiAnYW4gaG91cicsXHJcbiAgICAgICAgICAgIGhoIDogJyVkIGhvdXJzJyxcclxuICAgICAgICAgICAgZCA6ICdhIGRheScsXHJcbiAgICAgICAgICAgIGRkIDogJyVkIGRheXMnLFxyXG4gICAgICAgICAgICBNIDogJ2EgbW9udGgnLFxyXG4gICAgICAgICAgICBNTSA6ICclZCBtb250aHMnLFxyXG4gICAgICAgICAgICB5IDogJ2EgeWVhcicsXHJcbiAgICAgICAgICAgIHl5IDogJyVkIHllYXJzJ1xyXG4gICAgICAgIH0sXHJcbiAgICAgICAgb3JkaW5hbFBhcnNlOiAvXFxkezEsMn0tKNC5fNCz0L580Y8pLyxcclxuICAgICAgICBvcmRpbmFsOiBmdW5jdGlvbiAobnVtYmVyLCBwZXJpb2QpIHtcclxuICAgICAgICAgICAgc3dpdGNoIChwZXJpb2QpIHtcclxuICAgICAgICAgICAgICAgIGNhc2UgJ00nOlxyXG4gICAgICAgICAgICAgICAgY2FzZSAnZCc6XHJcbiAgICAgICAgICAgICAgICBjYXNlICdEREQnOlxyXG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBudW1iZXIgKyAnLdC5JztcclxuICAgICAgICAgICAgICAgIGNhc2UgJ0QnOlxyXG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBudW1iZXIgKyAnLdCz0L4nO1xyXG4gICAgICAgICAgICAgICAgY2FzZSAndyc6XHJcbiAgICAgICAgICAgICAgICBjYXNlICdXJzpcclxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gbnVtYmVyICsgJy3Rjyc7XHJcbiAgICAgICAgICAgICAgICBkZWZhdWx0OlxyXG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBudW1iZXI7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9LFxyXG4gICAgICAgIHdlZWsgOiB7XHJcbiAgICAgICAgICAgIGRvdyA6IDEsIC8vIE1vbmRheSBpcyB0aGUgZmlyc3QgZGF5IG9mIHRoZSB3ZWVrLlxyXG4gICAgICAgICAgICBkb3kgOiA3ICAvLyBUaGUgd2VlayB0aGF0IGNvbnRhaW5zIEphbiA0dGggaXMgdGhlIGZpcnN0IHdlZWsgb2YgdGhlIHllYXIuXHJcbiAgICAgICAgfVxyXG4gICAgfSk7XHJcblxyXG4gICAgcmV0dXJuIHJ1O1xyXG5cclxufSkpOyJdLCJmaWxlIjoiZGFzaGJvYXJkL21vbWVudC1ydS5qcyIsInNvdXJjZVJvb3QiOiIvc291cmNlLyJ9
