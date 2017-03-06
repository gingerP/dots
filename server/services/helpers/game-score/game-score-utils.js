var graphLoop = require('server/libs/graph/graph-loops-flood-fill');
var graph = require('server/libs/graph/graph');
var commonLoopsUtils = require('server/libs/graph/utils/common-utils');
var _ = require('lodash');
var CreationUtils = require('server/utils/creation-utils');
var Promise = require('bluebird');
var TrappedDotsHelper = require('server/services/helpers/game-score/trapped-dots-helper');

function extractValuationData(clientGameData) {
    return {
        dots: clientGameData.dots || [],
        loops: clientGameData.loops || [],
        losingDots: clientGameData.losingDots || []
    };
}
// 1
function prepareScoreValuation(dot, activePlayerGameData, opponentGameData) {
    return Promise.resolve({
        dot: dot,
        active: extractValuationData(activePlayerGameData),
        opponent: extractValuationData(opponentGameData),
        loops: [],
        delta: {
            opponent: [],
            active: []
        },
        isNewDotHitInLoop: false
    });
}

// 2
function isNewDotHitInLoop(inbound) {
    var loop = {};

    if (inbound.opponent.dots.length > 3) {
        loop = graph.getLoop(inbound.opponent.dots, inbound.dot);
    }
    inbound.isNewDotHitInLoop = !_.isEmpty(loop);

    return Promise.resolve(inbound);
}

// 2
function calculateLoops(inbound) {
    var activePlayerTempGameData = CreationUtils.newGameData();

    activePlayerTempGameData.dots = inbound.active.dots.concat([inbound.dot]);
    inbound.loops = graph.getLoops(activePlayerTempGameData.dots);
    inbound.active.dots.push(inbound.dot);

    return Promise.resolve(inbound);
}

// 3
function calculateLoopsDelta(inbound) {
    inbound.delta.active = getScoresDelta(inbound.loops, inbound.dot);

    return Promise.resolve(inbound);
}

// 4
function calculateCommonScore(inbound) {
    if (inbound.loops && inbound.loops.length && inbound.opponent.dots && inbound.opponent.dots.length) {
        TrappedDotsHelper.filterAndUpdateLoopsByOpponentTrappedDots(
            inbound.delta.active,
            inbound.opponent,
            inbound.active
        );
        inbound.active.loops = inbound.active.loops.concat(inbound.loopsDelta);
    }
    return Promise.resolve(inbound);
}

// A1
function updateNewOpponentLoop(inbound) {

}

function getGameDataDeltas(dot, dotClientGameData) {
    var clientDeltaGameData = CreationUtils.newGameData();
    var opponentDeltaGameData = CreationUtils.newGameData();
    var dots = _.cloneDeep(dotClientGameData.dots || []);
    var newLoops;
    dots.push(dot);
    newLoops = graph.getLoops(dots);

    clientDeltaGameData.loops = commonLoopsUtils.getNewLoops(newLoops, clientDeltaGameData.loops);
    clientDeltaGameData.dots = [dot];

    return {
        client: clientDeltaGameData,
        opponent: opponentDeltaGameData
    };
}

function getScoresDelta(loops, dot) {
    var resultLoops = [];
    _.forEach(loops, function (loopData) {
        if (_.findIndex(loopData.loop, dot) > -1) {
            resultLoops.push(loopData);
        }
    });
    return resultLoops;
}

function getGamersScores(dot, activePlayerGameData, opponentGameData, opponentCache) {
    function prepareOutBoundScore(inbound) {
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

    return prepareScoreValuation(dot, activePlayerGameData, opponentGameData, opponentCache)
        .then(isNewDotHitInLoop)
        .then((inbound) => {
            if(inbound.isNewDotHitInLoop) {
                return ;
            }
            return calculateLoops(inbound)
                .then(calculateLoopsDelta)
                .then(calculateCommonScore)
                .then(prepareOutBoundScore);
        });
}

module.exports = {
    getGameDataDeltas: getGameDataDeltas,
    getGamersScores: getGamersScores
};
