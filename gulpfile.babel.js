require('dotenv').config()
const gulp = require('gulp')
const del = require('del')
const fs = require('fs')
const runSequence = require('run-sequence')
const util = require('gulp-util')
const rollup = require('rollup').rollup
const commonjs = require('rollup-plugin-commonjs')
const babel = require('rollup-plugin-babel')
const nodeResolve = require('rollup-plugin-node-resolve')
const connect = require('gulp-connect')
const bump = require('gulp-bump')
const git = require('gulp-git')
const conventionalGithubReleaser = require('conventional-github-releaser')
const uglify = require('gulp-uglify')
const rename = require("gulp-rename")
const mocha = require('gulp-mocha')

require('mocha-clean');

gulp.task('uglify', function() {
  gulp.src('dist/index.js')
    .pipe(uglify())
    .pipe(rename(function (path) {
		path.basename = "emailValidator.min";
		return path;
	}))
    .pipe(gulp.dest('dist'))
});

// Configs for all tasks
// Comments are just examples how to add posible configurations to the tasks
const rollupConf = {
  entry: 'src/emailValidator.js',
  plugins: [
    nodeResolve({ jsnext: true }),
    babel(),
    commonjs({
      //include: 'node_modules/**'
    })
   ]
}

//CommonJS, suitable for Node and Browserify/Webpack format
const umdBundleConf = {
  format: 'umd',
  moduleName: 'isValidEmail',
  dest: 'dist/index.js'
}

gulp.task('build:umd', () => rollup(rollupConf).then((bundle) => bundle.write(umdBundleConf)))
gulp.task('clean', () => del(['dist']) )

gulp.task('default', ['clean'], () => (
	runSequence(
		[
			'build:umd'
		],
		'uglify'
	)
));
