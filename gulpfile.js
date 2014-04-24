var gulp = require('gulp'),
    sass = require('gulp-ruby-sass'),
    autoprefixer = require('gulp-autoprefixer'),
    minifycss = require('gulp-minify-css'),
    jshint = require('gulp-jshint'),
    uglify = require('gulp-uglify'),
    imagemin = require('gulp-imagemin'),
    rename = require('gulp-rename'),
    clean = require('gulp-clean'),
    rjs = require('gulp-requirejs');
    concat = require('gulp-concat'),
    notify = require('gulp-notify'),
    cache = require('gulp-cache'),
    livereload = require('gulp-livereload');

var paths = {
  css: {
    app: 'troposphere/static/css/app/*.css',
    login: 'troposphere/static/css/login/*.css',
    no_user: 'troposphere/static/css/no_user/*.css'
  },
  scripts: ['troposphere/static/js/**'],
  images: ['troposphere/static/images/**'],
};

// Styles
gulp.task('app_styles', function(){
  return gulp.src(paths.css.app)
    .pipe(concat('app.min.css'))
    .pipe(minifycss())
    .pipe(gulp.dest('troposphere/assets/css'))
    .pipe(notify({ message: 'Styles task complete' }));

});

gulp.task('no_user_styles', function(){
  return gulp.src(paths.css.no_user)
    .pipe(concat('no_user.min.css'))
    .pipe(minifycss())
    .pipe(gulp.dest('troposphere/assets/css'))
    .pipe(notify({ message: 'Styles task complete' }));

});

gulp.task('login_styles', function(){
  return gulp.src(paths.css.login)
    .pipe(concat('login.min.css'))
    .pipe(minifycss())
    .pipe(gulp.dest('troposphere/assets/css'))
    .pipe(notify({ message: 'Styles task complete' }));

});

gulp.task('styles', ['app_styles', 'login_styles', 'no_user_styles']);

// Scripts
gulp.task('scripts', ['requirejsBuild'], function(){
  return gulp.src(['troposphere/static/js/analytics.js'])
    .pipe(uglify())
    .pipe(gulp.dest('troposphere/assets/js'))
    .pipe(notify({ message: 'Scripts task complete' }));
});


// RequireJS
gulp.task('requirejsBuild', function() {
  rjs({
        //appDir: 'troposphere/assets/js',
        baseUrl: 'troposphere/static/js',
        out: 'app-require.min.js',
        shim: {
            backbone: {
                deps: ['underscore', 'jquery'],
                exports: 'Backbone'
            },
            underscore: {
                exports: '_'
            },
            bootstrap: {
                deps: ['jquery']
            }
        },
        include: ['main.js'],
        paths: {
          'jquery': '//cdnjs.cloudflare.com/ajax/libs/jquery/2.1.0/jquery',
          'backbone': '//cdnjs.cloudflare.com/ajax/libs/backbone.js/1.1.2/backbone-min',
          'underscore': '//cdnjs.cloudflare.com/ajax/libs/underscore.js/1.6.0/underscore-min',
          'google': 'https://www.google.com/jsapi',
          'bootstrap': '//cdnjs.cloudflare.com/ajax/libs/twitter-bootstrap/3.1.1/js/bootstrap',
          'moment': '//cdnjs.cloudflare.com/ajax/libs/moment.js/2.5.1/moment.min',
          'react': '//cdnjs.cloudflare.com/ajax/libs/react/0.10.0/react',
          'rsvp': '//cdn.jsdelivr.net/rsvp/3.0/rsvp.amd.min'
        }
      })
      .pipe(gulp.dest('troposphere/assets/js'))
      ;//.pipe(notify({ message: 'Require JS Build task complete' }));
});

// Images
gulp.task('images', function(){
  return gulp.src(paths.images)
    .pipe(cache(imagemin({ optimizationLevel: 5, progressive: true, interlaced: true })))
    .pipe(gulp.dest('troposphere/assets/images'))
    .pipe(notify({ message: 'Images build task complete' }));
});

// Clean
gulp.task('clean', function() {
  return gulp.src(['troposphere/assets'], {read: false})
    .pipe(clean({force: true}));
});

// Watch
gulp.task('watch', function() {
  gulp.watch('troposphere/static/css/**', ['styles']);
  gulp.watch('troposphere/static/js/**', ['requirejsBuild']);
  gulp.watch('troposphere/static/images/**', ['images']);

});

gulp.task('default', ['clean'], function(){
  gulp.start('styles','scripts', 'images');
});
