var gulp = require("gulp");
var minify = require("gulp-minify");
var concatCss = require('gulp-concat-css');
var processhtml = require("gulp-processhtml");

gulp.task("style", function() {
  return gulp.src("src/css/*.css")
    .pipe(concatCss("bundle.css"))
    .pipe(gulp.dest("dest/css"));
});
gulp.task("fonts", function() {
  return gulp.src("src/fonts/*")
    .pipe(gulp.dest("dest/fonts"));
});

gulp.task("html", function() {
  return gulp.src("index.html")
    .pipe(processhtml())
    .pipe(gulp.dest("dest"));
});

gulp.task("built", ["style", "fonts", "html"]);