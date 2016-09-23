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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiIiwic291cmNlcyI6WyJtb21lbnQtcnUuanMiXSwic291cmNlc0NvbnRlbnQiOlsiLy8hIG1vbWVudC5qcyBsb2NhbGUgY29uZmlndXJhdGlvblxyXG4vLyEgbG9jYWxlIDogRW5nbGlzaCAoVW5pdGVkIEtpbmdkb20pIFtlbi1nYl1cclxuLy8hIGF1dGhvciA6IENocmlzIEdlZHJpbSA6IGh0dHBzOi8vZ2l0aHViLmNvbS9jaHJpc2dlZHJpbVxyXG5cclxuOyhmdW5jdGlvbiAoZ2xvYmFsLCBmYWN0b3J5KSB7XHJcbiAgICB0eXBlb2YgZXhwb3J0cyA9PT0gJ29iamVjdCcgJiYgdHlwZW9mIG1vZHVsZSAhPT0gJ3VuZGVmaW5lZCdcclxuICAgICYmIHR5cGVvZiByZXF1aXJlID09PSAnZnVuY3Rpb24nID8gZmFjdG9yeShyZXF1aXJlKCcuLi9tb21lbnQnKSkgOlxyXG4gICAgICAgIHR5cGVvZiBkZWZpbmUgPT09ICdmdW5jdGlvbicgJiYgZGVmaW5lLmFtZCA/IGRlZmluZShbJy4uL21vbWVudCddLCBmYWN0b3J5KSA6XHJcbiAgICAgICAgICAgIGZhY3RvcnkoZ2xvYmFsLm1vbWVudClcclxufSh0aGlzLCBmdW5jdGlvbiAobW9tZW50KSB7ICd1c2Ugc3RyaWN0JztcclxuXHJcblxyXG4gICAgdmFyIHJ1ID0gbW9tZW50LmRlZmluZUxvY2FsZSgncnUnLCB7XHJcbiAgICAgICAgbW9udGhzIDogJ9Cv0L3QstCw0YDRjF/QpNC10LLRgNCw0LvRjF/QnNCw0YDRgl/QkNC/0YDQtdC70Yxf0JzQsNC5X9CY0Y7QvdGMX9CY0Y7Qu9GMX9CQ0LLQs9GD0YHRgl/QodC10L3RgtGP0LHRgNGMX9Ce0LrRgtGP0LHRgNGMX9Cd0L7Rj9Cx0YDRjF/QlNC10LrQsNCx0YDRjCcuc3BsaXQoJ18nKSxcclxuICAgICAgICBtb250aHNTaG9ydCA6ICfQr9C90LJf0KTQtdCyX9Cc0LDRgF/QkNC/0YBf0JzQsNC5X9CY0Y7QvV/QmNGO0Ltf0JDQstCzX9Ch0LXQvV/QntC60YJf0J3QvtGPX9CU0LXQuicuc3BsaXQoJ18nKSxcclxuICAgICAgICB3ZWVrZGF5cyA6ICfQktC+0YHQutGA0LXRgdC10L3RjNC1X9Cf0L7QvdC10LTQtdC70YzQvdC40Lpf0JLRgtC+0YDQvdC40Lpf0KHRgNC10LTQsF/Qp9C10YLQstC10YDQs1/Qn9GP0YLQvdC40YbQsF/QodGD0LHQsdC+0YLQsCcuc3BsaXQoJ18nKSxcclxuICAgICAgICB3ZWVrZGF5c1Nob3J0IDogJ9CS0YHQutGAX9Cf0L7QvV/QktGC0YBf0KHRgF/Qp9GC0LJf0J/Rgl/QodGD0LEnLnNwbGl0KCdfJyksXHJcbiAgICAgICAgd2Vla2RheXNNaW4gOiAn0JLRgV/Qn9C9X9CS0YJf0KHRgF/Qp9GCX9Cf0YJf0KHQsScuc3BsaXQoJ18nKSxcclxuICAgICAgICBsb25nRGF0ZUZvcm1hdCA6IHtcclxuICAgICAgICAgICAgTFQgOiAnSEg6bW0nLFxyXG4gICAgICAgICAgICBMVFMgOiAnSEg6bW06c3MnLFxyXG4gICAgICAgICAgICBMIDogJ0REL01NL1lZWVknLFxyXG4gICAgICAgICAgICBMTCA6ICdEIE1NTU0gWVlZWScsXHJcbiAgICAgICAgICAgIExMTCA6ICdEIE1NTU0gWVlZWSBISDptbScsXHJcbiAgICAgICAgICAgIExMTEwgOiAnZGRkZCwgRCBNTU1NIFlZWVkgSEg6bW0nXHJcbiAgICAgICAgfSxcclxuICAgICAgICBjYWxlbmRhciA6IHtcclxuICAgICAgICAgICAgc2FtZURheTogJ1vQodC10LPQvtC00L3RjyDQsl0gTFQnLFxyXG4gICAgICAgICAgICBuZXh0RGF5OiAnW9CX0LDQstGC0YDQsCDQsl0gTFQnLFxyXG4gICAgICAgICAgICBsYXN0RGF5OiAnW9CS0YfQtdGA0LAg0LJdIExUJyxcclxuICAgICAgICAgICAgbmV4dFdlZWs6IGZ1bmN0aW9uIChub3cpIHtcclxuICAgICAgICAgICAgICAgIGlmIChub3cud2VlaygpICE9PSB0aGlzLndlZWsoKSkge1xyXG4gICAgICAgICAgICAgICAgICAgIHN3aXRjaCAodGhpcy5kYXkoKSkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBjYXNlIDA6XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gJ1vQkiDRgdC70LXQtNGD0Y7RidC10LVdIGRkZGQgW9CyXSBMVCc7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGNhc2UgMTpcclxuICAgICAgICAgICAgICAgICAgICAgICAgY2FzZSAyOlxyXG4gICAgICAgICAgICAgICAgICAgICAgICBjYXNlIDQ6XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gJ1vQkiDRgdC70LXQtNGD0Y7RidC40LldIGRkZGQgW9CyXSBMVCc7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGNhc2UgMzpcclxuICAgICAgICAgICAgICAgICAgICAgICAgY2FzZSA1OlxyXG4gICAgICAgICAgICAgICAgICAgICAgICBjYXNlIDY6XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gJ1vQkiDRgdC70LXQtNGD0Y7RidGD0Y5dIGRkZGQgW9CyXSBMVCc7XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgICAgICBpZiAodGhpcy5kYXkoKSA9PT0gMikge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gJ1vQktC+XSBkZGRkIFvQsl0gTFQnO1xyXG4gICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiAnW9CSXSBkZGRkIFvQsl0gTFQnO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgbGFzdFdlZWs6IGZ1bmN0aW9uIChub3cpIHtcclxuICAgICAgICAgICAgICAgIGlmIChub3cud2VlaygpICE9PSB0aGlzLndlZWsoKSkge1xyXG4gICAgICAgICAgICAgICAgICAgIHN3aXRjaCAodGhpcy5kYXkoKSkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBjYXNlIDA6XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gJ1vQkiDQv9GA0L7RiNC70L7QtV0gZGRkZCBb0LJdIExUJztcclxuICAgICAgICAgICAgICAgICAgICAgICAgY2FzZSAxOlxyXG4gICAgICAgICAgICAgICAgICAgICAgICBjYXNlIDI6XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGNhc2UgNDpcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiAnW9CSINC/0YDQvtGI0LvRi9C5XSBkZGRkIFvQsl0gTFQnO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBjYXNlIDM6XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGNhc2UgNTpcclxuICAgICAgICAgICAgICAgICAgICAgICAgY2FzZSA2OlxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuICdb0JIg0L/RgNC+0YjQu9GD0Y5dIGRkZGQgW9CyXSBMVCc7XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgICAgICBpZiAodGhpcy5kYXkoKSA9PT0gMikge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gJ1vQktC+XSBkZGRkIFvQsl0gTFQnO1xyXG4gICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiAnW9CSXSBkZGRkIFvQsl0gTFQnO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgc2FtZUVsc2U6ICdMJ1xyXG4gICAgICAgIH0sXHJcbiAgICAgICAgcmVsYXRpdmVUaW1lIDoge1xyXG4gICAgICAgICAgICBmdXR1cmUgOiAnaW4gJXMnLFxyXG4gICAgICAgICAgICBwYXN0IDogJyVzIGFnbycsXHJcbiAgICAgICAgICAgIHMgOiAnYSBmZXcgc2Vjb25kcycsXHJcbiAgICAgICAgICAgIG0gOiAnYSBtaW51dGUnLFxyXG4gICAgICAgICAgICBtbSA6ICclZCBtaW51dGVzJyxcclxuICAgICAgICAgICAgaCA6ICdhbiBob3VyJyxcclxuICAgICAgICAgICAgaGggOiAnJWQgaG91cnMnLFxyXG4gICAgICAgICAgICBkIDogJ2EgZGF5JyxcclxuICAgICAgICAgICAgZGQgOiAnJWQgZGF5cycsXHJcbiAgICAgICAgICAgIE0gOiAnYSBtb250aCcsXHJcbiAgICAgICAgICAgIE1NIDogJyVkIG1vbnRocycsXHJcbiAgICAgICAgICAgIHkgOiAnYSB5ZWFyJyxcclxuICAgICAgICAgICAgeXkgOiAnJWQgeWVhcnMnXHJcbiAgICAgICAgfSxcclxuICAgICAgICBvcmRpbmFsUGFyc2U6IC9cXGR7MSwyfS0o0Ll80LPQvnzRjykvLFxyXG4gICAgICAgIG9yZGluYWw6IGZ1bmN0aW9uIChudW1iZXIsIHBlcmlvZCkge1xyXG4gICAgICAgICAgICBzd2l0Y2ggKHBlcmlvZCkge1xyXG4gICAgICAgICAgICAgICAgY2FzZSAnTSc6XHJcbiAgICAgICAgICAgICAgICBjYXNlICdkJzpcclxuICAgICAgICAgICAgICAgIGNhc2UgJ0RERCc6XHJcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIG51bWJlciArICct0LknO1xyXG4gICAgICAgICAgICAgICAgY2FzZSAnRCc6XHJcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIG51bWJlciArICct0LPQvic7XHJcbiAgICAgICAgICAgICAgICBjYXNlICd3JzpcclxuICAgICAgICAgICAgICAgIGNhc2UgJ1cnOlxyXG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBudW1iZXIgKyAnLdGPJztcclxuICAgICAgICAgICAgICAgIGRlZmF1bHQ6XHJcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIG51bWJlcjtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH0sXHJcbiAgICAgICAgd2VlayA6IHtcclxuICAgICAgICAgICAgZG93IDogMSwgLy8gTW9uZGF5IGlzIHRoZSBmaXJzdCBkYXkgb2YgdGhlIHdlZWsuXHJcbiAgICAgICAgICAgIGRveSA6IDcgIC8vIFRoZSB3ZWVrIHRoYXQgY29udGFpbnMgSmFuIDR0aCBpcyB0aGUgZmlyc3Qgd2VlayBvZiB0aGUgeWVhci5cclxuICAgICAgICB9XHJcbiAgICB9KTtcclxuXHJcbiAgICByZXR1cm4gcnU7XHJcblxyXG59KSk7Il0sImZpbGUiOiJtb21lbnQtcnUuanMiLCJzb3VyY2VSb290IjoiL3NvdXJjZS8ifQ==
