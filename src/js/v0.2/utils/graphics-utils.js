define([], function () {
    'use strict';

    function createGamePaneData(width, height, radius) {
        var data = [];
        for (var w = 0; w < width; w++) {
            for (var h = 0; h < height; h++) {
                data.push({
                    xInd: w,
                    yInd: h,
                    radius: radius,
                    id: 'circle_' + w + '_' + h
                });
            }
        }
        return data;
    }

    return {
        createGamePaneData: createGamePaneData
    }
});