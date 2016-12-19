define([
    'utils/common-utils'
], function (CommonUtils) {
    'use strict';

    var api;

    api = {
        convertDataArrayForGraphModule: function convertDataArrayForGraphModule(data) {
            return data.map(api.convertDataForGraphModule);
        },

        convertDataForGraphModule: function convertDataForGraphModule(data) {
            return {
                x: data.x,
                y: data.y
            };
        },
        convertToGameData: function convertToGameData(dot, loops, losingDots) {
            return {
                dots: CommonUtils.createArray(dot),
                loops: CommonUtils.createArray(loops),
                losingDots: CommonUtils.createArray(losingDots)
            };
        }
    };

    return api;
});
