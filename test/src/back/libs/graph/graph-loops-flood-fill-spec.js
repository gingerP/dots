'use strict';

var fs = require('fs');
var floodFill = require('../../../../../server/libs/graph/graph-loops-flood-fill');
var logger = require('../../../../../server/logging/logger').create('graph-loops-flood-fill-spec');
var files = fs.readdirSync(__dirname + '/test-data/');
var include = [];

files.forEach(function (filePath) {
    global.getDirectionTime = 0;
    global.passLineTime = 0;
    global._testCount = 0;

    if (include.length && include.indexOf(filePath) < 0) {
        return;
    }
    var fileName = filePath.replace(/\.json$/, '');
    var testData;
    var loops;
    logger.info(fileName);
    console.time(fileName);
    testData = require('./test-data/' + fileName);
    loops = floodFill.getLoops(testData.inbound);
    console.timeEnd(fileName);
});


