const gulp = require('gulp'),
    del = require('del'),
    concat = require("gulp-concat"),
    cleanCSS = require('gulp-clean-css'),
    htmlmin = require('gulp-htmlmin'),
    uglify = require('gulp-uglify'),
    less = require('gulp-less'),
    rename = require("gulp-rename"),
    runSequence = require('run-sequence'),
    htmlreplace = require('gulp-html-replace');

gulp.task('clean', function () {
    del(['dist']);
    del(['src/components']);
});

gulp.task('copy', function () {
    gulp.src(['src/assets/json/**'])
        .pipe(gulp.dest('dist/assets/json/'));
    gulp.src(['src/components/material-design-iconic-font/dist/fonts/**'])
        .pipe(gulp.dest('dist/assets/fonts/'));
    gulp.src(['src/components/weui/dist/style/weui.min.css'])
        .pipe(gulp.dest('dist/assets/styles/'));
    return gulp.src(['src/assets/images/**'])
        .pipe(gulp.dest('dist/assets/images/'));
});

gulp.task('less', function () {
    return gulp.src('src/assets/styles/*.less')
        .pipe(less())
        .pipe(gulp.dest('src/assets/styles/'));
});

gulp.task('cssmin', function () {

    //union login
    gulp.src(['src/assets/styles/login.union.css'])
        .pipe(cleanCSS({keepSpecialComments: 0}))
        .pipe(gulp.dest('dist/assets/styles/'));

    //open
    gulp.src(['src/components/material-design-iconic-font/dist/css/material-design-iconic-font.min.css',
        'src/components/google-material-color/dist/palette.css',
        'src/components/bootstrap-sweetalert/dist/sweetalert.css',
        'src/assets/styles/open.css'])
        .pipe(concat('open.css'))
        .pipe(cleanCSS({keepSpecialComments: 0}))
        .pipe(gulp.dest('dist/assets/styles/'));

    //preference
    gulp.src(['src/components/material-design-iconic-font/dist/css/material-design-iconic-font.min.css',
        'src/components/waves/dist/waves.min.css',
        'src/components/croppie/croppie.css',
        'src/assets/styles/preference.css'])
        .pipe(concat('preference.index.mini.css'))
        .pipe(cleanCSS({keepSpecialComments: 0}))
        .pipe(gulp.dest('dist/assets/styles/'));

    //pwd forget password and register
    return gulp.src(['src/components/animate.css/animate.min.css',
        'src/components/google-material-color/dist/palette.css',
        'src/components/material-design-iconic-font/dist/css/material-design-iconic-font.min.css',
        'src/assets/styles/pwd.css'])
        .pipe(concat('pwd.css'))
        .pipe(cleanCSS({keepSpecialComments: 0}))
        .pipe(gulp.dest('dist/assets/styles/'));
});

