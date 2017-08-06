var grunt = require('grunt');
var PRODUCTION_SRC_DIRECTORY = 'build';
var path = require('path');

function normalizeTemplateUrl(url) {
    return url.replace('./client', '/static');
}

function normalizeAppCacheModule(module, script) {
    var result = [
        'define([',
        '    \'angular\'',
        '], function(angular) {',
        '    \'use strict\';',
        '    angular.module(\'',
        module,
        '\', []).run([\'$templateCache\', function($templateCache) {',
        script,
        '}]);',
        '});'
    ].join('');
    return result;
}

require('app-module-path').addPath(path.resolve(__dirname, './'));

require('load-grunt-tasks')(grunt);
grunt.initConfig({
    eslint: {
        target: [
            'client/**/*.js',
            'server/**/*.js',
            'bin/*.js'
        ]
    },
    ngtemplates: {
        'app-cache': {
            src: './client/js/v0.2/components/**/*.html',
            dest: './client/js/v0.2/components/app-cache.js',
            options: {
                url: normalizeTemplateUrl,
                bootstrap: normalizeAppCacheModule,
                standalone: true,
                htmlmin: {
                    collapseBooleanAttributes: true,
                    collapseWhitespace: true,
                    removeComments: true
                }
            }
        }
    },
    less: {
        dev: {
            options: {
                paths: ['client/style/'],
                compress: true
            },
            files: {
                'client/style/style.css': 'client/style/style.less'
            }
        },
        prod: {
            options: {
                paths: ['client/style/'],
                compress: true
            },
            files: {
                [PRODUCTION_SRC_DIRECTORY + '/style/style.css']: 'client/style/style.less'
            }
        }
    },
    karma: {
        unit: {
            configFile: 'karma.conf.js'
        }
    },
    mochaTest: {
        test: {
            options: {
                reporter: 'spec',
                captureFile: 'results.txt', // Optionally capture the reporter output to a file
                quiet: false, // Optionally suppress output to standard out (defaults to false)
                clearRequireCache: false, // Optionally clear the require cache before running tests (defaults to false)
                noFail: false // Optionally set to not fail on failed tests (will still fail on other errors)
            },
            src: ['test/server/**/*.js']
        }
    }
});

grunt.registerTask('html2js', ['ngtemplates']);
grunt.registerTask('mocha', ['mochaTest']);
