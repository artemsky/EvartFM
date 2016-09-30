"use strict";
const gulp = require('gulp'),
    $ = require('gulp-load-plugins')({
        pattern: ['gulp-*', 'gulp.*', 'main-*']
    }),

    dir = {
        src: './resources/assets/',
        build: './public/',
        img: 'img/',
        libs: 'libs/',
        js: 'js/',
        css: 'css/',
        fonts: 'fonts/',
        scss: 'scss/',
        vendor: 'libs/vendor'
    },
    filename = {
        vendorCss: "vendor.min.css",
        vendorJs: "vendor.min.js"
    },
    AUTOPREFIXER_BROWSERS = [
        'ie >= 10',
        'ie_mob >= 10',
        'ff >= 30',
        'chrome >= 34',
        'safari >= 7',
        'opera >= 23',
        'ios >= 7',
        'android >= 4.4',
        'bb >= 10'
    ],
    overrides = require('./boweroverrides.json');


/*******************************************************************
 ******************* Development Mode Setup ************************
 *******************************************************************/

process.env.NODE_ENV = process.env.NODE_ENV ? process.env.NODE_ENV.trim() : 'dev';
var DevMode, Lint = false;
if(!process.env.NODE_ENV || process.env.NODE_ENV == 'development' || process.env.NODE_ENV == 'dev'){
    DevMode = true;
    process.env.NODE_ENV = 'development';
} else{
    DevMode = false;
    process.env.NODE_ENV = 'production';
}

gulp.task('setProd', (done) =>{
    DevMode = false;
    process.env.NODE_ENV = 'production';
    return done();
});


gulp.task('setDev', (done) =>{
    DevMode = true;
    process.env.NODE_ENV = 'development';
    return done();
});

/*******************************************************************
 ******************* Build Tasks ***********************************
 *******************************************************************/

//Clean before build
gulp.task('cls', (done) => {
    require('del')(`${dir.build}/**`);
    return done();
});

//Copy dependencies
gulp.task('copydeps', () => {
    return gulp.src([`${dir.src}/dependencies/**`, `${dir.src}/dependencies/.htaccess`])
        .pipe(gulp.dest(dir.build));
});

//Copy layouts
gulp.task('layouts', () => {
    return gulp.src(`${dir.src}/layouts/**`)
        .pipe(gulp.dest('./resources/views/'));
});

gulp.task('images', () => {
    return gulp.src(`${dir.src}/${dir.img}/**/*.*`, {since: gulp.lastRun('images')})
        .pipe($.newer(`${dir.build}/${dir.img}`))
        .pipe($.imagemin())
        .pipe(gulp.dest(`${dir.build}/${dir.img}`))
});

//Javascript
gulp.task('javascript', () => {
    return gulp.src(`${dir.src}js/**/*.js`, {since: gulp.lastRun('javascript')})
        .pipe($.newer(`${dir.build}/${dir.libs}`))
        .pipe($.if(Lint, $.eslint()))
        .pipe($.if(Lint, $.eslint.format()))
        .pipe($.if(DevMode, $.sourcemaps.init()))
        .pipe($.if(!DevMode, $.uglify().on('error', (e)=>{console.log(e.message);})))
        .pipe($.if(DevMode, $.sourcemaps.write()))
        .pipe(gulp.dest(`${dir.build}/${dir.libs}`))
});

//Fonts
gulp.task('fonts', () => {
    return gulp.src(`${dir.src}/${dir.fonts}/**/*.ttf`, {since: gulp.lastRun('fonts')})
        .pipe($.newer(dir.build + dir.fonts))
        .pipe($.ttf2eot({clone:true}))
        .pipe($.ttf2woff({clone:true}))
        .pipe($.ttf2woff2({clone:true}))
        .pipe(gulp.dest(dir.build + dir.fonts));
});


//Copy bower dependencies
gulp.task('bower', () => {
    const css = $.filter('**/*.css', {restore: true});
    const js = $.filter('**/*.js', {restore: true});
    const img = $.filter('**/*.{png,jpg,bmp,ico,gif}', {restore: true});
    const font = $.filter('**/*.{ttf,eot,woff,woff2,svg}');

    if(DevMode)
        return gulp.src($.mainBowerFiles({ "overrides": overrides}), { base: './bower_components' })
            .pipe(gulp.dest(dir.build+dir.vendor));

    return gulp.src($.mainBowerFiles({ "overrides": overrides}))
        .pipe(css)
        .pipe($.cssUrls((url) => {
            var prepend = '';
            if(url.includes("font")
                || url.includes(".eot")
                || url.includes(".woff")
                || url.includes(".ttf"))
                prepend = dir.fonts;
            else
                prepend = dir.img;
            return prepend + url.substring(url.lastIndexOf('/')+1);

        }))
        .pipe($.concat(filename.vendorCss))
        .pipe($.cssnano())
        .pipe(gulp.dest(`${dir.build}/${dir.vendor}`))
        .pipe(css.restore)
        .pipe(js)
        .pipe($.concat(filename.vendorJs))
        .pipe($.if(!DevMode, $.uglify().on('error', (e)=>{console.log(e.message);})))
        .pipe(gulp.dest(`${dir.build}/${dir.vendor}`))
        .pipe(js.restore)
        .pipe(img)
        .pipe(gulp.dest(`${dir.build}/${dir.vendor}/${dir.img}`))
        .pipe(img.restore)
        .pipe(font)
        .pipe(gulp.dest(`${dir.build}/${dir.vendor}/${dir.fonts}`));

});


//Compile Styles
gulp.task('styles', () => {
    return gulp.src('**/*.scss', {cwd: dir.src + dir.scss})
    // .pipe($.if(DevMode, $.sourcemaps.init()))
        .pipe($.sass().on('error', $.sass.logError))
        .pipe($.if(Lint, $.sassLint()))
        .pipe($.if(Lint, $.sassLint.format()))
        .pipe($.autoprefixer({
            browsers: AUTOPREFIXER_BROWSERS,
            cascade: false
        }))
        .pipe($.if(!DevMode, $.cssnano()))
        // .pipe($.if(DevMode, $.sourcemaps.write()))
        .pipe(gulp.dest(dir.build + dir.libs));
});



/*******************************************************************
 ******************* Global Tasks **********************************
 ********************************************************************/

gulp.task('watch', () =>{
    gulp.watch(`${dir.src}/scss/**/*.*`, gulp.series('styles'));
    gulp.watch(`${dir.src}/dependencies/**/*.*`, gulp.series('copydeps'));
    gulp.watch(`${dir.src}/${dir.img}/**/*.*`, gulp.series('images'));
    gulp.watch(`${dir.src}/${dir.js}/**/*.*`, gulp.series('javascript'));
    gulp.watch(`${dir.src}/${dir.fonts}/**/*.*`, gulp.series('fonts'));
    gulp.watch(`${dir.src}/layouts/**/*.*`, gulp.series('layouts'));
    gulp.watch('./bower_components/**/*.*', gulp.series('bower'));
});


gulp.task('default', gulp.series("setDev", 'bower', gulp.parallel('copydeps', 'styles', 'images', 'javascript', 'fonts')));
gulp.task('prod', gulp.series("setProd", "cls", 'bower', gulp.parallel('copydeps', 'styles', 'images', 'javascript', 'fonts')));
