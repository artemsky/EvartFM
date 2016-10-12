import * as $ from 'jquery';
import {Scheduler} from '../services/schedule.service';
import {AJAX} from "../services/requestOptions.service";
require("mousewheel");
require("owl.carousel");
module Schedule{
    let calendar = $("#calendar");
    new AJAX(calendar.attr("data-url"), "GET").start().then(success => {
        new Scheduler.Schedule(calendar, success.events, {
            events: {
                onEventsLoad: (events) => {
                    $('.owl-carousel').owlCarousel({
                        center: true,
                        items:2,
                        loop:false,
                        margin:10,
                        responsive:{
                            600:{
                                items:4
                            }
                        }
                    });
                }
            },
            template:{
                events:{
                    wrap: ['div|class="owl-carousel"'],
                    builder: (e) => {
                        return `<div class="event">
                                    <span class="event-title">${e.link[0].title}</span>
                                    <span class="event-description">${e.link[0].description}</span>
                                    <time>${e.date.time.hour}:${e.date.time.minute < 10 ? "0" + e.date.time.minute : e.date.time.minute}</time>
                                </div>`;
                    }
                }

            }
        });
    });
    
}