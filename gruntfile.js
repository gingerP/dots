var grunt = require('grunt'),
    PRODUCTION_SRC_DIRECTORY = 'build';

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
    }
});

grunt.registerTask('html2js', ['ngtemplates']);
