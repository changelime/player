var gulp = require("gulp");
var gulp_jspm = require("gulp-jspm"); 
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
<<<<<<< 97d48691f9fbaee4a84888ec67f9c036831600c6

=======
// gulp.task("js", function() {
//   return gulp.src("lib/js/app.js")
//     .pipe(gulp_jspm({selfExecutingBundle: true})) // `jspm bundle-sfx main`
//     .pipe(minify())
//     .pipe(gulp.dest("dest/js"));
// });
>>>>>>> update
gulp.task("html", function() {
  return gulp.src("index.html")
    .pipe(processhtml())
    .pipe(gulp.dest("dest"));
});

<<<<<<< 97d48691f9fbaee4a84888ec67f9c036831600c6
=======
// gulp.task("built", ["style", "fonts", "js", "html"]);
>>>>>>> update
gulp.task("built", ["style", "fonts", "html"]);