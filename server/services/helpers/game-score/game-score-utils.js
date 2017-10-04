'use strict';

/**
 * @typedef {[LoopCache, number]} CacheLoopInfo
 * @typedef {[GameData, GameDataCache, GameDataDelta]} GameDataResult
 */

const graphLoop = require('server/libs/graph/graph-loops-flood-fill');
const Graph = require('server/libs/graph/graph');
const commonLoopsUtils = require('server/libs/graph/utils/common-utils');
const _ = require('lodash');
const CreationUtils = require('server/utils/creation-utils');
const Promise = require('bluebird');
const TrappedDotsHelper = require('server/services/helpers/game-score/trapped-dots-helper');
const Errors = require('../../../errors');


function getGameDataDeltas(dot, dotClientGameData) {
	const clientDeltaGameData = CreationUtils.newGameData();
	const opponentDeltaGameData = CreationUtils.newGameData();
	const dots = _.cloneDeep(dotClientGameData.dots || []);
	dots.push(dot);
	const newLoops = Graph.getLoops(dots);

	clientDeltaGameData.loops = commonLoopsUtils.getNewLoops(newLoops, clientDeltaGameData.loops);
	clientDeltaGameData.dots = [dot];

	return {
		client: clientDeltaGameData,
		opponent: opponentDeltaGameData
	};
}

async function getGamersScoresV1(dot, activePlayerGameData, opponentGameData, opponentCache) {
	const inbound = {
		dot: dot,
		active: {
			dots: activePlayerGameData.dots || [],
			loops: activePlayerGameData.loops || [],
			losingDots: activePlayerGameData.losingDots || []
		},
		opponent: {
			dots: opponentGameData.dots || [],
			loops: opponentGameData.loops || [],
			losingDots: opponentGameData.losingDots || []
		},
		loops: [],
		delta: {
			opponent: [],
			active: []
		},
		isNewDotHitInLoop: false
	};

	let activePlayerTempGameData = CreationUtils.newGameData();

	activePlayerTempGameData.dots = inbound.active.dots.concat([inbound.dot]);
	inbound.loops = await Graph.getLoops(activePlayerTempGameData.dots);
	inbound.active.dots.push(inbound.dot);

	inbound.delta.active = [];
	_.forEach(inbound.loops, function (loopData) {
		if (_.findIndex(loopData.loop, dot) > -1) {
			inbound.delta.active.push(loopData);
		}
	});

	if (!inbound.delta.active.length) {
		/*        let loop = {};
		 /!*    if (inbound.opponent.dots.length > 3) {
		 loop = await Graph.getLoop(inbound.opponent.dots, inbound.dot);
		 }*!/
		 inbound.isNewDotHitInLoop = !_.isEmpty(loop);
		 if (inbound.isNewDotHitInLoop) {
		 return;
		 }*/
	}

	if (inbound.loops && inbound.loops.length && inbound.opponent.dots && inbound.opponent.dots.length) {
		TrappedDotsHelper.filterAndUpdateLoopsByOpponentTrappedDots(
			inbound.delta.active,
			inbound.opponent,
			inbound.active
		);
		//inbound.active.loops = inbound.active.loops.concat(inbound.loopsDelta);
	}

	activePlayerGameData.dots = inbound.active.dots;
	activePlayerGameData.loops = inbound.active.loops;
	activePlayerGameData.losingDots = inbound.active.losingDots;

	opponentGameData.dots = inbound.opponent.dots;
	opponentGameData.loops = inbound.opponent.loops;
	opponentGameData.losingDots = inbound.opponent.losingDots;
	return {
		gameData: {
			active: activePlayerGameData,
			opponent: opponentGameData
		},
		delta: {
			active: inbound.delta.active,
			opponent: inbound.delta.opponent
		},
		loops: inbound.loops
	};
}

/**
 *
 * @param {Dot} dot
 * @param {GameData} activePlayerGameData
 * @param {GameDataCache} activePlayerCache
 * @param {GameData} opponentGameData
 * @param {GameDataCache} opponentCache
 * @returns {Promise.<{active: GameDataResult , opponent: GameDataResult}>}
 * @throws {Errors.DotNotAllowed}
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
	return {
		active: [activePlayerGameData, activePlayerCache, activePlayerDelta],
		opponent: [opponentGameData, opponentCache, opponentPlayerDelta]
	};
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
				throw new Errors.DotsShouldBeCaptured();
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
	opponentGameData.losingDots = opponentGameData.losingDots.concat(capturedDots);
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
		active: [activePlayerGameData, activePlayerCache, activePlayerDelta],
		opponent: [opponentGameData, opponentCache, opponentDelta]
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
		active: [activePlayerGameData, activePlayerCache, activePlayerDelta],
		opponent: [opponentGameData, opponentCache, opponentDelta]
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
		active: [activePlayerGameData, activePlayerCache, activePlayerDelta],
		opponent: [opponentGameData, opponentCache, opponentDelta]
	};
}

module.exports = {
	getGameDataDeltas: getGameDataDeltas,
	getGamersScores: getGamersScoresV1,
	getGamersScoresV2: getGamersScoresV2
};
