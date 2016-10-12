/**
 * System configuration
 */
(function (global) {
    var root = "//" + (global.location.host || global.location.hostname) + "/";
    System.config({
        defaultJSExtensions: true,
        baseURL: root + 'libs/dashboard/app',
        // map tells the System loader where to look for things
        map: {
            'jquery': root + 'libs/vendor/jquery/dist/jquery.js',
            'bootstrap': root + 'libs/vendor/bootstrap/dist/js/bootstrap.js',
            'notie': root + 'libs/vendor/notie/dist/notie.min.js',
            'owl.carousel': root + 'libs/vendor/owl.carousel/dist/owl.carousel.js',
            'mousewheel': root + 'libs/vendor/jquery-mousewheel/jquery.mousewheel.js',
        },
        // packages tells the System loader how to load when no filename and/or no extension
        packages: {
            // app: {
            //     main: './main.js',
            //     defaultExtension: 'js'
            // },
            jquery: {
                defaultExtension: 'js'
            }
        }
    });
})(this);

System.import('main').catch(function(err){ console.error(err); });

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiIiwic291cmNlcyI6WyJkYXNoYm9hcmQvc3lzdGVtanMuY29uZmlnLmpzIl0sInNvdXJjZXNDb250ZW50IjpbIi8qKlxyXG4gKiBTeXN0ZW0gY29uZmlndXJhdGlvblxyXG4gKi9cclxuKGZ1bmN0aW9uIChnbG9iYWwpIHtcclxuICAgIHZhciByb290ID0gXCIvL1wiICsgKGdsb2JhbC5sb2NhdGlvbi5ob3N0IHx8IGdsb2JhbC5sb2NhdGlvbi5ob3N0bmFtZSkgKyBcIi9cIjtcclxuICAgIFN5c3RlbS5jb25maWcoe1xyXG4gICAgICAgIGRlZmF1bHRKU0V4dGVuc2lvbnM6IHRydWUsXHJcbiAgICAgICAgYmFzZVVSTDogcm9vdCArICdsaWJzL2Rhc2hib2FyZC9hcHAnLFxyXG4gICAgICAgIC8vIG1hcCB0ZWxscyB0aGUgU3lzdGVtIGxvYWRlciB3aGVyZSB0byBsb29rIGZvciB0aGluZ3NcclxuICAgICAgICBtYXA6IHtcclxuICAgICAgICAgICAgJ2pxdWVyeSc6IHJvb3QgKyAnbGlicy92ZW5kb3IvanF1ZXJ5L2Rpc3QvanF1ZXJ5LmpzJyxcclxuICAgICAgICAgICAgJ2Jvb3RzdHJhcCc6IHJvb3QgKyAnbGlicy92ZW5kb3IvYm9vdHN0cmFwL2Rpc3QvanMvYm9vdHN0cmFwLmpzJyxcclxuICAgICAgICAgICAgJ25vdGllJzogcm9vdCArICdsaWJzL3ZlbmRvci9ub3RpZS9kaXN0L25vdGllLm1pbi5qcycsXHJcbiAgICAgICAgICAgICdvd2wuY2Fyb3VzZWwnOiByb290ICsgJ2xpYnMvdmVuZG9yL293bC5jYXJvdXNlbC9kaXN0L293bC5jYXJvdXNlbC5qcycsXHJcbiAgICAgICAgICAgICdtb3VzZXdoZWVsJzogcm9vdCArICdsaWJzL3ZlbmRvci9qcXVlcnktbW91c2V3aGVlbC9qcXVlcnkubW91c2V3aGVlbC5qcycsXHJcbiAgICAgICAgfSxcclxuICAgICAgICAvLyBwYWNrYWdlcyB0ZWxscyB0aGUgU3lzdGVtIGxvYWRlciBob3cgdG8gbG9hZCB3aGVuIG5vIGZpbGVuYW1lIGFuZC9vciBubyBleHRlbnNpb25cclxuICAgICAgICBwYWNrYWdlczoge1xyXG4gICAgICAgICAgICAvLyBhcHA6IHtcclxuICAgICAgICAgICAgLy8gICAgIG1haW46ICcuL21haW4uanMnLFxyXG4gICAgICAgICAgICAvLyAgICAgZGVmYXVsdEV4dGVuc2lvbjogJ2pzJ1xyXG4gICAgICAgICAgICAvLyB9LFxyXG4gICAgICAgICAgICBqcXVlcnk6IHtcclxuICAgICAgICAgICAgICAgIGRlZmF1bHRFeHRlbnNpb246ICdqcydcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgIH0pO1xyXG59KSh0aGlzKTtcclxuXHJcblN5c3RlbS5pbXBvcnQoJ21haW4nKS5jYXRjaChmdW5jdGlvbihlcnIpeyBjb25zb2xlLmVycm9yKGVycik7IH0pO1xyXG4iXSwiZmlsZSI6ImRhc2hib2FyZC9zeXN0ZW1qcy5jb25maWcuanMiLCJzb3VyY2VSb290IjoiL3NvdXJjZS8ifQ==
