var graphLoop = req('src/back/libs/graph/graph-loops-flood-fill');
var graph = req('src/back/libs/graph/graph');
var commonLoopsUtils = req('src/back/libs/graph/utils/common-utils');
var _ = require('lodash');
var CreationUtils = req('src/back/utils/creation-utils');

function newGameData(dots) {
    return {
        dots: dots || [],
        losingDots: [],
        loops: []
    };
}

function getGameDataDeltas(dot, dotClientGameData) {
    var clientDeltaGameData = newGameData();
    var opponentDeltaGameData = newGameData();
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

function handleTrappedDots(trappedDots, opponentGameData, dot) {
    var index = _.findIndex(opponentGameData.dots, dot);
    if (index > -1) {
        opponentGameData.dots.splice(index, 1);
        opponentGameData.losingDots.push(dot);
        trappedDots.push(dot);
    }
}

function handleLoopData(opponentGameData, loopData) {
    var preparedLoopData = CreationUtils.newLoopData(loopData.loop);
    _.forEach(
        loopData.trappedDots,
        handleTrappedDots.bind(null, preparedLoopData.trappedDots, opponentGameData)
    );
    return preparedLoopData;
}

function getGamersScores(dot, activePlayerGameData, opponentGameData) {
    var newClientGameData = newGameData([dot]);
    var newLoopsData;
    newClientGameData.dots = newClientGameData.dots.concat(activePlayerGameData.dots);
    newLoopsData = graph.getLoopsData(newClientGameData.dots);
    activePlayerGameData.dots.push(dot);
    if (newLoopsData && newLoopsData.length && (opponentGameData.dots && opponentGameData.dots.length)) {
        activePlayerGameData.loops = _.map(newLoopsData, handleLoopData.bind(null, opponentGameData));
        activePlayerGameData.dots = newClientGameData.dots;
    }

    return {
        client: activePlayerGameData,
        opponent: opponentGameData
    };
}

module.exports = {
    getGameDataDeltas: getGameDataDeltas,
    getGamersScores: getGamersScores
};
