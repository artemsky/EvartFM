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
            if(audioplayer.get(0).paused && !selfPause)
                audioplayer.get(0).load();
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiIiwic291cmNlcyI6WyJhcHAuanMiXSwic291cmNlc0NvbnRlbnQiOlsialF1ZXJ5KGZ1bmN0aW9uKCQpIHtcbiAgICAndXNlIHN0cmljdCc7XG4gICAgXG4gICAgLy9NYWluIHNsaWRlclxuICAgICQoZG9jdW1lbnQpLnJlYWR5KGZ1bmN0aW9uKCkge1xuICAgICAgICAkKFwiI21haW4tc2xpZGVyIC5vd2wtY2Fyb3VzZWxcIikub3dsQ2Fyb3VzZWwoe1xuXG4gICAgICAgICAgICBuYXYgOiB0cnVlLCAvLyBTaG93IG5leHQgYW5kIHByZXYgYnV0dG9uc1xuICAgICAgICAgICAgc2xpZGVTcGVlZCA6IDMwMCxcbiAgICAgICAgICAgIHBhZ2luYXRpb25TcGVlZCA6IDQwMCxcbiAgICAgICAgICAgIGl0ZW1zOiAxLFxuICAgICAgICAgICAgc2luZ2xlSXRlbTogdHJ1ZSxcbiAgICAgICAgICAgIGRvdHM6IHRydWUsXG4gICAgICAgICAgICBhdXRvcGxheTogdHJ1ZSxcbiAgICAgICAgICAgIGF1dG9wbGF5VGltZW91dDogNTAwMCxcbiAgICAgICAgICAgIGxvb3A6IHRydWUsXG4gICAgICAgICAgICBhbmltYXRlT3V0OiAnb3dsLWZhZGVVcC1vdXQnLFxuICAgICAgICAgICAgYW5pbWF0ZUluOiAnb3dsLWZhZGUtaW4nLFxuICAgICAgICAgICAgbmF2VGV4dDogW1xuICAgICAgICAgICAgICAgIFwiPHNwYW4gY2xhc3M9J2dseXBoaWNvbiBnbHlwaGljb24tbWVudS1sZWZ0Jz48L3NwYW4+XCIsXG4gICAgICAgICAgICAgICAgXCI8c3BhbiBjbGFzcz0nZ2x5cGhpY29uIGdseXBoaWNvbi1tZW51LXJpZ2h0Jz48L3NwYW4+XCJdLFxuICAgICAgICAgICAgcmVzcG9uc2l2ZTp7XG4gICAgICAgICAgICAgICAgMDp7XG4gICAgICAgICAgICAgICAgICAgbmF2OiBmYWxzZVxuICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICA5OTI6e1xuICAgICAgICAgICAgICAgICAgIG5hdiA6IHRydWVcbiAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfSk7XG5cbiAgICB9KTtcblxuICAgIC8vUmFuZ2VzbGlkZXIuanMgQXVkaW8gUGxheWVyXG4gICAgJChkb2N1bWVudCkucmVhZHkoZnVuY3Rpb24oKSB7XG4gICAgICAgIHZhciBwbGF5ZXIgPSAkKFwiI3BsYXllclwiKTtcbiAgICAgICAgdmFyIGF1ZGlvcGxheWVyID0gJChcIiNldmFydHBsYXllclwiKTtcbiAgICAgICAgdmFyIHBsYXlidG4gPSBwbGF5ZXIuZmluZChcIi5hdWRpb3BsYXllciAudGFibGVjZWxsLnBsYXkgc3BhblwiKTtcbiAgICAgICAgdmFyIHNlbGZQYXVzZSA9IGZhbHNlO1xuXG5cbiAgICAgICAgdmFyIHBsYXllckFjdGlvbiA9IGZ1bmN0aW9uKCl7XG4gICAgICAgICAgICBpZigkKHRoaXMpLmhhc0NsYXNzKFwiZ2x5cGhpY29uLXBsYXlcIikpe1xuICAgICAgICAgICAgICAgICQodGhpcykucmVtb3ZlQ2xhc3MoXCJnbHlwaGljb24tcGxheVwiKS5hZGRDbGFzcyhcImdseXBoaWNvbi1wYXVzZVwiKTtcbiAgICAgICAgICAgICAgICBhdWRpb3BsYXllci5nZXQoMCkucGxheSgpO1xuICAgICAgICAgICAgICAgIHNlbGZQYXVzZSA9IGZhbHNlO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAkKHRoaXMpLnJlbW92ZUNsYXNzKFwiZ2x5cGhpY29uLXBhdXNlXCIpLmFkZENsYXNzKFwiZ2x5cGhpY29uLXBsYXlcIik7XG4gICAgICAgICAgICAgICAgYXVkaW9wbGF5ZXIuZ2V0KDApLnBhdXNlKCk7XG4gICAgICAgICAgICAgICAgc2VsZlBhdXNlID0gdHJ1ZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfTtcblxuICAgICAgICB2YXIgcmFuZ2VzbGlkZXIgPSBwbGF5ZXIuZmluZCgnaW5wdXRbdHlwZT1cInJhbmdlXCJdJykucmFuZ2VzbGlkZXIoe1xuICAgICAgICAgICAgcG9seWZpbGw6IGZhbHNlLFxuXG4gICAgICAgICAgICAvLyBDYWxsYmFjayBmdW5jdGlvblxuICAgICAgICAgICAgb25Jbml0OiBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgICAgICBhdWRpb3BsYXllci5nZXQoMCkudm9sdW1lID0gLjU7XG4gICAgICAgICAgICAgICAgcGxheWJ0bi5jbGljayhwbGF5ZXJBY3Rpb24pO1xuICAgICAgICAgICAgfSxcblxuICAgICAgICAgICAgLy8gQ2FsbGJhY2sgZnVuY3Rpb25cbiAgICAgICAgICAgIG9uU2xpZGU6IGZ1bmN0aW9uKHBvc2l0aW9uLCB2YWx1ZSkge1xuICAgICAgICAgICAgICAgIGF1ZGlvcGxheWVyLmdldCgwKS52b2x1bWUgPSB2YWx1ZS8xMDA7XG4gICAgICAgICAgICB9LFxuXG4gICAgICAgICAgICAvLyBDYWxsYmFjayBmdW5jdGlvblxuICAgICAgICAgICAgb25TbGlkZUVuZDogZnVuY3Rpb24ocG9zaXRpb24sIHZhbHVlKSB7fVxuICAgICAgICB9KTtcbiAgICAgICAgcGxheWVyLmZpbmQoXCIudm9sdW1lLWRvd25cIikuY2xpY2soZnVuY3Rpb24oKXtcbiAgICAgICAgICAgIHJhbmdlc2xpZGVyLnZhbCgwKS5jaGFuZ2UoKTtcbiAgICAgICAgfSk7XG4gICAgICAgIHBsYXllci5maW5kKFwiLnZvbHVtZS11cFwiKS5jbGljayhmdW5jdGlvbigpe1xuICAgICAgICAgICAgcmFuZ2VzbGlkZXIudmFsKDEwMCkuY2hhbmdlKCk7XG4gICAgICAgIH0pO1xuXG4gICAgICAgIHBsYXlidG4udHJpZ2dlcignY2xpY2snKTtcblxuICAgICAgICBzZXRJbnRlcnZhbChmdW5jdGlvbigpe1xuICAgICAgICAgICAgaWYoYXVkaW9wbGF5ZXIuZ2V0KDApLnBhdXNlZCAmJiAhc2VsZlBhdXNlKVxuICAgICAgICAgICAgICAgIGF1ZGlvcGxheWVyLmdldCgwKS5sb2FkKCk7XG4gICAgICAgICAgICAgICAgYXVkaW9wbGF5ZXIuZ2V0KDApLnBsYXkoKTtcbiAgICAgICAgfSwgMzAwMClcblxuXG4gICAgICAgIFxuICAgIH0pO1xuICAgIFxuXG5cbiAgICAvL1Njcm9sbGJhclxuICAgICQoZG9jdW1lbnQpLnJlYWR5KGZ1bmN0aW9uKCkge1xuICAgICAgICAkKCcjcHJvZ3JhbScpLnBlcmZlY3RTY3JvbGxiYXIoe1xuICAgICAgICAgICAgc3VwcHJlc3NTY3JvbGxYOiB0cnVlLFxuICAgICAgICAgICAgd2hlZWxTcGVlZDogMC41LFxuICAgICAgICAgICAgd2hlZWxQcm9wYWdhdGlvbjogdHJ1ZVxuICAgICAgICB9KTtcbiAgICB9KTtcblxuXG4gICAgLy9CbG9ja3F1b3RlXG4gICAgJChkb2N1bWVudCkucmVhZHkoZnVuY3Rpb24oKSB7XG4gICAgICAgICQoXCIjYmxvY2txdW90ZSAub3dsLWNhcm91c2VsXCIpLm93bENhcm91c2VsKHtcblxuICAgICAgICAgICAgbmF2IDogdHJ1ZSwgLy8gU2hvdyBuZXh0IGFuZCBwcmV2IGJ1dHRvbnNcbiAgICAgICAgICAgIHNsaWRlU3BlZWQgOiAzMDAsXG4gICAgICAgICAgICBwYWdpbmF0aW9uU3BlZWQgOiA0MDAsXG4gICAgICAgICAgICBpdGVtczogMSxcbiAgICAgICAgICAgIHNpbmdsZUl0ZW06IHRydWUsXG4gICAgICAgICAgICBkb3RzOiBmYWxzZSxcbiAgICAgICAgICAgIGF1dG9wbGF5OiB0cnVlLFxuICAgICAgICAgICAgYXV0b3BsYXlUaW1lb3V0OiAxMzAwMCxcbiAgICAgICAgICAgIGxvb3A6IGZhbHNlLFxuICAgICAgICAgICAgbmF2VGV4dDogW1xuICAgICAgICAgICAgICAgIFwiPHNwYW4gY2xhc3M9J2dseXBoaWNvbiBnbHlwaGljb24tbWVudS1sZWZ0Jz48L3NwYW4+XCIsXG4gICAgICAgICAgICAgICAgXCI8c3BhbiBjbGFzcz0nZ2x5cGhpY29uIGdseXBoaWNvbi1tZW51LXJpZ2h0Jz48L3NwYW4+XCJdXG4gICAgICAgIH0pO1xuXG4gICAgfSk7XG5cblxuICAgIC8vRWZpciBVcHBlclxuICAgICQoZG9jdW1lbnQpLnJlYWR5KGZ1bmN0aW9uKCkge1xuICAgICAgICB2YXIgc2xpZGVyID0gJChcIiNlZmlyLXVwcGVyIC5vd2wtY2Fyb3VzZWxcIik7XG4gICAgICAgIHNsaWRlci5vd2xDYXJvdXNlbCh7XG4gICAgICAgICAgICBzbGlkZVNwZWVkIDogMzAwLFxuICAgICAgICAgICAgcGFnaW5hdGlvblNwZWVkIDogNDAwLFxuICAgICAgICAgICAgaXRlbXM6IHNsaWRlci5maW5kKFwiLml0ZW1cIikubGVuZ3RoLTEsXG4gICAgICAgICAgICBhdXRvcGxheTogdHJ1ZSxcbiAgICAgICAgICAgIGF1dG9wbGF5VGltZW91dDogNzAwMCxcbiAgICAgICAgICAgIGxvb3A6IHRydWUsXG4gICAgICAgICAgICByZXNwb25zaXZlOntcbiAgICAgICAgICAgICAgICAwOntcbiAgICAgICAgICAgICAgICAgICAgaXRlbXM6MVxuICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgNjUwOntcbiAgICAgICAgICAgICAgICAgICAgaXRlbXM6MlxuICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgOTkyOntcbiAgICAgICAgICAgICAgICAgICAgaXRlbXM6M1xuICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgMTMwMDp7XG4gICAgICAgICAgICAgICAgICAgIGl0ZW1zOjRcbiAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgIDE2MDA6e1xuICAgICAgICAgICAgICAgICAgICBpdGVtczo1XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9KTtcblxuXG4gICAgfSk7XG5cbiAgICAvL1ZpZGVvXG4gICAgJChkb2N1bWVudCkucmVhZHkoZnVuY3Rpb24oKSB7XG4gICAgICAgICQoXCIjdmlkZW8gLm93bC1jYXJvdXNlbFwiKS5vd2xDYXJvdXNlbCh7XG4gICAgICAgICAgICBzbGlkZVNwZWVkIDogMzAwLFxuICAgICAgICAgICAgcGFnaW5hdGlvblNwZWVkIDogNDAwLFxuICAgICAgICAgICAgaXRlbXM6IDEsXG4gICAgICAgICAgICBzaW5nbGVJdGVtOiB0cnVlLFxuICAgICAgICAgICAgZG90czogdHJ1ZSxcbiAgICAgICAgICAgIGxvb3A6IHRydWVcbiAgICAgICAgfSk7XG5cbiAgICB9KTtcblxuICAgIC8vRWZpciBMb3dlclxuICAgICQoZG9jdW1lbnQpLnJlYWR5KGZ1bmN0aW9uKCkge1xuICAgICAgICB2YXIgc2xpZGVyID0gJChcIiNlZmlyLWxvd2VyIC5vd2wtY2Fyb3VzZWxcIik7XG4gICAgICAgIHNsaWRlci5vd2xDYXJvdXNlbCh7XG4gICAgICAgICAgICBzbGlkZVNwZWVkIDogMzAwLFxuICAgICAgICAgICAgcGFnaW5hdGlvblNwZWVkIDogNDAwLFxuICAgICAgICAgICAgaXRlbXM6IHNsaWRlci5maW5kKFwiLml0ZW1cIikubGVuZ3RoLTEsXG4gICAgICAgICAgICBhdXRvcGxheTogdHJ1ZSxcbiAgICAgICAgICAgIGF1dG9wbGF5VGltZW91dDogOTAwMCxcbiAgICAgICAgICAgIGxvb3A6IHRydWUsXG4gICAgICAgICAgICByZXNwb25zaXZlOntcbiAgICAgICAgICAgICAgICAwOntcbiAgICAgICAgICAgICAgICAgICAgaXRlbXM6MVxuICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgNjUwOntcbiAgICAgICAgICAgICAgICAgICAgaXRlbXM6MlxuICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgOTkyOntcbiAgICAgICAgICAgICAgICAgICAgaXRlbXM6M1xuICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgMTMwMDp7XG4gICAgICAgICAgICAgICAgICAgIGl0ZW1zOjRcbiAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgIDE2MDA6e1xuICAgICAgICAgICAgICAgICAgICBpdGVtczo1XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9KTtcblxuICAgIH0pO1xuXG4gICAgLy9TZW5kbWFpbCByZXF1ZXN0IGRlbW9cbiAgICAkKGRvY3VtZW50KS5yZWFkeShmdW5jdGlvbigpIHtcbiAgICAgICAgLypcbiAgICAgICAgIFJlc3BvbnNlIEpTT04gT2JqZWN0IEVYQU1QTEVcbiAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICBzdGF0dXM6IFwic3VjY2Vzc1wiIHx8IFwiZXJyb3JcIlxuICAgICAgICAgICAgICAgIHRleHQ6IFwiWW91ciBtZXNzYWdlIGhhcyBiZWVuIGRlbGl2ZXJlZCFcIiB8fCBcIllvdXIgbWVzc2FnZSBoYXMgbm90IGJlZW4gZGVsaXZlcmVkIVwiXG4gICAgICAgICAgICB9XG4gICAgICAgICAqL1xuXG4gICAgICAgIHZhciBVUkwgPSBcInNlbmRtYWlsLnBocFwiO1xuXG4gICAgICAgICQoXCIjc2VuZG1haWxcIikuY2xpY2soZnVuY3Rpb24oKXtcbiAgICAgICAgICAgIHZhciBmb3JtID0gJChcIiNzdXBwb3J0IGZvcm1cIik7XG4gICAgICAgICAgICAkLnBvc3QoVVJMLCB7XG4gICAgICAgICAgICAgICAgZGF0YTogZm9ybS5zZXJpYWxpemVBcnJheSgpXG4gICAgICAgICAgICB9KS5kb25lKGZ1bmN0aW9uKHJlc3BvbnNlKXtcbiAgICAgICAgICAgICAgICByZXNwb25zZSA9IEpTT04ucGFyc2UocmVzcG9uc2UpO1xuICAgICAgICAgICAgICAgIHZhciBvYmogPSBmb3JtLmZpbmQoXCIuZGVsaXZlcnN0YXR1c1wiKTtcbiAgICAgICAgICAgICAgICBvYmoudGV4dChyZXNwb25zZS50ZXh0KVxuICAgICAgICAgICAgICAgICAgICAuc2hvdygpO1xuICAgICAgICAgICAgICAgIGlmKHJlc3BvbnNlLnN0YXR1cyAhPSBcInN1Y2Nlc3NcIilcbiAgICAgICAgICAgICAgICAgICAgb2JqLmFkZENsYXNzKFwiZXJyb3JcIik7XG5cbiAgICAgICAgICAgICAgICBzZXRUaW1lb3V0KGZ1bmN0aW9uKCl7XG4gICAgICAgICAgICAgICAgICAgIG9iai5yZW1vdmVDbGFzcyhcImVycm9yXCIpXG4gICAgICAgICAgICAgICAgICAgICAgICAuaGlkZSgpO1xuICAgICAgICAgICAgICAgICAgICBmb3JtLmdldCgwKS5yZXNldCgpO1xuICAgICAgICAgICAgICAgIH0sIDUwMDApXG4gICAgICAgICAgICAgICAgXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfSk7XG5cblxuICAgIH0pO1xuICAgIFxuXG4gICAgXG4gICAgXG5cbn0pOyJdLCJmaWxlIjoiYXBwLmpzIiwic291cmNlUm9vdCI6Ii9zb3VyY2UvIn0=
