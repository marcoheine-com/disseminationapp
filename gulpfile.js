const gulp = require('gulp');
const sass = require('gulp-sass');

//  Compiles Sass to CSS
gulp.task('sass', () => {
  return gulp.src('assets/sass/**/*.scss')
    .pipe(sass().on('error', sass.logError))
    .pipe(gulp.dest('assets/css'));
});