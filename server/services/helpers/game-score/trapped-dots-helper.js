const _ = require('lodash');

function updateLoop(loop, opponentGameData) {
    var index = loop.trappedDots.length - 1;
    var opponentDots = opponentGameData.dots;
    var trappedDot;
    var opponentDotIndex;
    while(index >= 0) {
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

/**
 * Loops will be filtered by trapping opponent dots and game data will be updated
 * @param loops
 * @param opponentGameData
 */
function filterAndUpdateLoopsByOpponentTrappedDots(loopsDelta, opponentGameData, activeGameData) {
    _.forEachRight(loopsDelta, function(loop, index) {
        var hasTrappedDots = updateLoop(loop, opponentGameData);

        if (!hasTrappedDots) {
            // If after updating loop the trappedDots list is empty, so we removed it from loop;
            loopsDelta.splice(index, 1);
            activeGameData.loops.push(loop);
        }
    });
}


module.exports = {
    filterAndUpdateLoopsByOpponentTrappedDots: filterAndUpdateLoopsByOpponentTrappedDots
};
