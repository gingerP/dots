var grunt = require('grunt');
require('load-grunt-tasks')(grunt); // npm install --save-dev load-grunt-tasks

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
    }
});

grunt.registerTask('default', ['eslint']);