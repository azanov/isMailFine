var
	gulp = require('gulp'),
	gutil = require('gulp-util'),
	uglify = require('gulp-uglify'),
	rename = require('gulp-rename'),
	jscs = require('gulp-jscs'),
	jshint = require('gulp-jshint'),
	stylish = require('jshint-stylish'),
	mocha = require('gulp-mocha');

require('mocha-clean');

gulp.task('uglify', function () {
	gulp.src(['emailValidator.js'])
		.pipe(uglify({preserveComments: 'some'}))
		.pipe(rename({suffix: '.min'}))
		.pipe(gulp.dest('./'));
});

gulp.task('jscs', function () {
	gulp.src(['jquery.csssr.validation.js'])
		.pipe(jscs().on('error', function (error) {
			gutil.log(error.message);

			this.emit('end');
		}));
});

gulp.task('jshint', function () {
	gulp.src(['emailValidator.js'])
		.pipe(jshint())
		.pipe(jshint.reporter('jshint-stylish'));
});

gulp.task('watch', function () {
	gulp.watch('emailValidator.js', ['default']);
});

gulp.task('test', function () {
	return gulp.src('./tests/*.js', { read: false })
		.pipe(
			mocha({
				reporter: 'nyan',
				debug: false
			})
		)
});

gulp.task('default', [
	'uglify',
	'jscs',
	'jshint',
	'test'
]);
