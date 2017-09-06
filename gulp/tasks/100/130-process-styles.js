var pkg = require('../../package.js'),
    path = require('path');

var gulp = require('gulp'),
    gulp_copy = require('gulp-copy'),
    gulp_sass = require('gulp-sass'),
    gulp_sourcemaps = require('gulp-sourcemaps'),
    extend = require('xtend');

gulp.task('process-styles:copy', function () {
    return gulp.src(['src/style/**/*', '!src/style/**/*.scss'])
        .pipe(gulp_copy(path.join('build', pkg.name, 'style'), {
            prefix: 2
        }));
});
gulp.task('process-styles', ['process-styles:copy'], function () {
    var cli_min = require('yargs')
        .default('minify')
        .argv.minify;

    var sourcemaps = false, sass = {
        outputStyle: cli_min === true ? 'compressed' : 'expanded'
    };

    if (pkg.dizmo && pkg.dizmo.build) {
        var cfg_min = pkg.dizmo.build.minify;
        if (cfg_min) {
            var cfg_ss = cfg_min.styles !== undefined ? cfg_min.styles : {};
            if (cfg_ss) {
                if (cfg_ss.sourcemaps) // by default w/o a source-map!
                {
                    sourcemaps = extend({loadMaps: true}, cfg_ss.sourcemaps);
                }
                if (cli_min === undefined && (
                    cfg_ss.sass || cfg_ss.sass === undefined))
                {
                    sass = extend({outputStyle: 'compressed'}, cfg_ss.sass);
                }
            }
        }
    }

    var argv = require('yargs')
        .default('sourcemaps', sourcemaps)
        .default('sass', sass).argv;

    if (typeof argv.sourcemaps === 'string') {
        argv.sourcemaps = JSON.parse(argv.sourcemaps);
    }
    if (typeof argv.sass === 'string') {
        argv.sass = JSON.parse(argv.sass);
    }
    if (typeof argv.sass === 'boolean') {
        argv.sass = {
            outputStyle: argv.sass === true ? 'compressed' : 'expanded'
        };
    }

    var bundle = gulp.src('src/style/**/*.scss');
    if (argv.sourcemaps) {
        bundle = bundle.pipe(gulp_sourcemaps.init(
            extend({loadMaps: true}, argv.sourcemaps)
        ));
    }
    if (argv.sass || argv.sass === undefined) {
        bundle = bundle.pipe(gulp_sass.apply(
            this, [extend({outputStyle: 'compressed'}, argv.sass)]
        ).on('error', gulp_sass.logError));
    }
    if (argv.sourcemaps) {
        bundle = bundle.pipe(gulp_sourcemaps.write('./'));
    }
    return bundle
        .pipe(gulp.dest(path.join('build', pkg.name, 'style')));
});
