'use strict';

/**
 * @typedef {[LoopCache, number]} CacheLoopInfo
 * @typedef {[GameData, GameDataCache, GameDataDelta]} GameDataResult
 */

const Graph = require('server/libs/graph/graph');
const commonLoopsUtils = require('server/libs/graph/utils/common-utils');
const _ = require('lodash');
const CreationUtils = require('server/utils/creation-utils');
const TrappedDotsHelper = require('server/services/helpers/game-score/trapped-dots-helper');
const Errors = require('../../../errors');


function getGameDataDeltas(dot, dotClientGameData) {
	const clientDeltaGameData = CreationUtils.newGameData();
	const opponentDeltaGameData = CreationUtils.newGameData();
	const dots = _.cloneDeep(dotClientGameData.dots || []);
	dots.push(dot);
	const newLoops = Graph.getLoops(dots);
	normalizeLoopsCaches(newLoops);

	clientDeltaGameData.loops = commonLoopsUtils.getNewLoops(newLoops, clientDeltaGameData.loops);
	clientDeltaGameData.dots = [dot];

	return {
		client: clientDeltaGameData,
		opponent: opponentDeltaGameData
	};
}

/**
 *
 * @param {Dot} dot immutable
 * @param {GameData} activePlayerGameData mutable
 * @param {GameDataCache} activePlayerCache mutable
 * @param {GameData} opponentGameData mutable
 * @param {GameDataCache} opponentCache mutable
 * @returns {Promise.<{active: GameDataResult , opponent: GameDataResult}>}
 * @throws {Errors.DotNotAllowed, Errors.DotsShouldBeCaptured}
 */
async function getGamersScoresV2(dot, activePlayerGameData, activePlayerCache, opponentGameData, opponentCache) {
	const [, existsLoopCacheIndex] = getLoopCacheInfoToWhichDotHit(dot, activePlayerCache.cache);
	activePlayerGameData.dots.push(dot);
	if (!_.isNil(existsLoopCacheIndex)) {
		return ifDotTrappedInsideOwnLoop(
			dot, existsLoopCacheIndex,
			activePlayerGameData, activePlayerCache,
			opponentGameData, opponentCache
		);
	} else {
		const [, opponentLoopCacheIndex] = getLoopCacheInfoToWhichDotHit(dot, opponentCache);

		if (!_.isNil(opponentLoopCacheIndex)) {
			return ifDotTrappedIntoOpponentLoop(
				dot, opponentLoopCacheIndex,
				activePlayerGameData, activePlayerCache,
				opponentGameData, opponentCache
			);
		} else {
			return ifDotNotTrappedIntoAnyLoop(
				dot,
				activePlayerGameData, activePlayerCache,
				opponentGameData, opponentCache
			);
		}
	}
}

async function ifDotTrappedInsideOwnLoop(dot, existsLoopCacheIndex,
										 activePlayerGameData, activePlayerCache,
										 opponentGameData, opponentCache) {
	const existLoopCache = activePlayerCache.cache[existsLoopCacheIndex];
	if (existLoopCache.capturedDots.length) {
		throw new Errors.DotNotAllowed();
	}
	const newLoopsCaches = Graph.getLoopsWithVertexInBorder(activePlayerGameData.dots, dot);
	if (newLoopsCaches.length) {
		activePlayerCache.cache.splice(existsLoopCacheIndex, 1);
	}
	return collectEmptyDotForActivePlayer(activePlayerGameData, activePlayerCache, opponentGameData, opponentCache, dot, newLoopsCaches);
}

/**
 *
 * @param {Dot} dot
 * @param {number} opponentCacheLoopIndex index for opponent loopCache
 * @param {GameData} activePlayerGameData
 * @param {GameDataCache} activePlayerCache
 * @param {GameData} opponentGameData
 * @param {GameDataCache} opponentCache
 * @returns {Promise.<{active: GameDataResult, opponent: GameDataResult}>}
 * @throws [Errors.DotNotAllowed, Errors.DotsShouldBeCaptured]
 */
