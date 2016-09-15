define([
    'module.storage'
], function (storage) {
    'use strict';

    return {
        getOpponent: function () {
            var result;
            var game = storage.getGame();
            var opponent = storage.getOpponent();
            if (game && opponent && (opponent._id === game.from || opponent._id === game.to)) {
                result = opponent;
            }
            return result;
        },
        generateVertexes: function(xSize, ySize, radius) {
            var xIndex = 0;
            var yIndex = 0;
            var result = [];
            for(;xIndex < xSize ; xIndex++) {
                for(yIndex = 0; yIndex < ySize; yIndex++) {
                    result.push({
                        xInd: xIndex,
                        yInd: yIndex,
                        radius: radius
                    });
                }
            }
            return result;
        }
    }
});