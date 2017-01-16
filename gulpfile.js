// Dependencies
var   livereload = require('connect-livereload'),
	         del = require('del'),
	     express = require('express'),
	        gulp = require('gulp'),
    autoprefixer = require('gulp-autoprefixer'),
        imagemin = require('gulp-imagemin'),
	    pngquant = require('imagemin-pngquant'),
	      minify = require('gulp-minify-css'),
	      concat = require('gulp-concat'),
	       cache = require('gulp-cache'),
	      rename = require('gulp-rename'),
	        sass = require('gulp-sass'),
	       shell = require('gulp-shell'),
	      uglify = require('gulp-uglify'),
	       gutil = require('gulp-util'),
	      tinylr = require('tiny-lr');

// Variables
var express_port = 8888,
	express_root = __dirname + '/dist/',
			  lr = void 0,
	     lr_port = 35729,

			dist = {
				stat: "dist/",
				css: "dist/css/",
				js: "dist/js/",
				img: "dist/img/",
				overlord: "dist/**/*.{js,html,css}"
			},
			 src = {
				stat: [
					"src/*.html",
					"src/*.ico",
					"src/video/*.*"
				],
				sass: "src/sass/base.scss",
				js: [
					"src/js/app.js"
				],
				img: "src/img/**/*.*"
			};

// Clean
gulp.task('clean', function(cb) {
    del([dist.stat], cb);
});

// Server
gulp.task('serve', function(event) {
	// Server start console message
	gutil.log.apply(gutil, [
		gutil.colors.black.bgCyan(' (ಠ_ಠ) The overlord is serving your site on http://localhost:' + express_port + ' ')
	]);

	var app;
	app = express();
	app.use(livereload());
	app.use(express.static(express_root));
	app.listen(express_port);

	lr = tinylr();
	lr.listen(lr_port, function() {
		gutil.log.apply(gutil, [
			gutil.colors.black.bgCyan(' (ಠ_ಠ) The overlord is watching you on port ' + lr_port + ' ')
		]);
	})
});

// Reload
var refresh = function(event) {
	var fileName;
	fileName = require('path').relative(express_root, event.path);

	gutil.log.apply(gutil, [
		gutil.colors.black.bgCyan(' (ಠ_ಠ) '),
		gutil.colors.magenta(fileName),
		gutil.colors.cyan('changed')
	]);

	return lr.changed({
		body: {
			files: [fileName]
		}
	});
};

// SASS
gulp.task("sass", function(event) {
	return gulp.src(src.sass)
	.pipe(sass({ outputStyle: 'nested' }))
	.pipe(autoprefixer('last 2 version', 'safari 5', 'ie 8', 'ie 9', 'opera 12.1', 'ios 6', 'android 4'))
    .pipe(minify())
    .pipe(rename({ suffix: '.min' }))
	.pipe(gulp.dest(dist.css));
});

// Javascript
gulp.task('js', function(event) {
    return gulp.src(src.js)
    .pipe(concat('app.js'))
    .pipe(rename({ suffix: '.min' }))
    .pipe(uglify())
    .pipe(gulp.dest(dist.js));
});

// Images
gulp.task('img', function(event) {
    return gulp.src(src.img)
    .pipe(cache(
    	imagemin({
    		optimizationLevel: 3,
    		progressive: true,
    		interlaced: true,
    		svgoPlugins: [{
    			removeViewBox: false
    		}],
    		use: [
    			pngquant()
			]
		})))
    .pipe(gulp.dest(dist.img));
});

// Static files
gulp.task('copy', function() {
  return gulp.src(src.stat, {base: 'src/'})
    .pipe(gulp.dest(dist.stat))
});

// Watch
gulp.task("watch", function() {
	gulp.watch(src.sass, ["sass"]);
	gulp.watch(src.js, ["js"]);
	gulp.watch(src.img, ["img"]);
	gulp.watch(src.stat, ["copy"]);
	gulp.watch(dist.overlord, refresh);
});

//Browser
gulp.task('browser', shell.task(['open http://localhost:8888']));

// Default task
gulp.task("default", ["serve", "sass", "js", "img", "copy", "watch", "browser"]);

// Deploy gh-pages
var gulp = require('gulp');
var ghPages = require('gulp-gh-pages');

gulp.task('deploy', function() {
  return gulp.src('./dist/**/*')
    .pipe(ghPages());
});
