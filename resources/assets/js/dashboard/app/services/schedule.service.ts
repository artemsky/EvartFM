import * as $ from 'jquery';
import {type} from "os";

export module Scheduler{
    interface DateHelperTime{
        hour: number,
        minute: number
    }
    interface DateHelperDate{
        day: number,
        month: number,
        year: number,
        time: DateHelperTime
    }
    class DateHelper{
        private date: Date;

        constructor();
        constructor(date: Date | string);
        constructor(year: number, month: number, day: number, hour?: number, minute?:number);
        constructor(dateOrYear?: any, month?: number, day?: number, hour?: number, minute?:number) {
            if(arguments.length === 0)
                this.date = new Date();
            else if (typeof dateOrYear === "string") {
                this.date = new Date(dateOrYear);
            }
            else if(typeof dateOrYear === "object"){
                let date = <Date> dateOrYear;
                this.date = new Date(date.getFullYear(), date.getMonth(), date.getDate(), date.getHours(), date.getMinutes());
            }
            else{
                this.date = new Date(arguments);
            }
        }
        public toString(){
            return `${this.getYear()}-${this.getMonth()}-${this.getDay()}`;
        }
        public getTime() : DateHelperTime{
            return {
                hour: this.date.getHours(),
                minute: this.date.getMinutes()
            }
        }
        public getDate() : DateHelperDate{
            return {
                day: this.getDay(),
                month: this.getMonth(),
                year: this.getYear(),
                time: this.getTime()
            }
        }
        public getYear() : number{
            return this.date.getFullYear();
        }
        public getMonth() : number{
            return this.date.getMonth();
        }
        public getDay() : number{
            return this.date.getDate();
        }
        public setDay(day:number): void{
            this.date.setDate(day);
        }
        public setMonth(day:number): void{
            this.date.setMonth(day);
            this.setDay(1);
        }
        public setYear(day:number): void{
            this.date.setFullYear(day);
            this.setMonth(0);
        }
        public daysInMonth() {
            return new Date(this.getYear(), this.getMonth(), 0).getDate();
        }
    }

    interface ScheduleEvent{
        id: number,
        title: string,
        description: string,
        date: string,
        playlist: number
        repeat: {
            event_id: number,
            everyDay: number,
            everyWeek: number,
            sun: number,
            mon: number,
            tue: number,
            wed: number,
            thu: number,
            fri: number,
            sat: number
        }
    }

    interface EventLight{
        link: ScheduleEvent[],
        date: DateHelperDate
    }
    interface ScheduleOptions{
        startDate?: DateHelper,
        classes?: {
            day?: string,
            daySelected?: string,
            month?: string,
            monthSelected?: string,
            year?: string,
            yearSelected?: string,
            event?: string
        },
        events?: {
            onDaySelect?: (day?:number, target?:JQuery) => void,
            onEventsLoad?: (eventsThisDay?: Object) => void,
            onMonthSelect?: (day?, target?:JQuery) => void,
            onYearSelect?: (day?, target?:JQuery) => void,
        }
        template?:{
            events?:{
                wrap?: string|string[],
                builder?: (event:EventLight) => string
            }

        }
    }

    enum DateType{
        Day,
        Month,
        Year
    }


    export class Schedule{
        private target: JQuery;
        private events: ScheduleEvent[];
        private eventsHelper: EventLight[];
        private options: ScheduleOptions;
        private targetYears:JQuery;
        private targetMonths:JQuery;
        private targetDays:JQuery;
        private targetEvents:JQuery;

        private previousSelectedYear:JQuery;
        private previousSelectedMonth:JQuery;
        private previousSelectedDay:JQuery;

        constructor(target:JQuery, events: ScheduleEvent[], options:ScheduleOptions = {}){
            this.options = this.initOptions(options);
            this.events = events;
            this.parseEvents();
            this.target = target;


            this.initEvents();
            this.build();
            this.selectToday();
        }
        //Core
        private initOptions(options): ScheduleOptions{
            let defaultOptions:ScheduleOptions =  {
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
                    onDaySelect: () => {},
                    onEventsLoad: () => {},
                    onMonthSelect: () => {},
                    onYearSelect: () => {},
                },
                template:{
                    events:{
                        wrap: undefined,
                        builder: undefined
                    }
                }
            };

