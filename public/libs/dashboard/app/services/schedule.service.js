"use strict";
var $ = require('jquery');
var Scheduler;
(function (Scheduler) {
    var DateHelper = (function () {
        function DateHelper(dateOrYear, month, day, hour, minute) {
            if (arguments.length === 0)
                this.date = new Date();
            else if (typeof dateOrYear === "string") {
                this.date = new Date(dateOrYear);
            }
            else if (typeof dateOrYear === "object") {
                var date = dateOrYear;
                this.date = new Date(date.getFullYear(), date.getMonth(), date.getDate(), date.getHours(), date.getMinutes());
            }
            else {
                this.date = new Date(arguments);
            }
        }
        DateHelper.prototype.toString = function () {
            return this.getYear() + "-" + this.getMonth() + "-" + this.getDay();
        };
        DateHelper.prototype.getTime = function () {
            return {
                hour: this.date.getHours(),
                minute: this.date.getMinutes()
            };
        };
        DateHelper.prototype.getDate = function () {
            return {
                day: this.getDay(),
                month: this.getMonth(),
                year: this.getYear(),
                time: this.getTime()
            };
        };
        DateHelper.prototype.getYear = function () {
            return this.date.getFullYear();
        };
        DateHelper.prototype.getMonth = function () {
            return this.date.getMonth();
        };
        DateHelper.prototype.getDay = function () {
            return this.date.getDate();
        };
        DateHelper.prototype.setDay = function (day) {
            this.date.setDate(day);
        };
        DateHelper.prototype.setMonth = function (day) {
            this.date.setMonth(day);
            this.setDay(1);
        };
        DateHelper.prototype.setYear = function (day) {
            this.date.setFullYear(day);
            this.setMonth(0);
        };
        DateHelper.prototype.daysInMonth = function () {
            return new Date(this.getYear(), this.getMonth(), 0).getDate();
        };
        return DateHelper;
    }());
    var DateType;
    (function (DateType) {
        DateType[DateType["Day"] = 0] = "Day";
        DateType[DateType["Month"] = 1] = "Month";
        DateType[DateType["Year"] = 2] = "Year";
    })(DateType || (DateType = {}));
    var Schedule = (function () {
        function Schedule(target, events, options) {
            if (options === void 0) { options = {}; }
            this.options = this.initOptions(options);
            this.events = events;
            this.parseEvents();
            this.target = target;
            this.initEvents();
            this.build();
            this.selectToday();
        }
        Schedule.prototype.initOptions = function (options) {
            var defaultOptions = {
                startDate: new DateHelper(),
                classes: {
                    day: 'day',
                    daySelected: 'active',
                    month: 'month',
                    monthSelected: 'active',
                    year: 'year',
                    yearSelected: 'active',
                    event: 'event'
                },
                events: {
                    onDaySelect: function () { },
                    onEventsLoad: function () { },
                    onMonthSelect: function () { },
                    onYearSelect: function () { },
                },
                template: {
                    events: {
                        wrap: undefined,
                        builder: undefined
                    }
                }
            };
            var loop = function (defaultObject, passedObject) {
                var newObject = defaultObject;
                var keys = Object.keys(passedObject);
                for (var i = keys.length; i--;) {
                    if (typeof passedObject[keys[i]] === "object" && !(passedObject[keys[i]] instanceof Array)) {
                        newObject[keys[i]] = loop(defaultObject[keys[i]], passedObject[keys[i]]);
                    }
                    else {
                        newObject[keys[i]] = passedObject[keys[i]];
                    }
                }
                return newObject;
            };
            return loop(defaultOptions, options);
        };
        Schedule.prototype.initEvents = function () {
            var _this = this;
            this.previousSelectedYear = undefined;
            this.previousSelectedMonth = undefined;
            this.previousSelectedDay = undefined;
            this.target.on('click', '.' + this.options.classes.year, function (e) {
                _this.onClickYear($(e.target));
            });
            this.target.on('click', '.' + this.options.classes.month, function (e) {
                _this.onClickMonth($(e.target));
            });
            this.target.on('click', '.' + this.options.classes.day, function (e) {
                _this.onClickDay($(e.target));
            });
        };
        Schedule.prototype.parseCount = function (month, year) {
            var arr = Array.apply(null, Array(this.options.startDate.daysInMonth())).map(Number.prototype.valueOf, 0);
            this.eventsHelper.forEach(function (value) {
                if (value.date.year === year && value.date.month === month)
                    arr[value.date.day - 1]++;
            });
            return arr;
        };
        Schedule.prototype.parseEvents = function () {
            var _this = this;
            this.eventsHelper = [];
            this.events.forEach(function (event, i) {
                var eventDate = new DateHelper(event.date);
                _this.eventsHelper.push({
                    link: _this.events.slice(i, i + 1),
                    date: eventDate.getDate()
                });
            });
        };
        Schedule.prototype.build = function () {
            this.targetYears = $('<div class="calendarYears"></div>');
            this.targetMonths = $('<div class="calendarMonths"></div>');
            this.targetDays = $('<div class="calendarDays"></div>');
            this.targetEvents = $('<div class="calendarEvents"></div>');
            this.target.append([this.targetYears, this.targetMonths, this.targetDays, this.targetEvents]);
            this.buildYears();
        };
        ;
        Schedule.prototype.buildYears = function () {
            var yearsHtml = "<div class=\"" + this.options.classes.year + "\" data-year=\"" + (this.options.startDate.getYear() - 1) + "\">" + (this.options.startDate.getYear() - 1) + "</div>\n                            <div class=\"" + this.options.classes.year + "\" data-year=\"" + this.options.startDate.getYear() + "\">" + this.options.startDate.getYear() + "</div>\n                            <div class=\"" + this.options.classes.year + "\" data-year=\"" + (this.options.startDate.getYear() + 1) + "\">" + (this.options.startDate.getYear() + 1) + "</div>";
            this.targetYears.html(yearsHtml);
            this.buildMonths();
        };
        Schedule.prototype.buildMonths = function () {
            var _this = this;
            var monthNames = {
                en: ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'],
                ru: ['Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь', 'Июль', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь']
            };
            var lang = $('meta[name="lang"]').attr('content');
            if (!monthNames.hasOwnProperty(lang)) {
                lang = 'en';
            }
            var monthsHtml = '';
            monthNames[lang].forEach(function (value, i) {
                monthsHtml += "<div class=\"" + _this.options.classes.month + "\" data-month=\"" + i + "\">" + value + "</div>";
            });
            this.targetMonths.html(monthsHtml);
            this.buildDays();
        };
        Schedule.prototype.buildDays = function () {
            var dayEvents = this.parseCount(this.options.startDate.getMonth(), this.options.startDate.getYear());
            var daysHtml = '';
            for (var day = 0; day < this.options.startDate.daysInMonth(); day++) {
                daysHtml += "<div class=\"" + this.options.classes.day + "\" data-events=\"" + dayEvents[day] + "\" data-day=\"" + (day + 1) + "\">" + (day + 1) + "</div>";
            }
            this.targetDays.html(daysHtml);
        };
        Schedule.prototype.buildEvents = function () {
            var _this = this;
            var year = this.options.startDate.getYear(), month = this.options.startDate.getMonth(), day = this.options.startDate.getDay();
            var eventsThisMonth = this.eventsHelper.filter(function (value) {
                return value.date.year === year && value.date.month === month && value.date.day == day;
            });
            var eventsHtml = '';
            if (typeof this.options.template.events.builder === "function") {
                eventsThisMonth.forEach(function (value) {
                    eventsHtml += _this.options.template.events.builder(value);
                });
            }
            else {
                eventsThisMonth.forEach(function (value) {
                    eventsHtml += "<div class=\"" + _this.options.classes.event + "\" data-event-id=\"" + value.link[0].id + "\" data-playlist-id=\"" + value.link[0].playlist + "\" >\n                                    <div class=\"title\">" + value.link[0].title + "</div>\n                                    <div class=\"description\">" + value.link[0].description + "</div>\n                                </div>";
                });
            }
            if (typeof this.options.template.events.wrap !== "undefined") {
                if (this.options.template.events.wrap instanceof Array) {
                    var startTag_1 = '';
                    var endTag_1 = [];
                    this.options.template.events.wrap.forEach(function (element) {
                        var wrapper = element.split('|');
                        var tagName = wrapper[0];
                        var attributes = wrapper
                            .filter(function (val, i) { return i > 0; })
                            .toString()
                            .replace(',', ' ');
                        startTag_1 += "<" + tagName + " " + attributes + ">";
                        endTag_1.push("</" + tagName + ">");
                    });
                    eventsHtml = startTag_1
                        + eventsHtml
                        + endTag_1
                            .reverse()
                            .toString()
                            .replace(',', ' ');
                }
                else {
                    var wrapper = this.options.template.events.wrap.split('|');
                    var tagName = wrapper[0];
                    var attributes = wrapper
                        .filter(function (val, i) { return i > 0; })
                        .toString()
                        .replace(',', ' ');
                    eventsHtml = "<" + tagName + " " + attributes + ">" + eventsHtml + "</" + tagName + ">";
                }
            }
            this.targetEvents.html(eventsHtml);
            this.options.events.onEventsLoad(eventsThisMonth);
        };
        Schedule.prototype.switchClass = function (current, className, previous) {
            if (typeof previous !== "undefined") {
                previous.removeClass(className);
            }
            else {
                current.parent().find("." + className).removeClass(className);
            }
            current.addClass(className);
        };
        Schedule.prototype.onClickYear = function ($this) {
            var year = parseInt($this.text());
            this.options.startDate.setYear(year);
            this.switchClass($this, this.options.classes.yearSelected, this.previousSelectedYear);
            this.buildMonths();
            this.options.events.onYearSelect(year);
            this.previousSelectedYear = $this;
        };
        Schedule.prototype.onClickMonth = function ($this) {
            var month = parseInt($this.attr('data-month'));
            this.options.startDate.setMonth(month);
            this.switchClass($this, this.options.classes.monthSelected, this.previousSelectedMonth);
            this.buildDays();
            this.options.events.onMonthSelect(month);
            this.previousSelectedMonth = $this;
        };
        Schedule.prototype.onClickDay = function ($this) {
            var day = parseInt($this.text());
            this.options.startDate.setDay(parseInt($this.text()));
            this.switchClass($this, this.options.classes.daySelected, this.previousSelectedDay);
            this.buildEvents();
            this.options.events.onDaySelect(day);
            this.previousSelectedDay = $this;
        };
        Schedule.prototype.select = function (type, value) {
            switch (type) {
                case DateType.Year:
                    this.options.startDate.setYear(value);
                    this.targetYears.find("[data-year=\"" + value + "\"]")
                        .trigger('click');
                    break;
                case DateType.Month:
                    this.options.startDate.setMonth(value);
                    this.targetMonths.find("[data-month=\"" + value + "\"]")
                        .trigger('click');
                    break;
                case DateType.Day:
                    this.options.startDate.setDay(value);
                    this.targetDays.find("[data-day=\"" + value + "\"]")
                        .trigger('click');
                    break;
            }
        };
        Schedule.prototype.selectToday = function () {
            var today = new DateHelper();
            this.select(DateType.Year, today.getYear());
            this.select(DateType.Month, today.getMonth());
            this.select(DateType.Day, today.getDay());
        };
        return Schedule;
    }());
    Scheduler.Schedule = Schedule;
})(Scheduler = exports.Scheduler || (exports.Scheduler = {}));
