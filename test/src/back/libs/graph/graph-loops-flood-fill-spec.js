(function() {
    'use strict';
    global._req = require('app-root-path').require;
    var fs = require('fs');
    var _ = require('lodash');
    var floodFill = require('../../../../../src/back/libs/graph/graph-loops-flood-fill');
    var logger = req('src/js/logger').create('graph-loops-flood-fill-spec');


    var testDataDir = 'test-data';
    var testFiles = [];
    var files = fs.readdirSync(__dirname + '/test-data/');
    files.forEach(function(filePath) {
        var fileName = filePath.replace(/\.json$/, '');
        logger.info(fileName);
        var testData = require('./test-data/' + fileName);
        var loops = floodFill.getLoops(testData.inbound);
    });
})();