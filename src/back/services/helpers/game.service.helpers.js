var graphLoop = _req('src/back/libs/graph/graph-loops-flood-fill');
var commonLoopsUtils = _req('src/back/libs/graph/utils/common-utils');
var _ = require('lodash');

function newGameData(dots) {
    return {
        dots: dots || [],
        trappedDots: [],
        loops: []
    }
}

function getGameDataDeltas(dot, dotClientGameData, opponentGameData) {
    var clientDeltaGameData = newDeltaGameData();
    var opponentDeltaGameData = newDeltaGameData();
    var dots = _.cloneDeep(dotClientGameData.dots);
    dots.push(dot);
    var newLoops = graphLoop.getLoops(dots);

    clientDeltaGameData.loops = commonLoopsUtils.getNewLoops(newLoops, clientDeltaGameData.loops);
    clientDeltaGameData.dots = [dot];

    return {
        client: clientDeltaGameData,
        opponent: opponentDeltaGameData
    }
}

function getGamersScores(dot, dotClientGameData, opponentGameData) {
    var newClientGameData = newGameData([dot]);
    newClientGameData.dots = newClientGameData.dots.concat(dotClientGameData.dots);
    var newLoopsData = graphLoop.getLoops(newClientGameData.dots);
    dotClientGameData.dots.push(dot);
    if (newLoopsData && newLoopsData.length && (!opponentGameData.dots || !opponentGameData.dots.length)) {
        _.forEach(newLoopsData, function (loopData) {
            newClientGameData.loops.push(loopData.loop);
            _.forEach(loopData.trappedDots, function (trappedDot) {
                var index = _.findIndex(opponentGameData.dots, trappedDot);
                if (index > -1) {
                    opponentGameData.dots.splice(index, 1);
                    newClientGameData.trappedDots.push(trappedDot);
                }
            });
        });
        dotClientGameData.dots = newClientGameData.dots;
        dotClientGameData.trappedDots = newClientGameData.trappedDots;
        dotClientGameData.loops = newClientGameData.loops;
    }

    return {
        client: dotClientGameData,
        opponent: opponentGameData
    }
}




module.exports = {
    getGameDataDeltas: getGameDataDeltas,
    getGamersScores: getGamersScores
};