gulp.task('jsmin', function () {

    //uion login
    gulp.src(['src/components/jquery/dist/jquery.min.js',
        'src/components/mustache/mustache.min.js',
        'src/assets/scripts/login.union.js'])
        .pipe(concat('login.union.js'))
        .pipe(uglify())
        .pipe(gulp.dest('dist/assets/scripts/'));


    gulp.src(['src/assets/scripts/page-loader.js'])
        .pipe(uglify())
        .pipe(gulp.dest('dist/assets/scripts/'));

    //open.apps
    gulp.src(['src/components/bootstrap-validator/dist/validator.min.js',
        'src/components/remarkable-bootstrap-notify/dist/bootstrap-notify.min.js',
        'src/components/bootstrap-sweetalert/dist/sweetalert.js',
        'src/components/moment/min/moment.min.js',
        'src/components/moment/locale/zh-cn.js',
        'src/assets/scripts/open.apps.js'])
        .pipe(concat('open.apps.js'))
        .pipe(uglify())
        .pipe(gulp.dest('dist/assets/scripts/'));

    //open
    gulp.src(['src/components/jquery/dist/jquery.min.js',
        'src/components/bootstrap/dist/js/bootstrap.min.js',
        'src/assets/scripts/app.js',
        'src/components/mustache/mustache.min.js',
        'src/assets/scripts/open.docs.js',
        'src/assets/scripts/search.js'])
        .pipe(concat('open.js'))
        .pipe(uglify())
        .pipe(gulp.dest('dist/assets/scripts/'));

    //preference
    gulp.src(['src/components/jquery/dist/jquery.min.js',
        'src/components/bootstrap/dist/js/bootstrap.min.js',
        'src/components/moment/min/moment.min.js',
        'src/components/jquery-mask-plugin/dist/jquery.mask.min.js',
        'src/components/waves/dist/waves.min.js',
        'src/components/croppie/croppie.min.js',
        'src/components/bootpag/lib/jquery.bootpag.min.js',
        'src/components/remarkable-bootstrap-notify/dist/bootstrap-notify.min.js',
        'src/components/mustache/mustache.min.js',
        'src/components/ua-parser-js/dist/ua-parser.min.js',
        'src/components/bootstrap-validator/dist/validator.min.js',
        'src/components/jQuery.print/jQuery.print.js',
        'src/assets/scripts/arale-qrcode.min.js',
        'src/assets/scripts/datepicker.js',
        'src/assets/scripts/preference.js'])
        .pipe(concat('preference.index.mini.js'))
        .pipe(uglify())
        .pipe(gulp.dest('dist/assets/scripts/'));

    gulp.src(['src/assets/scripts/*.index.js'])
        .pipe(htmlreplace({
            js: {
                src: null,
                tpl:"addTag('script', {src: 'assets/scripts/%f.mini.js'}, sync);"
            },
            css: {
                src: null,
                tpl:"addTag('link', {rel: 'stylesheet', href: 'assets/styles/%f.mini.css', type: 'text/css'});"
            }
        }))
        .pipe(uglify())
        .pipe(gulp.dest('dist/assets/scripts/'));

    //login.code
    gulp.src(['src/assets/scripts/arale-qrcode.min.js'])
        .pipe(gulp.dest('dist/assets/scripts/'));

    //pwd forget password and register
    return gulp.src(['src/components/jquery/dist/jquery.min.js',
        'src/components/bootstrap/dist/js/bootstrap.min.js',
        'src/components/Waves/dist/waves.min.js',
        'src/components/bootstrap-validator/dist/validator.min.js',
        'src/assets/scripts/app.js',
        'src/assets/scripts/pwd.js'])
        .pipe(concat('pwd.js'))
        .pipe(uglify())
        .pipe(gulp.dest('dist/assets/scripts/'));
});


gulp.task('htmlmin', function () {
    var options = {
        collapseWhitespace: true,
        collapseBooleanAttributes: true,
        removeEmptyAttributes: true,
        removeScriptTypeAttributes: true,
        removeStyleLinkTypeAttributes: true,
        removeComments: true,
        minifyJS: true,
        minifyCSS: true
    };

    return gulp.src(['src/*.html'])
        .pipe(htmlreplace({
            js: {
                src: null,
                tpl:'<script src="assets/scripts/%f.js"></script>'
            },
            css: {
                src: null,
                tpl:'<link href="assets/styles/%f.css" rel="stylesheet">'
            },
            open_js: {
                src: null,
                tpl:'<script src="assets/scripts/open.js"></script>'
            },
            open_css: {
                src: null,
                tpl:'<link href="assets/styles/open.css" rel="stylesheet">'
            },
            weui: {
                src: null,
                tpl:'<link href="assets/styles/weui.min.css" rel="stylesheet">'
            }
        }))
        .pipe(htmlmin(options))
        .pipe(gulp.dest('dist/'));

});

gulp.task('default', ['copy', 'less', 'cssmin', 'jsmin', 'htmlmin']);
