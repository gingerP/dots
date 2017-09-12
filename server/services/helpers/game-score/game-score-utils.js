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

async function getGamersScoresV2(dot, activePlayerGameData, activePlayerCache, opponentGameData, opponentCache) {
    const activePlayerExistsLoop = getLoopToWhichDotHit(dot, activePlayerCache);
    activePlayerGameData.dots.push(dot);
    if (activePlayerExistsLoop) {
        if (activePlayerExistsLoop.capturedDots) {
            throw new Errors.DotNotAllowed();
        }
        const loops = await Graph.getLoops(activePlayerGameData.dots);
        TrappedDotsHelper.updateLoopsByCapturedDots(loops, opponentGameData);
        activePlayerGameData.loops = _.map(loops, loop => loop.loop);
    } else {
        const loopsForVertex = Graph.getLoopsWithVertexInBorder(activePlayerGameData.dots, dot);
        if (loopsForVertex.length) {

        } else {
            const opponentLoop = getLoopToWhichDotHit(dot, opponentCache);
            if (opponentLoop && opponentLoop.capturedDots.length) {
                throw new Errors.DotNotAllowed();
            }
            TrappedDotsHelper.updateLoopsByCapturedDots(opponentCache.cache, activePlayerGameData);
        }
    }



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

function getLoopToWhichDotHit(dot, gameDataCache) {
    let cacheIndex = gameDataCache.length - 1;
    while(cacheIndex >= 0) {
        const loop = gameDataCache[cacheIndex];
        let dotIndex = loop.trappedDots.length - 1;
        while(dotIndex >= 0) {
            const trappedDot = loop.trappedDots[dotIndex];
            if (dot.x === trappedDot.x && dot.y === trappedDot.y) {
                return loop;
            }
            dotIndex--;
        }
        cacheIndex--;
    }
    return null;
}

module.exports = {
    getGameDataDeltas: getGameDataDeltas,
    getGamersScores: getGamersScoresV1,
    getGamersScoresV2: getGamersScoresV2
};
