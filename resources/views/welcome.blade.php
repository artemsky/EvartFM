<!DOCTYPE html>
<html>
    <head>
        <title>Laravel</title>
        {{--<link href="https://maxcdn.bootstrapcdn.com/bootstrap/3.3.6/css/bootstrap.min.css" rel="stylesheet" integrity="sha384-1q8mTJOASx8j1Au+a5WDVnPi2lkFfwwEAa8hDDdjZlpLegxhjVME1fgjWPGmkzs7" crossorigin="anonymous">--}}
        {{--<script src="https://ajax.googleapis.com/ajax/libs/jquery/2.2.4/jquery.min.js"></script>--}}
        {{--<script src="https://maxcdn.bootstrapcdn.com/bootstrap/3.3.6/js/bootstrap.min.js" integrity="sha384-0mSbJDEHialfmuBBQP6A4Qrprq5OVfW37PRR3j5ELqxss1yVqOtnepnHVP9aJ7xS" crossorigin="anonymous"></script>--}}
        <script>
            (function () {
                function loadResources(options){
                    var head = document.getElementsByTagName('head')[0],
                        CSS = "css",
                        JAVASCRIPT = "js";

                    if(!options) return;

                    function callback(cb, resource){
                        if (this.readyState) {
                            resource.onreadystatechange = function () {
                                if (resource.readyState == "loaded" || resource.readyState == "complete") {
                                    resource.onreadystatechange = null;
                                    cb();
                                }
                            };
                        } else {
                            resource.onload = function () {
                                console.log("Loaded: ", resource.hasAttribute("href") ? resource.href : resource.src);
                            };
                            resource.onerror = function(){
                                head.removeChild(resource);
                                cb();
                                console.log("Error: ", resource);
                            };
                        }
                    }

                    function load(resource, type){
                        if(!resource.loadTry)
                            resource.loadTry = 1;
                        else if(resource.loadTry > 3)
                            return false;
                        var element = type != JAVASCRIPT ? true : false;
                        var target = document.createElement(element ? "link" : "script");
                        target.type = element ? "text/css" : "text/javascript";
                        if(element){
                            target.rel = 'stylesheet';
                            target.media = resource.media || 'all';
                        }

                        callback(function(){
                            resource.cdn = resource.local;
                            resource.loadTry++;
                            loadCss(resource);
                        }, target);

                        if(element)
                            target.href = resource.cdn;
                        else
                            target.src = resource.cdn;

                        head.appendChild(target);
                    }

                    if(options.css)
                        for(var style in options.css)
                            load(options.css[style], CSS);

                    if(options.js)
                        for(var script in options.js)
                            load(options.js[script], JAVASCRIPT);
                }



                loadResources({
                    css: [
                        {
                            cdn: "https://maxcdn.bootstrapcdn.com/bootstrap/3.3.6/css/bootstrap.min.css",
                            local: "https://maxcdn.bootstrapcdn.com/bootstrap/3.3.6/css/bootstrap.min.css"
                        }
                    ],
                    js: [
                        {
                            cdn: "https://maxcdn.bootstrapcdn.com/bootstrap/3.3.6/js/bootstrap.min.js",
                            local: "https://maxcdn.bootstrapcdn.com/bootstrap/3.3.6/js/bootstrap.mi1n.js"
                        }
                    ]
                });


            })();
        </script>
    </head>
    <body>
        <div class="container">
            <div class="content">
                <div class="title">Laravel 5</div>
            </div>
        </div>
    </body>
</html>
