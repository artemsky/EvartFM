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