            let loop = (defaultObject, passedObject) => {
                let newObject = defaultObject;
                let keys = Object.keys(passedObject);
                for(let i = keys.length; i--;){
                    if(typeof passedObject[keys[i]] === "object" && !(passedObject[keys[i]] instanceof Array)){
                        newObject[keys[i]] = loop(defaultObject[keys[i]], passedObject[keys[i]]);
                    }else{
                        newObject[keys[i]] = passedObject[keys[i]]
                    }
                }
                return newObject;
            };


            return loop(defaultOptions, options);
        }
        private initEvents(): void{
            this.previousSelectedYear = undefined;
            this.previousSelectedMonth = undefined;
            this.previousSelectedDay = undefined;

            this.target.on('click', '.' + this.options.classes.year, (e)=>{
                this.onClickYear($(e.target));
            });

            this.target.on('click', '.' + this.options.classes.month, (e)=>{
                this.onClickMonth($(e.target));
            });

            this.target.on('click', '.' + this.options.classes.day, (e)=>{
                this.onClickDay($(e.target));
            });

        }
        private parseCount(month:number, year:number){
            let arr = Array.apply(null, Array(this.options.startDate.daysInMonth())).map(Number.prototype.valueOf,0);
            
            this.eventsHelper.forEach((value)=>{
                if(value.date.year === year && value.date.month === month)
                    arr[value.date.day-1]++;
            });
            return arr;
        }
        private parseEvents() : void{
            this.eventsHelper = [];
            this.events.forEach((event, i)=>{
                let eventDate = new DateHelper(event.date);
                this.eventsHelper.push({
                    link: this.events.slice(i, i+1),
                    date: eventDate.getDate()
                })
            });
        }

