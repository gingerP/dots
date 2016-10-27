'use strict';

var fs = require('fs');
var floodFill = require('../../../../../src/back/libs/graph/graph-loops-flood-fill');
var logger = require('../../../../../src/js/logger').create('graph-loops-flood-fill-spec');
var files = fs.readdirSync(__dirname + '/test-data/');
files.forEach(function (filePath) {
    var fileName = filePath.replace(/\.json$/, '');
    var testData;
    var loops;
    logger.info(fileName);
    testData = require('./test-data/' + fileName);
    loops = floodFill.getLoops(testData.inbound);
    console.log(loops);
});
