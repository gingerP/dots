'use strict';

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
 * @returns {Promise.<{gameData: {active: *, opponent: *}, delta: {active: Array, opponent: Array}, loops: Array}>}
 * @throws {Errors.DotNotAllowed}
 */
async function getGamersScoresV2(dot, activePlayerGameData, activePlayerCache, opponentGameData, opponentCache) {
	const activePlayerDelta = {
		dots: [dot],
		losingDots: [],
		capturedDots: [],
		loops: []
	};
	const opponentPlayerDelta = {
		dots: [],
		losingDots: [],
		capturedDots: [],
		loops: []
	};
	const [activePlayerExistsLoop, existsLoopIndex] = getLoopCacheInfoToWhichDotHit(dot, activePlayerCache);
	activePlayerGameData.dots.push(dot);
	if (activePlayerExistsLoop) {
		if (activePlayerExistsLoop.capturedDots) {
			throw new Errors.DotNotAllowed();
		}
		const newLoops = Graph.getLoopsWithVertexInBorder(activePlayerGameData.dots, dot);
		if (newLoops.length) {
			activePlayerCache.cache.splice(existsLoopIndex, 1);
			activePlayerCache.cache = activePlayerCache.cache.concat(newLoops);
		}
	} else {
		const [opponentCacheLoop] = getLoopCacheInfoToWhichDotHit(dot, opponentCache);

		if (opponentCacheLoop) {
			if (opponentCacheLoop.capturedDots.length) {
				throw new Errors.DotNotAllowed();
			} else {
				const loopsCachesForDot = Graph.getLoopsWithVertexInBorder(activePlayerGameData.dots, dot);
				if (loopsCachesForDot.length) {

				} else {

				}

			}
		}


		const loopsForVertex = Graph.getLoopsWithVertexInBorder(activePlayerGameData.dots, dot);
		if (loopsForVertex.length) {


		} else {
			const [opponentCacheLoop, opponentCacheLoopIndex] = getLoopInfoToWhichDotHit(dot, opponentCache);
			if (opponentCacheLoop) {
				if (opponentCacheLoop.capturedDots.length) {
					throw new Errors.DotNotAllowed();
				} else {
					opponentGameData.loops.push(opponentCacheLoop.loop);
					opponentCacheLoop.capturedDots.push(dot);
					opponentPlayerDelta.capturedDots.push(dot);
					opponentPlayerDelta.loops.push(opponentCacheLoop);

					activePlayerGameData.losingDots.push(dot);
					activePlayerGameData.dots.pop();
					activePlayerDelta.dots = [];
					activePlayerDelta.losingDots.push(dot);
				}
			}
		}
	}

	return {
		active: [activePlayerGameData, activePlayerCache, activePlayerDelta],
		opponent: [opponentGameData, opponentCache, opponentPlayerDelta]
	};
}


/**
 * @param {Dot} dot
 * @param {GameDataCache} gameDataCache
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

module.exports = {
	getGameDataDeltas: getGameDataDeltas,
	getGamersScores: getGamersScoresV1,
	getGamersScoresV2: getGamersScoresV2
};
