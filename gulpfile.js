// Include gulp
var gulp = require('gulp');
var uglify = require('gulp-uglify');
var rename = require('gulp-rename');
var minifyCSS = require('gulp-minify-css');
var removeCode = require('gulp-remove-code');
var inject = require('gulp-inject');
var sourcemaps = require('gulp-sourcemaps');
var concat = require('gulp-concat');
var minifyhtml = require('gulp-minify-html');
var stripDebug = require('gulp-strip-debug');
var stripComments = require('gulp-strip-comments');
var ghPages = require('gulp-gh-pages');


// paths to files
var paths =  {
    scripts: ['src/js/data.js', 'src/js/app.js'],
    styles: ['src/css/style2.css'],
    content: ['src/index.html'],
    markers: ['src/markers/*.png'],
    injectFiles: ['src/js/lib/min/knockout-3.3.0.js', 'src/js/lib/min/jquery-2.1.4.min.js']
};


// move js/lib/min files to dist folder. Order may be important
gulp.task('minFiles', function() {
    return gulp.src(paths.injectFiles)
    .pipe(gulp.dest('./dist/js/lib/min'));
});

// move markers files to dist folder
gulp.task('markers', function() {
    return gulp.src(paths.markers)
    .pipe(gulp.dest('./dist/markers'));
});

// minify css and output to dist/css/*.css
gulp.task('styles', function() {
    return gulp.src(paths.styles)
    .pipe(minifyCSS())
    .pipe(gulp.dest('./dist/css'));
});

// concat and minify js files and output them to dist/js/app.js
gulp.task('scripts', function() {
    return gulp.src(paths.scripts)
        .pipe(stripDebug())
        .pipe(stripComments())
        .pipe(uglify())
        .pipe(concat('app.js'))
        .pipe(gulp.dest('./dist/js'));
});


// inject minified js filenames into index.html
// minify and copy index.html to dist folder
// place-data.html remains only in src, not in dist
gulp.task('index', function() {
    var target = gulp.src('./src/index.html');
    var sources = gulp.src('./src/js/lib/min/*.js', {
        read: false
    });

    return target
    .pipe(inject(sources, {

        // Do not add a root slash to the beginning of the path
        addRootSlash: false,

        // Remove the 'dist' from the path when injecting
        ignorePath: 'src/'
    }))
    // remove code that links to place-data.html page and unminified js
    .pipe(removeCode({ distribution: true }))
    .pipe(minifyhtml({
        empty: true,
        quotes: true
    }))
    .pipe(gulp.dest('dist'));
});

// put up dist folder on gh-pages
gulp.task('deploy', function() {
  return gulp.src('./dist/**/*')
    .pipe(ghPages());
});

// run using "gulp watch". Is not in default list
gulp.task('watch', function() {
    // watch minfiles
    gulp.watch('src/js/lib/min/*.js', ['minfiles']);

    // watch markers
    gulp.watch('src/markers', ['markers']);

    // watch styles
    gulp.watch('src/css/style2.css', ['styles']);

    // watch .js files
    gulp.watch('src/js/*.js', ['scripts']);

    // watch index files
    gulp.watch('src/index.html', ['index']);
});

// NOTE: You need to run "gulp watch" independently -- see above
gulp.task('default', [ 'index', 'styles', 'scripts', 'minFiles', 'markers', 'deploy']);
