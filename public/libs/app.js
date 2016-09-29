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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiIiwic291cmNlcyI6WyJhcHAuanMiXSwic291cmNlc0NvbnRlbnQiOlsialF1ZXJ5KGZ1bmN0aW9uKCQpIHtcclxuICAgICd1c2Ugc3RyaWN0JztcclxuICAgIFxyXG4gICAgLy9NYWluIHNsaWRlclxyXG4gICAgJChkb2N1bWVudCkucmVhZHkoZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgJChcIiNtYWluLXNsaWRlciAub3dsLWNhcm91c2VsXCIpLm93bENhcm91c2VsKHtcclxuXHJcbiAgICAgICAgICAgIG5hdiA6IHRydWUsIC8vIFNob3cgbmV4dCBhbmQgcHJldiBidXR0b25zXHJcbiAgICAgICAgICAgIHNsaWRlU3BlZWQgOiAzMDAsXHJcbiAgICAgICAgICAgIHBhZ2luYXRpb25TcGVlZCA6IDQwMCxcclxuICAgICAgICAgICAgaXRlbXM6IDEsXHJcbiAgICAgICAgICAgIHNpbmdsZUl0ZW06IHRydWUsXHJcbiAgICAgICAgICAgIGRvdHM6IHRydWUsXHJcbiAgICAgICAgICAgIGF1dG9wbGF5OiB0cnVlLFxyXG4gICAgICAgICAgICBhdXRvcGxheVRpbWVvdXQ6IDUwMDAsXHJcbiAgICAgICAgICAgIGxvb3A6IHRydWUsXHJcbiAgICAgICAgICAgIGFuaW1hdGVPdXQ6ICdvd2wtZmFkZVVwLW91dCcsXHJcbiAgICAgICAgICAgIGFuaW1hdGVJbjogJ293bC1mYWRlLWluJyxcclxuICAgICAgICAgICAgbmF2VGV4dDogW1xyXG4gICAgICAgICAgICAgICAgXCI8c3BhbiBjbGFzcz0nZ2x5cGhpY29uIGdseXBoaWNvbi1tZW51LWxlZnQnPjwvc3Bhbj5cIixcclxuICAgICAgICAgICAgICAgIFwiPHNwYW4gY2xhc3M9J2dseXBoaWNvbiBnbHlwaGljb24tbWVudS1yaWdodCc+PC9zcGFuPlwiXSxcclxuICAgICAgICAgICAgcmVzcG9uc2l2ZTp7XHJcbiAgICAgICAgICAgICAgICAwOntcclxuICAgICAgICAgICAgICAgICAgIG5hdjogZmFsc2VcclxuICAgICAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgICAgIDk5Mjp7XHJcbiAgICAgICAgICAgICAgICAgICBuYXYgOiB0cnVlXHJcbiAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH0pO1xyXG5cclxuICAgIH0pO1xyXG5cclxuICAgIC8vUmFuZ2VzbGlkZXIuanMgQXVkaW8gUGxheWVyXHJcbiAgICAkKGRvY3VtZW50KS5yZWFkeShmdW5jdGlvbigpIHtcclxuICAgICAgICB2YXIgcGxheWVyID0gJChcIiNwbGF5ZXJcIik7XHJcbiAgICAgICAgdmFyIGF1ZGlvcGxheWVyID0gJChcIiNldmFydHBsYXllclwiKTtcclxuICAgICAgICB2YXIgcGxheWJ0biA9IHBsYXllci5maW5kKFwiLmF1ZGlvcGxheWVyIC50YWJsZWNlbGwucGxheSBzcGFuXCIpO1xyXG4gICAgICAgIHZhciBzZWxmUGF1c2UgPSBmYWxzZTtcclxuXHJcblxyXG4gICAgICAgIHZhciBwbGF5ZXJBY3Rpb24gPSBmdW5jdGlvbigpe1xyXG4gICAgICAgICAgICBpZigkKHRoaXMpLmhhc0NsYXNzKFwiZ2x5cGhpY29uLXBsYXlcIikpe1xyXG4gICAgICAgICAgICAgICAgJCh0aGlzKS5yZW1vdmVDbGFzcyhcImdseXBoaWNvbi1wbGF5XCIpLmFkZENsYXNzKFwiZ2x5cGhpY29uLXBhdXNlXCIpO1xyXG4gICAgICAgICAgICAgICAgYXVkaW9wbGF5ZXIuZ2V0KDApLnBsYXkoKTtcclxuICAgICAgICAgICAgICAgIHNlbGZQYXVzZSA9IGZhbHNlO1xyXG4gICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgJCh0aGlzKS5yZW1vdmVDbGFzcyhcImdseXBoaWNvbi1wYXVzZVwiKS5hZGRDbGFzcyhcImdseXBoaWNvbi1wbGF5XCIpO1xyXG4gICAgICAgICAgICAgICAgYXVkaW9wbGF5ZXIuZ2V0KDApLnBhdXNlKCk7XHJcbiAgICAgICAgICAgICAgICBzZWxmUGF1c2UgPSB0cnVlO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfTtcclxuXHJcbiAgICAgICAgdmFyIHJhbmdlc2xpZGVyID0gcGxheWVyLmZpbmQoJ2lucHV0W3R5cGU9XCJyYW5nZVwiXScpLnJhbmdlc2xpZGVyKHtcclxuICAgICAgICAgICAgcG9seWZpbGw6IGZhbHNlLFxyXG5cclxuICAgICAgICAgICAgLy8gQ2FsbGJhY2sgZnVuY3Rpb25cclxuICAgICAgICAgICAgb25Jbml0OiBmdW5jdGlvbigpIHtcclxuICAgICAgICAgICAgICAgIGF1ZGlvcGxheWVyLmdldCgwKS52b2x1bWUgPSAuNTtcclxuICAgICAgICAgICAgICAgIHBsYXlidG4uY2xpY2socGxheWVyQWN0aW9uKTtcclxuICAgICAgICAgICAgfSxcclxuXHJcbiAgICAgICAgICAgIC8vIENhbGxiYWNrIGZ1bmN0aW9uXHJcbiAgICAgICAgICAgIG9uU2xpZGU6IGZ1bmN0aW9uKHBvc2l0aW9uLCB2YWx1ZSkge1xyXG4gICAgICAgICAgICAgICAgYXVkaW9wbGF5ZXIuZ2V0KDApLnZvbHVtZSA9IHZhbHVlLzEwMDtcclxuICAgICAgICAgICAgfSxcclxuXHJcbiAgICAgICAgICAgIC8vIENhbGxiYWNrIGZ1bmN0aW9uXHJcbiAgICAgICAgICAgIG9uU2xpZGVFbmQ6IGZ1bmN0aW9uKHBvc2l0aW9uLCB2YWx1ZSkge31cclxuICAgICAgICB9KTtcclxuICAgICAgICBwbGF5ZXIuZmluZChcIi52b2x1bWUtZG93blwiKS5jbGljayhmdW5jdGlvbigpe1xyXG4gICAgICAgICAgICByYW5nZXNsaWRlci52YWwoMCkuY2hhbmdlKCk7XHJcbiAgICAgICAgfSk7XHJcbiAgICAgICAgcGxheWVyLmZpbmQoXCIudm9sdW1lLXVwXCIpLmNsaWNrKGZ1bmN0aW9uKCl7XHJcbiAgICAgICAgICAgIHJhbmdlc2xpZGVyLnZhbCgxMDApLmNoYW5nZSgpO1xyXG4gICAgICAgIH0pO1xyXG5cclxuICAgICAgICBwbGF5YnRuLnRyaWdnZXIoJ2NsaWNrJyk7XHJcblxyXG4gICAgICAgIHNldEludGVydmFsKGZ1bmN0aW9uKCl7XHJcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKGF1ZGlvcGxheWVyLmdldCgwKS5wYXVzZWQpO1xyXG4gICAgICAgICAgICBjb25zb2xlLmxvZyhzZWxmUGF1c2UpO1xyXG4gICAgICAgICAgICBpZihhdWRpb3BsYXllci5nZXQoMCkucGF1c2VkICYmICFzZWxmUGF1c2UpXHJcbiAgICAgICAgICAgICAgICBhdWRpb3BsYXllci5nZXQoMCkucGxheSgpO1xyXG4gICAgICAgIH0sIDMwMDApXHJcblxyXG5cclxuICAgICAgICBcclxuICAgIH0pO1xyXG4gICAgXHJcblxyXG5cclxuICAgIC8vU2Nyb2xsYmFyXHJcbiAgICAkKGRvY3VtZW50KS5yZWFkeShmdW5jdGlvbigpIHtcclxuICAgICAgICAkKCcjcHJvZ3JhbScpLnBlcmZlY3RTY3JvbGxiYXIoe1xyXG4gICAgICAgICAgICBzdXBwcmVzc1Njcm9sbFg6IHRydWUsXHJcbiAgICAgICAgICAgIHdoZWVsU3BlZWQ6IDAuNSxcclxuICAgICAgICAgICAgd2hlZWxQcm9wYWdhdGlvbjogdHJ1ZVxyXG4gICAgICAgIH0pO1xyXG4gICAgfSk7XHJcblxyXG5cclxuICAgIC8vQmxvY2txdW90ZVxyXG4gICAgJChkb2N1bWVudCkucmVhZHkoZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgJChcIiNibG9ja3F1b3RlIC5vd2wtY2Fyb3VzZWxcIikub3dsQ2Fyb3VzZWwoe1xyXG5cclxuICAgICAgICAgICAgbmF2IDogdHJ1ZSwgLy8gU2hvdyBuZXh0IGFuZCBwcmV2IGJ1dHRvbnNcclxuICAgICAgICAgICAgc2xpZGVTcGVlZCA6IDMwMCxcclxuICAgICAgICAgICAgcGFnaW5hdGlvblNwZWVkIDogNDAwLFxyXG4gICAgICAgICAgICBpdGVtczogMSxcclxuICAgICAgICAgICAgc2luZ2xlSXRlbTogdHJ1ZSxcclxuICAgICAgICAgICAgZG90czogZmFsc2UsXHJcbiAgICAgICAgICAgIGF1dG9wbGF5OiB0cnVlLFxyXG4gICAgICAgICAgICBhdXRvcGxheVRpbWVvdXQ6IDEzMDAwLFxyXG4gICAgICAgICAgICBsb29wOiBmYWxzZSxcclxuICAgICAgICAgICAgbmF2VGV4dDogW1xyXG4gICAgICAgICAgICAgICAgXCI8c3BhbiBjbGFzcz0nZ2x5cGhpY29uIGdseXBoaWNvbi1tZW51LWxlZnQnPjwvc3Bhbj5cIixcclxuICAgICAgICAgICAgICAgIFwiPHNwYW4gY2xhc3M9J2dseXBoaWNvbiBnbHlwaGljb24tbWVudS1yaWdodCc+PC9zcGFuPlwiXVxyXG4gICAgICAgIH0pO1xyXG5cclxuICAgIH0pO1xyXG5cclxuXHJcbiAgICAvL0VmaXIgVXBwZXJcclxuICAgICQoZG9jdW1lbnQpLnJlYWR5KGZ1bmN0aW9uKCkge1xyXG4gICAgICAgIHZhciBzbGlkZXIgPSAkKFwiI2VmaXItdXBwZXIgLm93bC1jYXJvdXNlbFwiKTtcclxuICAgICAgICBzbGlkZXIub3dsQ2Fyb3VzZWwoe1xyXG4gICAgICAgICAgICBzbGlkZVNwZWVkIDogMzAwLFxyXG4gICAgICAgICAgICBwYWdpbmF0aW9uU3BlZWQgOiA0MDAsXHJcbiAgICAgICAgICAgIGl0ZW1zOiBzbGlkZXIuZmluZChcIi5pdGVtXCIpLmxlbmd0aC0xLFxyXG4gICAgICAgICAgICBhdXRvcGxheTogdHJ1ZSxcclxuICAgICAgICAgICAgYXV0b3BsYXlUaW1lb3V0OiA3MDAwLFxyXG4gICAgICAgICAgICBsb29wOiB0cnVlLFxyXG4gICAgICAgICAgICByZXNwb25zaXZlOntcclxuICAgICAgICAgICAgICAgIDA6e1xyXG4gICAgICAgICAgICAgICAgICAgIGl0ZW1zOjFcclxuICAgICAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgICAgICA2NTA6e1xyXG4gICAgICAgICAgICAgICAgICAgIGl0ZW1zOjJcclxuICAgICAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgICAgICA5OTI6e1xyXG4gICAgICAgICAgICAgICAgICAgIGl0ZW1zOjNcclxuICAgICAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgICAgICAxMzAwOntcclxuICAgICAgICAgICAgICAgICAgICBpdGVtczo0XHJcbiAgICAgICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICAgICAgMTYwMDp7XHJcbiAgICAgICAgICAgICAgICAgICAgaXRlbXM6NVxyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfSk7XHJcblxyXG5cclxuICAgIH0pO1xyXG5cclxuICAgIC8vVmlkZW9cclxuICAgICQoZG9jdW1lbnQpLnJlYWR5KGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICQoXCIjdmlkZW8gLm93bC1jYXJvdXNlbFwiKS5vd2xDYXJvdXNlbCh7XHJcbiAgICAgICAgICAgIHNsaWRlU3BlZWQgOiAzMDAsXHJcbiAgICAgICAgICAgIHBhZ2luYXRpb25TcGVlZCA6IDQwMCxcclxuICAgICAgICAgICAgaXRlbXM6IDEsXHJcbiAgICAgICAgICAgIHNpbmdsZUl0ZW06IHRydWUsXHJcbiAgICAgICAgICAgIGRvdHM6IHRydWUsXHJcbiAgICAgICAgICAgIGxvb3A6IHRydWVcclxuICAgICAgICB9KTtcclxuXHJcbiAgICB9KTtcclxuXHJcbiAgICAvL0VmaXIgTG93ZXJcclxuICAgICQoZG9jdW1lbnQpLnJlYWR5KGZ1bmN0aW9uKCkge1xyXG4gICAgICAgIHZhciBzbGlkZXIgPSAkKFwiI2VmaXItbG93ZXIgLm93bC1jYXJvdXNlbFwiKTtcclxuICAgICAgICBzbGlkZXIub3dsQ2Fyb3VzZWwoe1xyXG4gICAgICAgICAgICBzbGlkZVNwZWVkIDogMzAwLFxyXG4gICAgICAgICAgICBwYWdpbmF0aW9uU3BlZWQgOiA0MDAsXHJcbiAgICAgICAgICAgIGl0ZW1zOiBzbGlkZXIuZmluZChcIi5pdGVtXCIpLmxlbmd0aC0xLFxyXG4gICAgICAgICAgICBhdXRvcGxheTogdHJ1ZSxcclxuICAgICAgICAgICAgYXV0b3BsYXlUaW1lb3V0OiA5MDAwLFxyXG4gICAgICAgICAgICBsb29wOiB0cnVlLFxyXG4gICAgICAgICAgICByZXNwb25zaXZlOntcclxuICAgICAgICAgICAgICAgIDA6e1xyXG4gICAgICAgICAgICAgICAgICAgIGl0ZW1zOjFcclxuICAgICAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgICAgICA2NTA6e1xyXG4gICAgICAgICAgICAgICAgICAgIGl0ZW1zOjJcclxuICAgICAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgICAgICA5OTI6e1xyXG4gICAgICAgICAgICAgICAgICAgIGl0ZW1zOjNcclxuICAgICAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgICAgICAxMzAwOntcclxuICAgICAgICAgICAgICAgICAgICBpdGVtczo0XHJcbiAgICAgICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICAgICAgMTYwMDp7XHJcbiAgICAgICAgICAgICAgICAgICAgaXRlbXM6NVxyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfSk7XHJcblxyXG4gICAgfSk7XHJcblxyXG4gICAgLy9TZW5kbWFpbCByZXF1ZXN0IGRlbW9cclxuICAgICQoZG9jdW1lbnQpLnJlYWR5KGZ1bmN0aW9uKCkge1xyXG4gICAgICAgIC8qXHJcbiAgICAgICAgIFJlc3BvbnNlIEpTT04gT2JqZWN0IEVYQU1QTEVcclxuICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgc3RhdHVzOiBcInN1Y2Nlc3NcIiB8fCBcImVycm9yXCJcclxuICAgICAgICAgICAgICAgIHRleHQ6IFwiWW91ciBtZXNzYWdlIGhhcyBiZWVuIGRlbGl2ZXJlZCFcIiB8fCBcIllvdXIgbWVzc2FnZSBoYXMgbm90IGJlZW4gZGVsaXZlcmVkIVwiXHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgKi9cclxuXHJcbiAgICAgICAgdmFyIFVSTCA9IFwic2VuZG1haWwucGhwXCI7XHJcblxyXG4gICAgICAgICQoXCIjc2VuZG1haWxcIikuY2xpY2soZnVuY3Rpb24oKXtcclxuICAgICAgICAgICAgdmFyIGZvcm0gPSAkKFwiI3N1cHBvcnQgZm9ybVwiKTtcclxuICAgICAgICAgICAgJC5wb3N0KFVSTCwge1xyXG4gICAgICAgICAgICAgICAgZGF0YTogZm9ybS5zZXJpYWxpemVBcnJheSgpXHJcbiAgICAgICAgICAgIH0pLmRvbmUoZnVuY3Rpb24ocmVzcG9uc2Upe1xyXG4gICAgICAgICAgICAgICAgcmVzcG9uc2UgPSBKU09OLnBhcnNlKHJlc3BvbnNlKTtcclxuICAgICAgICAgICAgICAgIHZhciBvYmogPSBmb3JtLmZpbmQoXCIuZGVsaXZlcnN0YXR1c1wiKTtcclxuICAgICAgICAgICAgICAgIG9iai50ZXh0KHJlc3BvbnNlLnRleHQpXHJcbiAgICAgICAgICAgICAgICAgICAgLnNob3coKTtcclxuICAgICAgICAgICAgICAgIGlmKHJlc3BvbnNlLnN0YXR1cyAhPSBcInN1Y2Nlc3NcIilcclxuICAgICAgICAgICAgICAgICAgICBvYmouYWRkQ2xhc3MoXCJlcnJvclwiKTtcclxuXHJcbiAgICAgICAgICAgICAgICBzZXRUaW1lb3V0KGZ1bmN0aW9uKCl7XHJcbiAgICAgICAgICAgICAgICAgICAgb2JqLnJlbW92ZUNsYXNzKFwiZXJyb3JcIilcclxuICAgICAgICAgICAgICAgICAgICAgICAgLmhpZGUoKTtcclxuICAgICAgICAgICAgICAgICAgICBmb3JtLmdldCgwKS5yZXNldCgpO1xyXG4gICAgICAgICAgICAgICAgfSwgNTAwMClcclxuICAgICAgICAgICAgICAgIFxyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICB9KTtcclxuXHJcblxyXG4gICAgfSk7XHJcbiAgICBcclxuXHJcbiAgICBcclxuICAgIFxyXG5cclxufSk7Il0sImZpbGUiOiJhcHAuanMiLCJzb3VyY2VSb290IjoiL3NvdXJjZS8ifQ==
