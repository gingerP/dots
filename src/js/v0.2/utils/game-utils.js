define([
    'business/module.game.player'
], function (Player) {
    'use strict';

    return {
        generateVertexes: function(xSize, ySize, radius) {
            var data = [];
            var w;
            var h;
            for (w = 0; w < xSize; w++) {
                for (h = 0; h < ySize; h++) {
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
            return new Player().init(id, name, color, style);
        }
    }
});