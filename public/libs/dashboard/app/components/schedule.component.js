"use strict";
var $ = require('jquery');
var schedule_service_1 = require('../services/schedule.service');
var requestOptions_service_1 = require("../services/requestOptions.service");
require("mousewheel");
require("owl.carousel");
var Schedule;
(function (Schedule) {
    var calendar = $("#calendar");
    new requestOptions_service_1.AJAX(calendar.attr("data-url"), "GET").start().then(function (success) {
        new schedule_service_1.Scheduler.Schedule(calendar, success.events, {
            events: {
                onEventsLoad: function (events) {
                    $('.owl-carousel').owlCarousel({
                        center: true,
                        items: 2,
                        loop: false,
                        margin: 10,
                        responsive: {
                            600: {
                                items: 4
                            }
                        }
                    });
                }
            },
            template: {
                events: {
                    wrap: ['div|class="owl-carousel"'],
                    builder: function (e) {
                        return "<div class=\"event\">\n                                    <span class=\"event-title\">" + e.link[0].title + "</span>\n                                    <span class=\"event-description\">" + e.link[0].description + "</span>\n                                    <time>" + e.date.time.hour + ":" + (e.date.time.minute < 10 ? "0" + e.date.time.minute : e.date.time.minute) + "</time>\n                                </div>";
                    }
                }
            }
        });
    });
})(Schedule || (Schedule = {}));
