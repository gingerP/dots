var graphLoop = req('server/libs/graph/graph-loops-flood-fill');
var graph = req('server/libs/graph/graph');
var commonLoopsUtils = req('server/libs/graph/utils/common-utils');
var _ = require('lodash');
var CreationUtils = req('server/utils/creation-utils');
var Promise = require('bluebird');

function extractValuationData(clientGameData) {
    return {
        dots: clientGameData.dots,
        loops: clientGameData.loops,
        losingDots: clientGameData.losingDots
    };
}
// 1
function prepareScoreValuation(dot, activePlayerGameData, opponentGameData) {
    return Promise.resolve({
        dot: dot,
        active: extractValuationData(activePlayerGameData),
        opponent: extractValuationData(opponentGameData)
    });
}

// 2
function calculateLoops(inbound) {
    var activePlayerTempGameData = CreationUtils.newGameData();

    activePlayerTempGameData.dots = inbound.active.dots.concat([inbound.dot]);
    inbound.loops = graph.getLoopsData(activePlayerTempGameData.dots);
    inbound.active.dots.push(inbound.dot);

    return inbound;
}

// 3
function calculateLoopsDelta(inbound) {
    inbound.loopsDelta = getScoresDelta(inbound.loops, inbound.dot);

    return inbound;
}

// 4
function calculateCommonScore(inbound) {
    if (inbound.loops && inbound.loops.length && inbound.opponent.dots && inbound.opponent.dots.length) {
        _.forEach(inbound.loopsDelta, moveDotsToTrappedDotsInLoops.bind(null, inbound.opponent));
        inbound.active.loops = inbound.active.loops.concat(inbound.loopsDelta);
    }
    return inbound;
}

function getGameDataDeltas(dot, dotClientGameData) {
    var clientDeltaGameData = CreationUtils.newGameData();
    var opponentDeltaGameData = CreationUtils.newGameData();
    var dots = _.cloneDeep(dotClientGameData.dots || []);
    var newLoops;
    dots.push(dot);
    newLoops = graphLoop.getLoops(dots);

    clientDeltaGameData.loops = commonLoopsUtils.getNewLoops(newLoops, clientDeltaGameData.loops);
    clientDeltaGameData.dots = [dot];

    return {
        client: clientDeltaGameData,
        opponent: opponentDeltaGameData
    };
}

function moveDotsToTrappedDots(trappedDots, opponentGameData, dot) {
    var index = _.findIndex(opponentGameData.dots, dot);
    if (index > -1) {
        opponentGameData.dots.splice(index, 1);
        opponentGameData.losingDots.push(dot);
        trappedDots.push(dot);
    }
}

function moveDotsToTrappedDotsInLoops(opponentGameData, loopData) {
    var preparedLoopData = CreationUtils.newLoopData(loopData.loop);
    _.forEach(
        loopData.trappedDots,
        moveDotsToTrappedDots.bind(null, preparedLoopData.trappedDots, opponentGameData)
    );
    return preparedLoopData;
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

function getGamersScores(dot, activePlayerGameData, opponentGameData) {
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
                active: inbound.loopsDelta,
                opponent: {}
            }
        };
    }

    return prepareScoreValuation(dot, activePlayerGameData, opponentGameData)
        .then(calculateLoops)
        .then(calculateLoopsDelta)
        .then(calculateCommonScore)
        .then(prepareOutBoundScore);
}

module.exports = {
    getGameDataDeltas: getGameDataDeltas,
    getGamersScores: getGamersScores
};
