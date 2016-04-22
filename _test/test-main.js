var allTestFiles = [];
var TEST_REGEXP = /(spec|test)\.js$/i;
var pathToModule = function(path) {
    var returnValue = path.replace(/^\/base\//, '').replace(/\.js$/, '');
    return returnValue;
};

Object.keys(window.__karma__.files).forEach(function(file) {
    if (TEST_REGEXP.test(file)) {
        console.info('11111111111111111111111: ' + file);
        // Normalize paths to RequireJS module names.
        allTestFiles.push(pathToModule(file));
    }
});

require.config({
    baseUrl: '/base/',
    paths: {
        'moduleGraph': 'src/js/v0.2/module.graph'
    },
    shim: {
        'moduleGameBusiness': 'module.game.business'
    },
    waitSeconds: 15,
    deps: allTestFiles
});