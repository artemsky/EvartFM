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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiIiwic291cmNlcyI6WyJkYXNoYm9hcmQvbW9tZW50LXJ1LmpzIl0sInNvdXJjZXNDb250ZW50IjpbIi8vISBtb21lbnQuanMgbG9jYWxlIGNvbmZpZ3VyYXRpb25cbi8vISBsb2NhbGUgOiBFbmdsaXNoIChVbml0ZWQgS2luZ2RvbSkgW2VuLWdiXVxuLy8hIGF1dGhvciA6IENocmlzIEdlZHJpbSA6IGh0dHBzOi8vZ2l0aHViLmNvbS9jaHJpc2dlZHJpbVxuXG47KGZ1bmN0aW9uIChnbG9iYWwsIGZhY3RvcnkpIHtcbiAgICB0eXBlb2YgZXhwb3J0cyA9PT0gJ29iamVjdCcgJiYgdHlwZW9mIG1vZHVsZSAhPT0gJ3VuZGVmaW5lZCdcbiAgICAmJiB0eXBlb2YgcmVxdWlyZSA9PT0gJ2Z1bmN0aW9uJyA/IGZhY3RvcnkocmVxdWlyZSgnLi4vbW9tZW50JykpIDpcbiAgICAgICAgdHlwZW9mIGRlZmluZSA9PT0gJ2Z1bmN0aW9uJyAmJiBkZWZpbmUuYW1kID8gZGVmaW5lKFsnLi4vbW9tZW50J10sIGZhY3RvcnkpIDpcbiAgICAgICAgICAgIGZhY3RvcnkoZ2xvYmFsLm1vbWVudClcbn0odGhpcywgZnVuY3Rpb24gKG1vbWVudCkgeyAndXNlIHN0cmljdCc7XG5cblxuICAgIHZhciBydSA9IG1vbWVudC5kZWZpbmVMb2NhbGUoJ3J1Jywge1xuICAgICAgICBtb250aHMgOiAn0K/QvdCy0LDRgNGMX9Ck0LXQstGA0LDQu9GMX9Cc0LDRgNGCX9CQ0L/RgNC10LvRjF/QnNCw0Llf0JjRjtC90Yxf0JjRjtC70Yxf0JDQstCz0YPRgdGCX9Ch0LXQvdGC0Y/QsdGA0Yxf0J7QutGC0Y/QsdGA0Yxf0J3QvtGP0LHRgNGMX9CU0LXQutCw0LHRgNGMJy5zcGxpdCgnXycpLFxuICAgICAgICBtb250aHNTaG9ydCA6ICfQr9C90LJf0KTQtdCyX9Cc0LDRgF/QkNC/0YBf0JzQsNC5X9CY0Y7QvV/QmNGO0Ltf0JDQstCzX9Ch0LXQvV/QntC60YJf0J3QvtGPX9CU0LXQuicuc3BsaXQoJ18nKSxcbiAgICAgICAgd2Vla2RheXMgOiAn0JLQvtGB0LrRgNC10YHQtdC90YzQtV/Qn9C+0L3QtdC00LXQu9GM0L3QuNC6X9CS0YLQvtGA0L3QuNC6X9Ch0YDQtdC00LBf0KfQtdGC0LLQtdGA0LNf0J/Rj9GC0L3QuNGG0LBf0KHRg9Cx0LHQvtGC0LAnLnNwbGl0KCdfJyksXG4gICAgICAgIHdlZWtkYXlzU2hvcnQgOiAn0JLRgdC60YBf0J/QvtC9X9CS0YLRgF/QodGAX9Cn0YLQsl/Qn9GCX9Ch0YPQsScuc3BsaXQoJ18nKSxcbiAgICAgICAgd2Vla2RheXNNaW4gOiAn0JLRgV/Qn9C9X9CS0YJf0KHRgF/Qp9GCX9Cf0YJf0KHQsScuc3BsaXQoJ18nKSxcbiAgICAgICAgbG9uZ0RhdGVGb3JtYXQgOiB7XG4gICAgICAgICAgICBMVCA6ICdISDptbScsXG4gICAgICAgICAgICBMVFMgOiAnSEg6bW06c3MnLFxuICAgICAgICAgICAgTCA6ICdERC9NTS9ZWVlZJyxcbiAgICAgICAgICAgIExMIDogJ0QgTU1NTSBZWVlZJyxcbiAgICAgICAgICAgIExMTCA6ICdEIE1NTU0gWVlZWSBISDptbScsXG4gICAgICAgICAgICBMTExMIDogJ2RkZGQsIEQgTU1NTSBZWVlZIEhIOm1tJ1xuICAgICAgICB9LFxuICAgICAgICBjYWxlbmRhciA6IHtcbiAgICAgICAgICAgIHNhbWVEYXk6ICdb0KHQtdCz0L7QtNC90Y8g0LJdIExUJyxcbiAgICAgICAgICAgIG5leHREYXk6ICdb0JfQsNCy0YLRgNCwINCyXSBMVCcsXG4gICAgICAgICAgICBsYXN0RGF5OiAnW9CS0YfQtdGA0LAg0LJdIExUJyxcbiAgICAgICAgICAgIG5leHRXZWVrOiBmdW5jdGlvbiAobm93KSB7XG4gICAgICAgICAgICAgICAgaWYgKG5vdy53ZWVrKCkgIT09IHRoaXMud2VlaygpKSB7XG4gICAgICAgICAgICAgICAgICAgIHN3aXRjaCAodGhpcy5kYXkoKSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgY2FzZSAwOlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiAnW9CSINGB0LvQtdC00YPRjtGJ0LXQtV0gZGRkZCBb0LJdIExUJztcbiAgICAgICAgICAgICAgICAgICAgICAgIGNhc2UgMTpcbiAgICAgICAgICAgICAgICAgICAgICAgIGNhc2UgMjpcbiAgICAgICAgICAgICAgICAgICAgICAgIGNhc2UgNDpcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gJ1vQkiDRgdC70LXQtNGD0Y7RidC40LldIGRkZGQgW9CyXSBMVCc7XG4gICAgICAgICAgICAgICAgICAgICAgICBjYXNlIDM6XG4gICAgICAgICAgICAgICAgICAgICAgICBjYXNlIDU6XG4gICAgICAgICAgICAgICAgICAgICAgICBjYXNlIDY6XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuICdb0JIg0YHQu9C10LTRg9GO0YnRg9GOXSBkZGRkIFvQsl0gTFQnO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgaWYgKHRoaXMuZGF5KCkgPT09IDIpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiAnW9CS0L5dIGRkZGQgW9CyXSBMVCc7XG4gICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gJ1vQkl0gZGRkZCBb0LJdIExUJztcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICBsYXN0V2VlazogZnVuY3Rpb24gKG5vdykge1xuICAgICAgICAgICAgICAgIGlmIChub3cud2VlaygpICE9PSB0aGlzLndlZWsoKSkge1xuICAgICAgICAgICAgICAgICAgICBzd2l0Y2ggKHRoaXMuZGF5KCkpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGNhc2UgMDpcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gJ1vQkiDQv9GA0L7RiNC70L7QtV0gZGRkZCBb0LJdIExUJztcbiAgICAgICAgICAgICAgICAgICAgICAgIGNhc2UgMTpcbiAgICAgICAgICAgICAgICAgICAgICAgIGNhc2UgMjpcbiAgICAgICAgICAgICAgICAgICAgICAgIGNhc2UgNDpcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gJ1vQkiDQv9GA0L7RiNC70YvQuV0gZGRkZCBb0LJdIExUJztcbiAgICAgICAgICAgICAgICAgICAgICAgIGNhc2UgMzpcbiAgICAgICAgICAgICAgICAgICAgICAgIGNhc2UgNTpcbiAgICAgICAgICAgICAgICAgICAgICAgIGNhc2UgNjpcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gJ1vQkiDQv9GA0L7RiNC70YPRjl0gZGRkZCBb0LJdIExUJztcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIGlmICh0aGlzLmRheSgpID09PSAyKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gJ1vQktC+XSBkZGRkIFvQsl0gTFQnO1xuICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuICdb0JJdIGRkZGQgW9CyXSBMVCc7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgc2FtZUVsc2U6ICdMJ1xuICAgICAgICB9LFxuICAgICAgICByZWxhdGl2ZVRpbWUgOiB7XG4gICAgICAgICAgICBmdXR1cmUgOiAnaW4gJXMnLFxuICAgICAgICAgICAgcGFzdCA6ICclcyBhZ28nLFxuICAgICAgICAgICAgcyA6ICdhIGZldyBzZWNvbmRzJyxcbiAgICAgICAgICAgIG0gOiAnYSBtaW51dGUnLFxuICAgICAgICAgICAgbW0gOiAnJWQgbWludXRlcycsXG4gICAgICAgICAgICBoIDogJ2FuIGhvdXInLFxuICAgICAgICAgICAgaGggOiAnJWQgaG91cnMnLFxuICAgICAgICAgICAgZCA6ICdhIGRheScsXG4gICAgICAgICAgICBkZCA6ICclZCBkYXlzJyxcbiAgICAgICAgICAgIE0gOiAnYSBtb250aCcsXG4gICAgICAgICAgICBNTSA6ICclZCBtb250aHMnLFxuICAgICAgICAgICAgeSA6ICdhIHllYXInLFxuICAgICAgICAgICAgeXkgOiAnJWQgeWVhcnMnXG4gICAgICAgIH0sXG4gICAgICAgIG9yZGluYWxQYXJzZTogL1xcZHsxLDJ9LSjQuXzQs9C+fNGPKS8sXG4gICAgICAgIG9yZGluYWw6IGZ1bmN0aW9uIChudW1iZXIsIHBlcmlvZCkge1xuICAgICAgICAgICAgc3dpdGNoIChwZXJpb2QpIHtcbiAgICAgICAgICAgICAgICBjYXNlICdNJzpcbiAgICAgICAgICAgICAgICBjYXNlICdkJzpcbiAgICAgICAgICAgICAgICBjYXNlICdEREQnOlxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gbnVtYmVyICsgJy3QuSc7XG4gICAgICAgICAgICAgICAgY2FzZSAnRCc6XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBudW1iZXIgKyAnLdCz0L4nO1xuICAgICAgICAgICAgICAgIGNhc2UgJ3cnOlxuICAgICAgICAgICAgICAgIGNhc2UgJ1cnOlxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gbnVtYmVyICsgJy3Rjyc7XG4gICAgICAgICAgICAgICAgZGVmYXVsdDpcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIG51bWJlcjtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSxcbiAgICAgICAgd2VlayA6IHtcbiAgICAgICAgICAgIGRvdyA6IDEsIC8vIE1vbmRheSBpcyB0aGUgZmlyc3QgZGF5IG9mIHRoZSB3ZWVrLlxuICAgICAgICAgICAgZG95IDogNyAgLy8gVGhlIHdlZWsgdGhhdCBjb250YWlucyBKYW4gNHRoIGlzIHRoZSBmaXJzdCB3ZWVrIG9mIHRoZSB5ZWFyLlxuICAgICAgICB9XG4gICAgfSk7XG5cbiAgICByZXR1cm4gcnU7XG5cbn0pKTsiXSwiZmlsZSI6ImRhc2hib2FyZC9tb21lbnQtcnUuanMiLCJzb3VyY2VSb290IjoiL3NvdXJjZS8ifQ==
