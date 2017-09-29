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
 * If newActivePlayerCacheLoops capture any free dots (dots outside loops) from opponentGameData,
 * then that dots will be removed from opponentGameData.dots and opponentCache.dots_outside_loops,
 * also that dots will be added to opponentGameData.losingDots and cacheLoop.capturedDots.
 * All captured dots will be returned as array, also the parameters will be mutated.
 * @param {LoopCache[]} newActivePlayerCacheLoops, mutable
 * @param {GameData} opponentGameData, mutable
 * @param {GameDataCache} opponentCache, mutable
 * @returns Dot[]
 */
function captureFreeOpponentDotsByActivePlayerLoops(newActivePlayerCacheLoops, opponentGameData, opponentCache) {
	let activeLoopIndex = 0;
	let freeDots = opponentCache.dots_outside_loops;
	let allCapturedDots = [];
    while(activeLoopIndex < newActivePlayerCacheLoops.length) {
        let activePlayerCacheLoop = newActivePlayerCacheLoops[activeLoopIndex];
        let loopBorders = CommonGraphUtils.getMinMaxCorners(activePlayerCacheLoop.loop);
        let acceptableFreeDots = CommonGraphUtils.filterDotsInsideBorders(freeDots, loopBorders);
        let capturedFreeDots = filterDotsInsideLoopCache(acceptableFreeDots, activePlayerCacheLoop);
        activePlayerCacheLoop.capturedDots = capturedFreeDots;
        if (capturedFreeDots.length) {
            allCapturedDots = allCapturedDots.concat(capturedFreeDots);
            removeCapturedDotsFromGameDataAndCache(capturedFreeDots, opponentGameData, opponentCache);
        }
    }
    return allCapturedDots;
}

/**
 * Return dots, which captured inside loop
 * @param {Dot[]} dots, immutable
 * @param {LoopCache} loopCache, immutable
 * @returns Dot[]
 */
function filterDotsInsideLoopCache(dots, loopCache) {
    const result = [];
    let dIndex = 0;
    while(dIndex < dots.length) {
        let trappedIndex = 0;
        const dot = dots[trappedIndex];
        while(trappedIndex < loopCache.trappedDots) {
            const trappedDot = loopCache.trappedDots[trappedIndex];
            if (trappedDot.x === dot.x && trappedDot.y === dot.y) {
                result.push(dot);
                break;
            }
            trappedIndex++;
        }
        dIndex++;
    }
    return result;
}

/**
 * capturedDots will be removed from gameData.dots and gameCache.dots_outside_loops,
 * also that dots will be added to gameData.losingDots.
 * Parameters will be mutated.
 * @param {Dot[]} capturedDots, immutable
 * @param {GameData} gameData, mutable
 * @param {GameDataCache} gameCache, mutable
 */
function removeCapturedDotsFromGameDataAndCache(capturedDots, gameData, gameCache) {
    let indexCapture = 0;
    while(indexCapture < capturedDots.length - 1) {
        const capturedDot = capturedDots[indexCapture];
        let indexOutside = gameCache.dots_outside_loops.length - 1;
        while (indexOutside >= 0) {
            const outsideDot = gameCache.dots_outside_loops[indexOutside];
            if (outsideDot.x === capturedDot.x && outsideDot.y === capturedDot.y) {
                gameCache.dots_outside_loops.splice(indexOutside, 1);
                break;
            }
            indexOutside--;
        }
        let gameDataDotIndex = gameData.dots.length - 1;
        while(gameDataDotIndex >= 0) {
            const gameDataDot = gameData.dots[gameDataDotIndex];
            if (gameDataDot.x === capturedDot.x && gameDataDot.y === capturedDot.y) {
                gameData.dots.splice(gameDataDotIndex, 1);
                break;
            }
            gameDataDotIndex--;
        }
    }
    gameData.losingDots = gameData.losingDots.concat(capturedDots);
}

module.exports = {
    filterAndUpdateLoopsByOpponentTrappedDots: filterAndUpdateLoopsByOpponentTrappedDots,
    deductLoopsTrappedDotsFromOpponentGameData: deductLoopsTrappedDotsFromOpponentGameData,
    captureFreeOpponentDotsByActivePlayerLoops: captureFreeOpponentDotsByActivePlayerLoops
};
