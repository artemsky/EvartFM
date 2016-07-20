"use strict";
const gulp = require('gulp'),
    cssnano = require('gulp-cssnano'),
    autoprefixer = require('gulp-autoprefixer'),
    uglify = require('gulp-uglify'),
    sourcemaps = require('gulp-sourcemaps'),
    del = require('del'),
    sass = require('gulp-sass'),
    gulpif = require('gulp-if'),
    mainBowerFiles = require('main-bower-files'),
    filter = require('gulp-filter'),
    imagemin = require('gulp-imagemin'),
    flatten = require('gulp-flatten'),
    ttf2woff2 = require('gulp-ttf2woff2'),
    ttf2woff = require('gulp-ttf2woff'),
    ttf2eot = require('gulp-ttf2eot'),
    newer = require('gulp-newer'),
    eslint = require('gulp-eslint'),
    replace = require('gulp-replace-task'),
    sassLint = require('gulp-sass-lint'),
    spritesmith = require("gulp-spritesmith"),
    overrides = require('./boweroverrides.json'),

    dir = {
        src: './resources/assets/',
        release: './public/',
        img: 'img/',
        js: 'js/',
        css: 'css/',
        fonts: 'fonts/',
        scss: 'scss/'
    };

/*******************************************************************
 ******************* Development Mode Setup ************************
 *******************************************************************/

process.env.NODE_ENV = process.env.NODE_ENV ? process.env.NODE_ENV.trim() : 'dev';
var DevMode;
if(!process.env.NODE_ENV || process.env.NODE_ENV == 'development' || process.env.NODE_ENV == 'dev'){
    DevMode = true;
    process.env.NODE_ENV = 'development';
} else{
    DevMode = false;
    process.env.NODE_ENV = 'production';
}

/*******************************************************************
 ******************* Build Tasks ***********************************
 *******************************************************************/

//Clean before build
gulp.task('cls', (done) => {
    del([`${dir.release}/**`]);
    return done();
});

//Copy dependencies
gulp.task('copydeps', () => {
    return gulp.src([`${dir.src}/dependencies/**`, `${dir.src}/dependencies/.htaccess`])
        .pipe(gulp.dest(dir.release));
});

//Copy layouts
gulp.task('layouts', () => {
    return gulp.src(`${dir.src}/layouts/**`)
        .pipe(gulp.dest('./resources/views/'));
});

//Images
gulp.task('images', () => {
    return gulp.src(`${dir.src}/${dir.img}/**/*.*`, {since: gulp.lastRun('images')})
    .pipe(newer(`${dir.release}/${dir.img}`))
    .pipe(imagemin())
    .pipe(gulp.dest(`${dir.release}/${dir.img}`))
});

//Javascript
gulp.task('javascript', () => {
    return gulp.src(`${dir.src}/${dir.js}/**/*.js`, {since: gulp.lastRun('javascript')})
        .pipe(newer(`${dir.release}/${dir.js}`))
        .pipe(eslint())
        .pipe(eslint.format())
        .pipe(gulpif(DevMode, sourcemaps.init()))
        .pipe(gulpif(!DevMode, uglify().on('error', (e)=>{console.log(e.message);})))
        .pipe(gulpif(DevMode, sourcemaps.write()))
        .pipe(gulp.dest(`${dir.release}/${dir.js}`))
});

//Fonts
gulp.task('fonts', () => {
return gulp.src(`${dir.src}/${dir.fonts}/**/*.ttf`, {since: gulp.lastRun('fonts')})
    .pipe(newer(dir.release + dir.fonts))
    .pipe(ttf2eot({clone:true}))
    .pipe(ttf2woff({clone:true}))
    .pipe(ttf2woff2({clone:true}))
    .pipe(gulp.dest(dir.release + dir.fonts));
});


