module.exports = function(grunt) {

    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),

        karma: {
            unit: {
                configFile: 'karma.conf.js'
            }
        },
        less: {
                 development: {
                     options: {
                         paths: ["assets/css"],
                         compress: true
                     },
                     files: {"src/style/style.css": "src/style/*.less"}
                 },
                 production: {
                     options: {
                         paths: ["assets/css"],
                         cleancss: true,
                         compress: true
                     },
                     files: {"src/style/style.css": "src/style/*.less"}
                 }
             }
    });
    

    grunt.loadNpmTasks('grunt-contrib-less');
    grunt.loadNpmTasks('grunt-contrib-watch');
    grunt.loadNpmTasks('grunt-karma');
    grunt.registerTask('default', ['less']);
};