var gulp = require('gulp-help')(require('gulp'));
var del = require('del'),
    rename = require('gulp-rename'),
    replace = require('gulp-replace'),
    karma = require('karma'),
    webpack = require('webpack-stream'),
    webpackConfig = require('./webpack.config'),
    webpackTestConfig = require('./webpack.test.config'),
    runSequence = require('run-sequence'),
    argv = require('yargs').argv
    ;

gulp.task('build', 'Build for release', function (done) {
    return runSequence(
        'compile:ts',
        'generatecustomdts',
        done
    )
});

gulp.task('test', 'Run unit tests', function (done) {
    return runSequence(
        'compile:spec',
        'test:spec',
        done
    )
});


gulp.task('compile:ts', 'Compile source files', function () {
    return gulp.src(['typings/**/*.d.ts', './src/**/*.ts'])
        .pipe(webpack(webpackConfig))
        .pipe(gulp.dest('./dist'));
});

gulp.task('compile:spec', 'Compile typescript for tests', function () {
    return gulp.src(['./test/*.spec.ts'])
        .pipe(webpack(webpackTestConfig))
        .pipe(gulp.dest('./tmp'));
});

gulp.task('generatecustomdts', 'Generate dts with no exports', function (done) {
    return gulp.src(['./dist/*.d.ts'])
        .pipe(replace(/export\s/g, ''))
        .pipe(rename(function (path) {
            path.basename = "router-noexports.d";
        }))
        .pipe(gulp.dest('dist/'));
});

gulp.task('test:spec', 'Runs spec tests', function(done) {
    new karma.Server.start({
        configFile: __dirname + '/karma.conf.js',
        singleRun: argv.watch ? false : true,
        captureTimeout: argv.timeout || 20000
    }, done);
});