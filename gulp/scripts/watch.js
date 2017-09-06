var child_process = require('child_process'),
    fs = require('fs');

var run_script = function () {
    child_process.spawn('node', [
        './node_modules/gulp/bin/gulp.js', 'watch'
    ].concat(process.argv.slice(2)), {
        stdio: 'inherit'
    });
};

fs.access('./node_modules', function (error) {
    if (error) {
        var Spinner = require('../miscellanea/cli-spinner').Spinner,
            spinner = new Spinner('%s fetching dependencies: .. ');
        var npm_install = child_process.spawn('npm', [
            'install'
        ]);
        npm_install.on('close', function () {
            spinner.stop(true);
            run_script();
        });
        spinner.start();
    } else {
        run_script();
    }
});
