jQuery(function($) {
    'use strict';
    
    //Main slider
    $(document).ready(function() {
        $("#main-slider .owl-carousel").owlCarousel({

            nav : true, // Show next and prev buttons
            slideSpeed : 300,
            paginationSpeed : 400,
            items: 1,
            singleItem: true,
            dots: true,
            autoplay: true,
            autoplayTimeout: 5000,
            loop: true,
            animateOut: 'owl-fadeUp-out',
            animateIn: 'owl-fade-in',
            navText: [
                "<span class='glyphicon glyphicon-menu-left'></span>",
                "<span class='glyphicon glyphicon-menu-right'></span>"],
            responsive:{
                0:{
                   nav: false
                },
               992:{
                   nav : true
               }
            }
        });

    });

    //Rangeslider.js Audio Player
    $(document).ready(function() {
        var player = $("#player");
        var audioplayer = $("#evartplayer");
        var playbtn = player.find(".audioplayer .tablecell.play span");
        var selfPause = false;


        var playerAction = function(){
            if($(this).hasClass("glyphicon-play")){
                $(this).removeClass("glyphicon-play").addClass("glyphicon-pause");
                audioplayer.get(0).play();
                selfPause = false;
            } else {
                $(this).removeClass("glyphicon-pause").addClass("glyphicon-play");
                audioplayer.get(0).pause();
                selfPause = true;
            }
        };

        var rangeslider = player.find('input[type="range"]').rangeslider({
            polyfill: false,

            // Callback function
            onInit: function() {
                audioplayer.get(0).volume = .5;
                playbtn.click(playerAction);
            },

            // Callback function
            onSlide: function(position, value) {
                audioplayer.get(0).volume = value/100;
            },

            // Callback function
            onSlideEnd: function(position, value) {}
        });
        player.find(".volume-down").click(function(){
            rangeslider.val(0).change();
        });
        player.find(".volume-up").click(function(){
            rangeslider.val(100).change();
        });

        playbtn.trigger('click');

        setInterval(function(){
            console.log(audioplayer.get(0).paused);
            console.log(selfPause);
            if(audioplayer.get(0).paused && !selfPause)
                audioplayer.get(0).play();
        }, 3000)


        
    });
    


    //Scrollbar
    $(document).ready(function() {
        $('#program').perfectScrollbar({
            suppressScrollX: true,
            wheelSpeed: 0.5,
            wheelPropagation: true
        });
    });


    //Blockquote
    $(document).ready(function() {
        $("#blockquote .owl-carousel").owlCarousel({

            nav : true, // Show next and prev buttons
            slideSpeed : 300,
            paginationSpeed : 400,
            items: 1,
            singleItem: true,
            dots: false,
            autoplay: true,
            autoplayTimeout: 13000,
            loop: false,
            navText: [
                "<span class='glyphicon glyphicon-menu-left'></span>",
                "<span class='glyphicon glyphicon-menu-right'></span>"]
        });

    });


    //Efir Upper
    $(document).ready(function() {
        var slider = $("#efir-upper .owl-carousel");
        slider.owlCarousel({
            slideSpeed : 300,
            paginationSpeed : 400,
            items: slider.find(".item").length-1,
            autoplay: true,
            autoplayTimeout: 7000,
            loop: true,
            responsive:{
                0:{
                    items:1
                },
                650:{
                    items:2
                },
                992:{
                    items:3
                },
                1300:{
                    items:4
                },
                1600:{
                    items:5
                }
            }
        });


    });

    //Video
    $(document).ready(function() {
        $("#video .owl-carousel").owlCarousel({
            slideSpeed : 300,
            paginationSpeed : 400,
            items: 1,
            singleItem: true,
            dots: true,
            loop: true
        });

    });

    //Efir Lower
    $(document).ready(function() {
        var slider = $("#efir-lower .owl-carousel");
        slider.owlCarousel({
            slideSpeed : 300,
            paginationSpeed : 400,
            items: slider.find(".item").length-1,
            autoplay: true,
            autoplayTimeout: 9000,
            loop: true,
            responsive:{
                0:{
                    items:1
                },
                650:{
                    items:2
                },
                992:{
                    items:3
                },
                1300:{
                    items:4
                },
                1600:{
                    items:5
                }
            }
        });

    });

    //Sendmail request demo
    $(document).ready(function() {
        /*
         Response JSON Object EXAMPLE
            {
                status: "success" || "error"
                text: "Your message has been delivered!" || "Your message has not been delivered!"
            }
         */

        var URL = "sendmail.php";

        $("#sendmail").click(function(){
            var form = $("#support form");
            $.post(URL, {
                data: form.serializeArray()
            }).done(function(response){
                response = JSON.parse(response);
                var obj = form.find(".deliverstatus");
                obj.text(response.text)
                    .show();
                if(response.status != "success")
                    obj.addClass("error");

                setTimeout(function(){
                    obj.removeClass("error")
                        .hide();
                    form.get(0).reset();
                }, 5000)
                
            });
        });


    });
    

    
    

});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiIiwic291cmNlcyI6WyJhcHAuanMiXSwic291cmNlc0NvbnRlbnQiOlsialF1ZXJ5KGZ1bmN0aW9uKCQpIHtcbiAgICAndXNlIHN0cmljdCc7XG4gICAgXG4gICAgLy9NYWluIHNsaWRlclxuICAgICQoZG9jdW1lbnQpLnJlYWR5KGZ1bmN0aW9uKCkge1xuICAgICAgICAkKFwiI21haW4tc2xpZGVyIC5vd2wtY2Fyb3VzZWxcIikub3dsQ2Fyb3VzZWwoe1xuXG4gICAgICAgICAgICBuYXYgOiB0cnVlLCAvLyBTaG93IG5leHQgYW5kIHByZXYgYnV0dG9uc1xuICAgICAgICAgICAgc2xpZGVTcGVlZCA6IDMwMCxcbiAgICAgICAgICAgIHBhZ2luYXRpb25TcGVlZCA6IDQwMCxcbiAgICAgICAgICAgIGl0ZW1zOiAxLFxuICAgICAgICAgICAgc2luZ2xlSXRlbTogdHJ1ZSxcbiAgICAgICAgICAgIGRvdHM6IHRydWUsXG4gICAgICAgICAgICBhdXRvcGxheTogdHJ1ZSxcbiAgICAgICAgICAgIGF1dG9wbGF5VGltZW91dDogNTAwMCxcbiAgICAgICAgICAgIGxvb3A6IHRydWUsXG4gICAgICAgICAgICBhbmltYXRlT3V0OiAnb3dsLWZhZGVVcC1vdXQnLFxuICAgICAgICAgICAgYW5pbWF0ZUluOiAnb3dsLWZhZGUtaW4nLFxuICAgICAgICAgICAgbmF2VGV4dDogW1xuICAgICAgICAgICAgICAgIFwiPHNwYW4gY2xhc3M9J2dseXBoaWNvbiBnbHlwaGljb24tbWVudS1sZWZ0Jz48L3NwYW4+XCIsXG4gICAgICAgICAgICAgICAgXCI8c3BhbiBjbGFzcz0nZ2x5cGhpY29uIGdseXBoaWNvbi1tZW51LXJpZ2h0Jz48L3NwYW4+XCJdLFxuICAgICAgICAgICAgcmVzcG9uc2l2ZTp7XG4gICAgICAgICAgICAgICAgMDp7XG4gICAgICAgICAgICAgICAgICAgbmF2OiBmYWxzZVxuICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICA5OTI6e1xuICAgICAgICAgICAgICAgICAgIG5hdiA6IHRydWVcbiAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfSk7XG5cbiAgICB9KTtcblxuICAgIC8vUmFuZ2VzbGlkZXIuanMgQXVkaW8gUGxheWVyXG4gICAgJChkb2N1bWVudCkucmVhZHkoZnVuY3Rpb24oKSB7XG4gICAgICAgIHZhciBwbGF5ZXIgPSAkKFwiI3BsYXllclwiKTtcbiAgICAgICAgdmFyIGF1ZGlvcGxheWVyID0gJChcIiNldmFydHBsYXllclwiKTtcbiAgICAgICAgdmFyIHBsYXlidG4gPSBwbGF5ZXIuZmluZChcIi5hdWRpb3BsYXllciAudGFibGVjZWxsLnBsYXkgc3BhblwiKTtcbiAgICAgICAgdmFyIHNlbGZQYXVzZSA9IGZhbHNlO1xuXG5cbiAgICAgICAgdmFyIHBsYXllckFjdGlvbiA9IGZ1bmN0aW9uKCl7XG4gICAgICAgICAgICBpZigkKHRoaXMpLmhhc0NsYXNzKFwiZ2x5cGhpY29uLXBsYXlcIikpe1xuICAgICAgICAgICAgICAgICQodGhpcykucmVtb3ZlQ2xhc3MoXCJnbHlwaGljb24tcGxheVwiKS5hZGRDbGFzcyhcImdseXBoaWNvbi1wYXVzZVwiKTtcbiAgICAgICAgICAgICAgICBhdWRpb3BsYXllci5nZXQoMCkucGxheSgpO1xuICAgICAgICAgICAgICAgIHNlbGZQYXVzZSA9IGZhbHNlO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAkKHRoaXMpLnJlbW92ZUNsYXNzKFwiZ2x5cGhpY29uLXBhdXNlXCIpLmFkZENsYXNzKFwiZ2x5cGhpY29uLXBsYXlcIik7XG4gICAgICAgICAgICAgICAgYXVkaW9wbGF5ZXIuZ2V0KDApLnBhdXNlKCk7XG4gICAgICAgICAgICAgICAgc2VsZlBhdXNlID0gdHJ1ZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfTtcblxuICAgICAgICB2YXIgcmFuZ2VzbGlkZXIgPSBwbGF5ZXIuZmluZCgnaW5wdXRbdHlwZT1cInJhbmdlXCJdJykucmFuZ2VzbGlkZXIoe1xuICAgICAgICAgICAgcG9seWZpbGw6IGZhbHNlLFxuXG4gICAgICAgICAgICAvLyBDYWxsYmFjayBmdW5jdGlvblxuICAgICAgICAgICAgb25Jbml0OiBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgICAgICBhdWRpb3BsYXllci5nZXQoMCkudm9sdW1lID0gLjU7XG4gICAgICAgICAgICAgICAgcGxheWJ0bi5jbGljayhwbGF5ZXJBY3Rpb24pO1xuICAgICAgICAgICAgfSxcblxuICAgICAgICAgICAgLy8gQ2FsbGJhY2sgZnVuY3Rpb25cbiAgICAgICAgICAgIG9uU2xpZGU6IGZ1bmN0aW9uKHBvc2l0aW9uLCB2YWx1ZSkge1xuICAgICAgICAgICAgICAgIGF1ZGlvcGxheWVyLmdldCgwKS52b2x1bWUgPSB2YWx1ZS8xMDA7XG4gICAgICAgICAgICB9LFxuXG4gICAgICAgICAgICAvLyBDYWxsYmFjayBmdW5jdGlvblxuICAgICAgICAgICAgb25TbGlkZUVuZDogZnVuY3Rpb24ocG9zaXRpb24sIHZhbHVlKSB7fVxuICAgICAgICB9KTtcbiAgICAgICAgcGxheWVyLmZpbmQoXCIudm9sdW1lLWRvd25cIikuY2xpY2soZnVuY3Rpb24oKXtcbiAgICAgICAgICAgIHJhbmdlc2xpZGVyLnZhbCgwKS5jaGFuZ2UoKTtcbiAgICAgICAgfSk7XG4gICAgICAgIHBsYXllci5maW5kKFwiLnZvbHVtZS11cFwiKS5jbGljayhmdW5jdGlvbigpe1xuICAgICAgICAgICAgcmFuZ2VzbGlkZXIudmFsKDEwMCkuY2hhbmdlKCk7XG4gICAgICAgIH0pO1xuXG4gICAgICAgIHBsYXlidG4udHJpZ2dlcignY2xpY2snKTtcblxuICAgICAgICBzZXRJbnRlcnZhbChmdW5jdGlvbigpe1xuICAgICAgICAgICAgY29uc29sZS5sb2coYXVkaW9wbGF5ZXIuZ2V0KDApLnBhdXNlZCk7XG4gICAgICAgICAgICBjb25zb2xlLmxvZyhzZWxmUGF1c2UpO1xuICAgICAgICAgICAgaWYoYXVkaW9wbGF5ZXIuZ2V0KDApLnBhdXNlZCAmJiAhc2VsZlBhdXNlKVxuICAgICAgICAgICAgICAgIGF1ZGlvcGxheWVyLmdldCgwKS5wbGF5KCk7XG4gICAgICAgIH0sIDMwMDApXG5cblxuICAgICAgICBcbiAgICB9KTtcbiAgICBcblxuXG4gICAgLy9TY3JvbGxiYXJcbiAgICAkKGRvY3VtZW50KS5yZWFkeShmdW5jdGlvbigpIHtcbiAgICAgICAgJCgnI3Byb2dyYW0nKS5wZXJmZWN0U2Nyb2xsYmFyKHtcbiAgICAgICAgICAgIHN1cHByZXNzU2Nyb2xsWDogdHJ1ZSxcbiAgICAgICAgICAgIHdoZWVsU3BlZWQ6IDAuNSxcbiAgICAgICAgICAgIHdoZWVsUHJvcGFnYXRpb246IHRydWVcbiAgICAgICAgfSk7XG4gICAgfSk7XG5cblxuICAgIC8vQmxvY2txdW90ZVxuICAgICQoZG9jdW1lbnQpLnJlYWR5KGZ1bmN0aW9uKCkge1xuICAgICAgICAkKFwiI2Jsb2NrcXVvdGUgLm93bC1jYXJvdXNlbFwiKS5vd2xDYXJvdXNlbCh7XG5cbiAgICAgICAgICAgIG5hdiA6IHRydWUsIC8vIFNob3cgbmV4dCBhbmQgcHJldiBidXR0b25zXG4gICAgICAgICAgICBzbGlkZVNwZWVkIDogMzAwLFxuICAgICAgICAgICAgcGFnaW5hdGlvblNwZWVkIDogNDAwLFxuICAgICAgICAgICAgaXRlbXM6IDEsXG4gICAgICAgICAgICBzaW5nbGVJdGVtOiB0cnVlLFxuICAgICAgICAgICAgZG90czogZmFsc2UsXG4gICAgICAgICAgICBhdXRvcGxheTogdHJ1ZSxcbiAgICAgICAgICAgIGF1dG9wbGF5VGltZW91dDogMTMwMDAsXG4gICAgICAgICAgICBsb29wOiBmYWxzZSxcbiAgICAgICAgICAgIG5hdlRleHQ6IFtcbiAgICAgICAgICAgICAgICBcIjxzcGFuIGNsYXNzPSdnbHlwaGljb24gZ2x5cGhpY29uLW1lbnUtbGVmdCc+PC9zcGFuPlwiLFxuICAgICAgICAgICAgICAgIFwiPHNwYW4gY2xhc3M9J2dseXBoaWNvbiBnbHlwaGljb24tbWVudS1yaWdodCc+PC9zcGFuPlwiXVxuICAgICAgICB9KTtcblxuICAgIH0pO1xuXG5cbiAgICAvL0VmaXIgVXBwZXJcbiAgICAkKGRvY3VtZW50KS5yZWFkeShmdW5jdGlvbigpIHtcbiAgICAgICAgdmFyIHNsaWRlciA9ICQoXCIjZWZpci11cHBlciAub3dsLWNhcm91c2VsXCIpO1xuICAgICAgICBzbGlkZXIub3dsQ2Fyb3VzZWwoe1xuICAgICAgICAgICAgc2xpZGVTcGVlZCA6IDMwMCxcbiAgICAgICAgICAgIHBhZ2luYXRpb25TcGVlZCA6IDQwMCxcbiAgICAgICAgICAgIGl0ZW1zOiBzbGlkZXIuZmluZChcIi5pdGVtXCIpLmxlbmd0aC0xLFxuICAgICAgICAgICAgYXV0b3BsYXk6IHRydWUsXG4gICAgICAgICAgICBhdXRvcGxheVRpbWVvdXQ6IDcwMDAsXG4gICAgICAgICAgICBsb29wOiB0cnVlLFxuICAgICAgICAgICAgcmVzcG9uc2l2ZTp7XG4gICAgICAgICAgICAgICAgMDp7XG4gICAgICAgICAgICAgICAgICAgIGl0ZW1zOjFcbiAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgIDY1MDp7XG4gICAgICAgICAgICAgICAgICAgIGl0ZW1zOjJcbiAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgIDk5Mjp7XG4gICAgICAgICAgICAgICAgICAgIGl0ZW1zOjNcbiAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgIDEzMDA6e1xuICAgICAgICAgICAgICAgICAgICBpdGVtczo0XG4gICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICAxNjAwOntcbiAgICAgICAgICAgICAgICAgICAgaXRlbXM6NVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfSk7XG5cblxuICAgIH0pO1xuXG4gICAgLy9WaWRlb1xuICAgICQoZG9jdW1lbnQpLnJlYWR5KGZ1bmN0aW9uKCkge1xuICAgICAgICAkKFwiI3ZpZGVvIC5vd2wtY2Fyb3VzZWxcIikub3dsQ2Fyb3VzZWwoe1xuICAgICAgICAgICAgc2xpZGVTcGVlZCA6IDMwMCxcbiAgICAgICAgICAgIHBhZ2luYXRpb25TcGVlZCA6IDQwMCxcbiAgICAgICAgICAgIGl0ZW1zOiAxLFxuICAgICAgICAgICAgc2luZ2xlSXRlbTogdHJ1ZSxcbiAgICAgICAgICAgIGRvdHM6IHRydWUsXG4gICAgICAgICAgICBsb29wOiB0cnVlXG4gICAgICAgIH0pO1xuXG4gICAgfSk7XG5cbiAgICAvL0VmaXIgTG93ZXJcbiAgICAkKGRvY3VtZW50KS5yZWFkeShmdW5jdGlvbigpIHtcbiAgICAgICAgdmFyIHNsaWRlciA9ICQoXCIjZWZpci1sb3dlciAub3dsLWNhcm91c2VsXCIpO1xuICAgICAgICBzbGlkZXIub3dsQ2Fyb3VzZWwoe1xuICAgICAgICAgICAgc2xpZGVTcGVlZCA6IDMwMCxcbiAgICAgICAgICAgIHBhZ2luYXRpb25TcGVlZCA6IDQwMCxcbiAgICAgICAgICAgIGl0ZW1zOiBzbGlkZXIuZmluZChcIi5pdGVtXCIpLmxlbmd0aC0xLFxuICAgICAgICAgICAgYXV0b3BsYXk6IHRydWUsXG4gICAgICAgICAgICBhdXRvcGxheVRpbWVvdXQ6IDkwMDAsXG4gICAgICAgICAgICBsb29wOiB0cnVlLFxuICAgICAgICAgICAgcmVzcG9uc2l2ZTp7XG4gICAgICAgICAgICAgICAgMDp7XG4gICAgICAgICAgICAgICAgICAgIGl0ZW1zOjFcbiAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgIDY1MDp7XG4gICAgICAgICAgICAgICAgICAgIGl0ZW1zOjJcbiAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgIDk5Mjp7XG4gICAgICAgICAgICAgICAgICAgIGl0ZW1zOjNcbiAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgIDEzMDA6e1xuICAgICAgICAgICAgICAgICAgICBpdGVtczo0XG4gICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICAxNjAwOntcbiAgICAgICAgICAgICAgICAgICAgaXRlbXM6NVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfSk7XG5cbiAgICB9KTtcblxuICAgIC8vU2VuZG1haWwgcmVxdWVzdCBkZW1vXG4gICAgJChkb2N1bWVudCkucmVhZHkoZnVuY3Rpb24oKSB7XG4gICAgICAgIC8qXG4gICAgICAgICBSZXNwb25zZSBKU09OIE9iamVjdCBFWEFNUExFXG4gICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgc3RhdHVzOiBcInN1Y2Nlc3NcIiB8fCBcImVycm9yXCJcbiAgICAgICAgICAgICAgICB0ZXh0OiBcIllvdXIgbWVzc2FnZSBoYXMgYmVlbiBkZWxpdmVyZWQhXCIgfHwgXCJZb3VyIG1lc3NhZ2UgaGFzIG5vdCBiZWVuIGRlbGl2ZXJlZCFcIlxuICAgICAgICAgICAgfVxuICAgICAgICAgKi9cblxuICAgICAgICB2YXIgVVJMID0gXCJzZW5kbWFpbC5waHBcIjtcblxuICAgICAgICAkKFwiI3NlbmRtYWlsXCIpLmNsaWNrKGZ1bmN0aW9uKCl7XG4gICAgICAgICAgICB2YXIgZm9ybSA9ICQoXCIjc3VwcG9ydCBmb3JtXCIpO1xuICAgICAgICAgICAgJC5wb3N0KFVSTCwge1xuICAgICAgICAgICAgICAgIGRhdGE6IGZvcm0uc2VyaWFsaXplQXJyYXkoKVxuICAgICAgICAgICAgfSkuZG9uZShmdW5jdGlvbihyZXNwb25zZSl7XG4gICAgICAgICAgICAgICAgcmVzcG9uc2UgPSBKU09OLnBhcnNlKHJlc3BvbnNlKTtcbiAgICAgICAgICAgICAgICB2YXIgb2JqID0gZm9ybS5maW5kKFwiLmRlbGl2ZXJzdGF0dXNcIik7XG4gICAgICAgICAgICAgICAgb2JqLnRleHQocmVzcG9uc2UudGV4dClcbiAgICAgICAgICAgICAgICAgICAgLnNob3coKTtcbiAgICAgICAgICAgICAgICBpZihyZXNwb25zZS5zdGF0dXMgIT0gXCJzdWNjZXNzXCIpXG4gICAgICAgICAgICAgICAgICAgIG9iai5hZGRDbGFzcyhcImVycm9yXCIpO1xuXG4gICAgICAgICAgICAgICAgc2V0VGltZW91dChmdW5jdGlvbigpe1xuICAgICAgICAgICAgICAgICAgICBvYmoucmVtb3ZlQ2xhc3MoXCJlcnJvclwiKVxuICAgICAgICAgICAgICAgICAgICAgICAgLmhpZGUoKTtcbiAgICAgICAgICAgICAgICAgICAgZm9ybS5nZXQoMCkucmVzZXQoKTtcbiAgICAgICAgICAgICAgICB9LCA1MDAwKVxuICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgfSk7XG4gICAgICAgIH0pO1xuXG5cbiAgICB9KTtcbiAgICBcblxuICAgIFxuICAgIFxuXG59KTsiXSwiZmlsZSI6ImFwcC5qcyIsInNvdXJjZVJvb3QiOiIvc291cmNlLyJ9
