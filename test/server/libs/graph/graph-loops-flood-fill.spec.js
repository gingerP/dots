'use strict';
var assert = require('chai').assert;
var _ = require('lodash');
var graphLoopsFloodFill = req('server/libs/graph/graph-loops-flood-fill');
var FsHelper = req('test/server/libs/graph/helpers/fs-helper');

describe('Performance graph-loops-flood-fill', function () {
    var files = FsHelper.getFiles(__dirname + '/test-data/', ['performance']);
    var ITERATION_NUM = 50;
    _.forEach(files, function (filePath) {
        it(filePath.replace(__dirname + '/test-data/', '') + '  x' + ITERATION_NUM, function () {
            var i,
                fileName,
                testData,
                summaryStart = 0,
                summaryEnd = 0;
            this.timeout(Infinity);

            for (i = 0; i < ITERATION_NUM; i++) {
                fileName = filePath.replace(/\.json$/, '');
                summaryStart += Date.now();
                testData = require(fileName);
                graphLoopsFloodFill.getLoops(testData.inbound);
                summaryEnd += Date.now();
            }
            console.log('-------------------------------------------------------------------');
            console.log('\t%sms', (summaryEnd - summaryStart) / ITERATION_NUM);
        });
    });
});

describe('Quality graph-loops-flood-fill', function() {
    var files = FsHelper.getFiles(__dirname + '/test-data/', ['specials']);
    _.forEach(files, function (filePath) {
        it(filePath.replace(__dirname + '/test-data/', ''), function () {
            var fileName = filePath.replace(/\.json$/, '');
            var testData = require(fileName);
            var loopsData = graphLoopsFloodFill.getLoops(testData.inbound);

        });
    });
});