//Copy bower dependencies
gulp.task('bower', () => {
    const jsFilter = filter('**/*.js', {restore: true}),
    styleFilter = filter('**/*.css', {restore: true}),
    imageFilter = filter('**/*.{jpg,jpeg,png}', {restore: true}),
    fontFilter = filter('**/*.{eot,ttf,woff,woff2}');

    return gulp.src(mainBowerFiles({ "overrides": overrides }), { cwd: './bower_components' })
        //Javascript
        .pipe(jsFilter)
        .pipe(newer(`${dir.release+dir.js}`))
        .pipe(gulp.dest(`${dir.release+dir.js}`))
        .pipe(jsFilter.restore)
        //CSS
        .pipe(styleFilter)
        .pipe(newer(`${dir.release+dir.css}`))
        .pipe(gulp.dest(`${dir.release+dir.css}`))
        .pipe(styleFilter.restore)
        //Img
        .pipe(imageFilter)
        .pipe(newer(`${dir.release+dir.img}`))
        .pipe(gulp.dest(`${dir.release+dir.img}`))
        .pipe(imageFilter.restore)
        //Fonts
        .pipe(fontFilter)
        .pipe(newer(`${dir.release+dir.fonts}`))
        .pipe(gulp.dest(`${dir.release+dir.fonts}`))


});


//Compile Styles
gulp.task('styles', () => {
    return gulp.src('*.scss', {cwd: dir.src + dir.scss})
        .pipe(sassLint())
        .pipe(gulpif(DevMode, sourcemaps.init()))
        .pipe(sass().on('error', sass.logError))
        .pipe(autoprefixer({
            browsers: ['> 5%', 'last 10 Chrome versions', 'Firefox > 20'],
            cascade: false
        }))
        .pipe(gulpif(!DevMode, cssnano()))
        .pipe(gulpif(DevMode, sourcemaps.write()))
        .pipe(gulp.dest(`${dir.release}/${dir.css}`));
});

//Lint js
gulp.task('eslint', function () {
    return gulp.src(`${dir.src}/js/**/*.js`)
        .pipe(eslint())
        .pipe(eslint.format())
        .pipe(eslint.failAfterError());
});

//Lint scss
gulp.task('scsslint', function () {
    return gulp.src(`${dir.src}/scss/**/*.scss`)
        .pipe(sassLint())
        .pipe(sassLint.format())
        .pipe(sassLint.failOnError())
});

//Make Sprite
gulp.task('sprite', function () {
    return  gulp.src(`${dir.src}/psd/assets/sprite/*.png`)
        .pipe(spritesmith({
            imgName: 'sprite.png',
            styleName: 'sprite.scss',
            imgPath: 'sprite.png',
            padding: 10
        }))
        .pipe(gulp.dest(`${dir.src}/psd/assets/sprite/result`));
});

gulp.task('minreplace', function () {
    return gulp.src('**/*.blade.php', {cwd: `${dir.src}/layouts/` })
        .pipe(gulpif(!DevMode, replace({
            patterns: [
                {
                    match: /(\w+)(\.js|\.css)/g,
                    replacement: function (match) {
                        if(match.includes("min.")) return match;
                        match = match.trim();
                        let to = match.lastIndexOf(".");
                        return match.includes(".js") ? match.substring(0, to).concat(".min.js") : match.substring(0, to).concat(".min.css");
                    }
                }
            ]
        })))
        .pipe(gulp.dest('./resources/views/'));
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

gulp.task('setProd', (done) =>{
    process.env.NODE_ENV = 'production';
    return done();
});
gulp.task('setDev', (done) =>{
    process.env.NODE_ENV = 'development';
    return done();
});

gulp.task('default', gulp.series("setDev", "cls", 'minreplace', gulp.parallel('bower', 'copydeps', 'images', 'styles', 'javascript', 'fonts', 'eslint')));
gulp.task('prod', gulp.series("setProd", "cls", 'minreplace', gulp.parallel('bower', 'copydeps', 'images', 'styles', 'javascript', 'fonts', 'eslint')));
