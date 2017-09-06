var pkg = require('../../package.js'),
    fs = require('fs'),
    url = require('url');

var assert = require('assert'),
    lodash = require('lodash'),
    request = require('request');
var gulp = require('gulp'),
    gulp_util = require('gulp-util');

gulp.task('upload', ['build'], function () {
    var host = process.env.DZM_STORE_HOST,
        user = process.env.DZM_STORE_USER,
        pass = process.env.DZM_STORE_PASS;

    if (pkg.dizmo && pkg.dizmo.store) {
        host = host || pkg.dizmo.store.host;
        user = user || pkg.dizmo.store.user;
        pass = pass || pkg.dizmo.store.pass;
    }

    var argv = require('yargs')
        .default('host', host)
        .default('user', user)
        .default('pass', pass)
        .default('publish', null)
        .argv;

    if (!argv.host) {
        gulp_util.log(gulp_util.colors.yellow.bold(
            'Upload: DZM_STORE_HOST, package.json:dizmo.store.host or ' +
            '`--host` required!'
        ));
        return;
    }
    if (!argv.user && argv.user !== '') {
        gulp_util.log(gulp_util.colors.yellow.bold(
            'Upload: DZM_STORE_USER, package.json:dizmo.store.user or ' +
            '`--user` required!'
        ));
        return;
    }
    if (!argv.pass && argv.pass !== '') {
        gulp_util.log(gulp_util.colors.yellow.bold(
            'Upload: DZM_STORE_PASS, package.json:dizmo.store.pass or ' +
            '`--pass` required!'
        ));
        return;
    }
    if (!pkg ||
        !pkg.dizmo ||
        !pkg.dizmo.settings ||
        !pkg.dizmo.settings['category'])
    {
        gulp_util.log(gulp_util.colors.yellow.bold(
            'Upload: package.json:dizmo.settings.category required, ' +
            'e.g. "tools"!'
        ));
        return;
    }

    var dzm_name = '{0}-{1}.dzm'
        .replace('{0}', pkg.name)
        .replace('{1}', pkg.version);

    var do_login = function () {
        request.post(argv.host + '/v1/oauth/login',
            {
                body: JSON.stringify({
                    username: argv.user, password: argv.pass
                }),
                headers:{
                    'Content-Type': 'application/json'
                }
            }, on_login
        );
    };

    var on_login = function (err, res, body) {
        if (!err && res.statusCode === 200) {
            var set_cookies = res.headers['set-cookie'];
            assert(set_cookies, '"Set-Cookie" header required');
            var set_cookie = set_cookies[0];
            assert(set_cookie, '"Set-Cookie" header empty');
            var session = set_cookie.split(';')[0];
            assert(session, '"Set-Cookie" header invalid');

            if (argv.publish === true) {
                publish_dizmo(session);
            } else {
                post_dizmo(session);
            }
        } else {
            on_error_login.apply(this, arguments);
        }
    };

    var post_dizmo = function (session) {
        if (argv.publish === true) {
            publish_dizmo(session);
        } else {
            request.post(argv.host + '/v1/dizmo',
                {
                    formData: {
                        file: fs.createReadStream('build/' + dzm_name)
                    },
                    headers:{
                        'Cookie': session
                    }
                }, function (err, res) {
                    if (!err && res.statusCode === 201) {
                        gulp_util.log(gulp_util.colors.green.bold(
                            'Upload: transmission to {0} succeeded.'
                                .replace('{0}', argv.host)
                        ));
                        publish_dizmo(session);
                    } else {
                        put_dizmo(session);
                    }
                }
            );
        }
    };

    var put_dizmo = function (session) {
        if (argv.publish === true) {
            publish_dizmo(session);
        } else {
            request.put(argv.host + '/v1/dizmo/{0}'
                    .replace('{0}', pkg.dizmo.settings['bundle-identifier']),
                {
                    formData: {
                        file: fs.createReadStream('build/' + dzm_name)
                    },
                    headers:{
                        'Cookie': session
                    }
                }, function (err, res) {
                    if (!err && res.statusCode === 200) {
                        gulp_util.log(gulp_util.colors.green.bold(
                            'Upload: transmission to {0} succeeded.'
                                .replace('{0}', argv.host)
                        ));
                        publish_dizmo(session);
                    } else {
                        on_error_upload.apply(this, arguments);
                    }
                }
            );
        }
    };

    var publish_dizmo = function (session) {
        if (argv.publish !== false) {
            request.put(argv.host + '/v1/dizmo/{0}/publish/{1}'
                    .replace('{0}', pkg.dizmo.settings['bundle-identifier'])
                    .replace('{1}', pkg.version),
                {
                    body: JSON.stringify({
                        publish: true
                    }),
                    headers:{
                        'Content-Type': 'application/json',
                        'Cookie': session
                    }
                }, function (err, res) {
                    if (!err && res.statusCode === 200) {
                        gulp_util.log(gulp_util.colors.green.bold(
                            'Upload: publication of {0} succeeded.'
                                .replace('{0}', dzm_name)
                        ));
                    } else {
                        on_error_publish.apply(this, arguments);
                    }
                }
            );
        }
    };

    var on_error_login = function () {
        gulp_util.log(gulp_util.colors.yellow.bold(
            'Upload: sign-in to {0} failed!'.replace('{0}', argv.host)
        ));
        on_error.apply(this, arguments);
    };

    var on_error_upload = function () {
        gulp_util.log(gulp_util.colors.yellow.bold(
            'Upload: transmission to {0} failed!'
                .replace('{0}', argv.host)
        ));
        on_error.apply(this, arguments);
    };

    var on_error_publish = function () {
        gulp_util.log(gulp_util.colors.yellow.bold(
            'Upload: publication of {0} failed!'
                .replace('{0}', dzm_name)
        ));
        on_error.apply(this, arguments);
    };

    var on_error = function (err, res, body) {
        if (err) {
            console.log(err, res.toJSON());
        } else if (body) {
            try {
                var json = JSON.parse(body);
                if (json.errormessage && json.errornumber) {
                    gulp_util.log(gulp_util.colors.yellow.bold('{0} [{1}]'
                        .replace('{0}', json.errormessage)
                        .replace('{1}', json.errornumber)
                    ));
                } else {
                    gulp_util.log(gulp_util.colors.yellow.bold(
                        JSON.stringify(json, null, 4)
                    ));
                }
            } catch (ex) {
                console.log(res.toJSON());
            }
        } else {
            console.log(res.toJSON());
        }
    };

    do_login();
});
