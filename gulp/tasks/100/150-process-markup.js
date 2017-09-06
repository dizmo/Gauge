var pkg = require('../../package.js'),
    path = require('path'),
    extend = require('xtend');
var gulp = require('gulp'),
    gulp_htmlmin = require('gulp-htmlmin');

gulp.task('process-markup', function () {
    var cli_min = require('yargs')
        .default('minify')
        .argv.minify;

    var htmlmin = cli_min === true;

    if (pkg.dizmo && pkg.dizmo.build) {
        var cfg_min = pkg.dizmo.build.minify;
        if (cfg_min) {
            var cfg_ms = cfg_min.markups !== undefined ? cfg_min.markups : {};
            if (cfg_ms) {
                if (cli_min === undefined && (
                    cfg_ms.htmlmin || cfg_ms.htmlmin === undefined))
                {
                    htmlmin = extend({
                        collapseWhitespace: true,
                        minifyCSS: true,
                        minifyJS: true,
                        removeComments: true
                    }, cfg_ms.htmlmin);
                }
            }
        }
    }

    var argv = require('yargs')
        .default('htmlmin', htmlmin).argv;

    if (typeof argv.htmlmin === 'string') {
        argv.htmlmin = JSON.parse(argv.htmlmin);
    }

    var bundle = gulp.src('src/**/*.html');
    if (argv.htmlmin) {
        bundle = bundle.pipe(gulp_htmlmin.apply(
            this, [extend({
                collapseWhitespace: true,
                minifyCSS: true,
                minifyJS: true,
                removeComments: true
            }, argv.htmlmin)]
        ));
    }
    return bundle
        .pipe(gulp.dest(path.join('build', pkg.name)));
});
