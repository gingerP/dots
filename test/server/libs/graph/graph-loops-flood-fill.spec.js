'use strict';
var chai = require('chai');
var assert = chai.assert;
var _ = require('lodash');
var graphLoopsFloodFill = require('server/libs/graph/graph-loops-flood-fill');
var FsHelper = require('test/server/libs/graph/helpers/fs-helper');
var LoopHelpers = require('test/server/libs/graph/helpers/loop-helper');

const DIRECTORY_GET_LOOPS = __dirname + '/test-data/getLoops/';
const DIRECTORY_GET_LOOP = __dirname + '/test-data/getLoop/';

describe('Graph loops flood fill', function() {
    describe('method "getLoops"', function() {
        describe('Performance', function () {
            var files = FsHelper.getFiles(DIRECTORY_GET_LOOPS, ['performance']);
            var ITERATION_NUM = 50;
            _.forEach(files, function (filePath) {
                it(filePath.replace(DIRECTORY_GET_LOOPS, '') + '  x' + ITERATION_NUM, function () {
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
                    console.log('-------------------------------------------------------------------------------------------');
                    console.log('\t%sms', (summaryEnd - summaryStart) / ITERATION_NUM);
                });
            });
        });

        describe('Quality', function () {
            var files = FsHelper.getFiles(DIRECTORY_GET_LOOPS, ['specials', 'elementary']);
            _.forEach(files, function (filePath) {
                var fileName = filePath.replace(/\.json$/, '');
                var expectedData = require(fileName);
                it(expectedData.name + ' ' + filePath.replace(DIRECTORY_GET_LOOPS, ''), function () {
                    var loopsData = graphLoopsFloodFill.getLoops(expectedData.inbound);
                    assert.equal(
                        loopsData.length,
                        expectedData.outbound.length,
                        'Actual loops count (' + loopsData.length + ') not equal to Expected loops count (' + expectedData.outbound.length + ')');

                    _.forEach(loopsData, function (loopItem, index) {
                        assert(_.some(expectedData.outbound, function (expectedLoopItem) {
                            var result = LoopHelpers.isUnsortedArraysEqual(loopItem.loop, expectedLoopItem.loop) &&
                                LoopHelpers.isUnsortedArraysEqual(loopItem.trappedDots, expectedLoopItem.trappedDots);

                            return result;
                        }), index + ' loop should not exist!');
                    });
                });
            });
        });

        describe('Quality EMPTY', function () {
            var files = FsHelper.getFiles(DIRECTORY_GET_LOOPS, ['specials', 'empty-loops', 'big']);
            _.forEach(files, function (filePath) {
                var fileName = filePath.replace(/\.json$/, '');
                var expectedData = require(fileName);
                it(expectedData.name + ' ' + filePath.replace(DIRECTORY_GET_LOOPS, ''), function () {
                    var loopsData = graphLoopsFloodFill.getLoops(expectedData.inbound);
                    this.timeout(Infinity);
                    assert.equal(loopsData.length, 0);
                });
            });
        });
    });

    describe('method "getLoop"', function() {
        describe('Quality', function () {
            var files = FsHelper.getFiles(DIRECTORY_GET_LOOP, ['specials', 'elementary']);
            _.forEach(files, function (filePath) {
                var fileName = filePath.replace(/\.json$/, '');
                var expectedData = require(fileName);
                it(expectedData.name + ' ' + filePath.replace(DIRECTORY_GET_LOOP, ''), function () {
                    var loopsData = graphLoopsFloodFill.getLoop(expectedData.inbound.list, expectedData.inbound.start);
                    assert.equal(
                        loopsData.length,
                        expectedData.outbound.length,
                        'Actual loops count (' + loopsData.length + ') not equal to Expected loops count (' + expectedData.outbound.length + ')');

                    _.forEach(loopsData, function (loopItem, index) {
                        assert(_.some(expectedData.outbound, function (expectedLoopItem) {
                            var result = LoopHelpers.isUnsortedArraysEqual(loopItem.loop, expectedLoopItem.loop) &&
                                LoopHelpers.isUnsortedArraysEqual(loopItem.trappedDots, expectedLoopItem.trappedDots);

                            return result;
                        }), index + ' loop should not exist!');
                    });
                });
            });
        });

/*        describe('Quality EMPTY', function () {
            var files = FsHelper.getFiles(DIRECTORY_GET_LOOP, ['specials', 'empty-loops', 'big']);
            _.forEach(files, function (filePath) {
                var fileName = filePath.replace(/\.json$/, '');
                var expectedData = require(fileName);
                it(expectedData.name + ' ' + filePath.replace(DIRECTORY_GET_LOOP, ''), function () {
                    var loopsData = graphLoopsFloodFill.getLoops(expectedData.inbound);
                    this.timeout(Infinity);
                    assert.equal(loopsData.length, 0);
                });
            });
        });*/
    });

});
