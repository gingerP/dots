define([
    'business/module.game.player',
    'business/module.game.player.history'
], function (Player, History) {
    'use strict';

    return {
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