        //Html Builder
        private build(){
            this.targetYears = $('<div class="calendarYears"></div>');
            this.targetMonths = $('<div class="calendarMonths"></div>');
            this.targetDays = $('<div class="calendarDays"></div>');
            this.targetEvents = $('<div class="calendarEvents"></div>');
            this.target.append([this.targetYears, this.targetMonths, this.targetDays, this.targetEvents]);

            this.buildYears();
        };
        private buildYears(){
            let yearsHtml = `<div class="${this.options.classes.year}" data-year="${this.options.startDate.getYear()-1}">${this.options.startDate.getYear()-1}</div>
                            <div class="${this.options.classes.year}" data-year="${this.options.startDate.getYear()}">${this.options.startDate.getYear()}</div>
                            <div class="${this.options.classes.year}" data-year="${this.options.startDate.getYear()+1}">${this.options.startDate.getYear()+1}</div>`;

            this.targetYears.html(yearsHtml);

            this.buildMonths();
        }
        private buildMonths(){

            var monthNames:Object = {
                en: [ 'January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'],
                ru: [ 'Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь', 'Июль', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь']
            };
            let lang = $('meta[name="lang"]').attr('content');

            if(!monthNames.hasOwnProperty(lang)){
                lang = 'en';
            }
            let monthsHtml = '';
            monthNames[lang].forEach((value, i) => {
                monthsHtml+= `<div class="${this.options.classes.month}" data-month="${i}">${value}</div>`;
            });

            this.targetMonths.html(monthsHtml);

            this.buildDays();
        }
        private buildDays(){
            let dayEvents = this.parseCount(this.options.startDate.getMonth(), this.options.startDate.getYear());
            let daysHtml = '';
            for(let day = 0; day < this.options.startDate.daysInMonth(); day++){
                daysHtml += `<div class="${this.options.classes.day}" data-events="${dayEvents[day]}" data-day="${day+1}">${day+1}</div>`;
            }

            this.targetDays.html(daysHtml);
        }
        private buildEvents(){
            let year = this.options.startDate.getYear(),
                month = this.options.startDate.getMonth(),
                day = this.options.startDate.getDay();

            let eventsThisMonth = this.eventsHelper.filter((value)=>{
                return value.date.year === year && value.date.month === month && value.date.day == day;
            });


            let eventsHtml = '';
            if(typeof this.options.template.events.builder === "function"){
                eventsThisMonth.forEach((value)=>{
                    eventsHtml += this.options.template.events.builder(value);
                });
            }else{
                eventsThisMonth.forEach((value)=>{
                    eventsHtml += `<div class="${this.options.classes.event}" data-event-id="${value.link[0].id}" data-playlist-id="${value.link[0].playlist}" >
                                    <div class="title">${value.link[0].title}</div>
                                    <div class="description">${value.link[0].description}</div>
                                </div>`;
                });
            }

            if(typeof this.options.template.events.wrap !== "undefined"){
                if(this.options.template.events.wrap instanceof Array){
                    let startTag = '';
                    let endTag = [];
                    this.options.template.events.wrap.forEach((element)=>{

                        let wrapper = element.split('|');
                        let tagName = wrapper[0];
                        let attributes = wrapper
                            .filter((val, i)=> i > 0)
                            .toString()
                            .replace(',', ' ');
                        startTag += `<${tagName} ${attributes}>`;
                        endTag.push(`</${tagName}>`);

                    });
                    eventsHtml = startTag
                        + eventsHtml
                        + endTag
                            .reverse()
                            .toString()
                            .replace(',', ' ');
                }else{
                    let wrapper = this.options.template.events.wrap.split('|');
                    let tagName = wrapper[0];
                    let attributes = wrapper
                        .filter((val, i)=> i > 0)
                        .toString()
                        .replace(',', ' ');
                    eventsHtml = `<${tagName} ${attributes}>${eventsHtml}</${tagName}>`;
                }

            }

            this.targetEvents.html(eventsHtml);
            this.options.events.onEventsLoad(eventsThisMonth);
        }

        //Helpers
        private switchClass(current:JQuery, className: string, previous?:JQuery){
            if(typeof previous !== "undefined"){
                previous.removeClass(className);
            }else{
                current.parent().find(`.${className}`).removeClass(className)
            }
            current.addClass(className);
        }

        //Events

        private onClickYear($this: JQuery){
            let year = parseInt($this.text());
            this.options.startDate.setYear(year);
            this.switchClass($this, this.options.classes.yearSelected, this.previousSelectedYear);
            this.buildMonths();

            this.options.events.onYearSelect(year);
            this.previousSelectedYear = $this;
        }
        private onClickMonth($this: JQuery){
            let month = parseInt($this.attr('data-month'));
            this.options.startDate.setMonth(month);
            this.switchClass($this, this.options.classes.monthSelected, this.previousSelectedMonth);
            this.buildDays();

            this.options.events.onMonthSelect(month);
            this.previousSelectedMonth = $this;
        }
        private onClickDay($this: JQuery){
            let day = parseInt($this.text());
            this.options.startDate.setDay(parseInt($this.text()));
            this.switchClass($this, this.options.classes.daySelected, this.previousSelectedDay);
            this.buildEvents();

            this.options.events.onDaySelect(day);
            this.previousSelectedDay = $this;
        }
        private select(type:DateType, value:number){
            switch(type){
                case DateType.Year:
                    this.options.startDate.setYear(value);
                    this.targetYears.find(`[data-year="${value}"]`)
                        .trigger('click');
                    break;
                case DateType.Month:
                    this.options.startDate.setMonth(value);
                    this.targetMonths.find(`[data-month="${value}"]`)
                        .trigger('click');
                    break;
                case DateType.Day:
                    this.options.startDate.setDay(value);
                    this.targetDays.find(`[data-day="${value}"]`)
                        .trigger('click');
                    break;
            }
        }

        public selectToday() : void{
            let today = new DateHelper();
            this.select(DateType.Year, today.getYear());
            this.select(DateType.Month, today.getMonth());
            this.select(DateType.Day, today.getDay());
        }

    }
}