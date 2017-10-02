'use strict';
const _ = require('lodash');
const CommonGraphUtils = require('../../../libs/graph/utils/common-utils');

/**
 * @typedef {{x: number, y: number, index: number}} DotWithLoopIndex
 */

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
	while (index >= 0) {
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
 * then that dots will be removed from opponentGameData.dots and opponentCache.dotsOutsideLoops,
 * also that dots will be added to opponentGameData.losingDots and cacheLoop.capturedDots.
 * All captured dots will be returned as array, also the parameters will be mutated.
 * @param {Dot[]} dots, immutable
 * @param {LoopCache[]} loopsCaches, mutable
 * @returns LoopCacheCapturedDotsInfo[]
 */
function captureDotsByLoopsCaches(dots, loopsCaches) {
	let activeLoopIndex = 0;
	let allCapturedDots = [];
	while (activeLoopIndex < loopsCaches.length) {
		let activePlayerCacheLoop = loopsCaches[activeLoopIndex];
		let loopBorders = CommonGraphUtils.getMinMaxCorners(activePlayerCacheLoop.loop);
		let acceptableFreeDots = CommonGraphUtils.filterDotsInsideBorders(dots, loopBorders);
		let capturedFreeDots = filterDotsInsideLoopCache(acceptableFreeDots, activePlayerCacheLoop);
		if (capturedFreeDots.length) {
			allCapturedDots.push({index: activeLoopIndex, dots: capturedFreeDots});
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
	while (dIndex < dots.length) {
		let trappedIndex = 0;
		const dot = dots[trappedIndex];
		while (trappedIndex < loopCache.trappedDots) {
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
 * capturedDots will be removed from gameData.dots and gameCache.dotsOutsideLoops,
 * also that dots will be added to gameData.losingDots.
 * Parameters will be mutated.
 * @param {Dot[]} capturedDots, immutable
 * @param {GameData} gameData, mutable
 * @param {GameDataCache} gameCache, mutable
 */
function removeCapturedDotsFromGameDataAndCache(capturedDots, gameData, gameCache) {

}


/**
 * @param {Dot[]} dotsToRemove, immutable
 * @param {Dot[]} removeFromDots, mutable
 * @returns {Dot[]} removeFromDots - dotsToRemove
 */
function removeDotsFromList(dotsToRemove, removeFromDots) {
	let indexTo = dotsToRemove.length - 1;
	while (indexTo >= 0) {
		const dotTo = dotsToRemove[indexTo];
		let indexFrom = removeFromDots.length - 1;
		while (indexFrom >= 0) {
			if (dotTo.x === removeFromDots[indexFrom].x && dotTo.y === removeFromDots[indexFrom].y) {
				removeFromDots.splice(indexFrom, 1);
				break;
			}
			indexFrom--;
		}
		indexTo--;
	}
	return removeFromDots;
}

/**
 * @param {LoopCache[]} loopsCaches, mutable
 * @param {Dot[]} dots, immutable
 * @returns {number[]} lists of indexes which were removed
 */
function removeLoopsCachesWithDots(loopsCaches, dots) {
	let indexCache = loopsCaches.length - 1;
	let removedIndexes = [];
	let toBreak = false;
	while (indexCache >= 0 && !toBreak) {
		const loop = loopsCaches[indexCache].loop;
		let indexInLoop = loop.length - 1;
		while (indexInLoop >= 0 && !toBreak) {
			const loopDot = loop[indexInLoop];
			let indexDot = dots.length - 1;
			while (indexDot >= 0 && !toBreak) {
				if (loopDot.x === dots[indexDot].x && loopDot.y === dots[indexDot].y) {
					loopsCaches.splice(indexCache, 1);
					removedIndexes.push(indexCache);
					toBreak = true;
					break;
				}
				indexDot--;
			}
			indexInLoop--;
		}
	}
	return removedIndexes;
}

module.exports = {
	filterAndUpdateLoopsByOpponentTrappedDots: filterAndUpdateLoopsByOpponentTrappedDots,
	deductLoopsTrappedDotsFromOpponentGameData: deductLoopsTrappedDotsFromOpponentGameData,
	captureDotsByLoopsCaches: captureDotsByLoopsCaches,
	removeDotsFromList: removeDotsFromList,
	removeLoopsCachesWithDots: removeLoopsCachesWithDots
};
