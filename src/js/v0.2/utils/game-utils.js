define([
    'business/domains/Player',
    'business/game.storage'
], function (Player, GameStorage) {
    'use strict';

    return {
        generateVertexes: function(xSize, ySize, radius) {
            var data = [];
            var w;
            var h;
            for (w = 0; w < xSize; w++) {
                for (h = 0; h < ySize; h++) {
                    data.push({
                        x: w,
                        y: h,
                        radius: radius,
                        id: 'circle_' + w + '_' + h
                    });
                }
            }
            return data;
        },
        createNewPlayer: function createNewPlayer(id, name, color, style) {
            return new Player().init(id, name, color, style);
        },
        updatePlayerState: function updatePlayerState(playerId, state) {
            var player = GameStorage.getGamePlayerById(playerId);
            if (player) {
                player.addDots(state.dots).addLoops(state.loops).addTrappedDots(state.trappedDots);
                player.newStep();
            }
        }
    };
});
