define([], function() {
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
        }
    };

    return api;
});