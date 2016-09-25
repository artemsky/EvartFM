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
        var switchbtn = player.find(".switch input");
        var liveframe = '<iframe id="liveplayer" src="https://mixlr.com/users/5218043/embed?color=1c4563&autoplay=true" style="display:block" width="400px" height="146px" scrolling="no" frameborder="no" marginheight="0" marginwidth="0"></iframe>';
        var audiolabel = $(".audioplayer .tablecell:first .tablerow");

        var playerAction = function(){
            if($(this).hasClass("glyphicon-play")){
                $(this).removeClass("glyphicon-play").addClass("glyphicon-pause");
                audioplayer.get(0).play();
            } else {
                $(this).removeClass("glyphicon-pause").addClass("glyphicon-play");
                audioplayer.get(0).pause();
            }
        };
        var switchAction = function(){
            if($(this).is(":checked")){
                audiolabel.hide();
                audioplayer.get(0).pause();
                playbtn.removeClass("glyphicon-pause").addClass("glyphicon-play");
                audiolabel.parent().append(liveframe);
                return true;
            }
            else{
                audiolabel.show();
                audioplayer.get(0).play();
                playbtn.removeClass("glyphicon-play").addClass("glyphicon-pause");
                audiolabel.parent().find("#liveplayer").remove();
                return false;
            }
        };
        var rangeslider = player.find('input[type="range"]').rangeslider({
            polyfill: false,

            // Callback function
            onInit: function() {
                switchAction.call(switchbtn);
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


        switchbtn.change(switchAction);

        
    });
    
    //Program
    $(function(){
        var list = $("#program .nav");
        var now = new Date;
        var timezone = +3;
        var currentTime = {
            hours: now.getUTCHours() + timezone,
            minutes: now.getUTCMinutes()
        };

        var listParser = function(){
            var timeList = list.find("li time");
            var newList = [];

            var replaceItem = function($that){
                var newLi = $that.clone();
                newLi.appendTo(list);
                newLi.find(".num .glyphicon").removeClass("glyphicon-triangle-top").addClass("glyphicon-minus")
                $that.remove();

            };

            timeList.each(function(i, $this){
                var time = $($this).text().split(":");
                var thisListTime = {
                    hours: parseInt(time[0]),
                    minutes: parseInt(time[1])
                };


                if(thisListTime.hours < currentTime.hours){
                        newList.push($(this).parent());
                }else if(thisListTime.hours === currentTime.hours){
                    if(thisListTime.minutes < currentTime.minutes){
                        newList.push($(this).parent());
                    }
                }else{
                    if(!newList.length) {
                        var tmp = timeList.last().parent().clone();
                        tmp.find(".num .glyphicon").removeClass("glyphicon-triangle-top").addClass("glyphicon-triangle-right");
                        timeList.last().parent().parent().prepend(tmp);
                        timeList.last().parent().remove();
                        return false;
                    }
                    for(var item = 0; item < newList.length-1; item++)
                        replaceItem(newList[item]);
                    newList[item].find(".num .glyphicon").removeClass("glyphicon-triangle-top").addClass("glyphicon-triangle-right");
                    $("#player .song .name").text(newList[item].find(".text h6").text());
                    return false;
                }
            })
        };
        listParser();
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