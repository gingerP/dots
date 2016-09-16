define([
    'module.storage',
    'business/module.game.player',
    'business/module.game.player.history'
], function (storage, Player, History) {
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
            var data = [];
            for (var w = 0; w < xSize; w++) {
                for (var h = 0; h < ySize; h++) {
                    data.push({
                        xInd: w,
                        yInd: h,
                        radius: radius,
                        id: 'circle_' + w + '_' + h
                    });
                }
            }
            return data;
        },
        createNewPlayer: function createNewPlayer(id, name, color, style) {
            return new Player().init(id, name, color, style, new History());
        }
    }
});