var grunt = require('grunt'),
    prodDirectory = './build';

function normalizeTemplateUrl(url) {
    return url.replace('./src', '/static');
}

function normalizeAppCacheModule(module, script) {
    var result =
        "define([" +
        "    'angular'" +
        "], function(angular) {" +
        "    'use strict';" +
        "    angular.module('" + module + "', []).run(['$templateCache', function($templateCache) {" + script + "}]);" +
        "});";
    return result;
}

require('load-grunt-tasks')(grunt);
grunt.loadNpmTasks('grunt-angular-templates');
grunt.initConfig({
    eslint: {
        target: [
            'src/back/**/*.js',
            'src/cfg/**/*.js',
            'src/js/v0.2/**/*.js',
            'src/js/*.js',
            'test/**/*.js',
            'bin/*.js'
        ]
    },
    ngtemplates: {
        'app-cache': {
            src: './src/js/v0.2/components/**/*.html',
            dest: './src/js/v0.2/components/app-cache.js',
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
                compress: true
            },
            files: {
                'src/style/style.css': 'src/style/style.less'
            }
        },
        prod: {
            options: {
                compress: true
            },
            files: {
                'build/style.css': 'src/style/style.less'
            }
        }
    }
});

grunt.registerTask('html2js', ['ngtemplates']);
grunt.registerTask('less', ['less']);