async function ifDotTrappedIntoOpponentLoop(dot, opponentCacheLoopIndex,
											activePlayerGameData, activePlayerCache,
											opponentGameData, opponentCache) {
	const opponentLoopCache = opponentCache.cache[opponentCacheLoopIndex];
	if (opponentLoopCache.capturedDots.length) {
		throw new Errors.DotNotAllowed();
	} else {
		const loopsCachesForDot = Graph.getLoopsWithVertexInBorder(activePlayerGameData.dots, dot);
		if (loopsCachesForDot.length) {
			const newCapturedDotsInfo = TrappedDotsHelper.captureDotsByLoopsCaches(
				opponentCache.dotsNotCapturedOpponentDots,
				loopsCachesForDot
			);
			if (newCapturedDotsInfo.length) {
				throw new Errors.DotsShouldBeCapturedError();
			}
			return collectSuccessfulDotForActivePlayer(
				activePlayerGameData, activePlayerCache,
				opponentGameData, opponentCache,
				dot, loopsCachesForDot, newCapturedDotsInfo
			);
		} else {
			const dotIndex = findDotIndexRight(dot, activePlayerGameData.dots);
			if (dotIndex >= 0) {
				activePlayerGameData.dots.splice(dotIndex, 1);
			}

			return collectLosingDotForActivePlayer(
				activePlayerGameData, activePlayerCache,
				opponentGameData, opponentCache,
				dot, opponentCacheLoopIndex
			);
		}
	}
}

/**
 *
 * @param {Dot} dot
 * @param {GameData} activePlayerGameData
 * @param {GameDataCache} activePlayerCache
 * @param {GameData} opponentGameData
 * @param {GameDataCache} opponentCache
 * @returns {Promise.<{active: GameDataResult, opponent: GameDataResult}>}
 */
async function ifDotNotTrappedIntoAnyLoop(dot,
										  activePlayerGameData, activePlayerCache,
										  opponentGameData, opponentCache) {
	const loopsCachesForDot = Graph.getLoopsWithVertexInBorder(activePlayerGameData.dots, dot);
	if (loopsCachesForDot.length) {
		const newCapturedDotsInfo = TrappedDotsHelper.captureDotsByLoopsCaches(
			opponentCache.dotsNotCapturedOpponentDots,
			loopsCachesForDot
		);
		if (newCapturedDotsInfo) {
			return collectSuccessfulDotForActivePlayer(
				activePlayerGameData, activePlayerCache,
				opponentGameData, opponentCache,
				dot, loopsCachesForDot, newCapturedDotsInfo
			);
		} else {
			return collectEmptyDotForActivePlayer(
				activePlayerGameData, activePlayerCache,
				opponentGameData, opponentCache,
				dot, loopsCachesForDot
			);
		}
	} else {
		return collectEmptyDotForActivePlayer(
			activePlayerGameData, activePlayerCache,
			opponentGameData, opponentCache,
			dot, []
		);
	}

}

/**
 *
 * @param {Dot} dot
 * @param {Dot[]} dots
 * @returns {number} dot index
 */
function findDotIndexRight(dot, dots) {
	let index = dots.length - 1;
	while (index >= 0) {
		if (dots[index].x === dot.x && dots[index].y === dot.y) {
			return index;
		}
		index--;
	}
	return -1;
}


/**
 * @param {Dot} dot
 * @param {LoopCache[]} gameDataCache
 * @returns {CacheLoopInfo}
 */
function getLoopCacheInfoToWhichDotHit(dot, gameDataCache) {
	let cacheIndex = gameDataCache.length - 1;
	while (cacheIndex >= 0) {
		const loop = gameDataCache[cacheIndex];
		let dotIndex = loop.trappedDots.length - 1;
		while (dotIndex >= 0) {
			const trappedDot = loop.trappedDots[dotIndex];
			if (dot.x === trappedDot.x && dot.y === trappedDot.y) {
				return [loop, cacheIndex];
			}
			dotIndex--;
		}
		cacheIndex--;
	}
	return [];
}

/**
 * @param {GameData} activePlayerGameData
 * @param {GameDataCache} activePlayerCache
 * @param {GameData} opponentGameData
 * @param {GameDataCache} opponentCache
 * @param {Dot} dot
 * @param {LoopCache[]} loopsCachesForDot
 * @param {LoopCacheCapturedDotsInfo[]} newCapturedDotsInfo
 * @returns {Promise.<{active: GameDataResult , opponent: GameDataResult}>}
 */
