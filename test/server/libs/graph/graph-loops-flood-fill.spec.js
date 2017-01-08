'use strict';
var chai = require('chai');
var assert = chai.assert;
var expect = chai.expect;
var _ = require('lodash');
var graphLoopsFloodFill = req('server/libs/graph/graph-loops-flood-fill');
var FsHelper = req('test/server/libs/graph/helpers/fs-helper');
var LoopHelpers = req('test/server/libs/graph/helpers/loop-helper');

describe.skip('Performance graph-loops-flood-fill', function () {
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
            console.log('\t%sms', (summaryEnd - summaryStart) / ITERATION_NUM);
        });
    });
});

describe('Quality graph-loops-flood-fill', function () {
    var files = FsHelper.getFiles(__dirname + '/test-data/', ['specials', 'elementary']);
    _.forEach(files, function (filePath) {
        var fileName = filePath.replace(/\.json$/, '');
        var expectedData = require(fileName);
        it(expectedData.name + ' ' + filePath.replace(__dirname + '/test-data/', ''), function () {
            var loopsData = graphLoopsFloodFill.getLoops(expectedData.inbound);
            assert.equal(
                loopsData.length,
                expectedData.outbound.length,
                'Actual loops count (' + loopsData.length + ') not equal to Expected loops count (' + expectedData.outbound.length + ')');

            _.forEach(loopsData, function (loopItem, index) {
                assert(_.some(expectedData.outbound, function (expectedLoopItem) {
                    var result = LoopHelpers.isUnsortedArraysEqual(loopItem.loop, expectedLoopItem.loop) &&
                        LoopHelpers.isUnsortedArraysEqual(loopItem.trappedDots, expectedLoopItem.trappedDots)

                    return result;
                }), index + ' loop should not exist!');
            });
        });
    });
});
