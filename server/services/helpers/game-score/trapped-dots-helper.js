'use strict';

const _ = require('lodash');
const CommonGraphUtils = require('../../../libs/graph/utils/common-utils');

function updateLoop(loop, opponentGameData) {
    var index = loop.trappedDots.length - 1;
    var opponentDots = opponentGameData.dots;
    var trappedDot;
    var opponentDotIndex;
    while (index >= 0) {
        trappedDot = loop.trappedDots[index];
        opponentDotIndex = _.findIndex(opponentDots, trappedDot);
        if (opponentDotIndex > -1) {
            // If dot in loop also belong to opponent dots we mark it as losing dot
            opponentGameData.dots.splice(opponentDotIndex, 1);
            opponentGameData.losingDots.push(trappedDot);
        } else {
            // If dot in loop do not belong to opponent dots we removed it from trapped dots
            loop.trappedDots.splice(index, 1);
        }
        index--;
    }
    return Boolean(loop.trappedDots.length);
}

function capturedFreeOpponentDotsByWithActivePlayerLoop(loop, opponentGameData) {
    let index = loop.trappedDots.length - 1;
    const opponentDots = opponentGameData.dots;
    while(index >= 0) {
        let trappedDot = loop.trappedDots[index];
        let opponentDotIndex = _.findIndex(opponentDots, trappedDot);
        if (opponentDotIndex > -1) {
            // If dot in loop also belong to opponent dots we mark it as losing dot
            opponentGameData.dots.splice(opponentDotIndex, 1);
            opponentGameData.losingDots.push(trappedDot);
            loop.capturedDots.push(trappedDot);
        }
        index--;
    }
}

/**
 * Loops will be filtered by trapping opponent dots and game data will be updated
 * @param loops
 * @param opponentGameData
 */
function filterAndUpdateLoopsByOpponentTrappedDots(loopsDelta, opponentGameData, activeGameData) {
    _.forEachRight(loopsDelta, (loop, index) => {
        var hasTrappedDots = updateLoop(loop, opponentGameData);

        if (!hasTrappedDots) {
            // If after updating loop the trappedDots list is empty, so we removed it from loop;
            loopsDelta.splice(index, 1);
            activeGameData.loops.push(loop);
        }
    });
}

function deductLoopsTrappedDotsFromOpponentGameData(loops, opponentGameData, options) {
    const preparedOptions = _.merge({
        excludeOpponentLoops: false
    }, options);
    _.forEach(loops, loop => deductLoopTrappedDotsFromOpponentGameData(loop, opponentGameData, preparedOptions));
}


/**
 * Return free opponent dots, captured by active player loops.
 * Free dots means they are not captured active player dots as loops.
 * @param opponentCache
 * @param activePlayerLoops
 * @returns {Array}
 */
function capturedFreeOpponentDotsWithActivePlayerLoops(opponentGameData, opponentCache, newActivePlayerCacheLoops) {
	let activeLoopIndex = 0;
	let freeDots = opponentCache.dots_outside_loops;
    while(activeLoopIndex < newActivePlayerCacheLoops.length) {
        let activePlayerCacheLoop = newActivePlayerCacheLoops[activeLoopIndex];
        let loopBorders = CommonGraphUtils.getMinMaxCorners(activePlayerCacheLoop.loop);
        let acceptableFreeDots = CommonGraphUtils.filterDotsInsideCorners(freeDots, loopBorders);

    }
}

module.exports = {
    filterAndUpdateLoopsByOpponentTrappedDots: filterAndUpdateLoopsByOpponentTrappedDots,
    deductLoopsTrappedDotsFromOpponentGameData: deductLoopsTrappedDotsFromOpponentGameData
};
