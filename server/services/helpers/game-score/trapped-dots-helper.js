'use strict';
const _ = require('lodash');
const CommonGraphUtils = require('../../../libs/graph/utils/common-utils');

/**
 * @typedef {{x: number, y: number, index: number}} DotWithLoopIndex
 */

/**
 * If newActivePlayerCacheLoops capture any free dots (dots outside loops) from opponentGameData,
 * then that dots will be removed from opponentGameData.dots and opponentCache.dotsOutsideLoops,
 * also that dots will be added to opponentGameData.losingDots and cacheLoop.capturedDots.
 * All captured dots will be returned as array, also the parameters will be mutated.
 * @param {Dot[]} dots, immutable
 * @param {LoopCache[]} loopsCaches, mutable
 * @returns {LoopCacheCapturedDotsInfo[]} allCapturedDots
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
		activeLoopIndex++;
	}
	return allCapturedDots;
}

/**
 * Return dots, which captured inside loop
 * @param {Dot[]} dots, immutable
 * @param {LoopCache} loopCache, immutable
 * @returns {Dot[]} result
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
		indexCache--;
	}
	return removedIndexes;
}

module.exports = {
	captureDotsByLoopsCaches: captureDotsByLoopsCaches,
	removeDotsFromList: removeDotsFromList,
	removeLoopsCachesWithDots: removeLoopsCachesWithDots
};