async function collectSuccessfulDotForActivePlayer(activePlayerGameData, activePlayerCache,
												   opponentGameData, opponentCache,
												   dot, loopsCachesForDot, newCapturedDotsInfo) {
	const activePlayerDelta = {
		dots: [dot],
		losingDots: [],
		capturedDots: [],
		loops: []
	};
	const opponentDelta = {
		dots: [],
		losingDots: [],
		capturedDots: [],
		loops: []
	};
	let newCapturedDots = [];
	_.forEach(newCapturedDotsInfo, info => newCapturedDots = newCapturedDots.concat(info.dots));

	//Opponent player
	//	GameDataCache
	TrappedDotsHelper.removeDotsFromList(newCapturedDots, opponentCache.dotsNotCapturedOpponentDots);
	TrappedDotsHelper.removeDotsFromList(newCapturedDots, opponentCache.dotsOutsideLoops);
	TrappedDotsHelper.removeLoopsCachesWithDots(opponentCache.cache, newCapturedDots);
	//	GameData
	TrappedDotsHelper.removeDotsFromList(newCapturedDots, opponentGameData.dots);
	opponentGameData.losingDots = opponentGameData.losingDots.concat(newCapturedDots);
	//	GameDataDelta
	opponentDelta.losingDots = newCapturedDots;

	//Active player
	//	GameDataDelta
	let dotsInLoopsBorders = [];
	_.forEach(activePlayerDelta.loops, loop => dotsInLoopsBorders = dotsInLoopsBorders.concat(loop));
	activePlayerDelta.capturedDots = newCapturedDots;
	activePlayerDelta.loops = _.map(loopsCachesForDot, 'loop');
	//	GameDataCache
	TrappedDotsHelper.removeDotsFromList(dotsInLoopsBorders, activePlayerCache.dotsNotCapturedOpponentDots);
	TrappedDotsHelper.removeDotsFromList(dotsInLoopsBorders, activePlayerCache.dotsOutsideLoops);
	_.forEach(newCapturedDotsInfo, info => loopsCachesForDot[info.index].capturedDots = info.dots);
	activePlayerCache.cache = activePlayerCache.cache.concat(loopsCachesForDot);
	//	GameData
	activePlayerGameData.loops = activePlayerGameData.loops.concat(activePlayerDelta.loops);

	return {
		active: [activePlayerDelta, activePlayerGameData, activePlayerCache],
		opponent: [opponentDelta, opponentGameData, opponentCache]
	};
}

/**
 * @param {GameData} activePlayerGameData
 * @param {GameDataCache} activePlayerCache
 * @param {GameData} opponentGameData
 * @param {GameDataCache} opponentCache
 * @param {Dot} dot
 * @param {number} loopCacheIndex index for opponent loopCache
 * @returns {Promise.<{active: GameDataResult , opponent: GameDataResult}>}
 */
async function collectLosingDotForActivePlayer(activePlayerGameData, activePlayerCache,
											   opponentGameData, opponentCache,
											   dot, loopCacheIndex) {
	const activePlayerDelta = {
		dots: [],
		losingDots: [dot],
		capturedDots: [],
		loops: []
	};
	const opponentDelta = {
		dots: [],
		losingDots: [],
		capturedDots: [dot],
		loops: []
	};
	const opponentLoopCache = opponentCache.cache[loopCacheIndex];

	//Opponent player
	//	GameDataDelta
	opponentDelta.loops = [opponentLoopCache.loop];
	//	GameData
	opponentGameData.loops = opponentGameData.loops.concat(opponentLoopCache.loop);
	//	GameDataCache
	TrappedDotsHelper.removeDotsFromList(opponentLoopCache.loop, opponentCache.dotsNotCapturedOpponentDots);
	TrappedDotsHelper.removeDotsFromList(opponentLoopCache.loop, opponentCache.dotsOutsideLoops);
	opponentLoopCache.capturedDots = [dot];

	//Active player
	//	GameDataDelta
	//	GameData
	activePlayerGameData.losingDots.push(dot);
	//	GameDataCache

	return {
		active: [activePlayerDelta, activePlayerGameData, activePlayerCache],
		opponent: [opponentDelta, opponentGameData, opponentCache]
	};
}

/**
 *
 * @param {GameData} activePlayerGameData
 * @param {GameDataCache} activePlayerCache
 * @param {GameData} opponentGameData
 * @param {GameDataCache} opponentCache
 * @param {Dot} dot
 * @param {LoopCache[]}loopsCachesForDot
 * @returns {Promise.<{active: GameDataResult , opponent: GameDataResult}>}
 */
async function collectEmptyDotForActivePlayer(activePlayerGameData, activePlayerCache,
											  opponentGameData, opponentCache,
											  dot, loopsCachesForDot) {
	const activePlayerDelta = {
		dots: [dot],
		losingDots: [],
		capturedDots: [],
		loops: []
	};
	const opponentDelta = {
		dots: [],
		losingDots: [],
		capturedDots: [],
		loops: []
	};
	//Opponent player
	//	GameDataDelta
	//	GameData
	//	GameDataCache

	//Active player
	//	GameDataDelta
	//	GameData
	//	GameDataCache
	activePlayerCache.cache = activePlayerCache.cache.concat(loopsCachesForDot);

	return {
		active: [activePlayerDelta, activePlayerGameData, activePlayerCache],
		opponent: [opponentDelta, opponentGameData, opponentCache]
	};
}

module.exports = {
	getGameDataDeltas: getGameDataDeltas,
	getGamersScoresV2: getGamersScoresV2
};
