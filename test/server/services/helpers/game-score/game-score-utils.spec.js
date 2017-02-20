'use strict';
var chai = require('chai');
var assert = chai.assert;
var _ = require('lodash');
var GameScoreUtils = require('server/services/helpers/game-score/game-score-utils');
var FsHelper = require('test/server/libs/graph/helpers/fs-helper');
var LoopHelpers = require('test/server/libs/graph/helpers/loop-helper');
var TEST_DATA_TEMPLATE_01 = require('test/server/services/helpers/game-score/test-data/trapped-dots');
var TEST_DATA_TEMPLATE_02 = require('test/server/services/helpers/game-score/test-data/empty-trapped-dots');

describe.skip('Utilities for game score', function() {
    it('Test Data Template 01 - ' + TEST_DATA_TEMPLATE_01.name, function (done) {
        var args = TEST_DATA_TEMPLATE_01.input;
        GameScoreUtils.getGamersScores(args.dot, args.activePlayerGameData, args.opponentGameData).then((result) => {
            var expectedActivePlayer = TEST_DATA_TEMPLATE_01.output.gameData.active;
            var realActivePlayer = result.gameData.active;

            assert(
                LoopHelpers.isUnsortedArraysEqual(
                    realActivePlayer.loops[0].loop,
                    expectedActivePlayer.loops[0].loop
                ),
                `Loops are not equal! 
                    actual ${realActivePlayer.loops[0].loop.length},
                    expected ${expectedActivePlayer.loops[0].loop.length}`
            );

            assert(
                LoopHelpers.isUnsortedArraysEqual(
                    realActivePlayer.loops[0].trappedDots,
                    expectedActivePlayer.loops[0].trappedDots
                ),
                `Trapped dots are not equal! 
                    actual ${realActivePlayer.loops[0].trappedDots.length},
                    expected ${expectedActivePlayer.loops[0].trappedDots.length}`
            );

            done();
        });
    });

    it('Test Data Template 02 - ' + TEST_DATA_TEMPLATE_02.name, function (done) {
        var args = TEST_DATA_TEMPLATE_02.input;
        GameScoreUtils.getGamersScores(args.dot, args.activePlayerGameData, args.opponentGameData).then((result) => {
            var expectedActivePlayer = TEST_DATA_TEMPLATE_02.output.gameData.active;
            var realActivePlayer = result.gameData.active;

            assert(
                LoopHelpers.isUnsortedArraysEqual(
                    realActivePlayer.loops,
                    expectedActivePlayer.loops
                ),
                `Loops are not equal! 
                    actual ${realActivePlayer.loops.length},
                    expected ${expectedActivePlayer.loops.length}`
            );

            assert(
                LoopHelpers.isUnsortedArraysEqual(
                    realActivePlayer.loops,
                    expectedActivePlayer.loops
                ),
                `Trapped dots are not equal! 
                    actual ${realActivePlayer.loops.length},
                    expected ${expectedActivePlayer.loops.length}`
            );

            done();
        });
    });
});
